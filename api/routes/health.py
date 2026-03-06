"""
VOXAR Health Endpoint.
Public endpoint for server status and monitoring.
"""

import time
import logging
from fastapi import APIRouter, Request

logger = logging.getLogger("VoxarHealth")

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(request: Request):
    """
    Server health check.

    Returns server status, GPU info, queue depth, and voice count.
    No authentication required.
    """
    settings = request.app.state.settings
    queue = request.app.state.queue
    voice_manager = request.app.state.voice_manager
    engine = request.app.state.engine
    start_time = request.app.state.start_time

    # GPU info (safe — doesn't require model to be loaded)
    gpu_info = {}
    try:
        gpu_info = engine.get_gpu_info()
    except Exception:
        gpu_info = {"available": False}

    response = {
        "status": "healthy",
        "engine": engine.get_active_engine() or "initializing",
        "engine_version": None,
        "gpu": gpu_info,
        "queue": queue.get_queue_stats(),
        "voices_loaded": len(voice_manager.list_voices()),
        "uptime_seconds": round(time.time() - start_time, 1),
        "config": {
            "max_text_length": settings.MAX_TEXT_LENGTH,
            "max_queue_size": settings.MAX_QUEUE_SIZE,
            "rate_limit_per_minute": settings.RATE_LIMIT_PER_MINUTE,
        },
    }

    # Get engine version if available
    try:
        from engine import __version__
        response["engine_version"] = __version__
    except ImportError:
        pass

    return response
