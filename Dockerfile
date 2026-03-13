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

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    git \
    cmake \
    python3-dev \
    libsndfile1 \
    espeak-ng \
    ffmpeg \
    sox \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir runpod>=1.6.0

COPY engine/ ./engine/
COPY api/ ./api/
COPY voices/ ./voices/
COPY run_server.py .

RUN mkdir -p /app/output /app/logs /app/voices/user_voices

RUN python engine/download_models.py

EXPOSE 8000

CMD ["python", "-u", "engine/runpod_handler.py"]
