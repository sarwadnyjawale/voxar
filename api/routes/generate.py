"""
VOXAR TTS Generation Endpoints.
Submit async or synchronous TTS generation jobs.
"""

import asyncio
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional

from api.dependencies import (
    get_queue, get_voice_manager, get_user_voice_manager,
    get_settings, get_engine, check_rate_limit,
)

logger = logging.getLogger("VoxarGenerate")

router = APIRouter(tags=["generate"])


class GenerateRequest(BaseModel):
    """TTS generation request body."""

    text: str = Field(..., description="Text to convert to speech")
    voice_id: str = Field(..., description="Voice ID from catalog (e.g., 'v001')")
    language: str = Field("auto", description="Language code: auto, en, hi, ta, te, etc.")
    mode: str = Field("flash", description="TTS mode: flash, cinematic, longform, multilingual")
    speed: float = Field(1.0, ge=0.5, le=2.0, description="Speech speed (0.5-2.0)")
    format: str = Field("mp3", description="Output format: mp3 or wav")


def _validate_request(req: GenerateRequest, voice_manager, settings,
                      max_length=None, user_voice_manager=None, api_key=None):
    """Validate generation request. Raises HTTPException on invalid input."""
    max_len = max_length or settings.MAX_TEXT_LENGTH

    # Text length
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required and cannot be empty")
    if len(req.text) > max_len:
        raise HTTPException(
            status_code=400,
            detail=f"Text too long: {len(req.text)} chars (max {max_len})",
        )

    # Voice exists — support both library (v001) and user (uv_*) voices
    from engine.user_voice_manager import UserVoiceManager

    if UserVoiceManager.is_user_voice_id(req.voice_id):
        # User-cloned voice
        if user_voice_manager is None:
            raise HTTPException(
                status_code=400,
                detail="User voice cloning is not available.",
            )

        # Ownership check: user can only use their own voices
        if api_key and not user_voice_manager.verify_ownership(api_key, req.voice_id):
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this voice.",
            )

        voice = user_voice_manager.get_voice(req.voice_id)
        if not voice:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Voice '{req.voice_id}' not found. "
                    f"Use GET /api/v1/voices/clone to list your cloned voices."
                ),
            )

        if voice.get("status") != "ready":
            raise HTTPException(
                status_code=400,
                detail=f"Voice '{req.voice_id}' is not ready (status: {voice.get('status')}).",
            )
    else:
        # Library voice (existing behavior)
        voice = voice_manager.get_voice(req.voice_id)
        if not voice:
            raise HTTPException(
                status_code=400,
                detail=f"Voice '{req.voice_id}' not found. Use GET /api/v1/voices to list available voices.",
            )

    # Mode
    if req.mode not in settings.VALID_MODES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode '{req.mode}'. Valid: {sorted(settings.VALID_MODES)}",
        )

    # Format
    if req.format not in ("mp3", "wav"):
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Use 'mp3' or 'wav'.",
        )

    return voice


@router.post("/generate", dependencies=[Depends(check_rate_limit)])
async def generate_async(
    request: Request,
    req: GenerateRequest,
    queue=Depends(get_queue),
    voice_manager=Depends(get_voice_manager),
    user_voice_manager=Depends(get_user_voice_manager),
    settings=Depends(get_settings),
):
    """
    Submit an async TTS generation job.

    Returns a job_id that can be polled via GET /api/v1/jobs/{job_id}.
    When the job completes, download audio from GET /api/v1/jobs/{job_id}/audio.

    Supports both library voices (e.g., 'v001') and user-cloned voices (e.g., 'uv_a3f82b_d9e1c047').
    """
    api_key = getattr(request.state, "api_key", None)
    _validate_request(req, voice_manager, settings,
                      user_voice_manager=user_voice_manager, api_key=api_key)

    try:
        job_id = await queue.submit(
            text=req.text.strip(),
            voice_id=req.voice_id,
            language=req.language,
            mode=req.mode,
            speed=req.speed,
            output_format=req.format,
        )
    except asyncio.QueueFull:
        raise HTTPException(
            status_code=503,
            detail="Server busy. Generation queue is full. Please try again later.",
        )

    return {
        "job_id": job_id,
        "status": "queued",
        "queue_position": queue.get_queue_position(job_id),
        "message": f"Job submitted. Poll GET /api/v1/jobs/{job_id} for status.",
    }


@router.post("/generate/sync", dependencies=[Depends(check_rate_limit)])
async def generate_sync(
    request: Request,
    req: GenerateRequest,
    queue=Depends(get_queue),
    voice_manager=Depends(get_voice_manager),
    user_voice_manager=Depends(get_user_voice_manager),
    settings=Depends(get_settings),
):
    """
    Synchronous TTS generation. Blocks until audio is ready.

    Limited to shorter text (max 1000 chars by default).
    For longer text, use the async POST /api/v1/generate endpoint.

    Supports both library voices (e.g., 'v001') and user-cloned voices (e.g., 'uv_a3f82b_d9e1c047').
    """
    api_key = getattr(request.state, "api_key", None)
    _validate_request(req, voice_manager, settings,
                      max_length=settings.MAX_SYNC_TEXT_LENGTH,
                      user_voice_manager=user_voice_manager, api_key=api_key)

    try:
        job_id = await queue.submit(
            text=req.text.strip(),
            voice_id=req.voice_id,
            language=req.language,
            mode=req.mode,
            speed=req.speed,
            output_format=req.format,
        )
    except asyncio.QueueFull:
        raise HTTPException(
            status_code=503,
            detail="Server busy. Please try again later.",
        )

    # Poll until complete or timeout
    timeout = settings.JOB_TIMEOUT_SECONDS
    poll_interval = 0.5
    elapsed = 0.0

    while elapsed < timeout:
        job = queue.get_job(job_id)
        if not job:
            raise HTTPException(status_code=500, detail="Job disappeared from queue")

        if job.status == "completed":
            return {
                "job_id": job.job_id,
                "status": "completed",
                "audio_url": f"/api/v1/jobs/{job.job_id}/audio",
                "duration": job.duration,
                "quality_score": job.quality_score,
                "quality_grade": job.quality_grade,
                "character_count": job.character_count,
                "processing_time": job.processing_time,
                "engine": job.engine,
                "format": job.output_format,
            }

        if job.status == "failed":
            raise HTTPException(
                status_code=500,
                detail=f"Generation failed: {job.error}",
            )

        await asyncio.sleep(poll_interval)
        elapsed += poll_interval

    raise HTTPException(
        status_code=504,
        detail=f"Generation timed out after {timeout}s",
    )
