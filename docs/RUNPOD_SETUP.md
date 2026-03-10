# RunPod Serverless Setup Guide

## 1. Build & Push the Docker Image
You need to host your Engine's Docker image somewhere accessible (Docker Hub) so RunPod can pull it.

```bash
# 1. Login to Docker Hub
docker login

# 2. Build the image locally (this will trigger the pre-download scripts)
docker build -f Dockerfile.engine -t <your_docker_username>/voxar-engine:latest .

# 3. Push to Docker Hub
docker push <your_docker_username>/voxar-engine:latest
```

## 2. Create the RunPod Serverless Endpoint
1. Create a RunPod account and add billing details.
2. Go to **Serverless** -> **Templates** -> **New Template**.
   - Container Image: `<your_docker_username>/voxar-engine:latest`
   - Container Disk: `20 GB` (models are large)
3. Go to **Serverless** -> **Endpoints** -> **New Endpoint**.
   - Select your template.
   - Select GPU: **RTX 3090 / A40** (24GB VRAM required for XTTS)
   - Max Workers: `3` (increases concurrently generated audios)
   - Idle Timeout: `300` (Worker shuts down after 5 minutes of no jobs. Costs $0 when down.)
   - **FlashBoot**: Enabled (significantly speeds up cold starts).

## 3. Connect to the Backend
1. Once deployed, RunPod will give you an **Endpoint ID** (a random string like `abc123xyz`).
2. Go to RunPod Settings -> **API Keys** -> Create a new key.
3. In your Coolify backend Environment Variables, set:
   - `RUNPOD_ENDPOINT_ID=abc123xyz`
   - `RUNPOD_API_KEY=YOUR_API_KEY`
   - `VOXAR_ENGINE_MODE=runpod`

The VOXAR Node.js backend will now automatically route TTS, STT, and Cloning jobs via the Redis Queue -> RunPod API.
