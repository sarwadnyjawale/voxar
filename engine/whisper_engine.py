"""
VOXAR Whisper Engine v1.0
Speech-to-Text engine wrapping faster-whisper (CTranslate2 backend).

Features:
  - Transcription with timestamps (segment-level and word-level)
  - Translation to English from any of 99 supported languages
  - Language auto-detection with confidence score
  - Configurable model size (tiny -> large-v3) and compute type (int8/float16)
  - Lazy model loading, clean unload with VRAM cleanup

Architecture:
  - Hot-swapped via EngineRouter (XTTS unloaded during STT)
  - VRAM: large-v3 int8 uses ~1GB (fits within 8.59GB RTX 4060 budget)
  - 4x faster than openai-whisper, 2x less VRAM, identical accuracy

RULES:
  - This module must NEVER contain credit/billing/API logic
  - Engine logic only -- no web routing
  - Always call torch.cuda.empty_cache() after unloading
"""

import os
import time
import logging
import torch
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger("VoxarWhisper")


# ─── Data Classes ────────────────────────────────────────────────────────

@dataclass
class WordSegment:
    """A single word with timestamp."""
    word: str
    start: float
    end: float
    probability: float

    def to_dict(self):
        return {
            "word": self.word,
            "start": round(self.start, 3),
            "end": round(self.end, 3),
            "probability": round(self.probability, 3),
        }


@dataclass
class TranscriptSegment:
    """A segment of transcribed text with timestamps."""
    id: int
    text: str
    start: float
    end: float
    words: list = field(default_factory=list)
    avg_logprob: float = 0.0
    no_speech_prob: float = 0.0
    speaker: Optional[str] = None  # Populated by diarizer

    def to_dict(self):
        result = {
            "id": self.id,
            "text": self.text,
            "start": round(self.start, 3),
            "end": round(self.end, 3),
            "avg_logprob": round(self.avg_logprob, 4),
            "no_speech_prob": round(self.no_speech_prob, 4),
        }
        if self.words:
            result["words"] = [w.to_dict() for w in self.words]
        if self.speaker:
            result["speaker"] = self.speaker
        return result


@dataclass
class TranscriptionResult:
    """Complete result of a transcription/translation job."""
    segments: list = field(default_factory=list)
    text: str = ""
    detected_language: str = ""
    language_probability: float = 0.0
    audio_duration: float = 0.0
    processing_time: float = 0.0
    task: str = "transcribe"  # "transcribe" or "translate"
    model_size: str = ""
    word_timestamps: bool = False
    diarized: bool = False

    def to_dict(self):
        return {
            "text": self.text,
            "segments": [s.to_dict() for s in self.segments],
            "detected_language": self.detected_language,
            "language_probability": round(self.language_probability, 4),
            "audio_duration": round(self.audio_duration, 2),
            "processing_time": round(self.processing_time, 2),
            "task": self.task,
            "model_size": self.model_size,
            "segment_count": len(self.segments),
            "word_count": sum(len(s.text.split()) for s in self.segments),
            "word_timestamps": self.word_timestamps,
            "diarized": self.diarized,
        }


# ─── Whisper Engine ──────────────────────────────────────────────────────

class VoxarWhisperEngine:
    """
    VOXAR Speech-to-Text Engine wrapping faster-whisper.

    Uses CTranslate2 backend for 4x speed and 2x VRAM savings over
    openai-whisper while maintaining identical accuracy.

    Usage:
        whisper = VoxarWhisperEngine(model_size="large-v3")
        result = whisper.transcribe("audio.wav")
        print(result.text)
        print(result.detected_language)
        for seg in result.segments:
            print(f"[{seg.start:.1f}s -> {seg.end:.1f}s] {seg.text}")

        # Translate to English
        result = whisper.transcribe("hindi_audio.wav", task="translate")

        # Cleanup
        whisper.unload_model()
    """

    # Valid model sizes (fastest -> best quality)
    VALID_MODEL_SIZES = {
        "tiny", "tiny.en",
        "base", "base.en",
        "small", "small.en",
        "medium", "medium.en",
        "large-v1", "large-v2", "large-v3",
        "distil-large-v2", "distil-large-v3",
    }

    # Valid compute types
    VALID_COMPUTE_TYPES = {
        "int8", "int8_float16", "int8_float32",
        "float16", "float32",
    }

    # Approximate VRAM usage per model (int8 quantization)
    MODEL_VRAM_MB = {
        "tiny": 39, "base": 74, "small": 244,
        "medium": 769, "large-v1": 1500, "large-v2": 1500,
        "large-v3": 1500, "distil-large-v2": 900, "distil-large-v3": 900,
    }

    # Maximum audio duration (seconds)
    MAX_AUDIO_DURATION = 7200  # 2 hours

    # Whisper's 99 supported languages
    SUPPORTED_LANGUAGES = {
        "af", "am", "ar", "as", "az", "ba", "be", "bg", "bn", "bo",
        "br", "bs", "ca", "cs", "cy", "da", "de", "el", "en", "es",
        "et", "eu", "fa", "fi", "fo", "fr", "gl", "gu", "ha", "haw",
        "he", "hi", "hr", "ht", "hu", "hy", "id", "is", "it", "ja",
        "jw", "ka", "kk", "km", "kn", "ko", "la", "lb", "ln", "lo",
        "lt", "lv", "mg", "mi", "mk", "ml", "mn", "mr", "ms", "mt",
        "my", "ne", "nl", "nn", "no", "oc", "pa", "pl", "ps", "pt",
        "ro", "ru", "sa", "sd", "si", "sk", "sl", "sn", "so", "sq",
        "sr", "su", "sv", "sw", "ta", "te", "tg", "th", "tk", "tl",
        "tr", "tt", "uk", "ur", "uz", "vi", "yi", "yo", "zh",
    }

    def __init__(self, model_size="large-v3", compute_type="int8", device=None):
        """
        Initialize the Whisper STT engine.

        Args:
            model_size: Whisper model size. Larger = better quality, more VRAM.
                        Options: tiny, base, small, medium, large-v3 (recommended)
            compute_type: Quantization type. int8 = best quality/VRAM ratio.
                          Options: int8, int8_float16, float16, float32
            device: "cuda" or "cpu". Auto-detects if None.
        """
        if model_size not in self.VALID_MODEL_SIZES:
            raise ValueError(
                f"Invalid model size '{model_size}'. "
                f"Valid: {sorted(self.VALID_MODEL_SIZES)}"
            )
        if compute_type not in self.VALID_COMPUTE_TYPES:
            raise ValueError(
                f"Invalid compute type '{compute_type}'. "
                f"Valid: {sorted(self.VALID_COMPUTE_TYPES)}"
            )

        self._model_size = model_size
        self._compute_type = compute_type
        self._device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # Model state -- lazy loaded
        self._model = None

        logger.info(
            f"VoxarWhisperEngine initialized: model={model_size} "
            f"compute={compute_type} device={self._device} (lazy loading)"
        )

    @property
    def is_model_loaded(self):
        """Check if the Whisper model is currently loaded."""
        return self._model is not None

    def load_model(self):
        """Load the faster-whisper model into memory."""
        if self.is_model_loaded:
            logger.info("Whisper model already loaded")
            return

        logger.info(
            f"Loading faster-whisper {self._model_size} "
            f"(compute={self._compute_type})..."
        )
        load_start = time.time()

        from faster_whisper import WhisperModel

        self._model = WhisperModel(
            self._model_size,
            device=self._device,
            compute_type=self._compute_type,
        )

        load_time = time.time() - load_start
        logger.info(f"Whisper model loaded in {load_time:.1f}s")

        if self._device == "cuda":
            vram_mb = torch.cuda.memory_allocated() / (1024 ** 2)
            logger.info(f"VRAM after Whisper load: ~{vram_mb:.0f}MB allocated")

    def unload_model(self):
        """Unload the Whisper model from memory."""
        if not self.is_model_loaded:
            logger.warning("Whisper model already unloaded")
            return

        del self._model
        self._model = None

        if self._device == "cuda":
            torch.cuda.empty_cache()
            torch.cuda.synchronize()

        logger.info("Whisper model unloaded")

    def transcribe(self, audio_path, language=None, task="transcribe",
                   beam_size=5, word_timestamps=True, initial_prompt=None,
                   vad_filter=True, vad_parameters=None):
        """
        Transcribe or translate an audio file.

        Args:
            audio_path: path to audio file (WAV, MP3, FLAC, etc.)
            language: language code (None = auto-detect, recommended)
            task: "transcribe" (keep original language) or
                  "translate" (translate to English)
            beam_size: beam search width (higher = better quality, slower)
            word_timestamps: include word-level timestamps
            initial_prompt: optional context prompt to guide transcription
            vad_filter: use voice activity detection to filter silence
            vad_parameters: custom VAD parameters dict

        Returns:
            TranscriptionResult with segments, text, language, timestamps
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        if task not in ("transcribe", "translate"):
            raise ValueError(f"Invalid task '{task}'. Use 'transcribe' or 'translate'.")

        if language and language not in self.SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Language '{language}' not supported by Whisper. "
                f"Use None for auto-detection."
            )

        if not self.is_model_loaded:
            self.load_model()

        logger.info(
            f"Whisper {task}: {Path(audio_path).name} | "
            f"lang={'auto' if not language else language} | "
            f"beam={beam_size} | word_ts={word_timestamps}"
        )

        start_time = time.time()

        # Configure VAD
        vad_params = vad_parameters or {
            "min_silence_duration_ms": 500,
            "speech_pad_ms": 200,
        }

        # Run faster-whisper transcription
        segments_gen, info = self._model.transcribe(
            audio_path,
            language=language,
            task=task,
            beam_size=beam_size,
            word_timestamps=word_timestamps,
            initial_prompt=initial_prompt,
            vad_filter=vad_filter,
            vad_parameters=vad_params if vad_filter else None,
        )

        # Collect segments (generator -> list)
        segments = []
        full_text_parts = []

        for i, seg in enumerate(segments_gen):
            words = []
            if word_timestamps and seg.words:
                words = [
                    WordSegment(
                        word=w.word,
                        start=w.start,
                        end=w.end,
                        probability=w.probability,
                    )
                    for w in seg.words
                ]

            segment = TranscriptSegment(
                id=i,
                text=seg.text.strip(),
                start=seg.start,
                end=seg.end,
                words=words,
                avg_logprob=seg.avg_logprob,
                no_speech_prob=seg.no_speech_prob,
            )
            segments.append(segment)
            full_text_parts.append(seg.text.strip())

        processing_time = time.time() - start_time

        result = TranscriptionResult(
            segments=segments,
            text=" ".join(full_text_parts),
            detected_language=info.language,
            language_probability=info.language_probability,
            audio_duration=info.duration,
            processing_time=processing_time,
            task=task,
            model_size=self._model_size,
            word_timestamps=word_timestamps,
        )

        # Calculate real-time factor
        rtf = processing_time / max(info.duration, 0.1)

        logger.info(
            f"Whisper done: {len(segments)} segments | "
            f"{info.duration:.1f}s audio | "
            f"lang={info.language} ({info.language_probability:.0%}) | "
            f"{processing_time:.1f}s processing (RTF={rtf:.2f})"
        )

        if self._device == "cuda":
            torch.cuda.empty_cache()

        return result

    def get_model_info(self):
        """Get information about the Whisper engine."""
        info = {
            "engine": "whisper",
            "backend": "faster-whisper (CTranslate2)",
            "model_size": self._model_size,
            "compute_type": self._compute_type,
            "device": self._device,
            "is_loaded": self.is_model_loaded,
            "supported_languages": len(self.SUPPORTED_LANGUAGES),
            "estimated_vram_mb": self.MODEL_VRAM_MB.get(
                self._model_size.split(".")[0], 0
            ),
        }

        if self._device == "cuda" and self.is_model_loaded:
            info["vram_allocated_mb"] = round(
                torch.cuda.memory_allocated() / (1024 ** 2)
            )

        return info
