"""
VOXAR API Dependencies.
Shared FastAPI dependencies via Depends().
"""

import logging
from fastapi import Depends, HTTPException, Request

logger = logging.getLogger("VoxarDeps")


def get_settings(request: Request):
    """Get server settings from app state."""
    return request.app.state.settings


def get_engine(request: Request):
    """Get the EngineRouter singleton from app state."""
    return request.app.state.engine


def get_queue(request: Request):
    """Get the GPUJobQueue singleton from app state."""
    return request.app.state.queue


def get_voice_manager(request: Request):
    """Get the VoiceManager singleton from app state."""
    return request.app.state.voice_manager


def get_user_voice_manager(request: Request):
    """Get the UserVoiceManager singleton from app state."""
    return request.app.state.user_voice_manager


def get_rate_limiter(request: Request):
    """Get the RateLimiter from app state."""
    return request.app.state.rate_limiter


async def check_rate_limit(request: Request):
    """
    FastAPI dependency that enforces rate limiting.

    Reads the API key from request.state (set by APIKeyMiddleware)
    and checks the token bucket.

    Raises HTTPException 429 if rate limited.
    """
    rate_limiter = request.app.state.rate_limiter
    api_key = getattr(request.state, "api_key", "anonymous")

    allowed, retry_after = rate_limiter.check(api_key)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limited",
                "message": "Too many requests. Please slow down.",
                "retry_after_seconds": retry_after,
            },
            headers={"Retry-After": str(int(retry_after or 1))},
        )
