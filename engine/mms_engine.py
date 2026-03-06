"""
VOXAR MMS-TTS Engine v1.0
Wraps Facebook's MMS-TTS (Massively Multilingual Speech) for native Indian language TTS.

MMS uses VITS architecture with per-language models. Each model is ~300-500MB.
No voice cloning — uses a single default voice per language.
Native sample rate is 16kHz, resampled to 24kHz to match XTTS pipeline.

Supported languages:
  Hindi (hi), Tamil (ta), Telugu (te), Bengali (bn), Marathi (mr),
  Kannada (kn), Malayalam (ml), Gujarati (gu), Punjabi (pa), Odia (or)

RULES:
  - This module must NEVER contain credit/billing/API logic
  - Engine logic only — no web routing
  - Always unload before loading a different language model
"""

import os
import time
import logging
import numpy as np
import torch
from pathlib import Path
from datetime import datetime

logger = logging.getLogger("VoxarMMS")


class VoxarMMSEngine:
    """
    VOXAR MMS-TTS Engine — Native Indian Language TTS.

    Uses Facebook's MMS-TTS models via Hugging Face transformers.
    Each language has a separate VITS model (~300-500MB VRAM).

    Usage:
        mms = VoxarMMSEngine()
        result = mms.generate("नमस्ते दुनिया", language="hi")
        print(result["output_path"])
    """

    NATIVE_SAMPLE_RATE = 16000
    OUTPUT_SAMPLE_RATE = 24000

    # VOXAR language code → MMS model ID
    LANGUAGE_MODELS = {
        "hi": "facebook/mms-tts-hin",
        "ta": "facebook/mms-tts-tam",
        "te": "facebook/mms-tts-tel",
        "bn": "facebook/mms-tts-ben",
        "mr": "facebook/mms-tts-mar",
        "kn": "facebook/mms-tts-kan",
        "ml": "facebook/mms-tts-mal",
        "gu": "facebook/mms-tts-guj",
        "pa": "facebook/mms-tts-pan",
        "or": "facebook/mms-tts-ori",
    }

    LANGUAGE_NAMES = {
        "hi": "Hindi", "ta": "Tamil", "te": "Telugu", "bn": "Bengali",
        "mr": "Marathi", "kn": "Kannada", "ml": "Malayalam",
        "gu": "Gujarati", "pa": "Punjabi", "or": "Odia",
    }

    def __init__(self, output_dir="output"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # Model state — lazy loaded
        self._model = None
        self._tokenizer = None
        self._current_language = None
        self._current_model_id = None

        logger.info(f"VoxarMMSEngine initialized (device={self.device}, lazy loading)")

    @property
    def is_model_loaded(self):
        """Check if an MMS model is currently loaded."""
        return self._model is not None and self._tokenizer is not None

    @property
    def current_language(self):
        """Currently loaded language, or None."""
        return self._current_language

    def load_model(self, language):
        """
        Load the MMS model for a specific language.

        If a different language model is already loaded, it will be unloaded first.
        If the same language is already loaded, this is a no-op.

        Args:
            language: VOXAR language code (e.g., "ta", "te", "bn")
        """
        if language not in self.LANGUAGE_MODELS:
            raise ValueError(
                f"Language '{language}' not supported by MMS. "
                f"Supported: {sorted(self.LANGUAGE_MODELS.keys())}"
            )

        model_id = self.LANGUAGE_MODELS[language]

        # Already loaded for this language
        if self._current_model_id == model_id and self.is_model_loaded:
            logger.info(f"MMS model already loaded for {self.LANGUAGE_NAMES.get(language, language)}")
            return

        # Different model loaded — unload first
        if self.is_model_loaded:
            logger.info(f"Swapping MMS model: {self._current_language} → {language}")
            self.unload_model()

        logger.info(f"Loading MMS model: {model_id} ({self.LANGUAGE_NAMES.get(language, language)})")
        load_start = time.time()

        from transformers import VitsModel, AutoTokenizer

        self._tokenizer = AutoTokenizer.from_pretrained(model_id)
        self._model = VitsModel.from_pretrained(model_id).to(self.device)

        load_time = time.time() - load_start
        self._current_language = language
        self._current_model_id = model_id

        logger.info(f"MMS model loaded in {load_time:.1f}s")

        if self.device == "cuda":
            vram_used = torch.cuda.memory_allocated() / (1024 ** 3)
            logger.info(f"VRAM after MMS load: ~{vram_used:.2f} GB allocated")

    def unload_model(self):
        """Unload the current MMS model from memory."""
        if not self.is_model_loaded:
            logger.warning("MMS model already unloaded")
            return

        lang = self._current_language
        del self._model
        del self._tokenizer
        self._model = None
        self._tokenizer = None
        self._current_language = None
        self._current_model_id = None

        if self.device == "cuda":
            torch.cuda.empty_cache()
            torch.cuda.synchronize()

        logger.info(f"MMS model unloaded ({lang})")

    def generate(self, text, language, speed=None, output_filename=None,
                 speaker_wav=None, mode=None):
        """
        Generate speech from text using MMS-TTS.

        Args:
            text: input text in the target language script
            language: VOXAR language code (e.g., "ta", "hi")
            speed: speech speed multiplier (default 1.0)
            output_filename: custom output filename
            speaker_wav: ignored (MMS has no voice cloning, accepted for API compat)
            mode: ignored (MMS has no modes, accepted for API compat)

        Returns:
            dict matching VoxarTTSEngine.generate() format:
            {output_path, duration, characters, generation_time, mode,
             language, speed, chunks_used, quality_notes, file_size_kb}
        """
        if language not in self.LANGUAGE_MODELS:
            raise ValueError(
                f"Language '{language}' not supported by MMS. "
                f"Supported: {sorted(self.LANGUAGE_MODELS.keys())}"
            )

        # Ensure correct model is loaded
        self.load_model(language)

        clean_text = text.strip()
        if not clean_text:
            raise ValueError("Text is empty after stripping whitespace")

        if output_filename:
            output_path = self.output_dir / output_filename
        else:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
            output_path = self.output_dir / f"voxar_mms_{language}_{timestamp}.wav"

        logger.info(
            f"MMS generating: lang={language} | chars={len(clean_text)} | "
            f"text={clean_text[:60]}{'...' if len(clean_text) > 60 else ''}"
        )

        start_time = time.time()
        quality_notes = []

        try:
            inputs = self._tokenizer(clean_text, return_tensors="pt").to(self.device)

            with torch.no_grad():
                output = self._model(**inputs)
                waveform = output.waveform[0].cpu().numpy()

            # MMS outputs 16kHz — resample to 24kHz to match XTTS pipeline
            waveform_24k = self._resample(waveform, self.NATIVE_SAMPLE_RATE,
                                          self.OUTPUT_SAMPLE_RATE)

            # Apply speed adjustment if requested
            effective_speed = speed if speed is not None else 1.0
            if effective_speed != 1.0:
                waveform_24k = self._adjust_speed(waveform_24k, effective_speed)
                quality_notes.append(f"Speed adjusted to {effective_speed}x")

            # Save as WAV
            self._save_wav(waveform_24k, output_path, self.OUTPUT_SAMPLE_RATE)

        except Exception as e:
            logger.error(f"MMS generation failed: {type(e).__name__}: {e}")
            if self.device == "cuda":
                torch.cuda.empty_cache()
            raise

        gen_time = time.time() - start_time
        duration = len(waveform_24k) / self.OUTPUT_SAMPLE_RATE

        if duration < 0.5:
            quality_notes.append("WARNING: Audio very short")

        if self.device == "cuda":
            torch.cuda.empty_cache()

        quality_notes.append("Generated via MMS-TTS (no voice cloning)")

        result = {
            "output_path": str(output_path),
            "duration": round(duration, 2),
            "characters": len(clean_text),
            "generation_time": round(gen_time, 2),
            "mode": "mms",
            "mode_name": "MMS-TTS",
            "language": language,
            "speed": effective_speed,
            "chunks_used": 1,
            "quality_notes": quality_notes,
            "file_size_kb": round(os.path.getsize(output_path) / 1024, 1),
            "engine": "mms",
        }

        logger.info(
            f"MMS done: {duration:.2f}s audio in {gen_time:.2f}s | "
            f"{result['file_size_kb']}KB"
        )

        return result

    def _resample(self, audio, orig_sr, target_sr):
        """Resample audio from orig_sr to target_sr using linear interpolation."""
        if orig_sr == target_sr:
            return audio

        duration = len(audio) / orig_sr
        target_length = int(duration * target_sr)

        # Use numpy interp for simple, dependency-free resampling
        x_orig = np.linspace(0, duration, len(audio), endpoint=False)
        x_target = np.linspace(0, duration, target_length, endpoint=False)
        resampled = np.interp(x_target, x_orig, audio).astype(np.float32)

        return resampled

    def _adjust_speed(self, audio, speed):
        """Adjust audio speed by resampling (time-stretch without pitch shift)."""
        if speed == 1.0:
            return audio
        # Simple time-stretch via resampling
        target_length = int(len(audio) / speed)
        x_orig = np.linspace(0, 1, len(audio), endpoint=False)
        x_target = np.linspace(0, 1, target_length, endpoint=False)
        return np.interp(x_target, x_orig, audio).astype(np.float32)

    def _save_wav(self, audio, path, sample_rate):
        """Save float32 audio array as 16-bit WAV."""
        import wave

        # Normalize to prevent clipping
        peak = np.max(np.abs(audio))
        if peak > 0:
            audio = audio / peak * 0.95

        # Convert to 16-bit PCM
        audio_int16 = (audio * 32767).astype(np.int16)

        with wave.open(str(path), 'w') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(audio_int16.tobytes())

    def get_model_info(self):
        """Get info about the currently loaded model."""
        info = {
            "engine": "mms",
            "is_loaded": self.is_model_loaded,
            "current_language": self._current_language,
            "current_model_id": self._current_model_id,
            "supported_languages": sorted(self.LANGUAGE_MODELS.keys()),
            "device": self.device,
        }

        if self.device == "cuda":
            info["vram_allocated_gb"] = round(
                torch.cuda.memory_allocated() / (1024 ** 3), 2
            )

        return info

    @staticmethod
    def get_supported_languages():
        """Return list of supported language codes."""
        return sorted(VoxarMMSEngine.LANGUAGE_MODELS.keys())
