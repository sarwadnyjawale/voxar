"""
VOXAR Job Status & Audio Download Endpoints.
Poll job progress and download generated audio files.
"""

import os
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from api.dependencies import get_queue, check_rate_limit

logger = logging.getLogger("VoxarJobs")

router = APIRouter(tags=["jobs"])


@router.get("/jobs/{job_id}", dependencies=[Depends(check_rate_limit)])
async def get_job_status(
    job_id: str,
    queue=Depends(get_queue),
):
    """
    Get the status and result of a TTS generation job.

    Poll this endpoint after submitting a job via POST /api/v1/generate.
    When status is "completed", the audio_url field contains the download link.
    """
    job = queue.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found. Jobs expire after 1 hour.",
        )

    return job.to_dict()


@router.get("/jobs/{job_id}/audio", dependencies=[Depends(check_rate_limit)])
async def download_audio(
    job_id: str,
    queue=Depends(get_queue),
):
    """
    Download the generated audio file for a completed job.

    Returns the audio file directly with appropriate content-type header.
    Only available for jobs with status "completed".
    """
    job = queue.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found.",
        )

    if job.status == "queued" or job.status == "processing":
        raise HTTPException(
            status_code=409,
            detail=f"Job is still {job.status}. Please wait for completion.",
        )

    if job.status == "failed":
        raise HTTPException(
            status_code=410,
            detail=f"Job failed: {job.error}",
        )

    if not job.tts_audio_path or not os.path.exists(job.tts_audio_path):
        raise HTTPException(
            status_code=404,
            detail="Audio file not found. It may have been cleaned up.",
        )

    # Determine content type
    if job.tts_audio_path.endswith(".mp3"):
        media_type = "audio/mpeg"
        filename = f"voxar_{job.job_id}.mp3"
    else:
        media_type = "audio/wav"
        filename = f"voxar_{job.job_id}.wav"

    return FileResponse(
        path=job.tts_audio_path,
        media_type=media_type,
        filename=filename,
    )
