"""
M4 distributor (AWS Lambda, fired every minute by EventBridge).

Replaces M1's distributor.py on the EC2. Each run:
  1. find jobs with status='pending'
  2. make sure the job has a linked job_sessions row (direct-INSERT test jobs may not)
  3. skip it if that session already has a fargate_task_arn (already spawned)
  4. ecs:RunTask one Fargate task for it (JOB_ID passed as a container override)
  5. write the task ARN onto the session - this is the idempotency the stateless
     Lambda can't keep in memory

Keys: only SUPABASE_URL / SUPABASE_SECRET_KEY, read from Secrets Manager at cold
start (Lambda role allows GetSecretValue on those two). The Fargate task gets its
own keys from the task definition's `secrets`, so no key passes through here.
Runs never overlap: the timeout (50 s) is shorter than the 1-minute schedule and
the EventBridge target has retries off. (Reserved concurrency 1 would be cleaner,
but this account's Lambda concurrency limit is 10, so AWS refuses to reserve any.)

Deployed by the AWS CLI from a zip (not by CodeBuild); kept in the repo for the record.
"""
import os

import boto3
from supabase import create_client

CLUSTER = os.environ["ECS_CLUSTER"]
TASK_DEFINITION = os.environ["TASK_DEFINITION"]
SUBNETS = [s for s in os.environ["SUBNETS"].split(",") if s]
SECURITY_GROUPS = [s for s in os.environ["SECURITY_GROUPS"].split(",") if s]
CONTAINER = os.environ.get("CONTAINER_NAME", "worker")
MAX_SPAWN_PER_RUN = int(os.environ.get("MAX_SPAWN_PER_RUN", "10"))

_sm = boto3.client("secretsmanager")
_ecs = boto3.client("ecs")
db = create_client(
    _sm.get_secret_value(SecretId="supabase-url")["SecretString"],
    _sm.get_secret_value(SecretId="supabase-secret-key")["SecretString"],
)


def _ensure_session(job: dict) -> str:
    """Return the job's session id, creating AND linking one if missing."""
    if job.get("current_session_id"):
        return job["current_session_id"]
    row = db.table("job_sessions").insert({"job_id": job["id"], "session_number": 1}).execute().data[0]
    # The easy-to-miss link: without it worker.py crashes on a null current_session_id.
    db.table("jobs").update({"current_session_id": row["id"]}).eq("id", job["id"]).execute()
    return row["id"]


def _run_task(job_id: str) -> str:
    resp = _ecs.run_task(
        cluster=CLUSTER,
        taskDefinition=TASK_DEFINITION,
        launchType="FARGATE",
        count=1,
        startedBy=f"distributor-{job_id}"[:36],
        networkConfiguration={"awsvpcConfiguration": {
            "subnets": SUBNETS,
            "securityGroups": SECURITY_GROUPS,
            "assignPublicIp": "ENABLED",  # public subnet, no NAT gateway needed
        }},
        overrides={"containerOverrides": [
            {"name": CONTAINER, "environment": [{"name": "JOB_ID", "value": job_id}]},
        ]},
    )
    if resp.get("failures") or not resp.get("tasks"):
        raise RuntimeError(f"RunTask failed: {resp.get('failures')}")
    return resp["tasks"][0]["taskArn"]


def handler(event, context):
    jobs = (db.table("jobs").select("id,current_session_id")
            .eq("status", "pending").order("created_at").limit(50).execute().data)
    spawned, skipped, errors = [], 0, []
    for job in jobs:
        if len(spawned) >= MAX_SPAWN_PER_RUN:
            break
        try:
            session_id = _ensure_session(job)
            session = (db.table("job_sessions").select("fargate_task_arn")
                       .eq("id", session_id).single().execute().data)
            if session.get("fargate_task_arn"):
                skipped += 1
                continue
            arn = _run_task(job["id"])
            db.table("job_sessions").update({"fargate_task_arn": arn}).eq("id", session_id).execute()
            spawned.append(job["id"])
            print(f"spawned job {job['id']} -> {arn}")
        except Exception as exc:  # one bad job must not block the rest
            errors.append(job["id"])
            print(f"ERROR job {job['id']}: {exc!r}")
    result = {"pending": len(jobs), "spawned": len(spawned), "skipped": skipped, "errors": len(errors)}
    print(result)
    return result
