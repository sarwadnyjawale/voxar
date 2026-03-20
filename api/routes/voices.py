"""
VOXAR Voice Catalog Endpoints.
Browse and search the voice library.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from api.dependencies import get_voice_manager, check_rate_limit

logger = logging.getLogger("VoxarVoices")

router = APIRouter(tags=["voices"])


def _sanitize_voice(voice):
    """Strip internal paths from voice data for public API response."""
    safe = dict(voice)
    # Remove internal file paths
    safe.pop("embedding_path", None)
    # Convert preview_urls to public URLs
    previews = safe.get("preview_urls", {})
    if previews:
        safe["preview_urls"] = {
            lang: f"/previews/{path.split('/')[-1]}"
            for lang, path in previews.items()
        }
    return safe


@router.get("/voices", dependencies=[Depends(check_rate_limit)])
async def list_voices(
    voice_manager=Depends(get_voice_manager),
    language: Optional[str] = Query(None, description="Filter by language code (en, hi, ta, etc.)"),
    gender: Optional[str] = Query(None, description="Filter by gender (male, female)"),
    style: Optional[str] = Query(None, description="Filter by style tag"),
):
    """
    List all voices in the catalog, with optional filters.

    Filters can be combined: ?language=en&gender=female&style=narration
    """
    voices = voice_manager.list_voices()

    if language:
        voices = [v for v in voices if language in v.get("languages", [])]

    if gender:
        voices = [v for v in voices if v.get("gender") == gender]

    if style:
        voices = [
            v for v in voices
            if style in v.get("styles", []) or style in v.get("tags", [])
        ]

    return {
        "count": len(voices),
        "voices": [_sanitize_voice(v) for v in voices],
    }


@router.get("/voices/{voice_id}", dependencies=[Depends(check_rate_limit)])
async def get_voice(
    voice_id: str,
    voice_manager=Depends(get_voice_manager),
):
    """Get details for a specific voice by ID."""
    voice = voice_manager.get_voice(voice_id)
    if not voice:
        raise HTTPException(status_code=404, detail=f"Voice '{voice_id}' not found")

    return _sanitize_voice(voice)
