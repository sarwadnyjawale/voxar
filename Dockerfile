# ============================================================
# VOXAR AI Engine — Local Docker Build
# Python 3.10 + CUDA 11.8 + PyTorch 2.1 (base image)
# Build locally, push to DockerHub, pull on RunPod
# ============================================================
FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04

LABEL maintainer="VOXAR <hello@voxar.in>"
LABEL description="VOXAR AI Engine — TTS/STT Server"

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# HuggingFace cache — models downloaded at runtime, persisted via volume
ENV HF_HOME=/app/models
ENV TRANSFORMERS_CACHE=/app/models
ENV TORCH_HOME=/app/models/torch

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    git \
    cmake \
    python3-dev \
    libsndfile1 \
    libsndfile1-dev \
    espeak-ng \
    ffmpeg \
    sox \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .

# Step 1: numpy + scipy + Cython first (build-time deps for TTS/librosa)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefer-binary \
        numpy==1.22.0 \
        scipy==1.11.4 \
        Cython==3.2.4

# Step 2: All pinned packages (skip torch/torchaudio — already in base image)
#   --no-deps            → skip resolver (we have a complete freeze)
#   --no-build-isolation → source builds see system torch/numpy
RUN grep -viE '^(torch==|torchaudio==|numpy==|scipy==|Cython==|MyShell|#)' requirements.txt > /tmp/filtered.txt && \
    pip install --no-cache-dir --prefer-binary --no-deps --no-build-isolation \
        --ignore-installed \
        -r /tmp/filtered.txt

# Step 3: OpenVoice from git (separate — needs --no-build-isolation for torch)
RUN pip install --no-cache-dir --no-deps --no-build-isolation \
    "MyShell-OpenVoice @ git+https://github.com/myshell-ai/OpenVoice.git@74a1d147b17a8c3092dd5430504bd83ef6c7eb23"

# Copy application code
COPY engine/ ./engine/
COPY api/ ./api/
COPY voices/ ./voices/
COPY run_server.py .

RUN mkdir -p /app/output /app/logs /app/voices/user_voices /app/models

# NO model download during build — models load at runtime

EXPOSE 8000

CMD ["python", "-u", "engine/runpod_handler.py"]
