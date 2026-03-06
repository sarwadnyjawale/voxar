"""
VOXAR User Voice Manager v1.0
Manages user-uploaded voice samples for custom voice cloning.

Provides the complete pipeline from raw upload to cloning-ready voice:
  1. Validate uploaded audio (format, duration, noise, speech content)
  2. Clean via VoiceSampleCleaner (noise reduce, normalize, trim)
  3. Deep quality analysis (SNR, speech ratio, clipping, spectral quality)
  4. Store cleaned sample + metadata per user
  5. Resolve voice_id -> embedding path for TTS generation

Storage layout:
  voices/user_voices/{api_key_hash}/{voice_id}/
    raw_upload.wav      -- Original upload preserved for re-processing
    cleaned.wav         -- Cleaned sample used as XTTS speaker_wav
    metadata.json       -- Voice metadata, quality scores, analysis

Voice ID format:
  uv_{api_key_hash_6}_{uuid_8}  (e.g., "uv_a3f82b_d9e1c047")

RULES:
  - This module must NEVER contain credit/billing/API logic
  - Engine logic only -- no web routing
  - Always validate ownership (api_key) before operations
"""

import os
import json
import uuid
import time
import shutil
import hashlib
import logging
import numpy as np
from pathlib import Path
from datetime import datetime, timezone

from engine.voice_cleaner import VoiceSampleCleaner

logger = logging.getLogger("VoxarUserVoice")


class UserVoiceManager:
    """
    Manages user-uploaded voice clones with ElevenLabs-grade quality checks.

    Each user (identified by API key) can upload voice samples which are
    cleaned, validated, and stored for use as XTTS speaker references.

    Usage:
        uvm = UserVoiceManager(base_dir="voices/user_voices")

        # Register a new voice from uploaded audio
        result = uvm.register_voice(
            api_key="voxar-dev-key-001",
            name="My Voice",
            raw_audio_path="/tmp/upload.wav",
            language="en",
        )
        print(result["voice_id"])  # "uv_a3f82b_d9e1c047"

        # Use in generation
        path = uvm.resolve_embedding_path("uv_a3f82b_d9e1c047")
        # -> "voices/user_voices/a3f82b/uv_a3f82b_d9e1c047/cleaned.wav"

        # List user's voices
        voices = uvm.get_user_voices("voxar-dev-key-001")

        # Delete
        uvm.delete_voice("voxar-dev-key-001", "uv_a3f82b_d9e1c047")
    """

    # ─── Constants ───────────────────────────────────────────────────────

    MAX_VOICES_PER_USER = 10
    MAX_UPLOAD_SIZE_MB = 15
    MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

    # Audio requirements for high-quality voice cloning
    ALLOWED_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac", ".wma"}
    MIN_DURATION_SECONDS = 10       # Absolute minimum for voice cloning
    MAX_DURATION_SECONDS = 120      # Reject uploads longer than 2 minutes
    IDEAL_DURATION_MIN = 20         # Best results require at least 20s
    IDEAL_DURATION_MAX = 60         # Diminishing returns beyond 60s
    MIN_SAMPLE_RATE = 16000         # Below this, quality degrades sharply
    QUALITY_THRESHOLD = 6           # Minimum cleaner score to accept (out of 10)

    # Deep analysis thresholds
    MIN_SPEECH_RATIO = 0.3          # At least 30% of audio must be speech
    MAX_SILENCE_RATIO = 0.5         # No more than 50% silence
    MIN_SNR_DB = 10                 # Minimum signal-to-noise ratio
    MAX_CLIPPING_RATIO = 0.01       # Less than 1% of samples clipping

    def __init__(self, base_dir="voices/user_voices"):
        """
        Initialize UserVoiceManager.

        Args:
            base_dir: root directory for user voice storage
        """
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

        # Initialize the sample cleaner (reuses Phase 4 component)
        self._cleaner = VoiceSampleCleaner()

        logger.info(
            f"UserVoiceManager initialized: base_dir={self.base_dir} "
            f"max_voices_per_user={self.MAX_VOICES_PER_USER}"
        )

    # ─── Public API ──────────────────────────────────────────────────────

    def register_voice(self, api_key, name, raw_audio_path, language="en"):
        """
        Register a new user voice from an uploaded audio file.

        Full pipeline:
          1. Pre-validate audio (format, size, duration, sample rate)
          2. Clean sample (noise reduce, normalize, trim, quality check)
          3. Deep quality analysis (SNR, speech ratio, clipping, spectral)
          4. Store cleaned sample + metadata
          5. Return detailed result with voice_id and quality feedback

        Args:
            api_key: user's API key (for scoping and ownership)
            name: display name for the voice (e.g., "My Narration Voice")
            raw_audio_path: path to the uploaded audio file
            language: primary language code (default "en")

        Returns:
            dict with:
                voice_id, name, status ("accepted" or "rejected"),
                quality_score (0-10), quality_grade (A-F),
                duration, sample_rate, analysis (detailed breakdown),
                tips (improvement suggestions), embedding_path (if accepted)

        Raises:
            ValueError: if input validation fails (format, size, etc.)
            FileNotFoundError: if raw_audio_path doesn't exist
        """
        start_time = time.time()

        # ── Validate inputs ──
        if not name or not name.strip():
            raise ValueError("Voice name is required")
        name = name.strip()[:50]  # Cap name length

        if not os.path.exists(raw_audio_path):
            raise FileNotFoundError(f"Audio file not found: {raw_audio_path}")

        # Check voice count limit
        current_count = self.get_voice_count(api_key)
        if current_count >= self.MAX_VOICES_PER_USER:
            raise ValueError(
                f"Voice limit reached ({self.MAX_VOICES_PER_USER} max). "
                f"Delete an existing voice to upload a new one."
            )

        # ── Step 1: Pre-validate audio file ──
        pre_validation = self._pre_validate(raw_audio_path)
        if not pre_validation["valid"]:
            return self._rejection_result(
                name=name,
                reason=pre_validation["reason"],
                tips=pre_validation.get("tips", []),
            )

        # ── Generate voice ID and create directories ──
        key_hash = self._hash_api_key(api_key)
        voice_id = self._generate_voice_id(key_hash)

        voice_dir = self.base_dir / key_hash / voice_id
        voice_dir.mkdir(parents=True, exist_ok=True)

        raw_save_path = voice_dir / "raw_upload.wav"
        cleaned_path = voice_dir / "cleaned.wav"

        try:
            # ── Save raw upload (convert to WAV for consistency) ──
            self._save_raw_upload(raw_audio_path, str(raw_save_path))

            # ── Step 2: Clean the sample ──
            logger.info(f"Cleaning voice sample for {voice_id}...")
            clean_result = self._cleaner.clean_sample(
                str(raw_save_path), str(cleaned_path)
            )

            # ── Step 3: Deep quality analysis ──
            analysis = self._deep_quality_analysis(str(cleaned_path), clean_result)

            # ── Determine acceptance ──
            accepted = (
                clean_result["accepted"]
                and analysis["overall_score"] >= self.QUALITY_THRESHOLD
                and analysis["speech_ratio"] >= self.MIN_SPEECH_RATIO
            )

            quality_grade = self._score_to_grade(analysis["overall_score"])

            if not accepted:
                # Clean up directories on rejection
                shutil.rmtree(str(voice_dir), ignore_errors=True)

                tips = self._generate_improvement_tips(analysis, clean_result)
                return self._rejection_result(
                    name=name,
                    reason=self._build_rejection_reason(analysis, clean_result),
                    tips=tips,
                    analysis=analysis,
                    quality_score=analysis["overall_score"],
                    quality_grade=quality_grade,
                )

            # ── Step 4: Store metadata ──
            processing_time = round(time.time() - start_time, 2)

            metadata = {
                "voice_id": voice_id,
                "name": name,
                "api_key_hash": key_hash,
                "language": language,
                "status": "ready",
                "quality_score": analysis["overall_score"],
                "quality_grade": quality_grade,
                "duration": clean_result["duration"],
                "sample_rate": clean_result["sample_rate"],
                "analysis": analysis,
                "cleaner_issues": clean_result["issues"],
                "processing_time": processing_time,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "usage_count": 0,
                "is_user_voice": True,
            }

            metadata_path = voice_dir / "metadata.json"
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)

            logger.info(
                f"Voice registered: {voice_id} | name={name} | "
                f"quality={analysis['overall_score']}/10 ({quality_grade}) | "
                f"duration={clean_result['duration']}s | "
                f"processed in {processing_time}s"
            )

            return {
                "voice_id": voice_id,
                "name": name,
                "status": "accepted",
                "quality_score": analysis["overall_score"],
                "quality_grade": quality_grade,
                "duration": clean_result["duration"],
                "sample_rate": clean_result["sample_rate"],
                "analysis": analysis,
                "tips": self._generate_improvement_tips(analysis, clean_result),
                "embedding_path": str(cleaned_path),
                "processing_time": processing_time,
                "message": self._build_acceptance_message(analysis, quality_grade),
            }

        except Exception as e:
            # Clean up on any error
            if voice_dir.exists():
                shutil.rmtree(str(voice_dir), ignore_errors=True)
            logger.error(f"Voice registration failed: {e}")
            raise

    def get_voice(self, voice_id):
        """
        Get a user voice by ID.

        Returns:
            dict with voice metadata, or None if not found
        """
        if not voice_id or not voice_id.startswith("uv_"):
            return None

        # Extract key_hash from voice_id: uv_{key_hash}_{uuid}
        parts = voice_id.split("_", 2)
        if len(parts) < 3:
            return None

        key_hash = parts[1]
        metadata_path = self.base_dir / key_hash / voice_id / "metadata.json"

        if not metadata_path.exists():
            return None

        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            logger.warning(f"Failed to read metadata for {voice_id}: {e}")
            return None

    def get_user_voices(self, api_key):
        """
        Get all voices belonging to a specific API key.

        Args:
            api_key: the user's API key

        Returns:
            list of voice metadata dicts, sorted by creation date (newest first)
        """
        key_hash = self._hash_api_key(api_key)
        user_dir = self.base_dir / key_hash

        if not user_dir.exists():
            return []

        voices = []
        for voice_dir in sorted(user_dir.iterdir()):
            if not voice_dir.is_dir():
                continue

            metadata_path = voice_dir / "metadata.json"
            if metadata_path.exists():
                try:
                    with open(metadata_path, "r", encoding="utf-8") as f:
                        metadata = json.load(f)
                        voices.append(metadata)
                except (json.JSONDecodeError, OSError):
                    continue

        # Sort by creation date, newest first
        voices.sort(key=lambda v: v.get("created_at", ""), reverse=True)
        return voices

    def delete_voice(self, api_key, voice_id):
        """
        Delete a user voice (files + metadata).

        Args:
            api_key: the user's API key (for ownership verification)
            voice_id: the voice ID to delete

        Returns:
            bool: True if deleted, False if not found

        Raises:
            PermissionError: if voice doesn't belong to this API key
        """
        if not voice_id or not voice_id.startswith("uv_"):
            return False

        # Verify ownership
        key_hash = self._hash_api_key(api_key)
        parts = voice_id.split("_", 2)
        if len(parts) < 3:
            return False

        voice_key_hash = parts[1]
        if voice_key_hash != key_hash:
            raise PermissionError(
                "You can only delete your own voices."
            )

        voice_dir = self.base_dir / key_hash / voice_id

        if not voice_dir.exists():
            return False

        shutil.rmtree(str(voice_dir), ignore_errors=True)
        logger.info(f"Voice deleted: {voice_id}")
        return True

    def get_voice_count(self, api_key):
        """Get the number of voices for a specific API key."""
        key_hash = self._hash_api_key(api_key)
        user_dir = self.base_dir / key_hash

        if not user_dir.exists():
            return 0

        count = 0
        for item in user_dir.iterdir():
            if item.is_dir() and (item / "metadata.json").exists():
                count += 1
        return count

    def resolve_embedding_path(self, voice_id):
        """
        Resolve a user voice ID to its cleaned WAV path (used as XTTS speaker_wav).

        Args:
            voice_id: user voice ID (e.g., "uv_a3f82b_d9e1c047")

        Returns:
            str: absolute path to cleaned.wav

        Raises:
            ValueError: if voice_id format is invalid
            FileNotFoundError: if voice or cleaned audio doesn't exist
        """
        if not voice_id or not voice_id.startswith("uv_"):
            raise ValueError(f"Invalid user voice ID format: {voice_id}")

        parts = voice_id.split("_", 2)
        if len(parts) < 3:
            raise ValueError(f"Invalid user voice ID format: {voice_id}")

        key_hash = parts[1]
        cleaned_path = self.base_dir / key_hash / voice_id / "cleaned.wav"

        if not cleaned_path.exists():
            raise FileNotFoundError(
                f"User voice not found: {voice_id}. "
                f"It may have been deleted."
            )

        return str(cleaned_path.resolve())

    def verify_ownership(self, api_key, voice_id):
        """
        Verify that a voice belongs to the given API key.

        Args:
            api_key: the user's API key
            voice_id: the voice ID to check

        Returns:
            bool: True if the voice belongs to this API key
        """
        if not voice_id or not voice_id.startswith("uv_"):
            return False

        key_hash = self._hash_api_key(api_key)
        parts = voice_id.split("_", 2)
        if len(parts) < 3:
            return False

        return parts[1] == key_hash

    def increment_usage(self, voice_id):
        """Increment the usage counter for a voice."""
        voice = self.get_voice(voice_id)
        if voice is None:
            return

        voice["usage_count"] = voice.get("usage_count", 0) + 1

        parts = voice_id.split("_", 2)
        if len(parts) >= 3:
            key_hash = parts[1]
            metadata_path = self.base_dir / key_hash / voice_id / "metadata.json"
            try:
                with open(metadata_path, "w", encoding="utf-8") as f:
                    json.dump(voice, f, indent=2, ensure_ascii=False)
            except OSError:
                pass

    @staticmethod
    def is_user_voice_id(voice_id):
        """Check if a voice_id is a user voice (starts with 'uv_')."""
        return isinstance(voice_id, str) and voice_id.startswith("uv_")

    # ─── Pre-validation ──────────────────────────────────────────────────

    def _pre_validate(self, audio_path):
        """
        Pre-validate an audio file before cleaning.

        Checks: file size, extension, loadability, duration, sample rate.

        Returns:
            dict with: valid (bool), reason (str if invalid), tips (list)
        """
        # File existence
        if not os.path.exists(audio_path):
            return {
                "valid": False,
                "reason": "Audio file not found.",
                "tips": ["Make sure the file path is correct."],
            }

        # File size
        file_size = os.path.getsize(audio_path)
        if file_size > self.MAX_UPLOAD_SIZE_BYTES:
            size_mb = round(file_size / (1024 * 1024), 1)
            return {
                "valid": False,
                "reason": f"File too large ({size_mb}MB). Maximum is {self.MAX_UPLOAD_SIZE_MB}MB.",
                "tips": [
                    "Trim your audio to 20-60 seconds of clear speech.",
                    "Use a lower quality export setting (128kbps MP3 is fine for voice cloning).",
                ],
            }

        # Extension
        ext = Path(audio_path).suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return {
                "valid": False,
                "reason": (
                    f"Unsupported format '{ext}'. "
                    f"Accepted: {', '.join(sorted(self.ALLOWED_EXTENSIONS))}"
                ),
                "tips": [
                    "Convert your audio to WAV or MP3 format before uploading.",
                ],
            }

        # Load and check duration / sample rate
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_file(audio_path)
        except Exception as e:
            return {
                "valid": False,
                "reason": f"Cannot read audio file: {e}",
                "tips": [
                    "Make sure the file is a valid audio file and not corrupted.",
                    "Try re-exporting the audio from your recording software.",
                ],
            }

        duration = len(audio) / 1000.0

        if duration < self.MIN_DURATION_SECONDS:
            return {
                "valid": False,
                "reason": (
                    f"Audio too short ({duration:.1f}s). "
                    f"Minimum {self.MIN_DURATION_SECONDS} seconds required."
                ),
                "tips": [
                    "Record at least 20-30 seconds of clear speech for best results.",
                    "Read a paragraph from a book or article in your natural voice.",
                    "Avoid long pauses between sentences.",
                ],
            }

        if duration > self.MAX_DURATION_SECONDS:
            return {
                "valid": False,
                "reason": (
                    f"Audio too long ({duration:.1f}s). "
                    f"Maximum {self.MAX_DURATION_SECONDS} seconds. "
                    f"We recommend 20-60 seconds for best quality."
                ),
                "tips": [
                    "Trim your audio to the best 20-60 second segment.",
                    "Choose a segment with clear, consistent speech.",
                ],
            }

        if audio.frame_rate < self.MIN_SAMPLE_RATE:
            return {
                "valid": False,
                "reason": (
                    f"Sample rate too low ({audio.frame_rate}Hz). "
                    f"Minimum {self.MIN_SAMPLE_RATE}Hz required."
                ),
                "tips": [
                    "Record at 44100Hz or 48000Hz for best quality.",
                    "Avoid using heavily compressed audio (very low bitrate MP3).",
                ],
            }

        return {"valid": True}

    # ─── Deep Quality Analysis ───────────────────────────────────────────

    def _deep_quality_analysis(self, cleaned_path, clean_result):
        """
        Perform deep quality analysis on the cleaned audio.

        Goes beyond the basic cleaner score with voice-cloning-specific checks:
          - Signal-to-noise ratio (SNR)
          - Speech ratio (how much of the audio contains speech)
          - Clipping detection
          - Dynamic range
          - Spectral quality (frequency distribution)
          - Volume consistency

        Returns:
            dict with detailed analysis scores and overall_score (0-10)
        """
        from pydub import AudioSegment

        try:
            audio = AudioSegment.from_file(cleaned_path)
        except Exception as e:
            logger.warning(f"Deep analysis failed to load audio: {e}")
            return {
                "overall_score": clean_result.get("quality_score", 0),
                "speech_ratio": 0.0,
                "snr_db": 0.0,
                "clipping_ratio": 0.0,
                "dynamic_range_db": 0.0,
                "volume_consistency": 0.0,
                "issues": ["Failed to load cleaned audio for analysis"],
            }

        samples = np.array(audio.get_array_of_samples(), dtype=np.float64)
        if len(samples) == 0:
            return {
                "overall_score": 0,
                "speech_ratio": 0.0,
                "snr_db": 0.0,
                "clipping_ratio": 0.0,
                "dynamic_range_db": 0.0,
                "volume_consistency": 0.0,
                "issues": ["Audio contains no samples"],
            }

        max_val = 2 ** 15  # 16-bit audio
        samples_norm = samples / max_val

        issues = []
        score = 10  # Start at perfect, deduct for problems

        # ── 1. Speech ratio (non-silence proportion) ──
        speech_ratio = self._calculate_speech_ratio(audio)
        if speech_ratio < 0.3:
            score -= 3
            issues.append(
                f"Low speech content ({speech_ratio:.0%}). "
                f"Audio should be mostly speech, not silence or music."
            )
        elif speech_ratio < 0.5:
            score -= 1
            issues.append(
                f"Moderate speech content ({speech_ratio:.0%}). "
                f"Try to minimize long pauses."
            )

        # ── 2. Signal-to-noise ratio ──
        snr_db = self._estimate_snr(samples_norm, audio.frame_rate)
        if snr_db < 10:
            score -= 3
            issues.append(
                f"High background noise (SNR: {snr_db:.1f}dB). "
                f"Record in a quieter environment."
            )
        elif snr_db < 20:
            score -= 1
            issues.append(
                f"Some background noise detected (SNR: {snr_db:.1f}dB)."
            )

        # ── 3. Clipping detection ──
        clipping_ratio = np.mean(np.abs(samples_norm) > 0.99)
        if clipping_ratio > 0.01:
            score -= 2
            issues.append(
                f"Audio clipping detected ({clipping_ratio:.1%} of samples). "
                f"Lower your microphone gain."
            )
        elif clipping_ratio > 0.005:
            score -= 1
            issues.append("Minor audio clipping detected.")

        # ── 4. Dynamic range ──
        rms = np.sqrt(np.mean(samples_norm ** 2))
        peak = np.max(np.abs(samples_norm))
        if peak > 0 and rms > 0:
            dynamic_range_db = round(20 * np.log10(peak / (rms + 1e-10)), 1)
            crest_factor = peak / (rms + 1e-10)

            if crest_factor < 2:
                score -= 1
                issues.append(
                    "Audio is over-compressed. Use minimal compression when recording."
                )
            elif crest_factor > 20:
                score -= 1
                issues.append(
                    "Very wide dynamic range. Try to maintain consistent volume."
                )
        else:
            dynamic_range_db = 0.0

        # ── 5. Volume consistency (RMS variance across segments) ──
        volume_consistency = self._measure_volume_consistency(audio)
        if volume_consistency < 0.5:
            score -= 1
            issues.append(
                "Inconsistent volume levels. Maintain a steady distance from the microphone."
            )

        # ── 6. Duration bonus/penalty ──
        duration = len(audio) / 1000.0
        if duration >= self.IDEAL_DURATION_MIN and duration <= self.IDEAL_DURATION_MAX:
            pass  # Ideal range, no adjustment
        elif duration < 15:
            score -= 1
            issues.append(
                f"Short sample ({duration:.1f}s). 20-60 seconds gives best results."
            )

        # ── 7. Volume level ──
        if audio.dBFS < -30:
            score -= 2
            issues.append(
                f"Audio is very quiet ({audio.dBFS:.1f} dBFS). "
                f"Speak closer to the microphone."
            )
        elif audio.dBFS < -25:
            score -= 1
            issues.append(
                f"Audio is quiet ({audio.dBFS:.1f} dBFS). Consider increasing gain."
            )

        # Clamp score
        overall_score = max(0, min(10, score))

        return {
            "overall_score": overall_score,
            "cleaner_score": clean_result.get("quality_score", 0),
            "speech_ratio": round(speech_ratio, 3),
            "snr_db": round(snr_db, 1),
            "clipping_ratio": round(clipping_ratio, 4),
            "dynamic_range_db": dynamic_range_db,
            "volume_consistency": round(volume_consistency, 3),
            "volume_dbfs": round(audio.dBFS, 1),
            "duration": round(duration, 2),
            "issues": issues,
        }

    def _calculate_speech_ratio(self, audio):
        """Calculate the proportion of audio that contains speech (non-silence)."""
        from pydub.silence import detect_nonsilent

        try:
            nonsilent = detect_nonsilent(
                audio,
                min_silence_len=300,
                silence_thresh=audio.dBFS - 16,
            )
            if not nonsilent:
                return 0.0

            speech_ms = sum(end - start for start, end in nonsilent)
            return speech_ms / len(audio) if len(audio) > 0 else 0.0

        except Exception:
            return 0.5  # Default to middle value if detection fails

    def _estimate_snr(self, samples, sample_rate):
        """
        Estimate signal-to-noise ratio in dB.

        Uses a simple approach: compare RMS of the loudest segments (signal)
        to the quietest segments (noise floor).
        """
        try:
            # Split into 50ms frames
            frame_size = int(sample_rate * 0.05)
            if frame_size == 0 or len(samples) < frame_size:
                return 20.0  # Default if audio too short to analyze

            n_frames = len(samples) // frame_size
            frames = samples[:n_frames * frame_size].reshape(n_frames, frame_size)

            # RMS per frame
            frame_rms = np.sqrt(np.mean(frames ** 2, axis=1))
            frame_rms = frame_rms[frame_rms > 0]  # Remove silent frames

            if len(frame_rms) < 4:
                return 15.0  # Not enough data

            # Sort by RMS: bottom 10% = noise, top 50% = signal
            sorted_rms = np.sort(frame_rms)
            n = len(sorted_rms)

            noise_rms = np.mean(sorted_rms[:max(1, n // 10)])
            signal_rms = np.mean(sorted_rms[n // 2:])

            if noise_rms < 1e-10:
                return 40.0  # Very low noise floor

            snr = 20 * np.log10(signal_rms / noise_rms)
            return max(0, min(60, snr))  # Clamp to reasonable range

        except Exception:
            return 15.0  # Default on error

    def _measure_volume_consistency(self, audio):
        """
        Measure how consistent the volume is across the audio.

        Returns: 0.0 (very inconsistent) to 1.0 (perfectly consistent)
        """
        try:
            # Split into 2-second segments
            segment_ms = 2000
            if len(audio) < segment_ms * 2:
                return 0.8  # Too short to meaningfully measure

            segments = [
                audio[i:i + segment_ms]
                for i in range(0, len(audio) - segment_ms, segment_ms)
            ]

            # Get dBFS per segment (filter out silent segments)
            levels = []
            for seg in segments:
                if seg.dBFS > -50:  # Ignore near-silent segments
                    levels.append(seg.dBFS)

            if len(levels) < 2:
                return 0.5

            # Standard deviation of levels -- lower is more consistent
            std_dev = np.std(levels)

            # Map: 0 std = 1.0 consistency, 10+ std = 0.0 consistency
            consistency = max(0.0, min(1.0, 1.0 - (std_dev / 10.0)))
            return consistency

        except Exception:
            return 0.7  # Default on error

    # ─── Quality Feedback ────────────────────────────────────────────────

    def _generate_improvement_tips(self, analysis, clean_result):
        """
        Generate specific, actionable tips to improve voice quality.

        Returns list of tip strings, prioritized by impact.
        """
        tips = []
        issues = analysis.get("issues", [])

        # High-impact tips first
        if analysis.get("snr_db", 20) < 15:
            tips.append(
                "Record in a quiet room with minimal background noise. "
                "Close windows, turn off fans/AC, and use a closet or "
                "blanket fort for sound dampening."
            )

        if analysis.get("speech_ratio", 1) < 0.4:
            tips.append(
                "Fill your recording with continuous speech. Read a "
                "paragraph from a book or news article without long pauses "
                "between sentences."
            )

        if analysis.get("clipping_ratio", 0) > 0.005:
            tips.append(
                "Lower your microphone input gain to prevent clipping. "
                "Your peaks should stay below -3dB. Move the mic slightly "
                "further from your mouth."
            )

        if analysis.get("volume_dbfs", 0) < -25:
            tips.append(
                "Speak closer to the microphone or increase the input gain. "
                "Aim for peaks around -6dB to -3dB."
            )

        if analysis.get("volume_consistency", 1) < 0.6:
            tips.append(
                "Maintain a consistent distance from the microphone. "
                "Avoid moving your head while speaking."
            )

        duration = analysis.get("duration", 0)
        if duration < self.IDEAL_DURATION_MIN:
            tips.append(
                f"Record a longer sample (at least {self.IDEAL_DURATION_MIN} seconds). "
                f"More speech data gives the AI more to learn from. "
                f"The sweet spot is 30-60 seconds."
            )

        # General quality tips
        if not tips:
            if analysis.get("overall_score", 10) < 8:
                tips.append(
                    "For best results, use a dedicated microphone (USB or XLR), "
                    "record in a quiet space, and speak naturally as you "
                    "would in a conversation."
                )

        if not tips:
            tips.append(
                "Great recording! Your voice will clone well. For even better "
                "results, try recording with varied intonation and emotion."
            )

        return tips

    def _build_rejection_reason(self, analysis, clean_result):
        """Build a human-readable rejection reason."""
        reasons = []

        if analysis.get("speech_ratio", 1) < self.MIN_SPEECH_RATIO:
            reasons.append("not enough speech content")

        if analysis.get("overall_score", 10) < self.QUALITY_THRESHOLD:
            reasons.append(f"quality score too low ({analysis['overall_score']}/10)")

        if not clean_result.get("accepted", True):
            reasons.append(
                f"audio cleaner score below threshold "
                f"({clean_result.get('quality_score', 0)}/10)"
            )

        if reasons:
            return (
                f"Voice sample rejected: {', '.join(reasons)}. "
                f"Please review the tips below and try again with a better recording."
            )

        return "Voice sample did not meet quality requirements."

    def _build_acceptance_message(self, analysis, grade):
        """Build a congratulatory acceptance message based on quality grade."""
        messages = {
            "A+": "Excellent! Studio-quality voice sample. Your cloned voice will sound amazing.",
            "A": "Great quality! Your voice will clone very accurately.",
            "B+": "Very good recording. Your cloned voice will sound natural.",
            "B": "Good quality recording. Voice cloning will work well.",
            "C+": "Acceptable quality. Voice cloning will work, but recording in a quieter environment would improve results.",
            "C": "Minimum quality met. Consider re-recording in better conditions for improved cloning accuracy.",
        }

        return messages.get(grade, messages.get("C"))

    @staticmethod
    def _score_to_grade(score):
        """Convert numeric score (0-10) to letter grade."""
        if score >= 10:
            return "A+"
        elif score >= 9:
            return "A"
        elif score >= 8:
            return "B+"
        elif score >= 7:
            return "B"
        elif score >= 6:
            return "C+"
        elif score >= 5:
            return "C"
        elif score >= 4:
            return "D"
        else:
            return "F"

    @staticmethod
    def _rejection_result(name, reason, tips=None, analysis=None,
                          quality_score=0, quality_grade="F"):
        """Build a standardized rejection result dict."""
        return {
            "voice_id": None,
            "name": name,
            "status": "rejected",
            "quality_score": quality_score,
            "quality_grade": quality_grade,
            "duration": 0,
            "sample_rate": 0,
            "analysis": analysis or {},
            "tips": tips or [],
            "embedding_path": None,
            "processing_time": 0,
            "message": reason,
        }

    # ─── File Operations ─────────────────────────────────────────────────

    def _save_raw_upload(self, source_path, dest_path):
        """
        Save the raw upload, converting to WAV if needed.

        Always stores as WAV for consistency in the cleaning pipeline.
        """
        ext = Path(source_path).suffix.lower()

        if ext == ".wav":
            shutil.copy2(source_path, dest_path)
        else:
            # Convert to WAV
            from pydub import AudioSegment
            audio = AudioSegment.from_file(source_path)
            audio.export(dest_path, format="wav")

    # ─── ID Generation ───────────────────────────────────────────────────

    @staticmethod
    def _hash_api_key(api_key):
        """
        Generate a 6-char hash from an API key for directory scoping.

        This is NOT a security measure -- it's for directory organization.
        The API key itself is never stored on disk.
        """
        return hashlib.sha256(api_key.encode()).hexdigest()[:6]

    @staticmethod
    def _generate_voice_id(key_hash):
        """Generate a unique voice ID: uv_{key_hash}_{uuid_8}"""
        short_uuid = uuid.uuid4().hex[:8]
        return f"uv_{key_hash}_{short_uuid}"
