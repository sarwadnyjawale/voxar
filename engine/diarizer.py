"""
VOXAR Speaker Diarizer v1.0
Speaker diarization engine wrapping pyannote.audio.

Features:
  - Speaker identification (who said what)
  - Configurable speaker count (auto-detect, min/max bounds, or exact)
  - Merges diarization segments with Whisper transcript segments
  - Graceful degradation: works without pyannote (diarization simply disabled)

Architecture:
  - Hot-swapped via EngineRouter (loaded alongside Whisper during STT)
  - VRAM: pyannote pipeline uses ~0.5GB on CUDA
  - Requires HuggingFace token (pyannote models are gated)
  - Falls back gracefully if pyannote not installed or token missing

RULES:
  - This module must NEVER contain credit/billing/API logic
  - Engine logic only -- no web routing
  - Always call torch.cuda.empty_cache() after unloading
"""

import os
import time
import logging
import torch
from dataclasses import dataclass, field
from typing import Optional, List

logger = logging.getLogger("VoxarDiarizer")


# ─── Data Classes ────────────────────────────────────────────────────────

@dataclass
class DiarizationSegment:
    """A single diarization segment identifying a speaker over a time range."""
    speaker: str        # e.g., "SPEAKER_00", "SPEAKER_01"
    start: float        # seconds
    end: float          # seconds

    @property
    def duration(self):
        return self.end - self.start

    def to_dict(self):
        return {
            "speaker": self.speaker,
            "start": round(self.start, 3),
            "end": round(self.end, 3),
            "duration": round(self.duration, 3),
        }


@dataclass
class DiarizationResult:
    """Complete result of a diarization job."""
    segments: List[DiarizationSegment] = field(default_factory=list)
    num_speakers: int = 0
    speakers: List[str] = field(default_factory=list)
    audio_duration: float = 0.0
    processing_time: float = 0.0

    def to_dict(self):
        return {
            "segments": [s.to_dict() for s in self.segments],
            "num_speakers": self.num_speakers,
            "speakers": self.speakers,
            "audio_duration": round(self.audio_duration, 2),
            "processing_time": round(self.processing_time, 2),
            "segment_count": len(self.segments),
        }


# ─── Availability Check ─────────────────────────────────────────────────

def check_pyannote_available():
    """
    Check if pyannote.audio is installed and importable.

    Returns:
        tuple: (available: bool, reason: str)
    """
    try:
        import pyannote.audio  # noqa: F401
        return True, "pyannote.audio is available"
    except ImportError:
        return False, (
            "pyannote.audio not installed. "
            "Install with: pip install pyannote.audio"
        )


# ─── Speaker Diarizer ───────────────────────────────────────────────────

class VoxarDiarizer:
    """
    VOXAR Speaker Diarization Engine wrapping pyannote.audio.

    Identifies speakers in an audio file and assigns time-stamped speaker
    labels. Results can be merged with Whisper transcription segments to
    produce a full "who said what" transcript.

    Pyannote's speaker diarization pipeline:
      1. Voice Activity Detection (VAD) -- find speech regions
      2. Speaker Embedding Extraction -- neural voiceprint per region
      3. Clustering -- group regions by speaker identity
      4. Re-segmentation -- refine speaker boundaries

    Requirements:
      - pyannote.audio >= 3.0 (pip install pyannote.audio)
      - HuggingFace token with access to pyannote models (gated)
      - Accept terms at: https://huggingface.co/pyannote/speaker-diarization-3.1

    Usage:
        diarizer = VoxarDiarizer(hf_token="hf_...")
        result = diarizer.diarize("podcast.wav")
        for seg in result.segments:
            print(f"[{seg.start:.1f}s -> {seg.end:.1f}s] {seg.speaker}")

        # Merge with Whisper transcript
        merged = diarizer.merge_with_transcript(result.segments, whisper_segments)

        # Cleanup
        diarizer.unload_model()
    """

    # Pyannote model identifier (latest stable)
    PIPELINE_MODEL = "pyannote/speaker-diarization-3.1"

    # Sensible defaults for speaker count
    DEFAULT_MIN_SPEAKERS = 1
    DEFAULT_MAX_SPEAKERS = 10

    # Maximum audio duration for diarization (seconds)
    MAX_AUDIO_DURATION = 7200  # 2 hours

    def __init__(self, hf_token=None, device=None):
        """
        Initialize the speaker diarization engine.

        Args:
            hf_token: HuggingFace API token. Required for pyannote model
                      access (gated model). Can also be set via HF_TOKEN env var.
            device: "cuda" or "cpu". Auto-detects if None.
        """
        self._hf_token = hf_token or os.getenv("HF_TOKEN", "")
        self._device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # Model state -- lazy loaded
        self._pipeline = None

        # Check pyannote availability
        self._pyannote_available, self._pyannote_reason = check_pyannote_available()

        logger.info(
            f"VoxarDiarizer initialized: device={self._device} | "
            f"pyannote={'available' if self._pyannote_available else 'NOT available'} | "
            f"hf_token={'set' if self._hf_token else 'NOT set'} (lazy loading)"
        )

    @property
    def is_available(self):
        """
        Check if diarization is fully available.

        Requires:
          1. pyannote.audio installed
          2. HuggingFace token configured
        """
        return self._pyannote_available and bool(self._hf_token)

    @property
    def unavailable_reason(self):
        """Get the reason diarization is unavailable (or empty string if available)."""
        if not self._pyannote_available:
            return self._pyannote_reason
        if not self._hf_token:
            return (
                "HuggingFace token not configured. "
                "Set HF_TOKEN environment variable or pass hf_token to constructor. "
                "Get a token at: https://huggingface.co/settings/tokens "
                "and accept terms at: https://huggingface.co/pyannote/speaker-diarization-3.1"
            )
        return ""

    @property
    def is_model_loaded(self):
        """Check if the diarization pipeline is currently loaded."""
        return self._pipeline is not None

    def load_model(self):
        """
        Load the pyannote speaker diarization pipeline.

        Requires pyannote.audio and a valid HuggingFace token.

        Raises:
            RuntimeError: if pyannote is not available or HF token is missing
        """
        if self.is_model_loaded:
            logger.info("Diarization pipeline already loaded")
            return

        if not self._pyannote_available:
            raise RuntimeError(
                f"Cannot load diarization model: {self._pyannote_reason}"
            )

        if not self._hf_token:
            raise RuntimeError(
                "Cannot load diarization model: HuggingFace token not configured. "
                "Set HF_TOKEN environment variable."
            )

        logger.info(
            f"Loading pyannote diarization pipeline "
            f"({self.PIPELINE_MODEL})..."
        )
        load_start = time.time()

        from pyannote.audio import Pipeline

        self._pipeline = Pipeline.from_pretrained(
            self.PIPELINE_MODEL,
            use_auth_token=self._hf_token,
        )

        # Move to GPU if available
        if self._device == "cuda":
            self._pipeline.to(torch.device("cuda"))

        load_time = time.time() - load_start
        logger.info(f"Diarization pipeline loaded in {load_time:.1f}s")

        if self._device == "cuda":
            vram_mb = torch.cuda.memory_allocated() / (1024 ** 2)
            logger.info(f"VRAM after diarizer load: ~{vram_mb:.0f}MB allocated")

    def unload_model(self):
        """Unload the diarization pipeline from memory."""
        if not self.is_model_loaded:
            logger.warning("Diarization pipeline already unloaded")
            return

        del self._pipeline
        self._pipeline = None

        if self._device == "cuda":
            torch.cuda.empty_cache()
            torch.cuda.synchronize()

        logger.info("Diarization pipeline unloaded")

    def diarize(self, audio_path, num_speakers=None, min_speakers=None,
                max_speakers=None):
        """
        Perform speaker diarization on an audio file.

        Identifies who speaks when. Returns time-stamped speaker labels
        that can be merged with Whisper transcription segments.

        Args:
            audio_path: path to audio file (WAV recommended, any ffmpeg format supported)
            num_speakers: exact number of speakers (if known). Set to None for auto-detection.
            min_speakers: minimum expected speakers (helps constrain clustering).
                          Ignored if num_speakers is set.
            max_speakers: maximum expected speakers (helps constrain clustering).
                          Ignored if num_speakers is set.

        Returns:
            DiarizationResult with speaker segments, speaker count, and timing info.

        Raises:
            FileNotFoundError: if audio file doesn't exist
            RuntimeError: if diarization is not available
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        if not self.is_available:
            raise RuntimeError(
                f"Diarization not available: {self.unavailable_reason}"
            )

        # Load model if not already loaded
        if not self.is_model_loaded:
            self.load_model()

        logger.info(
            f"Diarizing: {os.path.basename(audio_path)} | "
            f"speakers={'auto' if num_speakers is None else num_speakers} | "
            f"min={min_speakers} max={max_speakers}"
        )

        start_time = time.time()

        # Build pipeline parameters
        params = {}
        if num_speakers is not None:
            params["num_speakers"] = num_speakers
        else:
            if min_speakers is not None:
                params["min_speakers"] = min_speakers
            if max_speakers is not None:
                params["max_speakers"] = max_speakers

        # Run diarization
        diarization = self._pipeline(audio_path, **params)

        # Convert pyannote output to our data structures
        # pyannote returns an Annotation object with (segment, track, label) tuples
        segments = []
        speakers_set = set()

        for turn, _, speaker in diarization.itertracks(yield_label=True):
            seg = DiarizationSegment(
                speaker=speaker,
                start=turn.start,
                end=turn.end,
            )
            segments.append(seg)
            speakers_set.add(speaker)

        # Sort segments by start time (should already be, but ensure)
        segments.sort(key=lambda s: s.start)

        # Merge very short adjacent segments from the same speaker
        # (pyannote sometimes produces fragments < 0.5s)
        segments = self._merge_adjacent_segments(segments, gap_threshold=0.5)

        processing_time = time.time() - start_time
        speakers_list = sorted(speakers_set)

        # Estimate audio duration from the last segment end
        audio_duration = max(s.end for s in segments) if segments else 0.0

        result = DiarizationResult(
            segments=segments,
            num_speakers=len(speakers_list),
            speakers=speakers_list,
            audio_duration=audio_duration,
            processing_time=processing_time,
        )

        logger.info(
            f"Diarization done: {result.num_speakers} speakers | "
            f"{len(segments)} segments | "
            f"{processing_time:.1f}s processing"
        )

        if self._device == "cuda":
            torch.cuda.empty_cache()

        return result

    @staticmethod
    def _merge_adjacent_segments(segments, gap_threshold=0.5):
        """
        Merge adjacent segments from the same speaker if the gap is small.

        Pyannote sometimes produces very short fragments. This consolidates
        them for cleaner output.

        Args:
            segments: list of DiarizationSegment, sorted by start time
            gap_threshold: max gap in seconds to merge (default: 0.5s)

        Returns:
            list of merged DiarizationSegment
        """
        if not segments:
            return segments

        merged = [segments[0]]

        for seg in segments[1:]:
            prev = merged[-1]

            # Same speaker and gap is small enough -> merge
            if seg.speaker == prev.speaker and (seg.start - prev.end) <= gap_threshold:
                # Extend the previous segment
                merged[-1] = DiarizationSegment(
                    speaker=prev.speaker,
                    start=prev.start,
                    end=max(prev.end, seg.end),
                )
            else:
                merged.append(seg)

        if len(merged) < len(segments):
            logger.debug(
                f"Merged {len(segments)} -> {len(merged)} diarization segments "
                f"(gap_threshold={gap_threshold}s)"
            )

        return merged

    def merge_with_transcript(self, diarization_segments, transcript_segments):
        """
        Assign speaker labels to Whisper transcript segments based on
        diarization results.

        Uses overlap-based matching: each transcript segment is assigned
        the speaker who has the maximum temporal overlap with it.

        Algorithm:
          For each transcript segment [t_start, t_end]:
            1. Find all diarization segments that overlap with it
            2. Calculate overlap duration with each speaker
            3. Assign the speaker with the maximum total overlap

        This is robust to boundary mismatches between Whisper and pyannote
        since they process audio independently.

        Args:
            diarization_segments: list of DiarizationSegment from diarize()
            transcript_segments: list of TranscriptSegment from Whisper

        Returns:
            list of TranscriptSegment with .speaker field populated
        """
        if not diarization_segments:
            logger.warning("No diarization segments to merge")
            return transcript_segments

        if not transcript_segments:
            logger.warning("No transcript segments to merge")
            return transcript_segments

        logger.info(
            f"Merging {len(transcript_segments)} transcript segments "
            f"with {len(diarization_segments)} diarization segments..."
        )

        assigned_count = 0

        for t_seg in transcript_segments:
            # Calculate overlap with each speaker
            speaker_overlaps = {}

            for d_seg in diarization_segments:
                # Calculate temporal overlap between transcript and diarization segment
                overlap_start = max(t_seg.start, d_seg.start)
                overlap_end = min(t_seg.end, d_seg.end)
                overlap_duration = max(0.0, overlap_end - overlap_start)

                if overlap_duration > 0:
                    if d_seg.speaker not in speaker_overlaps:
                        speaker_overlaps[d_seg.speaker] = 0.0
                    speaker_overlaps[d_seg.speaker] += overlap_duration

            # Assign speaker with maximum overlap
            if speaker_overlaps:
                best_speaker = max(speaker_overlaps, key=speaker_overlaps.get)
                t_seg.speaker = best_speaker
                assigned_count += 1
            else:
                # No overlap found -- could be silence or a segment that
                # falls outside diarization range
                t_seg.speaker = None

        unassigned = len(transcript_segments) - assigned_count
        logger.info(
            f"Speaker assignment: {assigned_count}/{len(transcript_segments)} segments | "
            f"{unassigned} unassigned"
        )

        # Fill unassigned gaps using nearest neighbor strategy
        # If a segment has no speaker, inherit from the nearest assigned segment
        if unassigned > 0:
            self._fill_unassigned_speakers(transcript_segments)

        return transcript_segments

    @staticmethod
    def _fill_unassigned_speakers(transcript_segments):
        """
        Fill unassigned speaker labels using nearest neighbor interpolation.

        For segments where no diarization overlap was found, assign the speaker
        from the nearest (by time) assigned segment. Prefers the preceding speaker
        (more natural in conversation flow) unless no preceding assignment exists.

        Args:
            transcript_segments: list of TranscriptSegment (modified in-place)
        """
        filled = 0

        for i, seg in enumerate(transcript_segments):
            if seg.speaker is not None:
                continue

            # Look backward first (more natural: inherit from previous speaker)
            for j in range(i - 1, -1, -1):
                if transcript_segments[j].speaker is not None:
                    seg.speaker = transcript_segments[j].speaker
                    filled += 1
                    break
            else:
                # Look forward if no backward match
                for j in range(i + 1, len(transcript_segments)):
                    if transcript_segments[j].speaker is not None:
                        seg.speaker = transcript_segments[j].speaker
                        filled += 1
                        break

        if filled > 0:
            logger.debug(
                f"Filled {filled} unassigned speaker labels via nearest neighbor"
            )

    def get_model_info(self):
        """Get information about the diarization engine."""
        info = {
            "engine": "diarizer",
            "backend": "pyannote.audio",
            "pipeline_model": self.PIPELINE_MODEL,
            "device": self._device,
            "is_available": self.is_available,
            "is_loaded": self.is_model_loaded,
            "pyannote_installed": self._pyannote_available,
            "hf_token_set": bool(self._hf_token),
        }

        if not self.is_available:
            info["unavailable_reason"] = self.unavailable_reason

        if self._device == "cuda" and self.is_model_loaded:
            info["vram_allocated_mb"] = round(
                torch.cuda.memory_allocated() / (1024 ** 2)
            )

        return info
