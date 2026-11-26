-- M4: the Lambda distributor is stateless, so it records the Fargate task it
-- started on the session row. It only spawns jobs whose session has no ARN yet.
ALTER TABLE public.job_sessions ADD COLUMN IF NOT EXISTS fargate_task_arn TEXT;
CREATE INDEX IF NOT EXISTS idx_job_sessions_unspawned
  ON public.job_sessions (id) WHERE fargate_task_arn IS NULL;
