"""
M1 worker: processes one job, downloads the video, runs Whisper,
writes TXT back to job_sessions.subtitle_txt_content.

M2 (credits): 1 credit = 1 minute (rounded up, min 1). The job is claimed first,
the duration is checked against the user's balance before any Whisper call
(status 'insufficient_credits' if short), and credits are deducted only when the
transcript has been saved, right before status 'done'.

Started by distributor.py (one Popen per pending job). Reads JOB_ID from env.
Reads OPENAI_API_KEY / SUPABASE_URL / SUPABASE_SECRET_KEY from AWS Secrets
Manager — the EC2's IAM instance profile grants `secretsmanager:GetSecretValue`
on exactly those secret names, so no credentials ever live on disk.
"""
import math
import os
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import boto3
from openai import OpenAI
from supabase import create_client


def _get_secret(client, name: str) -> str:
    """Fetch one Secrets Manager secret by name (returns the SecretString)."""
    return client.get_secret_value(SecretId=name)["SecretString"]


def _load_secrets() -> dict[str, str]:
    """Pull the three M1 secrets from AWS Secrets Manager."""
    sm = boto3.client("secretsmanager")
    return {
        "OPENAI_API_KEY": _get_secret(sm, "openai-api-key"),
        "SUPABASE_URL": _get_secret(sm, "supabase-url"),
        "SUPABASE_SECRET_KEY": _get_secret(sm, "supabase-secret-key"),
    }


_secrets = _load_secrets()
db = create_client(_secrets["SUPABASE_URL"], _secrets["SUPABASE_SECRET_KEY"])
openai_client = OpenAI(api_key=_secrets["OPENAI_API_KEY"])

# OpenAI Whisper has a 25 MB file-size limit. 10 minutes of 64 kbps mono mp3 ~= 4.8 MB,
# safely under the limit. Long videos get split into 600-second chunks.
CHUNK_SECONDS = 600


def get_job(job_id: str) -> dict:
    return db.table("jobs").select("*").eq("id", job_id).single().execute().data


def update_job(job_id: str, **fields) -> None:
    # A real ISO timestamp — PostgREST passes values as literals, so the string "now()" is invalid.
    now = datetime.now(timezone.utc).isoformat()
    db.table("jobs").update({**fields, "updated_at": now}).eq("id", job_id).execute()


def update_session(session_id: str, **fields) -> None:
    db.table("job_sessions").update(fields).eq("id", session_id).execute()


def download_video(url: str, dest_dir: Path) -> Path:
    """yt-dlp for URLs; pass through for local file paths."""
    if url.startswith(("http://", "https://")):
        out_template = str(dest_dir / "video.%(ext)s")
        subprocess.run(["yt-dlp", "-o", out_template, url], check=True)
        return next(dest_dir.glob("video.*"))
    return Path(url).expanduser().resolve()


def to_mp3(video_path: Path, dest_dir: Path) -> Path:
    """Convert any video/audio container to 64 kbps mono 16 kHz mp3 (Whisper-friendly)."""
    mp3 = dest_dir / "audio.mp3"
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(video_path),
            "-vn", "-ac", "1",
            "-ar", "16000", "-ab", "64k",
            "-acodec", "libmp3lame",
            str(mp3),
        ],
        check=True,
        capture_output=True,
    )
    return mp3


def get_duration_seconds(audio_path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(out.stdout.strip())


def split_chunks(mp3_path: Path, dest_dir: Path) -> list[Path]:
    """Split into CHUNK_SECONDS-second chunks (re-encode to keep sizes predictable)."""
    duration = get_duration_seconds(mp3_path)
    n_chunks = max(1, math.ceil(duration / CHUNK_SECONDS))
    chunks = []
    for i in range(n_chunks):
        chunk = dest_dir / f"chunk_{i:03d}.mp3"
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(mp3_path),
                "-ss", str(i * CHUNK_SECONDS),
                "-t", str(CHUNK_SECONDS),
                "-acodec", "libmp3lame",
                "-ab", "64k",
                str(chunk),
            ],
            check=True,
            capture_output=True,
        )
        chunks.append(chunk)
    return chunks


def transcribe_chunk(chunk_path: Path, language: str) -> str:
    with open(chunk_path, "rb") as f:
        return openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="text",
            language=language,
        )


def probe_minutes_cheap(url: str) -> int | None:
    """Duration in credits WITHOUT downloading, or None if unknown.

    yt-dlp prints the literal string 'NA' for some sources (direct mp4 URLs);
    any error or timeout also means 'unknown', never a crash.
    """
    if not url.startswith(("http://", "https://")):
        return None
    try:
        out = subprocess.run(
            ["yt-dlp", "--print", "duration", "--no-warnings", url],
            capture_output=True, text=True, timeout=30, check=True,
        ).stdout.strip()
        seconds = float(out.splitlines()[0]) if out else None
    except (subprocess.SubprocessError, ValueError, IndexError):
        return None
    if seconds is None or seconds <= 0:
        return None
    return max(1, math.ceil(seconds / 60))


def probe_minutes_from_file(path: Path) -> int:
    return max(1, math.ceil(get_duration_seconds(path) / 60))


def get_balance(user_id: str) -> float:
    rows = db.table("profiles").select("credits_balance").eq("id", user_id).limit(1).execute().data
    return float(rows[0]["credits_balance"]) if rows else 0.0


def block_insufficient(job: dict, minutes: int, balance: float) -> None:
    """No Whisper call, nothing charged: mark the job and leave a 0-amount ledger note."""
    update_job(job["id"], status="insufficient_credits")
    db.table("credit_transactions").insert({
        "user_id": job["user_id"],
        "amount": 0,
        "type": "deduction",
        "description": f"Insufficient credits: video is {minutes} min, you have {int(balance)}",
        "job_id": job["id"],
    }).execute()
    print(f"[{job['id']}] insufficient credits: needs {minutes}, has {balance}")


def deduct_credits(job: dict, minutes: int) -> None:
    db.table("credit_transactions").insert({
        "user_id": job["user_id"],
        "amount": -minutes,
        "type": "deduction",
        "description": f"Transcribed {minutes} min video",
        "job_id": job["id"],
    }).execute()
    # Read-then-write (accepted v1 race: one worker per job, sequential distributor).
    new_balance = max(0.0, get_balance(job["user_id"]) - minutes)
    db.table("profiles").update({"credits_balance": new_balance}).eq("id", job["user_id"]).execute()


def main() -> None:
    job_id = os.environ["JOB_ID"]
    job = get_job(job_id)
    session_id = job["current_session_id"]

    # Claim the job FIRST: if anything below crashes it is 'downloading', not 'pending',
    # so the distributor will not re-spawn it in a loop.
    update_job(job_id, status="downloading")
    print(f"[{job_id}] downloading {job['video_source_url']}")

    balance = get_balance(job["user_id"])
    minutes = probe_minutes_cheap(job["video_source_url"])
    if minutes is not None and minutes > balance:
        block_insufficient(job, minutes, balance)
        return

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        video = download_video(job["video_source_url"], tmp_path)

        if minutes is None:
            minutes = probe_minutes_from_file(video)
            if minutes > balance:
                block_insufficient(job, minutes, balance)
                return

        mp3 = to_mp3(video, tmp_path)

        update_job(job_id, status="transcribe")
        chunks = split_chunks(mp3, tmp_path)
        print(f"[{job_id}] transcribing {len(chunks)} chunk(s)")

        full_text = "\n\n".join(transcribe_chunk(c, job["language"]) for c in chunks)

        update_session(session_id, subtitle_txt_content=full_text)
        try:
            deduct_credits(job, minutes)
        except Exception as exc:  # transcript is already saved: don't strand the job
            print(f"[{job_id}] CREDIT DEDUCTION FAILED ({minutes} min): {exc!r} — reconcile manually")
        update_job(job_id, status="done")

    print(f"[{job_id}] done — {len(full_text)} chars")


if __name__ == "__main__":
    main()
