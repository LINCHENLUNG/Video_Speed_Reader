# M4 worker image: one container = one job. Built by AWS CodeBuild (buildspec.yml), run on ECS Fargate.
# Official python image via AWS's ECR Public mirror: Docker Hub rate-limits
# anonymous pulls from shared CodeBuild IPs (429 Too Many Requests).
FROM public.ecr.aws/docker/library/python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY worker.py .
ENV PYTHONUNBUFFERED=1
# JOB_ID arrives from the Lambda's RunTask override; the three keys from the
# task definition's `secrets` (Secrets Manager). Nothing secret is baked in.
CMD ["python", "worker.py"]
