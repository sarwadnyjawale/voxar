"""
VOXAR Voice Sample Cleaner v1.0
Automated pipeline for cleaning raw voice samples to studio quality.

Steps per sample:
  1. Convert to WAV 22050Hz mono
  2. Noise reduction
  3. Trim silence (keep 200ms padding)
  4. Normalize to -16 LUFS
  5. Trim to best 30-60s segment
  6. Quality check

Usage:
    cleaner = VoiceSampleCleaner()
    result = cleaner.clean_sample("raw.wav", "cleaned.wav")
    print(result["quality_score"], result["accepted"])

    results = cleaner.batch_clean("voices/raw_samples/", "voices/cleaned_samples/")
"""

import os
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger("VoxarVoiceCleaner")


class VoiceSampleCleaner:
    """Clean raw voice samples for XTTS speaker embedding extraction."""

    TARGET_SR = 22050
    TARGET_LUFS = -16.0
    MIN_DURATION = 10.0      # seconds — reject if shorter
    MAX_DURATION = 60.0      # seconds — trim if longer
    IDEAL_DURATION = 30.0    # seconds — target length
    SILENCE_PAD_MS = 200     # ms of silence padding at edges
    QUALITY_THRESHOLD = 7    # out of 10 — accept if >=

    def clean_sample(self, input_path, output_path):
        """
        Clean a single voice sample.

        Args:
            input_path: path to raw audio file (WAV, MP3, FLAC, etc.)
            output_path: path for cleaned WAV output

        Returns:
            dict with:
                quality_score (0-10), duration, sample_rate, issues,
                accepted (bool), input_path, output_path
        """
        from pydub import AudioSegment

        input_path = str(input_path)
        output_path = str(output_path)
        issues = []

        logger.info(f"Cleaning: {os.path.basename(input_path)}")

        # Step 1: Load and convert to mono WAV at target sample rate
        try:
            audio = AudioSegment.from_file(input_path)
        except Exception as e:
            return self._fail_result(input_path, output_path, f"Cannot load: {e}")

        original_duration = len(audio) / 1000.0
        logger.info(f"  Original: {original_duration:.1f}s, "
                     f"{audio.frame_rate}Hz, {audio.channels}ch")

        if original_duration < self.MIN_DURATION:
            return self._fail_result(
                input_path, output_path,
                f"Too short ({original_duration:.1f}s < {self.MIN_DURATION}s minimum)"
            )

        # Convert to mono
        if audio.channels > 1:
            audio = audio.set_channels(1)
            issues.append("Converted stereo to mono")

        # Set sample rate
        if audio.frame_rate != self.TARGET_SR:
            audio = audio.set_frame_rate(self.TARGET_SR)
            issues.append(f"Resampled to {self.TARGET_SR}Hz")

        # Step 2: Noise reduction
        audio = self._reduce_noise(audio)

        # Step 3: Trim silence
        audio = self._trim_silence(audio)
        trimmed_duration = len(audio) / 1000.0

        if trimmed_duration < self.MIN_DURATION:
            issues.append(f"After trimming only {trimmed_duration:.1f}s — may have too much silence")

        # Step 4: Normalize to target LUFS
        audio = self._normalize_lufs(audio)

        # Step 5: Trim to ideal duration (select best segment)
        if trimmed_duration > self.MAX_DURATION:
            audio = self._select_best_segment(audio)
            issues.append(f"Trimmed from {trimmed_duration:.1f}s to {len(audio)/1000:.1f}s")

        # Step 6: Quality check
        quality_score = self._assess_quality(audio)

        if quality_score < self.QUALITY_THRESHOLD:
            issues.append(f"Quality below threshold ({quality_score}/10)")

        # Save
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        audio.export(output_path, format="wav")

        final_duration = len(audio) / 1000.0
        accepted = quality_score >= self.QUALITY_THRESHOLD

        result = {
            "input_path": input_path,
            "output_path": output_path,
            "quality_score": quality_score,
            "duration": round(final_duration, 2),
            "sample_rate": self.TARGET_SR,
            "issues": issues,
            "accepted": accepted,
        }

        status = "ACCEPTED" if accepted else "REJECTED"
        logger.info(f"  {status}: {final_duration:.1f}s, quality={quality_score}/10")

        return result

    def batch_clean(self, input_dir, output_dir):
        """
        Clean all audio files in a directory.

        Args:
            input_dir: directory with raw audio files
            output_dir: directory for cleaned outputs

        Returns:
            list of result dicts (one per file)
        """
        input_dir = Path(input_dir)
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        audio_extensions = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac"}
        files = sorted(
            f for f in input_dir.iterdir()
            if f.suffix.lower() in audio_extensions
        )

        if not files:
            logger.warning(f"No audio files found in {input_dir}")
            return []

        logger.info(f"Batch cleaning {len(files)} files from {input_dir}")
        results = []

        for i, filepath in enumerate(files):
            output_path = output_dir / f"{filepath.stem}_cleaned.wav"
            logger.info(f"\n[{i+1}/{len(files)}] {filepath.name}")

            result = self.clean_sample(str(filepath), str(output_path))
            results.append(result)

        # Summary
        accepted = sum(1 for r in results if r["accepted"])
        logger.info(f"\nBatch complete: {accepted}/{len(results)} accepted")

        return results

    def _reduce_noise(self, audio):
        """Apply noise reduction using noisereduce library."""
        try:
            import noisereduce as nr

            samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
            samples = samples / (2 ** 15)  # Normalize to [-1, 1]

            reduced = nr.reduce_noise(
                y=samples,
                sr=audio.frame_rate,
                prop_decrease=0.7,  # Moderate — not too aggressive
                stationary=True,
            )

            # Convert back to AudioSegment
            reduced_int16 = (reduced * 32767).astype(np.int16)
            from pydub import AudioSegment
            cleaned = AudioSegment(
                data=reduced_int16.tobytes(),
                sample_width=2,
                frame_rate=audio.frame_rate,
                channels=1,
            )
            return cleaned

        except ImportError:
            logger.warning("noisereduce not installed — skipping noise reduction")
            return audio
        except Exception as e:
            logger.warning(f"Noise reduction failed: {e} — skipping")
            return audio

    def _trim_silence(self, audio):
        """Trim leading/trailing silence, keep padding."""
        from pydub.silence import detect_leading_silence

        # Detect silence threshold (adaptive based on overall loudness)
        silence_thresh = audio.dBFS - 16

        lead = detect_leading_silence(audio, silence_threshold=silence_thresh, chunk_size=10)
        trail = detect_leading_silence(audio.reverse(), silence_threshold=silence_thresh, chunk_size=10)

        # Apply with padding
        pad = self.SILENCE_PAD_MS
        start = max(0, lead - pad)
        end = max(0, len(audio) - trail + pad)

        if start >= end:
            return audio  # Don't trim if it would result in empty audio

        return audio[start:end]

    def _normalize_lufs(self, audio):
        """Normalize audio to target LUFS."""
        try:
            import pyloudnorm as pyln

            samples = np.array(audio.get_array_of_samples(), dtype=np.float64)
            samples = samples / (2 ** 15)

            meter = pyln.Meter(audio.frame_rate)
            current_lufs = meter.integrated_loudness(samples)

            if np.isinf(current_lufs) or np.isnan(current_lufs):
                logger.warning("Cannot measure LUFS — audio may be silent")
                return audio

            normalized = pyln.normalize.loudness(
                samples, current_lufs, self.TARGET_LUFS
            )

            # Clip to prevent overflow
            normalized = np.clip(normalized, -1.0, 1.0)

            normalized_int16 = (normalized * 32767).astype(np.int16)
            from pydub import AudioSegment
            return AudioSegment(
                data=normalized_int16.tobytes(),
                sample_width=2,
                frame_rate=audio.frame_rate,
                channels=1,
            )

        except ImportError:
            logger.warning("pyloudnorm not installed — using simple normalization")
            # Fallback: normalize to -1 dBFS peak
            change = -1.0 - audio.max_dBFS
            return audio.apply_gain(change)
        except Exception as e:
            logger.warning(f"LUFS normalization failed: {e}")
            return audio

    def _select_best_segment(self, audio):
        """Select the best segment of target duration from the audio."""
        target_ms = int(self.IDEAL_DURATION * 1000)

        if len(audio) <= target_ms:
            return audio

        # Find the segment with the highest average energy (most speech)
        best_start = 0
        best_energy = -float("inf")
        step_ms = 1000  # Check every 1s

        for start in range(0, len(audio) - target_ms, step_ms):
            segment = audio[start:start + target_ms]
            energy = segment.dBFS
            if energy > best_energy:
                best_energy = energy
                best_start = start

        return audio[best_start:best_start + target_ms]

    def _assess_quality(self, audio):
        """
        Assess audio quality on a 0-10 scale.

        Checks: loudness, silence ratio, duration, dynamic range.
        """
        score = 10
        duration = len(audio) / 1000.0

        # Duration penalty
        if duration < 15:
            score -= 2
        elif duration < 20:
            score -= 1

        # Loudness check
        if audio.dBFS < -30:
            score -= 3  # Very quiet
        elif audio.dBFS < -25:
            score -= 1

        # Silence ratio
        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        silence_threshold = np.max(np.abs(samples)) * 0.02
        silence_ratio = np.sum(np.abs(samples) < silence_threshold) / len(samples)
        if silence_ratio > 0.4:
            score -= 2
        elif silence_ratio > 0.3:
            score -= 1

        # Clipping check
        peak = np.max(np.abs(samples))
        max_val = 2 ** 15 - 1
        if peak >= max_val * 0.99:
            score -= 1  # Clipping

        # Dynamic range (too compressed = bad for voice cloning)
        rms = np.sqrt(np.mean(samples ** 2))
        if peak > 0:
            crest_factor = peak / (rms + 1e-10)
            if crest_factor < 2:
                score -= 1  # Over-compressed

        return max(0, min(10, score))

    def _fail_result(self, input_path, output_path, reason):
        """Create a failure result dict."""
        logger.warning(f"  REJECTED: {reason}")
        return {
            "input_path": input_path,
            "output_path": output_path,
            "quality_score": 0,
            "duration": 0,
            "sample_rate": self.TARGET_SR,
            "issues": [reason],
            "accepted": False,
        }
