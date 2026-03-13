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

# Step 1: Build-time deps first (numpy needed by scipy/librosa, Cython by spacy/thinc)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefer-binary \
        numpy==1.22.0 \
        scipy==1.11.4 \
        Cython==3.2.4

# Step 2: All pinned packages
#   --no-deps        → skip resolver (complete freeze, all transitive deps listed)
#   --no-build-isolation → source builds (TTS, encodec, trainer) use system torch/numpy
#                          instead of PEP 517 isolated venv that lacks them
RUN pip install --no-cache-dir --prefer-binary --no-deps --no-build-isolation -r requirements.txt

# Step 3: Git-sourced package (not on PyPI, also needs --no-build-isolation for torch)
RUN pip install --no-cache-dir --no-deps --no-build-isolation \
    "MyShell-OpenVoice @ git+https://github.com/myshell-ai/OpenVoice.git@74a1d147b17a8c3092dd5430504bd83ef6c7eb23"

# Step 4: RunPod SDK (may already be in base image, ensure present)
RUN pip install --no-cache-dir runpod

COPY engine/ ./engine/
COPY api/ ./api/
COPY voices/ ./voices/
COPY run_server.py .

RUN mkdir -p /app/output /app/logs /app/voices/user_voices

RUN python engine/download_models.py

EXPOSE 8000

CMD ["python", "-u", "engine/runpod_handler.py"]
