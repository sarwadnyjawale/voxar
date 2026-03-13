# ============================================================
# VOXAR AI Engine — RunPod Serverless
# GPU TTS/STT with XTTS v2, MMS, OpenVoice, Whisper
# ============================================================
FROM runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04

LABEL maintainer="VOXAR <hello@voxar.in>"
LABEL description="VOXAR AI Engine — RunPod Serverless TTS/STT"

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Audio processing system deps (base image has Python + CUDA already)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libsndfile1 libsox-fmt-all sox \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Ensure engine.* imports resolve from /app regardless of entrypoint
ENV PYTHONPATH=/app

# Install Python deps (layer cached separately from code)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install runpod>=1.6.0

# Copy project files
COPY engine/ ./engine/
COPY api/ ./api/
COPY voices/ ./voices/
COPY run_server.py .

# Runtime directories
RUN mkdir -p /app/output /app/logs /app/voices/user_voices

# Bake XTTS v2 + Whisper models into the image so cold starts
# don't download ~3GB on every container spin-up
RUN python engine/download_models.py

EXPOSE 8000

CMD ["python", "-u", "engine/runpod_handler.py"]
