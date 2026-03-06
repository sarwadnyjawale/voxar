"""
VOXAR OpenVoice Engine v1.0
Wraps MyShell AI's OpenVoice V2 Tone Color Converter for voice identity transfer.

OpenVoice separates speech content from voice identity (tone color).
This enables applying a reference voice's identity onto MMS-generated audio,
giving us voice cloning for ALL regional Indian languages.

Pipeline:
  MMS output (perfect pronunciation) → OpenVoice (voice identity) → Final audio

The same 20 library voices work across all 12 languages:
  - EN/HI/MR: XTTS direct cloning (90-95% quality)
  - Regional: MMS + OpenVoice conversion (75-85% quality, perfect pronunciation)

RULES:
  - This module must NEVER contain credit/billing/API logic
  - Engine logic only — no web routing
  - Always call torch.cuda.empty_cache() after unloading
"""

import os
import time
import logging
import torch
import numpy as np
from pathlib import Path

logger = logging.getLogger("VoxarOpenVoice")


class VoxarOpenVoiceEngine:
    """
    VOXAR OpenVoice Engine — Tone Color Conversion for Voice Cloning.

    Uses MyShell AI's OpenVoice V2 to transfer voice identity from a reference
    speaker onto MMS-generated audio. This enables the same 20 library voices
    to work across all 12 supported languages.

    Usage:
        ov = VoxarOpenVoiceEngine()
        result = ov.convert(
            source_audio="mms_output.wav",
            reference_audio="voices/embeddings/v001_aisha.wav",
            output_path="output/converted.wav",
        )
    """

    # HuggingFace repo for OpenVoice V2 converter checkpoint
    CHECKPOINT_REPO = "myshell-ai/OpenVoiceV2"

    def __init__(self, checkpoint_dir=None, se_cache_dir=None):
        """
        Args:
            checkpoint_dir: path to converter checkpoint directory containing
                            config.json and checkpoint.pth. If None, auto-downloads
                            from HuggingFace.
            se_cache_dir: directory to cache extracted speaker embeddings on disk.
                          If None, uses in-memory cache only.
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._checkpoint_dir = checkpoint_dir
        self._se_cache_dir = Path(se_cache_dir) if se_cache_dir else None

        # Model state — lazy loaded
        self._converter = None

        # In-memory cache for speaker embeddings (voice_id → tensor)
        self._se_cache = {}

        if self._se_cache_dir:
            self._se_cache_dir.mkdir(parents=True, exist_ok=True)

        logger.info(
            f"VoxarOpenVoiceEngine initialized (device={self.device}, lazy loading)"
        )

    @property
    def is_model_loaded(self):
        """Check if the ToneColorConverter is currently loaded."""
        return self._converter is not None

    def _ensure_checkpoint(self):
        """
        Locate or download the OpenVoice V2 converter checkpoint.

        Returns:
            Path to the checkpoint directory containing config.json and checkpoint.pth
        """
        # User-specified local path
        if self._checkpoint_dir:
            ckpt_path = Path(self._checkpoint_dir)
            config = ckpt_path / "config.json"
            ckpt = ckpt_path / "checkpoint.pth"
            if config.exists() and ckpt.exists():
                return ckpt_path
            raise FileNotFoundError(
                f"Checkpoint not found at {ckpt_path}. "
                f"Expected config.json and checkpoint.pth"
            )

        # Auto-download from HuggingFace
        from huggingface_hub import snapshot_download

        logger.info(
            f"Downloading OpenVoice V2 checkpoint from {self.CHECKPOINT_REPO}..."
        )
        cache_dir = snapshot_download(
            repo_id=self.CHECKPOINT_REPO,
            allow_patterns=["converter/*"],
        )

        ckpt_path = Path(cache_dir) / "converter"
        self._checkpoint_dir = str(ckpt_path)
        logger.info(f"Checkpoint ready at: {ckpt_path}")
        return ckpt_path

    def load_model(self):
        """Load the ToneColorConverter model."""
        if self.is_model_loaded:
            logger.info("OpenVoice converter already loaded")
            return

        ckpt_path = self._ensure_checkpoint()

        logger.info("Loading OpenVoice ToneColorConverter...")
        load_start = time.time()

        from openvoice.api import ToneColorConverter

        config_path = str(ckpt_path / "config.json")
        checkpoint_path = str(ckpt_path / "checkpoint.pth")

        self._converter = ToneColorConverter(
            config_path,
            device=self.device,
            enable_watermark=False,  # Skip wavmark dependency
        )
        self._converter.load_ckpt(checkpoint_path)

        load_time = time.time() - load_start
        logger.info(f"OpenVoice converter loaded in {load_time:.1f}s")

        if self.device == "cuda":
            vram_used = torch.cuda.memory_allocated() / (1024 ** 3)
            logger.info(f"VRAM after OpenVoice load: ~{vram_used:.2f} GB allocated")

    def unload_model(self):
        """Unload the ToneColorConverter from memory."""
        if not self.is_model_loaded:
            logger.warning("OpenVoice converter already unloaded")
            return

        del self._converter
        self._converter = None

        # Clear in-memory SE cache (tensors may reference GPU memory)
        self._se_cache.clear()

        if self.device == "cuda":
            torch.cuda.empty_cache()
            torch.cuda.synchronize()

        logger.info("OpenVoice converter unloaded")

    def extract_se(self, audio_path, voice_id=None):
        """
        Extract speaker embedding (SE) from an audio file.

        Args:
            audio_path: path to WAV audio file
            voice_id: optional cache key. If provided, result is cached both
                      in-memory and on disk (if se_cache_dir is set).

        Returns:
            torch.Tensor — speaker embedding
        """
        # Check in-memory cache
        if voice_id and voice_id in self._se_cache:
            logger.debug(f"SE cache hit (memory) for {voice_id}")
            return self._se_cache[voice_id]

        # Check disk cache
        if voice_id and self._se_cache_dir:
            disk_path = self._se_cache_dir / f"{voice_id}_se.pt"
            if disk_path.exists():
                se = torch.load(str(disk_path), map_location=self.device)
                self._se_cache[voice_id] = se
                logger.info(f"SE loaded from disk cache for {voice_id}")
                return se

        if not self.is_model_loaded:
            self.load_model()

        logger.info(f"Extracting SE from: {Path(audio_path).name}")

        # Use ToneColorConverter.extract_se() — accepts list of wav paths
        se_save_path = None
        if voice_id and self._se_cache_dir:
            se_save_path = str(self._se_cache_dir / f"{voice_id}_se.pt")

        se = self._converter.extract_se(
            [str(audio_path)],
            se_save_path=se_save_path,
        )

        # Move to correct device if loaded from disk save
        se = se.to(self.device)

        # Cache in memory
        if voice_id:
            self._se_cache[voice_id] = se
            logger.info(f"Extracted and cached SE for {voice_id}")

        return se

    def convert(self, source_audio, reference_audio, output_path,
                voice_id=None, tau=0.3):
        """
        Convert the voice identity of source audio to match the reference speaker.

        This is the core method for Approach B regional language pipeline:
        MMS output (perfect pronunciation) + reference voice → cloned output.

        Args:
            source_audio: path to source audio (e.g., MMS-TTS output)
            reference_audio: path to reference voice (e.g., library voice embedding WAV)
            output_path: path to save the converted audio
            voice_id: optional voice ID for SE caching (e.g., "v001")
            tau: tone color conversion strength (0.0-1.0, default 0.3).
                 Higher = stronger voice identity transfer.

        Returns:
            dict with output_path, duration, conversion_time, voice_id, engine
        """
        if not self.is_model_loaded:
            self.load_model()

        logger.info(
            f"OpenVoice converting: {Path(source_audio).name} → "
            f"{Path(reference_audio).name} voice (tau={tau})"
        )

        start_time = time.time()

        # Extract source SE (from MMS output — always fresh, not cached)
        source_se = self._converter.extract_se([str(source_audio)])
        source_se = source_se.to(self.device)

        # Extract target SE (from reference voice — cached by voice_id)
        target_se = self.extract_se(reference_audio, voice_id=voice_id)

        # Ensure output directory exists
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        # Perform tone color conversion
        self._converter.convert(
            audio_src_path=str(source_audio),
            src_se=source_se,
            tgt_se=target_se,
            output_path=str(output_path),
            tau=tau,
            message="default",
        )

        conversion_time = time.time() - start_time

        # Get output file info
        duration = 0.0
        file_size_kb = 0.0
        try:
            import soundfile as sf
            data, sr = sf.read(str(output_path))
            duration = len(data) / sr
            file_size_kb = os.path.getsize(output_path) / 1024
        except Exception:
            try:
                file_size_kb = os.path.getsize(output_path) / 1024
            except Exception:
                pass

        if self.device == "cuda":
            torch.cuda.empty_cache()

        result = {
            "output_path": str(output_path),
            "duration": round(duration, 2),
            "conversion_time": round(conversion_time, 2),
            "voice_id": voice_id,
            "tau": tau,
            "file_size_kb": round(file_size_kb, 1),
            "engine": "openvoice",
        }

        logger.info(
            f"OpenVoice done: {duration:.2f}s audio converted in "
            f"{conversion_time:.2f}s | {file_size_kb:.1f}KB"
        )

        return result

    def preload_voice_library(self, embeddings_dir):
        """
        Pre-extract and cache speaker embeddings for all voices in the library.

        Call this once at startup to avoid extraction latency during generation.

        Args:
            embeddings_dir: path to voices/embeddings/ directory containing
                            voice WAV files named like v001_aisha.wav

        Returns:
            dict mapping voice_id → SE tensor
        """
        if not self.is_model_loaded:
            self.load_model()

        embeddings_path = Path(embeddings_dir)
        loaded = {}

        for wav_file in sorted(embeddings_path.glob("v*_*.wav")):
            # Extract voice_id from filename (e.g., "v001_aisha.wav" → "v001")
            voice_id = wav_file.stem.split("_")[0]

            se = self.extract_se(str(wav_file), voice_id=voice_id)
            loaded[voice_id] = se

        logger.info(f"Pre-loaded {len(loaded)} voice SEs from {embeddings_dir}")
        return loaded

    def get_model_info(self):
        """Get info about the OpenVoice engine."""
        info = {
            "engine": "openvoice",
            "version": "v2",
            "is_loaded": self.is_model_loaded,
            "cached_speakers": sorted(self._se_cache.keys()),
            "cached_count": len(self._se_cache),
            "device": self.device,
            "se_cache_dir": str(self._se_cache_dir) if self._se_cache_dir else None,
        }

        if self.device == "cuda":
            info["vram_allocated_gb"] = round(
                torch.cuda.memory_allocated() / (1024 ** 3), 2
            )

        return info
