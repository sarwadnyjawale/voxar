"""
VOXAR Speech-to-Text (Transcription) Endpoints.
Upload audio for transcription, translation, and subtitle generation.

Endpoints:
  POST /api/v1/transcribe           Async transcription job (upload audio)
  POST /api/v1/transcribe/sync      Sync transcription (short audio, <60s)
  GET  /api/v1/transcribe/{job_id}  Poll job status
  GET  /api/v1/transcribe/{job_id}/result  Download result (JSON/SRT/VTT)
"""

import os
import asyncio
import logging
import tempfile
import shutil
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional

from api.dependencies import (
    get_queue, get_settings, get_engine, check_rate_limit,
)

logger = logging.getLogger("VoxarTranscribe")

router = APIRouter(tags=["transcribe"])

# Allowed audio file extensions for upload
ALLOWED_AUDIO_EXTENSIONS = {
    ".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac",
    ".wma", ".opus", ".webm", ".mp4", ".mkv", ".avi",
}

# Allowed content types
ALLOWED_CONTENT_TYPES = {
    "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mpeg", "audio/mp3",
    "audio/flac", "audio/x-flac",
    "audio/ogg", "audio/vorbis",
    "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/aac",
    "audio/x-aac", "audio/wma", "audio/x-ms-wma",
    "audio/opus", "audio/webm",
    "video/mp4", "video/webm", "video/x-matroska", "video/avi",
    "application/octet-stream",  # Generic binary (allow, validate by extension)
}


def _validate_audio_upload(file: UploadFile, settings):
    """
    Validate an uploaded audio file.

    Checks:
      1. File extension is in the allowed list
      2. Content type is recognized
      3. File size is within limits

    Raises HTTPException on validation failure.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No audio file uploaded.",
        )

    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file format '{ext}'. "
                f"Supported: {', '.join(sorted(ALLOWED_AUDIO_EXTENSIONS))}"
            ),
        )

    # Check content type (lenient -- some clients send wrong types)
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        logger.warning(
            f"Unexpected content type '{file.content_type}' for {file.filename}, "
            f"allowing based on extension."
        )

    # Check file size (approximate, from content-length header)
    max_bytes = settings.MAX_AUDIO_UPLOAD_SIZE_MB * 1024 * 1024
    if file.size and file.size > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File too large: {file.size / (1024*1024):.1f}MB "
                f"(max {settings.MAX_AUDIO_UPLOAD_SIZE_MB}MB)."
            ),
        )


async def _save_upload_to_temp(file: UploadFile, settings):
    """
    Save uploaded audio file to a temporary location.

    Returns the temporary file path. Caller is responsible for cleanup.

    Raises HTTPException if file exceeds size limits during read.
    """
    max_bytes = settings.MAX_AUDIO_UPLOAD_SIZE_MB * 1024 * 1024
    ext = os.path.splitext(file.filename)[1].lower()

    # Create temp file with the correct extension (ffmpeg needs it)
    temp_dir = tempfile.mkdtemp(prefix="voxar_stt_")
    temp_path = os.path.join(temp_dir, f"upload{ext}")

    try:
        total_read = 0
        chunk_size = 1024 * 1024  # 1MB chunks

        with open(temp_path, "wb") as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                total_read += len(chunk)

                if total_read > max_bytes:
                    # Clean up partial file
                    f.close()
                    shutil.rmtree(temp_dir, ignore_errors=True)
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"File too large: exceeds {settings.MAX_AUDIO_UPLOAD_SIZE_MB}MB limit."
                        ),
                    )
                f.write(chunk)

        if total_read == 0:
            shutil.rmtree(temp_dir, ignore_errors=True)
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty.",
            )

        logger.info(
            f"Audio upload saved: {temp_path} ({total_read / (1024*1024):.1f}MB)"
        )
        return temp_path

    except HTTPException:
        raise
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save uploaded file: {e}",
        )


# ─── Endpoints ───────────────────────────────────────────────────────────

@router.post("/transcribe", dependencies=[Depends(check_rate_limit)])
async def transcribe_async(
    request: Request,
    file: UploadFile = File(..., description="Audio file to transcribe"),
    language: Optional[str] = Form(None, description="Language code (auto-detect if empty)"),
    task: str = Form("transcribe", description="'transcribe' or 'translate' (to English)"),
    diarize: bool = Form(False, description="Enable speaker diarization"),
    word_timestamps: bool = Form(True, description="Include word-level timestamps"),
    subtitle_format: str = Form("all", description="Subtitle format: srt, vtt, json, or all"),
    num_speakers: Optional[int] = Form(None, description="Exact number of speakers (optional)"),
    min_speakers: Optional[int] = Form(None, description="Minimum speakers (optional)"),
    max_speakers: Optional[int] = Form(None, description="Maximum speakers (optional)"),
    queue=Depends(get_queue),
    settings=Depends(get_settings),
):
    """
    Submit an async speech-to-text transcription job.

    Upload an audio file (WAV, MP3, FLAC, OGG, M4A, etc.) for transcription.
    Supports 99 languages with auto-detection.

    Returns a job_id that can be polled via GET /api/v1/transcribe/{job_id}.
    When completed, download results via GET /api/v1/transcribe/{job_id}/result.

    Features:
      - Automatic language detection with confidence score
      - Translation to English from any language
      - Speaker diarization (who said what)
      - SRT and VTT subtitle generation
      - Word-level timestamps for karaoke subtitles
    """
    # Validate upload
    _validate_audio_upload(file, settings)

    # Validate task
    if task not in ("transcribe", "translate"):
        raise HTTPException(
            status_code=400,
            detail="Invalid task. Use 'transcribe' or 'translate'.",
        )

    # Validate subtitle format
    if subtitle_format not in ("srt", "vtt", "json", "all"):
        raise HTTPException(
            status_code=400,
            detail="Invalid subtitle_format. Use 'srt', 'vtt', 'json', or 'all'.",
        )

    # Save upload to temp file
    temp_path = await _save_upload_to_temp(file, settings)

    try:
        job_id = await queue.submit_transcription(
            audio_path=temp_path,
            language=language if language else None,
            task=task,
            diarize=diarize,
            word_timestamps=word_timestamps,
            subtitle_format=subtitle_format,
            num_speakers=num_speakers,
            min_speakers=min_speakers,
            max_speakers=max_speakers,
        )
    except asyncio.QueueFull:
        # Clean up temp file on queue full
        shutil.rmtree(os.path.dirname(temp_path), ignore_errors=True)
        raise HTTPException(
            status_code=503,
            detail="Server busy. Transcription queue is full. Please try again later.",
        )

    return {
        "job_id": job_id,
        "status": "queued",
        "queue_position": queue.get_queue_position(job_id),
        "message": f"Transcription job submitted. Poll GET /api/v1/transcribe/{job_id} for status.",
    }


@router.post("/transcribe/sync", dependencies=[Depends(check_rate_limit)])
async def transcribe_sync(
    request: Request,
    file: UploadFile = File(..., description="Audio file to transcribe (max 60s)"),
    language: Optional[str] = Form(None, description="Language code (auto-detect if empty)"),
    task: str = Form("transcribe", description="'transcribe' or 'translate' (to English)"),
    diarize: bool = Form(False, description="Enable speaker diarization"),
    word_timestamps: bool = Form(True, description="Include word-level timestamps"),
    subtitle_format: str = Form("all", description="Subtitle format: srt, vtt, json, or all"),
    queue=Depends(get_queue),
    settings=Depends(get_settings),
    engine=Depends(get_engine),
):
    """
    Synchronous speech-to-text transcription. Blocks until result is ready.

    Limited to shorter audio files (max 60 seconds by default).
    For longer audio, use the async POST /api/v1/transcribe endpoint.

    Returns the full transcription result directly in the response.
    """
    # Validate upload
    _validate_audio_upload(file, settings)

    # Validate task
    if task not in ("transcribe", "translate"):
        raise HTTPException(
            status_code=400,
            detail="Invalid task. Use 'transcribe' or 'translate'.",
        )

    # Save upload to temp file
    temp_path = await _save_upload_to_temp(file, settings)

    try:
        job_id = await queue.submit_transcription(
            audio_path=temp_path,
            language=language if language else None,
            task=task,
            diarize=diarize,
            word_timestamps=word_timestamps,
            subtitle_format=subtitle_format,
        )
    except asyncio.QueueFull:
        shutil.rmtree(os.path.dirname(temp_path), ignore_errors=True)
        raise HTTPException(
            status_code=503,
            detail="Server busy. Please try again later.",
        )

    # Poll until complete or timeout
    # STT gets a longer timeout than TTS since it involves model swaps
    timeout = max(settings.JOB_TIMEOUT_SECONDS, 300)  # At least 5 minutes
    poll_interval = 0.5
    elapsed = 0.0

    while elapsed < timeout:
        job = queue.get_job(job_id)
        if not job:
            raise HTTPException(status_code=500, detail="Job disappeared from queue")

        if job.status == "completed":
            # Read and return the result JSON directly
            result = {
                "job_id": job.job_id,
                "status": "completed",
                "detected_language": job.detected_language,
                "language_probability": round(job.language_probability, 4),
                "audio_duration": round(job.audio_duration, 2),
                "processing_time": job.processing_time,
                "segment_count": job.segment_count,
                "word_count": job.word_count,
                "diarized": job.diarized,
                "num_speakers": job.num_speakers_detected,
                "result_url": f"/api/v1/transcribe/{job.job_id}/result",
            }

            # Include subtitle download URLs
            if job.stt_subtitle_paths:
                result["subtitle_urls"] = {}
                for fmt, path in job.stt_subtitle_paths.items():
                    result["subtitle_urls"][fmt] = (
                        f"/api/v1/transcribe/{job.job_id}/result?format={fmt}"
                    )

            return result

        if job.status == "failed":
            raise HTTPException(
                status_code=500,
                detail=f"Transcription failed: {job.error}",
            )

        await asyncio.sleep(poll_interval)
        elapsed += poll_interval

    raise HTTPException(
        status_code=504,
        detail=f"Transcription timed out after {timeout}s",
    )


@router.get("/transcribe/{job_id}", dependencies=[Depends(check_rate_limit)])
async def get_transcription_status(
    job_id: str,
    queue=Depends(get_queue),
):
    """
    Get the status of a transcription job.

    Poll this endpoint after submitting a job via POST /api/v1/transcribe.
    When status is "completed", use the result_url to download results.
    """
    job = queue.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found. Jobs expire after 1 hour.",
        )

    if job.job_type != "stt":
        raise HTTPException(
            status_code=400,
            detail=f"Job '{job_id}' is not a transcription job.",
        )

    return job.to_dict()


@router.get("/transcribe/{job_id}/result", dependencies=[Depends(check_rate_limit)])
async def download_transcription_result(
    job_id: str,
    format: str = "json",
    queue=Depends(get_queue),
):
    """
    Download the transcription result in the requested format.

    Formats:
      - json: Full transcription result with segments, words, and metadata
      - srt: SubRip subtitle file
      - vtt: WebVTT subtitle file
      - word_srt: Word-level SRT (karaoke-style)
      - word_vtt: Word-level VTT (karaoke-style)

    Only available for jobs with status "completed".
    """
    job = queue.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found.",
        )

    if job.job_type != "stt":
        raise HTTPException(
            status_code=400,
            detail=f"Job '{job_id}' is not a transcription job.",
        )

    if job.status == "queued" or job.status == "processing":
        raise HTTPException(
            status_code=409,
            detail=f"Job is still {job.status}. Please wait for completion.",
        )

    if job.status == "failed":
        raise HTTPException(
            status_code=410,
            detail=f"Transcription failed: {job.error}",
        )

    # Handle JSON result
    if format == "json":
        if not job.stt_result_path or not os.path.exists(job.stt_result_path):
            raise HTTPException(
                status_code=404,
                detail="Result file not found. It may have been cleaned up.",
            )
        return FileResponse(
            path=job.stt_result_path,
            media_type="application/json",
            filename=f"voxar_{job.job_id}_transcription.json",
        )

    # Handle subtitle files
    if not job.stt_subtitle_paths:
        raise HTTPException(
            status_code=404,
            detail="No subtitle files available for this job.",
        )

    if format not in job.stt_subtitle_paths:
        available = list(job.stt_subtitle_paths.keys())
        raise HTTPException(
            status_code=400,
            detail=(
                f"Format '{format}' not available for this job. "
                f"Available: {available}"
            ),
        )

    subtitle_path = job.stt_subtitle_paths[format]
    if not os.path.exists(subtitle_path):
        raise HTTPException(
            status_code=404,
            detail="Subtitle file not found. It may have been cleaned up.",
        )

    # Determine content type and filename
    content_types = {
        "srt": ("application/x-subrip", f"voxar_{job.job_id}.srt"),
        "vtt": ("text/vtt", f"voxar_{job.job_id}.vtt"),
        "word_srt": ("application/x-subrip", f"voxar_{job.job_id}_words.srt"),
        "word_vtt": ("text/vtt", f"voxar_{job.job_id}_words.vtt"),
    }
    media_type, filename = content_types.get(format, ("application/octet-stream", f"voxar_{job.job_id}.{format}"))

    return FileResponse(
        path=subtitle_path,
        media_type=media_type,
        filename=filename,
    )
