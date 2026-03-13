# ============================================================
# VOXAR AI Engine — RunPod Serverless
# Python 3.10 + CUDA 11.8 + PyTorch 2.1 (base image)
# ============================================================
FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04

LABEL maintainer="VOXAR <hello@voxar.in>"
LABEL description="VOXAR AI Engine — RunPod Serverless TTS/STT"

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# System build tools + audio libs required to compile TTS and its C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    cmake \
    git \
    python3-dev \
    libsndfile1 \
    espeak-ng \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONPATH=/app

# Python deps (torch/torchaudio already in base image)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir runpod>=1.6.0

# Project files
COPY engine/ ./engine/
COPY api/ ./api/
COPY voices/ ./voices/
COPY run_server.py .

# Runtime directories
RUN mkdir -p /app/output /app/logs /app/voices/user_voices

# Bake XTTS v2 + Whisper weights into the image
RUN python engine/download_models.py

EXPOSE 8000

CMD ["python", "-u", "engine/runpod_handler.py"]
