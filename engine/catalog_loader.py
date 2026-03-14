"""
VOXAR Catalog Loader
Ensures voice catalog and embeddings are available at runtime.

On RunPod / Docker, the bundled voices may live at a different path
than the runtime working directory.  This module:

  1. Checks whether the target voices_dir already has a valid catalog.
  2. If not, searches a list of known source locations.
  3. Copies voices_catalog.json + embeddings/*.wav to the target.

Called automatically by VoiceManager.__init__().
"""

import os
import json
import shutil
import logging
from pathlib import Path

logger = logging.getLogger("VoxarCatalogLoader")

CATALOG_FILENAME = "voices_catalog.json"
EMBEDDINGS_DIR = "embeddings"
PREVIEW_SCRIPTS = "preview_scripts.json"

# Ordered list of directories to search for bundled voices.
# First match with a valid catalog + embeddings wins.
_SOURCE_CANDIDATES = [
    "/app/voices",                      # Docker image (Dockerfile WORKDIR /app)
    "/workspace/voxar/voices",          # RunPod pod workspace
    "/workspace/voices",                # RunPod alt layout
    # Relative to this file's location (engine/../voices)
    str(Path(__file__).resolve().parent.parent / "voices"),
]


def _count_embeddings(directory):
    """Count .wav files in a directory."""
    if not os.path.isdir(directory):
        return 0
    return sum(1 for f in os.listdir(directory) if f.endswith(".wav"))


def _catalog_voice_count(catalog_path):
    """Read catalog JSON and return number of voices, or 0 on any error."""
    try:
        with open(catalog_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return len(data.get("voices", []))
    except (OSError, json.JSONDecodeError, ValueError):
        return 0


def _is_valid_source(directory):
    """A source is valid if it has a catalog with >0 voices AND >0 embedding WAVs."""
    catalog = os.path.join(directory, CATALOG_FILENAME)
    embeds = os.path.join(directory, EMBEDDINGS_DIR)
    return _catalog_voice_count(catalog) > 0 and _count_embeddings(embeds) > 0


def find_voice_source():
    """
    Search known locations for a directory with a valid voice catalog.

    Returns:
        str or None: path to the source voices directory
    """
    for candidate in _SOURCE_CANDIDATES:
        if _is_valid_source(candidate):
            vc = _catalog_voice_count(os.path.join(candidate, CATALOG_FILENAME))
            ec = _count_embeddings(os.path.join(candidate, EMBEDDINGS_DIR))
            logger.info(
                f"Found voice source: {candidate} "
                f"({vc} voices, {ec} embeddings)"
            )
            return candidate
    return None


def ensure_catalog(target_dir):
    """
    Guarantee that target_dir contains a usable voice catalog.

    If the target is already valid, returns immediately.
    Otherwise copies catalog + embeddings from the first valid source.

    Args:
        target_dir: path the VoiceManager will load from (e.g. "voices")

    Returns:
        str: resolved absolute path to the voices directory
    """
    target = Path(target_dir).resolve()
    target_catalog = target / CATALOG_FILENAME
    target_embeds = target / EMBEDDINGS_DIR

    # ── Already valid? ──
    if _is_valid_source(str(target)):
        vc = _catalog_voice_count(str(target_catalog))
        ec = _count_embeddings(str(target_embeds))
        logger.info(f"Voice catalog OK: {target} ({vc} voices, {ec} embeddings)")
        return str(target)

    # ── Target is missing or incomplete ──
    vc = _catalog_voice_count(str(target_catalog))
    ec = _count_embeddings(str(target_embeds))
    logger.warning(
        f"Voice catalog incomplete at {target} "
        f"(catalog={vc} voices, embeddings={ec} WAVs)"
    )

    source = find_voice_source()
    if source is None:
        logger.error(
            "No voice source found in any known location. "
            f"Searched: {_SOURCE_CANDIDATES}"
        )
        # Create dirs so VoiceManager doesn't crash on missing paths
        target.mkdir(parents=True, exist_ok=True)
        target_embeds.mkdir(parents=True, exist_ok=True)
        return str(target)

    src = Path(source).resolve()
    if src == target:
        logger.info("Source and target are the same directory")
        return str(target)

    logger.info(f"Copying voices: {src} -> {target}")

    # Ensure target structure
    target.mkdir(parents=True, exist_ok=True)
    target_embeds.mkdir(parents=True, exist_ok=True)

    # Copy catalog JSON
    src_catalog = src / CATALOG_FILENAME
    shutil.copy2(str(src_catalog), str(target_catalog))
    logger.info(f"  Copied {CATALOG_FILENAME}")

    # Copy embedding WAVs
    src_embeds = src / EMBEDDINGS_DIR
    copied = 0
    for fname in os.listdir(str(src_embeds)):
        if fname.endswith(".wav"):
            dst = target_embeds / fname
            if not dst.exists():
                shutil.copy2(str(src_embeds / fname), str(dst))
                copied += 1
    logger.info(f"  Copied {copied} embedding WAVs")

    # Copy preview scripts if available
    src_scripts = src / PREVIEW_SCRIPTS
    if src_scripts.is_file():
        shutil.copy2(str(src_scripts), str(target / PREVIEW_SCRIPTS))
        logger.info(f"  Copied {PREVIEW_SCRIPTS}")

    # Final validation
    vc = _catalog_voice_count(str(target_catalog))
    ec = _count_embeddings(str(target_embeds))
    logger.info(f"Voice catalog ready: {vc} voices, {ec} embeddings at {target}")

    return str(target)
