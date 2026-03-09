#!/bin/bash
# ============================================================
# VOXAR GPU Engine — RunPod/Vast.ai Deployment Script
# ============================================================
#
# This script deploys the VOXAR AI engine to a cloud GPU instance.
# Supports RunPod and Vast.ai.
#
# Prerequisites:
#   - Docker with NVIDIA runtime
#   - NVIDIA GPU (A100 40GB recommended for production)
#   - At least 20GB disk space for models
#
# Usage:
#   chmod +x deploy-engine.sh
#   ./deploy-engine.sh
#
# ============================================================

set -e

echo "=== VOXAR Engine Deployment ==="
echo ""

# Configuration
ENGINE_PORT=${ENGINE_PORT:-8000}
API_KEY=${ENGINE_API_KEY:-voxar-dev-key-001}
IMAGE_NAME="voxar-engine"
CONTAINER_NAME="voxar-engine"

# Build the image
echo "[1/4] Building Docker image..."
docker build -f Dockerfile.engine -t $IMAGE_NAME .

# Stop existing container if running
echo "[2/4] Stopping existing container (if any)..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Run the container
echo "[3/4] Starting engine container..."
docker run -d \
    --name $CONTAINER_NAME \
    --gpus all \
    --restart unless-stopped \
    -p $ENGINE_PORT:8000 \
    -e VOXAR_HOST=0.0.0.0 \
    -e VOXAR_PORT=8000 \
    -e VOXAR_API_KEYS=$API_KEY \
    -v voxar-models:/root/.local/share \
    -v voxar-output:/app/output \
    -v voxar-voices:/app/voices \
    $IMAGE_NAME

# Wait for startup (XTTS model loading takes 30-60s)
echo "[4/4] Waiting for engine to start (this takes 30-60 seconds for model loading)..."
for i in $(seq 1 120); do
    if curl -sf http://localhost:$ENGINE_PORT/api/v1/health > /dev/null 2>&1; then
        echo ""
        echo "=== Engine is RUNNING ==="
        echo "URL: http://localhost:$ENGINE_PORT"
        echo "Health: http://localhost:$ENGINE_PORT/api/v1/health"
        echo "Voices: http://localhost:$ENGINE_PORT/api/v1/voices"
        echo ""
        curl -s http://localhost:$ENGINE_PORT/api/v1/health | python3 -m json.tool 2>/dev/null || true
        exit 0
    fi
    printf "."
    sleep 1
done

echo ""
echo "[ERROR] Engine failed to start within 120 seconds."
echo "Check logs: docker logs $CONTAINER_NAME"
exit 1
