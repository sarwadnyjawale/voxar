"""
VOXAR Quality Validator v1.0
Validates mastered audio before delivery to user.

Quality Grades:
  A (85-100): Excellent — deliver immediately
  B (70-84):  Good — deliver with no issues  
  C (55-69):  Fair — deliver with warning
  D (40-54):  Poor — auto-retry once
  F (below 40): Failed — reject, refund credits
"""

import os
import numpy as np
import logging

logger = logging.getLogger("VoxarQuality")


class VoxarQualityValidator:
    """
    Validates audio quality before delivery.
    Returns quality score, grade, and actionable feedback.
    """

    # Thresholds
    MIN_DURATION = 0.5           # seconds
    MAX_SILENCE_RATIO = 0.35     # 35%
    TARGET_LUFS = -16.0
    LUFS_TOLERANCE = 3.0         # ±3 LUFS acceptable
    MAX_PEAK_DBFS = -0.5         # must be below this
    MIN_PEAK_DBFS = -20.0        # must be above this (not too quiet)

    # Score thresholds
    GRADE_A = 85
    GRADE_B = 70
    GRADE_C = 55
    GRADE_D = 40

    def validate(self, audio_path, expected_text_length=None):
        """
        Complete quality validation of an audio file.

        Args:
            audio_path: path to audio file
            expected_text_length: character count of input text (for duration check)

        Returns:
            dict with score, grade, passed, issues, recommendation
        """
        if not os.path.exists(audio_path):
            return self._fail("File not found", audio_path)

        issues = []
        score = 100

        try:
            import soundfile as sf
            data, sample_rate = sf.read(audio_path, dtype='float32')

            if len(data.shape) > 1:
                data = np.mean(data, axis=1)

        except Exception as e:
            return self._fail(f"Cannot read audio: {e}", audio_path)

        duration = len(data) / sample_rate
        file_size_kb = os.path.getsize(audio_path) / 1024.0

        # ── Check 1: Duration ──
        if duration < self.MIN_DURATION:
            issues.append({
                "type": "too_short",
                "severity": "critical",
                "message": f"Audio only {duration:.2f}s (minimum {self.MIN_DURATION}s)",
                "deduction": 30
            })
            score -= 30

        # Check if duration is reasonable for input text
        if expected_text_length:
            # Rough estimate: 15 chars per second of speech
            expected_duration = expected_text_length / 15.0
            if duration < expected_duration * 0.3:
                issues.append({
                    "type": "suspiciously_short",
                    "severity": "warning",
                    "message": f"Audio {duration:.1f}s but expected ~{expected_duration:.0f}s for {expected_text_length} chars",
                    "deduction": 15
                })
                score -= 15

        # ── Check 2: Silence ratio ──
        silence_ratio = self._calculate_silence_ratio(data, sample_rate)

        if silence_ratio > 0.50:
            issues.append({
                "type": "mostly_silent",
                "severity": "critical",
                "message": f"Audio is {silence_ratio:.0%} silence (generation likely failed)",
                "deduction": 25
            })
            score -= 25
        elif silence_ratio > self.MAX_SILENCE_RATIO:
            issues.append({
                "type": "high_silence",
                "severity": "warning",
                "message": f"Silence ratio {silence_ratio:.0%} (target: <{self.MAX_SILENCE_RATIO:.0%})",
                "deduction": 10
            })
            score -= 10

        # ── Check 3: Volume levels ──
        peak_linear = np.max(np.abs(data)) if len(data) > 0 else 0
        peak_dbfs = 20 * np.log10(peak_linear + 1e-10)

        if peak_linear > 0.99:
            issues.append({
                "type": "clipping",
                "severity": "warning",
                "message": f"Audio is clipping (peak: {peak_dbfs:.1f} dBFS)",
                "deduction": 10
            })
            score -= 10

        if peak_dbfs < self.MIN_PEAK_DBFS:
            issues.append({
                "type": "too_quiet",
                "severity": "warning",
                "message": f"Audio very quiet (peak: {peak_dbfs:.1f} dBFS)",
                "deduction": 10
            })
            score -= 10

        # ── Check 4: Loudness (LUFS) ──
        try:
            import pyloudnorm as pyln
            meter = pyln.Meter(sample_rate)
            loudness = meter.integrated_loudness(data)

            if not (np.isinf(loudness) or np.isnan(loudness)):
                deviation = abs(loudness - self.TARGET_LUFS)
                if deviation > self.LUFS_TOLERANCE * 2:
                    issues.append({
                        "type": "loudness_far_off",
                        "severity": "warning",
                        "message": f"Loudness {loudness:.1f} LUFS (target: {self.TARGET_LUFS})",
                        "deduction": 10
                    })
                    score -= 10
                elif deviation > self.LUFS_TOLERANCE:
                    issues.append({
                        "type": "loudness_off",
                        "severity": "info",
                        "message": f"Loudness {loudness:.1f} LUFS (target: {self.TARGET_LUFS})",
                        "deduction": 5
                    })
                    score -= 5
            else:
                loudness = None
        except Exception:
            loudness = None

        # ── Check 5: Repetition detection ──
        repetition = self._detect_repetition(data, sample_rate)
        if repetition["detected"]:
            issues.append({
                "type": "repetition",
                "severity": "critical",
                "message": f"Repeated audio segment detected ({repetition['count']} repeats)",
                "deduction": 20
            })
            score -= 20

        # ── Check 6: Artifact detection ──
        artifact_count = self._detect_artifacts(data, sample_rate)
        if artifact_count > 10:
            issues.append({
                "type": "many_artifacts",
                "severity": "warning",
                "message": f"{artifact_count} click/pop artifacts detected",
                "deduction": 10
            })
            score -= 10
        elif artifact_count > 3:
            issues.append({
                "type": "some_artifacts",
                "severity": "info",
                "message": f"{artifact_count} minor artifacts detected",
                "deduction": 3
            })
            score -= 3

        # ── Calculate final score and grade ──
        score = max(0, min(100, score))
        grade = self._get_grade(score)
        passed = score >= self.GRADE_D
        recommendation = self._get_recommendation(score, grade)

        result = {
            "audio_path": audio_path,
            "file_name": os.path.basename(audio_path),
            "score": score,
            "grade": grade,
            "passed": passed,
            "recommendation": recommendation,
            "duration": round(duration, 2),
            "file_size_kb": round(file_size_kb, 1),
            "peak_dbfs": round(float(peak_dbfs), 1),
            "loudness_lufs": round(float(loudness), 1) if loudness is not None else None,
            "silence_ratio": round(float(silence_ratio), 2),
            "issues": issues,
            "issue_count": len(issues),
        }

        logger.info(f"  Quality: {score}/100 ({grade}) — "
                    f"{'PASS' if passed else 'FAIL'} — {len(issues)} issues")

        return result

    def _calculate_silence_ratio(self, data, sample_rate):
        """Calculate what percentage of audio is silence."""
        try:
            from pydub import AudioSegment
            import io as io_module
            import soundfile as sf

            # Write to buffer and load with pydub
            buf = io_module.BytesIO()
            sf.write(buf, data, sample_rate, format='WAV')
            buf.seek(0)
            audio = AudioSegment.from_file(buf, format='wav')

            thresh = audio.dBFS - 16 if audio.dBFS > -60 else -50

            from pydub.silence import detect_nonsilent
            nonsilent = detect_nonsilent(audio, min_silence_len=300, silence_thresh=thresh)

            if nonsilent:
                speech_ms = sum(e - s for s, e in nonsilent)
                return 1.0 - (speech_ms / max(len(audio), 1))
            return 1.0
        except Exception:
            # Fallback: simple energy-based detection
            threshold = np.max(np.abs(data)) * 0.05
            silent_samples = np.sum(np.abs(data) < threshold)
            return float(silent_samples / max(len(data), 1))

    def _detect_repetition(self, data, sample_rate):
        """Detect if audio has repeated segments (XTTS loop bug)."""
        result = {"detected": False, "count": 0}

        # Check 2-second segments for correlation
        segment_length = int(sample_rate * 2.0)
        if len(data) < segment_length * 3:
            return result  # Too short to have meaningful repetition

        # Compare non-overlapping segments
        num_segments = min(len(data) // segment_length, 10)
        segments = []
        for i in range(num_segments):
            start = i * segment_length
            end = start + segment_length
            segments.append(data[start:end])

        repeat_count = 0
        for i in range(len(segments)):
            for j in range(i + 2, len(segments)):  # Skip adjacent (might be similar naturally)
                correlation = np.corrcoef(segments[i], segments[j])[0, 1]
                if correlation > 0.85:  # Very high correlation = likely repeated
                    repeat_count += 1

        if repeat_count >= 2:
            result["detected"] = True
            result["count"] = repeat_count

        return result

    def _detect_artifacts(self, data, sample_rate):
        """Count click/pop artifacts in audio."""
        if len(data) < sample_rate * 0.1:
            return 0

        window = max(1, int(sample_rate * 0.002))
        abs_data = np.abs(data)
        count = 0

        for i in range(window, len(data) - window, window):
            local_avg = np.mean(abs_data[i - window:i])
            if local_avg < 1e-6:
                continue
            if abs_data[i] > local_avg * 12:
                count += 1

        return count

    def _get_grade(self, score):
        if score >= self.GRADE_A:
            return "A"
        elif score >= self.GRADE_B:
            return "B"
        elif score >= self.GRADE_C:
            return "C"
        elif score >= self.GRADE_D:
            return "D"
        else:
            return "F"

    def _get_recommendation(self, score, grade):
        if grade == "A":
            return "accept"
        elif grade == "B":
            return "accept"
        elif grade == "C":
            return "accept_with_warning"
        elif grade == "D":
            return "retry"
        else:
            return "reject"

    def _fail(self, reason, audio_path):
        return {
            "audio_path": audio_path,
            "file_name": os.path.basename(audio_path) if audio_path else "unknown",
            "score": 0, "grade": "F", "passed": False,
            "recommendation": "reject",
            "issues": [{"type": "fatal", "severity": "critical",
                        "message": reason, "deduction": 100}],
            "issue_count": 1,
        }

    def print_result(self, result):
        """Print formatted validation result."""
        grade_emoji = {"A": "🌟", "B": "✅", "C": "⚠️", "D": "🔄", "F": "❌"}
        emoji = grade_emoji.get(result['grade'], "❓")

        print(f"\n  {emoji} Quality: {result['score']}/100 — Grade {result['grade']}")
        print(f"  File: {result.get('file_name', 'unknown')}")
        print(f"  Duration: {result.get('duration', 0)}s")
        print(f"  Recommendation: {result['recommendation'].upper()}")

        if result['issues']:
            print(f"  Issues ({result['issue_count']}):")
            for issue in result['issues']:
                sev_icon = {"critical": "🔴", "warning": "🟡", "info": "🔵"}
                icon = sev_icon.get(issue['severity'], "⚪")
                print(f"    {icon} {issue['message']}")
        else:
            print(f"  No issues detected!")