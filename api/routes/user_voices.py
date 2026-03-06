"""
VOXAR User Voice Cloning Endpoints.
Upload, list, manage, and delete user-cloned voices.

Endpoints:
  POST   /api/v1/voices/clone           Upload a voice sample for cloning
  GET    /api/v1/voices/clone           List user's cloned voices
  GET    /api/v1/voices/clone/{voice_id} Get details of a cloned voice
  DELETE /api/v1/voices/clone/{voice_id} Delete a cloned voice
"""

import os
import tempfile
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from typing import Optional

from api.dependencies import (
    get_user_voice_manager, get_settings, check_rate_limit,
)

logger = logging.getLogger("VoxarUserVoices")

router = APIRouter(tags=["voice-cloning"])


def _get_api_key(request: Request) -> str:
    """Extract the authenticated API key from request state."""
    api_key = getattr(request.state, "api_key", None)
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required for voice cloning operations.",
        )
    return api_key


@router.post("/voices/clone", dependencies=[Depends(check_rate_limit)])
async def clone_voice(
    request: Request,
    file: UploadFile = File(
        ...,
        description="Audio file (WAV, MP3, FLAC, OGG, M4A). "
                    "10-120 seconds of clear speech. Max 15MB.",
    ),
    name: str = Form(
        ...,
        description="Display name for the voice (e.g., 'My Narration Voice')",
        min_length=1,
        max_length=50,
    ),
    language: str = Form(
        "en",
        description="Primary language: en, hi, ta, te, bn, mr, etc.",
    ),
    uvm=Depends(get_user_voice_manager),
    settings=Depends(get_settings),
):
    """
    Upload a voice sample to create a custom cloned voice.

    **Requirements for best results:**
    - 20-60 seconds of clear, continuous speech
    - Quiet environment (no background music, minimal noise)
    - Consistent volume and microphone distance
    - Natural speaking style (read a book paragraph or news article)

    **Supported formats:** WAV, MP3, FLAC, OGG, M4A, AAC

    **After upload:**
    - Your voice is cleaned and analyzed for cloning quality
    - If accepted, you receive a `voice_id` starting with `uv_`
    - Use this `voice_id` in the `/generate` endpoint to create speech

    **Quality grades:**
    - A+/A: Studio quality -- excellent cloning results
    - B+/B: Good quality -- natural sounding clone
    - C+/C: Acceptable -- clone works but could be better
    - D/F: Rejected -- see tips for improvement
    """
    api_key = _get_api_key(request)

    # ── Validate file basics ──
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    allowed = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac", ".wma"}
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "unsupported_format",
                "message": (
                    f"Unsupported audio format '{ext}'. "
                    f"Accepted: {', '.join(sorted(allowed))}"
                ),
                "tips": ["Convert your audio to WAV or MP3 before uploading."],
            },
        )

    # Check content type (loose check -- some clients send wrong types)
    if file.content_type and not (
        file.content_type.startswith("audio/")
        or file.content_type == "application/octet-stream"
    ):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "invalid_content_type",
                "message": f"Expected audio file, got '{file.content_type}'.",
                "tips": ["Upload a WAV, MP3, or FLAC audio file."],
            },
        )

    # ── Read file with size limit ──
    max_bytes = getattr(settings, "MAX_UPLOAD_SIZE_MB", 15) * 1024 * 1024
    content = await file.read()

    if len(content) > max_bytes:
        max_mb = max_bytes / (1024 * 1024)
        actual_mb = round(len(content) / (1024 * 1024), 1)
        raise HTTPException(
            status_code=413,
            detail={
                "error": "file_too_large",
                "message": f"File too large ({actual_mb}MB). Maximum is {max_mb:.0f}MB.",
                "tips": [
                    "Trim your audio to 20-60 seconds of clear speech.",
                    "Export as 128kbps MP3 to reduce file size.",
                ],
            },
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── Save to temp file and process ──
    temp_path = None
    try:
        # Write to temp file (VoiceSampleCleaner works with file paths)
        suffix = ext if ext else ".wav"
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=suffix, prefix="voxar_upload_"
        ) as tmp:
            tmp.write(content)
            temp_path = tmp.name

        logger.info(
            f"Voice clone upload: name='{name}' size={len(content)} "
            f"format={ext} api_key=...{api_key[-6:]}"
        )

        # ── Register voice (clean + analyze + store) ──
        result = uvm.register_voice(
            api_key=api_key,
            name=name,
            raw_audio_path=temp_path,
            language=language,
        )

        # Determine HTTP status based on acceptance
        if result["status"] == "rejected":
            return {
                "status": "rejected",
                "voice_id": None,
                "name": name,
                "quality_score": result.get("quality_score", 0),
                "quality_grade": result.get("quality_grade", "F"),
                "message": result.get("message", "Voice sample rejected."),
                "tips": result.get("tips", []),
                "analysis": result.get("analysis", {}),
            }

        return {
            "status": "accepted",
            "voice_id": result["voice_id"],
            "name": result["name"],
            "quality_score": result["quality_score"],
            "quality_grade": result["quality_grade"],
            "duration": result["duration"],
            "sample_rate": result["sample_rate"],
            "processing_time": result["processing_time"],
            "message": result["message"],
            "tips": result.get("tips", []),
            "usage": f"Use voice_id='{result['voice_id']}' in POST /api/v1/generate",
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Voice clone upload failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Voice processing failed. Please try again.",
        )
    finally:
        # Always clean up temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


@router.get("/voices/clone", dependencies=[Depends(check_rate_limit)])
async def list_user_voices(
    request: Request,
    uvm=Depends(get_user_voice_manager),
):
    """
    List all your cloned voices.

    Returns voice details including quality scores, usage counts,
    and creation dates. Sorted by newest first.
    """
    api_key = _get_api_key(request)

    voices = uvm.get_user_voices(api_key)

    # Build response (exclude internal fields)
    voice_list = []
    for v in voices:
        voice_list.append({
            "voice_id": v["voice_id"],
            "name": v["name"],
            "language": v.get("language", "en"),
            "status": v.get("status", "ready"),
            "quality_score": v.get("quality_score", 0),
            "quality_grade": v.get("quality_grade", ""),
            "duration": v.get("duration", 0),
            "usage_count": v.get("usage_count", 0),
            "created_at": v.get("created_at", ""),
        })

    max_voices = getattr(uvm, "MAX_VOICES_PER_USER", 10)

    return {
        "voices": voice_list,
        "total": len(voice_list),
        "limit": max_voices,
        "remaining": max(0, max_voices - len(voice_list)),
    }


@router.get("/voices/clone/{voice_id}", dependencies=[Depends(check_rate_limit)])
async def get_user_voice(
    voice_id: str,
    request: Request,
    uvm=Depends(get_user_voice_manager),
):
    """
    Get details of a specific cloned voice.

    Returns full metadata including quality analysis breakdown.
    """
    api_key = _get_api_key(request)

    # Validate format
    if not voice_id.startswith("uv_"):
        raise HTTPException(
            status_code=400,
            detail="Invalid voice ID format. User voice IDs start with 'uv_'.",
        )

    # Verify ownership
    if not uvm.verify_ownership(api_key, voice_id):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this voice.",
        )

    voice = uvm.get_voice(voice_id)
    if voice is None:
        raise HTTPException(
            status_code=404,
            detail=f"Voice '{voice_id}' not found.",
        )

    # Return full metadata (exclude internal paths)
    return {
        "voice_id": voice["voice_id"],
        "name": voice["name"],
        "language": voice.get("language", "en"),
        "status": voice.get("status", "ready"),
        "quality_score": voice.get("quality_score", 0),
        "quality_grade": voice.get("quality_grade", ""),
        "duration": voice.get("duration", 0),
        "sample_rate": voice.get("sample_rate", 0),
        "analysis": voice.get("analysis", {}),
        "usage_count": voice.get("usage_count", 0),
        "processing_time": voice.get("processing_time", 0),
        "created_at": voice.get("created_at", ""),
        "is_user_voice": True,
    }


@router.delete("/voices/clone/{voice_id}", dependencies=[Depends(check_rate_limit)])
async def delete_user_voice(
    voice_id: str,
    request: Request,
    uvm=Depends(get_user_voice_manager),
):
    """
    Delete a cloned voice permanently.

    This removes the voice sample, cleaned audio, and all metadata.
    Any future generation requests using this voice_id will fail.
    """
    api_key = _get_api_key(request)

    # Validate format
    if not voice_id.startswith("uv_"):
        raise HTTPException(
            status_code=400,
            detail="Invalid voice ID format. User voice IDs start with 'uv_'.",
        )

    try:
        deleted = uvm.delete_voice(api_key, voice_id)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Voice '{voice_id}' not found.",
        )

    return {
        "status": "deleted",
        "voice_id": voice_id,
        "message": "Voice permanently deleted.",
    }
