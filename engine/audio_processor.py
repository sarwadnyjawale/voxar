"""
VOXAR Audio Processor v1.0
Phase 2: Complete Audio Post-Processing Pipeline

Day 1: VoxarAudioAnalyzer ✅
Day 2: Core processing ✅
Day 3: Advanced processing ✅
Day 4: VoxarAudioMaster complete pipeline ← THIS
Day 5: VoxarQualityValidator + Export
"""

import os
import sys
import json
import time
import numpy as np
import logging
from pathlib import Path

logger = logging.getLogger("VoxarAudio")


# ================================================================
# AUDIO I/O
# ================================================================

class AudioIO:
    @staticmethod
    def load(audio_path):
        import soundfile as sf
        data, sr = sf.read(audio_path, dtype='float32')
        if len(data.shape) > 1:
            data = np.mean(data, axis=1).astype(np.float32)
        return data, sr

    @staticmethod
    def save(data, sample_rate, output_path, format_type="wav"):
        import soundfile as sf
        d = os.path.dirname(output_path)
        if d:
            os.makedirs(d, exist_ok=True)
        data = np.clip(data.astype(np.float32), -1.0, 1.0)
        sf.write(output_path, data, sample_rate, subtype='FLOAT')
        return output_path

    @staticmethod
    def get_info(audio_path):
        import soundfile as sf
        info = sf.info(audio_path)
        return {
            "duration": info.duration, "sample_rate": info.samplerate,
            "channels": info.channels,
            "file_size_kb": round(os.path.getsize(audio_path) / 1024, 1)
        }


# ================================================================
# ANALYZER (Day 1)
# ================================================================

class VoxarAudioAnalyzer:
    TARGET_LUFS = -16.0
    MAX_SILENCE_RATIO = 0.30

    def analyze(self, audio_path):
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Not found: {audio_path}")

        problems = []
        from pydub import AudioSegment
        audio = AudioSegment.from_file(audio_path)

        import soundfile as sf
        data, sample_rate = sf.read(audio_path)
        if len(data.shape) > 1:
            data_mono = np.mean(data, axis=1)
        else:
            data_mono = data

        duration = len(audio) / 1000.0
        file_size_kb = os.path.getsize(audio_path) / 1024.0

        loudness_lufs = None
        try:
            import pyloudnorm as pyln
            if duration >= 0.4:
                meter = pyln.Meter(sample_rate)
                loudness_lufs = meter.integrated_loudness(data_mono)
                if np.isinf(loudness_lufs) or np.isnan(loudness_lufs):
                    loudness_lufs = None
        except Exception:
            pass

        peak_linear = np.max(np.abs(data_mono)) if len(data_mono) > 0 else 0
        peak_dbfs = float(20 * np.log10(peak_linear + 1e-10))
        is_clipping = peak_linear > 0.99
        if is_clipping:
            problems.append(("clipping", 4, f"Peak: {peak_dbfs:.1f} dBFS"))

        silence_thresh = audio.dBFS - 16 if audio.dBFS > -60 else -50
        try:
            from pydub.silence import detect_leading_silence
            trailing_silence_ms = detect_leading_silence(
                audio.reverse(), silence_threshold=silence_thresh)
        except Exception:
            trailing_silence_ms = 0
        if trailing_silence_ms > 300:
            problems.append(("trailing_silence", 2, f"{trailing_silence_ms}ms"))

        try:
            from pydub.silence import detect_nonsilent
            nonsilent = detect_nonsilent(audio, min_silence_len=300, silence_thresh=silence_thresh)
            silence_ratio = 1.0 - (sum(e - s for s, e in nonsilent) / max(len(audio), 1)) if nonsilent else 1.0
        except Exception:
            silence_ratio = 0.0
        if silence_ratio > self.MAX_SILENCE_RATIO:
            problems.append(("high_silence", 3, f"{silence_ratio:.0%}"))

        score = 100
        for _, sev, _ in problems:
            score -= sev * 5
        score = max(0, min(100, score))

        return {
            "file_path": str(audio_path), "file_name": os.path.basename(audio_path),
            "file_size_kb": round(file_size_kb, 1), "duration_seconds": round(duration, 2),
            "sample_rate": int(sample_rate), "channels": int(audio.channels),
            "loudness_lufs": round(float(loudness_lufs), 1) if loudness_lufs is not None else None,
            "peak_dbfs": round(float(peak_dbfs), 1), "is_clipping": bool(is_clipping),
            "silence_ratio": round(float(silence_ratio), 2),
            "problems": problems, "problem_count": len(problems),
            "score": int(score),
        }

    def analyze_batch(self, directory, extensions=None):
        if extensions is None:
            extensions = {'.wav', '.mp3', '.m4a', '.flac'}
        directory = Path(directory)
        if not directory.exists():
            return []
        results = []
        for af in sorted(directory.iterdir()):
            if af.suffix.lower() in extensions and not af.name.startswith('_'):
                try:
                    results.append(self.analyze(str(af)))
                except Exception as e:
                    results.append({"file_name": af.name, "error": str(e), "score": 0})
        return results

    def print_report(self, results):
        print(f"\n  {'File':<40} {'Dur':<6} {'LUFS':<7} {'Peak':<7} {'Sil%':<6} {'Score':<6}")
        print(f"  {'─' * 72}")
        for r in results:
            if 'error' in r:
                continue
            lufs = f"{r['loudness_lufs']}" if r['loudness_lufs'] is not None else "N/A"
            st = "✅" if r['score'] >= 80 else "⚠️" if r['score'] >= 60 else "❌"
            print(f"  {r['file_name']:<40} {r['duration_seconds']:<6.1f} {lufs:<7} "
                  f"{r['peak_dbfs']:<7.1f} {r['silence_ratio']:<6.0%} {r['score']:<6} {st}")


# ================================================================
# CORE PROCESSOR (Day 2)
# ================================================================

class VoxarCoreProcessor:
    def trim_silence(self, data, sample_rate, threshold_db=-40, padding_ms=100):
        if len(data) == 0:
            return data
        threshold_linear = 10 ** (threshold_db / 20.0)
        padding_samples = int(sample_rate * padding_ms / 1000.0)
        abs_data = np.abs(data)
        ws = max(1, int(sample_rate * 0.01))
        if len(abs_data) > ws:
            energy = np.sqrt(np.convolve(abs_data ** 2, np.ones(ws) / ws, mode='same'))
        else:
            energy = abs_data
        above = energy > threshold_linear
        if not np.any(above):
            return data[:min(len(data), sample_rate)]
        idx = np.where(above)[0]
        start = max(0, idx[0] - padding_samples)
        end = min(len(data), idx[-1] + padding_samples)
        trimmed = data[start:end]
        ms = (len(data) - len(trimmed)) / sample_rate * 1000
        if ms > 50:
            logger.info(f"  Trimmed {ms:.0f}ms silence")
        return trimmed

    def normalize_loudness(self, data, sample_rate, target_lufs=-16.0):
        if len(data) == 0:
            return data
        import pyloudnorm as pyln
        meter = pyln.Meter(sample_rate)
        try:
            current = meter.integrated_loudness(data)
        except Exception:
            return data
        if np.isinf(current) or np.isnan(current):
            return data
        gain_db = max(-20, min(20, target_lufs - current))
        result = data * (10 ** (gain_db / 20.0))
        logger.info(f"  Loudness: {current:.1f} → {target_lufs:.1f} LUFS ({gain_db:+.1f}dB)")
        return result

    def remove_clipping(self, data, sample_rate, ceiling_db=-1.0):
        if len(data) == 0:
            return data
        ceiling = 10 ** (ceiling_db / 20.0)
        peak = np.max(np.abs(data))
        if peak <= ceiling:
            return data
        result = data.copy()
        knee = ceiling * 0.707
        abs_data = np.abs(data)
        mask = abs_data > knee
        if np.any(mask):
            signs = np.sign(data[mask])
            mags = abs_data[mask]
            norm = (mags - knee) / (peak - knee + 1e-10)
            comp = np.tanh(norm * 2) * (ceiling - knee) + knee
            result[mask] = signs * comp
        new_peak = np.max(np.abs(result))
        logger.info(f"  Limiter: {20*np.log10(peak+1e-10):.1f} → {20*np.log10(new_peak+1e-10):.1f} dBFS")
        return result

    def noise_reduction(self, data, sample_rate, strength=0.5):
        if len(data) == 0 or strength <= 0:
            return data
        try:
            import noisereduce as nr
        except ImportError:
            return data
        try:
            denoised = nr.reduce_noise(
                y=data, sr=sample_rate, stationary=True,
                prop_decrease=min(0.8, strength * 0.8),
                n_fft=2048, win_length=2048, hop_length=512)
            logger.info(f"  Noise reduction: strength={strength:.1f}")
            return denoised.astype(np.float32)
        except Exception:
            return data


# ================================================================
# ADVANCED PROCESSOR (Day 3)
# ================================================================

class VoxarAdvancedProcessor:
    def apply_compression(self, data, sample_rate, ratio=2.5, threshold_db=-20,
                          attack_ms=10, release_ms=100, knee_db=6):
        if len(data) == 0:
            return data

        knee_half = knee_db / 2.0
        abs_data = np.abs(data)

        # Block-based RMS envelope (vectorized — replaces sample-by-sample loop)
        block_size = max(1, int(sample_rate * 0.01))  # ~10ms blocks
        n_blocks = len(data) // block_size
        remainder = len(data) - n_blocks * block_size

        if n_blocks > 0:
            blocks = abs_data[:n_blocks * block_size].reshape(n_blocks, block_size)
            rms_blocks = np.sqrt(np.mean(blocks ** 2, axis=1))
            envelope = np.repeat(rms_blocks, block_size)
        else:
            envelope = np.array([], dtype=np.float32)

        if remainder > 0:
            rms_rem = np.sqrt(np.mean(abs_data[n_blocks * block_size:] ** 2))
            envelope = np.append(envelope, np.full(remainder, rms_rem, dtype=np.float32))

        # Smooth envelope with convolution (pure numpy — no scipy import overhead)
        smooth_samples = max(1, block_size // 2)
        kernel = np.ones(smooth_samples, dtype=np.float32) / smooth_samples
        envelope = np.convolve(envelope, kernel, mode='same').astype(np.float32)

        # Vectorized gain computation (replaces sample-by-sample loop)
        env_db = 20.0 * np.log10(envelope + 1e-10)

        gain_db = np.zeros_like(env_db)
        # Above knee: full compression
        above = env_db > (threshold_db + knee_half)
        gain_db[above] = (env_db[above] - threshold_db) * (1.0 / ratio - 1.0)
        # Knee zone: soft-knee curve
        knee_zone = (env_db >= (threshold_db - knee_half)) & ~above
        over = env_db[knee_zone] - threshold_db + knee_half
        gain_db[knee_zone] = (over ** 2) / (4.0 * knee_half) * (1.0 / ratio - 1.0)
        # Below knee: gain_db stays 0 (no compression)

        gain = (10.0 ** (gain_db / 20.0)).astype(np.float32)

        avg_gr = 20 * np.log10(np.mean(gain) + 1e-10)
        logger.info(f"  Compression: {ratio}:1 @{threshold_db}dB avg_GR={avg_gr:.1f}dB")
        return data * gain

    def apply_eq(self, data, sample_rate, preset="voice_clarity"):
        if len(data) == 0:
            return data
        from scipy.signal import butter, sosfilt, lfilter

        presets = {
            "voice_clarity": {"hpf": 80, "pf": 3000, "pg": 2.0, "pq": 1.0,
                              "af": 9000, "ag": 1.5, "aq": 0.8, "lpf": 16000},
            "warm": {"hpf": 60, "pf": 2500, "pg": 1.0, "pq": 1.0,
                     "af": 8000, "ag": 0.5, "aq": 0.8, "lpf": 14000},
            "bright": {"hpf": 100, "pf": 3500, "pg": 3.0, "pq": 1.2,
                       "af": 10000, "ag": 2.5, "aq": 0.8, "lpf": 18000},
            "cinematic": {"hpf": 70, "pf": 2800, "pg": 1.5, "pq": 0.9,
                          "af": 8500, "ag": 1.0, "aq": 0.8, "lpf": 15000},
        }
        if preset not in presets:
            preset = "voice_clarity"
        p = presets[preset]
        nyq = sample_rate / 2.0
        result = data.copy()

        # HPF
        if p["hpf"] < nyq:
            try:
                sos = butter(4, p["hpf"] / nyq, btype='high', output='sos')
                result = sosfilt(sos, result).astype(np.float32)
            except Exception:
                pass

        # Presence boost
        def peaking_eq(signal, freq, gain_db, Q, sr):
            w0 = 2 * np.pi * freq / sr
            alpha = np.sin(w0) / (2 * Q)
            A = 10 ** (gain_db / 20.0)
            b0 = 1 + alpha * A
            b1 = -2 * np.cos(w0)
            b2 = 1 - alpha * A
            a0 = 1 + alpha / A
            a1 = -2 * np.cos(w0)
            a2 = 1 - alpha / A
            b = np.array([b0 / a0, b1 / a0, b2 / a0])
            a = np.array([1.0, a1 / a0, a2 / a0])
            return lfilter(b, a, signal).astype(np.float32)

        if p["pf"] < nyq:
            try:
                result = peaking_eq(result, p["pf"], p["pg"], p["pq"], sample_rate)
            except Exception:
                pass
        if p["af"] < nyq:
            try:
                result = peaking_eq(result, p["af"], p["ag"], p["aq"], sample_rate)
            except Exception:
                pass

        # LPF
        if p["lpf"] < nyq:
            try:
                sos = butter(4, p["lpf"] / nyq, btype='low', output='sos')
                result = sosfilt(sos, result).astype(np.float32)
            except Exception:
                pass

        logger.info(f"  EQ: {preset}")
        return result

    def smooth_breaths(self, data, sample_rate, reduction_db=8):
        if len(data) == 0:
            return data
        result = data.copy()
        window_samples = int(sample_rate * 0.02)
        hop = window_samples // 2
        if len(data) < window_samples * 3:
            return data
        num_w = (len(data) - window_samples) // hop + 1
        energies = np.zeros(num_w)
        for i in range(num_w):
            s = i * hop
            e = s + window_samples
            if e > len(data):
                break
            energies[i] = np.sqrt(np.mean(data[s:e] ** 2))
        e_sorted = np.sort(energies[energies > 0])
        if len(e_sorted) < 10:
            return data
        noise = np.percentile(e_sorted, 10)
        speech = np.percentile(e_sorted, 70)
        upper = noise + (speech - noise) * 0.35
        lower = noise * 1.5
        reduction = 10 ** (-reduction_db / 20.0)
        count = 0
        fade = min(int(sample_rate * 0.005), window_samples // 4)
        for i in range(num_w):
            if lower < energies[i] < upper:
                s = i * hop
                e = min(s + window_samples, len(data))
                g = np.ones(e - s, dtype=np.float32) * reduction
                if fade > 1:
                    g[:fade] = np.linspace(1.0, reduction, fade)
                    g[-fade:] = np.linspace(reduction, 1.0, fade)
                result[s:e] *= g
                count += 1
        if count > 0:
            logger.info(f"  Breaths: {count} segments reduced by {reduction_db}dB")
        return result

    def remove_artifacts(self, data, sample_rate):
        if len(data) == 0:
            return data
        result = data.copy()
        fixes = []

        # DC offset
        dc = np.mean(result)
        if abs(dc) > 0.001:
            result -= dc
            fixes.append("DC offset")

        # Click detection (vectorized — replaces sample-by-sample loop)
        ws = max(1, int(sample_rate * 0.002))
        abs_r = np.abs(result)

        from scipy.ndimage import uniform_filter1d
        local_avg = uniform_filter1d(abs_r, size=ws, mode='nearest').astype(np.float32)

        # Vectorized click mask: spike > 15x local average, and local average is non-trivial
        click_mask = (abs_r > local_avg * 15) & (local_avg > 1e-6)
        click_indices = np.where(click_mask)[0]

        # Interpolate only at click positions (typically <20 — small loop is fine)
        clicks = 0
        for i in click_indices:
            left = result[max(0, i - 3):i]
            right = result[i + 1:min(len(result), i + 4)]
            if len(left) > 0 and len(right) > 0:
                result[i] = (np.mean(left) + np.mean(right)) / 2.0
                clicks += 1
        if clicks > 0:
            fixes.append(f"{clicks} clicks")

        # Edge fades
        fade = min(int(sample_rate * 0.003), len(result) // 4)
        if fade > 1:
            result[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
            result[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)

        if fixes:
            logger.info(f"  Artifacts: {', '.join(fixes)}")
        return result


# ================================================================
# MASTERING PROFILES
# ================================================================

MASTERING_PROFILES = {
    "flash": {
        "name": "Flash",
        "description": "Minimal processing for speed",
        "noise_reduction": 0.0,
        "compression_ratio": 1.5,
        "compression_threshold": -25,
        "eq_preset": "voice_clarity",
        "breath_reduction_db": 4,
        "target_lufs": -16.0,
        "ceiling_db": -1.0,
    },
    "cinematic": {
        "name": "Cinematic",
        "description": "Full processing for dramatic quality",
        "noise_reduction": 0.4,
        "compression_ratio": 3.0,
        "compression_threshold": -18,
        "eq_preset": "cinematic",
        "breath_reduction_db": 10,
        "target_lufs": -16.0,
        "ceiling_db": -1.0,
    },
    "longform": {
        "name": "Longform",
        "description": "Stable pacing for audiobooks and podcasts",
        "noise_reduction": 0.3,
        "compression_ratio": 2.5,
        "compression_threshold": -20,
        "eq_preset": "warm",
        "breath_reduction_db": 6,
        "target_lufs": -16.0,
        "ceiling_db": -1.0,
    },
    "multilingual": {
        "name": "Multilingual",
        "description": "Optimized for Indian languages",
        "noise_reduction": 0.3,
        "compression_ratio": 2.0,
        "compression_threshold": -22,
        "eq_preset": "voice_clarity",
        "breath_reduction_db": 6,
        "target_lufs": -16.0,
        "ceiling_db": -1.0,
    },
}


# ================================================================
# VOXAR AUDIO MASTER (Day 4 — COMPLETE)
# ================================================================

class VoxarAudioMaster:
    """
    Complete audio mastering pipeline.
    Transforms raw TTS output into studio-grade audio.

    Correct processing order:
      1. Noise reduction (before everything — works on raw signal)
      2. Trim silence (remove dead air)
      3. Remove artifacts (DC offset, clicks, edge fades)
      4. Compression (even out dynamics)
      5. EQ (shape tone)
      6. Breath smoothing (reduce breath sounds)
      7. Normalize loudness (set to -16 LUFS)
      8. Final limiter (catch any peaks above ceiling)

    Order matters! Normalization MUST be second-to-last.
    Limiter MUST be last.
    """

    def __init__(self, mode="flash"):
        self.mode = mode
        self.profile = MASTERING_PROFILES.get(mode, MASTERING_PROFILES["flash"])
        self.core = VoxarCoreProcessor()
        self.advanced = VoxarAdvancedProcessor()
        self.io = AudioIO()
        logger.info(f"VoxarAudioMaster: mode={mode} ({self.profile['name']})")

    def set_mode(self, mode):
        """Change mastering mode."""
        if mode not in MASTERING_PROFILES:
            logger.warning(f"Unknown mode '{mode}', using flash")
            mode = "flash"
        self.mode = mode
        self.profile = MASTERING_PROFILES[mode]
        logger.info(f"Mastering mode changed to: {mode}")

    def master(self, raw_audio_path, output_path=None, output_format="wav"):
        """
        Complete mastering pipeline for a single audio file.

        Args:
            raw_audio_path: path to raw TTS output
            output_path: where to save mastered file (auto-generated if None)
            output_format: "wav" or "mp3"

        Returns:
            dict with output_path, duration, processing_time, etc.
        """
        if not os.path.exists(raw_audio_path):
            raise FileNotFoundError(f"Not found: {raw_audio_path}")

        start_time = time.time()
        p = self.profile

        logger.info(f"  Mastering: {os.path.basename(raw_audio_path)} (mode: {self.mode})")

        # Load raw audio
        data, sr = self.io.load(raw_audio_path)
        original_duration = len(data) / sr
        original_peak = float(np.max(np.abs(data)))

        # === MASTERING CHAIN ===

        # Step 1: Noise reduction
        if p["noise_reduction"] > 0:
            data = self.core.noise_reduction(data, sr, strength=p["noise_reduction"])

        # Step 2: Trim silence
        data = self.core.trim_silence(data, sr, threshold_db=-40, padding_ms=100)

        # Step 3: Remove artifacts
        data = self.advanced.remove_artifacts(data, sr)

        # Step 4: Compression
        if p["compression_ratio"] > 1.0:
            data = self.advanced.apply_compression(
                data, sr,
                ratio=p["compression_ratio"],
                threshold_db=p["compression_threshold"]
            )

        # Step 5: EQ
        data = self.advanced.apply_eq(data, sr, preset=p["eq_preset"])

        # Step 6: Breath smoothing
        if p["breath_reduction_db"] > 0:
            data = self.advanced.smooth_breaths(data, sr, reduction_db=p["breath_reduction_db"])

        # Step 7: Normalize loudness (-16 LUFS)
        data = self.core.normalize_loudness(data, sr, target_lufs=p["target_lufs"])

        # Step 8: FINAL limiter (MUST be last — catches anything above ceiling)
        data = self.core.remove_clipping(data, sr, ceiling_db=p["ceiling_db"])

        # Generate output path
        if output_path is None:
            raw_name = Path(raw_audio_path).stem
            out_dir = Path(raw_audio_path).parent / "mastered"
            out_dir.mkdir(exist_ok=True)
            output_path = str(out_dir / f"mastered_{raw_name}.{output_format}")

        # Save
        self.io.save(data, sr, output_path)

        # Convert to MP3 if requested
        if output_format == "mp3":
            output_path = self._convert_to_mp3(output_path, quality="high")

        processing_time = time.time() - start_time
        final_duration = len(data) / sr
        final_peak = float(np.max(np.abs(data)))

        logger.info(f"  Mastered: {original_duration:.1f}s → {final_duration:.1f}s | "
                    f"Peak: {20*np.log10(original_peak+1e-10):.1f} → "
                    f"{20*np.log10(final_peak+1e-10):.1f} dBFS | "
                    f"Time: {processing_time:.1f}s")

        return {
            "output_path": output_path,
            "original_duration": round(original_duration, 2),
            "final_duration": round(final_duration, 2),
            "processing_time": round(processing_time, 2),
            "mode": self.mode,
            "mode_name": self.profile["name"],
            "original_peak_dbfs": round(20 * np.log10(original_peak + 1e-10), 1),
            "final_peak_dbfs": round(20 * np.log10(final_peak + 1e-10), 1),
            "target_lufs": p["target_lufs"],
            "file_size_kb": round(os.path.getsize(output_path) / 1024, 1),
        }

    def master_chunked(self, chunk_paths, output_path, pause_ms=400, crossfade_ms=50):
        """
        Master individual chunks and join them with crossfade.
        THIS FIXES the chunk transition quality issue.

        Process:
          1. Master each chunk individually
          2. Crossfade between chunks (smooth transition)
          3. Add pause between chunks
          4. Final mastering pass on complete audio

        Args:
            chunk_paths: list of raw chunk audio file paths
            output_path: where to save final joined audio
            pause_ms: silence between chunks in ms
            crossfade_ms: overlap/crossfade duration in ms
        """
        if not chunk_paths:
            raise ValueError("No chunk paths provided")

        start_time = time.time()
        p = self.profile

        logger.info(f"  Chunked mastering: {len(chunk_paths)} chunks "
                    f"(pause:{pause_ms}ms, crossfade:{crossfade_ms}ms)")

        # Step 1: Load and process each chunk
        processed_chunks = []
        chunk_sr = None

        for i, chunk_path in enumerate(chunk_paths):
            if not os.path.exists(chunk_path):
                logger.warning(f"  Chunk {i} not found: {chunk_path}")
                continue

            data, sr = self.io.load(chunk_path)
            if chunk_sr is None:
                chunk_sr = sr
            elif sr != chunk_sr:
                logger.warning(f"  Chunk {i} sample rate mismatch: {sr} vs {chunk_sr}")

            # Process each chunk (no normalization yet — do that on joined audio)
            # Step 1: Noise reduction
            if p["noise_reduction"] > 0:
                data = self.core.noise_reduction(data, sr, strength=p["noise_reduction"])

            # Step 2: Trim silence
            data = self.core.trim_silence(data, sr, threshold_db=-40, padding_ms=80)

            # Step 3: Artifacts
            data = self.advanced.remove_artifacts(data, sr)

            # Step 4: Compression (per chunk for consistent dynamics)
            if p["compression_ratio"] > 1.0:
                data = self.advanced.apply_compression(
                    data, sr,
                    ratio=p["compression_ratio"],
                    threshold_db=p["compression_threshold"]
                )

            # Step 5: EQ
            data = self.advanced.apply_eq(data, sr, preset=p["eq_preset"])

            # Step 6: Breath smoothing
            if p["breath_reduction_db"] > 0:
                data = self.advanced.smooth_breaths(data, sr, reduction_db=p["breath_reduction_db"])

            processed_chunks.append(data)
            logger.info(f"  Chunk {i + 1}/{len(chunk_paths)} processed ({len(data)/sr:.1f}s)")

        if not processed_chunks:
            raise RuntimeError("No chunks could be processed")

        sr = chunk_sr

        # Step 2: Join chunks with crossfade
        joined = self._join_with_crossfade(processed_chunks, sr, pause_ms, crossfade_ms)

        # Step 3: Final mastering pass on complete audio
        # Normalize loudness on the COMPLETE joined audio (consistent throughout)
        joined = self.core.normalize_loudness(joined, sr, target_lufs=p["target_lufs"])

        # Final limiter
        joined = self.core.remove_clipping(joined, sr, ceiling_db=p["ceiling_db"])

        # Save
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
        self.io.save(joined, sr, output_path)

        processing_time = time.time() - start_time
        final_duration = len(joined) / sr

        logger.info(f"  Chunked master complete: {len(processed_chunks)} chunks → "
                    f"{final_duration:.1f}s | Time: {processing_time:.1f}s")

        return {
            "output_path": output_path,
            "final_duration": round(final_duration, 2),
            "processing_time": round(processing_time, 2),
            "chunks_processed": len(processed_chunks),
            "mode": self.mode,
            "crossfade_ms": crossfade_ms,
            "pause_ms": pause_ms,
            "file_size_kb": round(os.path.getsize(output_path) / 1024, 1),
        }

    def _join_with_crossfade(self, chunks, sample_rate, pause_ms, crossfade_ms):
        """
        Join audio chunks with smooth crossfade transitions.
        This is the KEY function that fixes chunk boundary artifacts.

        How it works:
          Chunk A:  [...audio... ──fade_out──]
          Pause:    [───silence───]
          Chunk B:  [──fade_in── ...audio...]

        The fade regions overlap, creating smooth transition.
        """
        if len(chunks) == 1:
            return chunks[0]

        crossfade_samples = int(sample_rate * crossfade_ms / 1000.0)
        pause_samples = int(sample_rate * pause_ms / 1000.0)

        # Calculate total length
        total_length = sum(len(c) for c in chunks)
        # Add pauses between chunks
        total_length += pause_samples * (len(chunks) - 1)
        # Subtract crossfade overlaps
        total_length -= crossfade_samples * 2 * (len(chunks) - 1)
        total_length = max(total_length, sum(len(c) for c in chunks))

        result = np.zeros(total_length + sample_rate, dtype=np.float32)  # Extra buffer
        position = 0

        for i, chunk in enumerate(chunks):
            if i == 0:
                # First chunk: just place it, apply fade out at end
                chunk_copy = chunk.copy()
                if crossfade_samples > 0 and len(chunk_copy) > crossfade_samples:
                    fade_out = np.linspace(1.0, 0.0, crossfade_samples, dtype=np.float32)
                    chunk_copy[-crossfade_samples:] *= fade_out

                end_pos = position + len(chunk_copy)
                if end_pos <= len(result):
                    result[position:end_pos] = chunk_copy
                else:
                    fit = len(result) - position
                    result[position:position + fit] = chunk_copy[:fit]
                position = end_pos - crossfade_samples  # Overlap region

            else:
                # Add pause
                position += pause_samples

                # Apply fade in to start of this chunk
                chunk_copy = chunk.copy()
                if crossfade_samples > 0 and len(chunk_copy) > crossfade_samples:
                    fade_in = np.linspace(0.0, 1.0, crossfade_samples, dtype=np.float32)
                    chunk_copy[:crossfade_samples] *= fade_in

                    # Also fade out end (for next chunk)
                    if i < len(chunks) - 1 and len(chunk_copy) > crossfade_samples:
                        fade_out = np.linspace(1.0, 0.0, crossfade_samples, dtype=np.float32)
                        chunk_copy[-crossfade_samples:] *= fade_out

                # Place chunk (overlapping with previous fade-out region)
                end_pos = position + len(chunk_copy)
                if end_pos <= len(result):
                    # Add (overlap) rather than replace in crossfade region
                    result[position:position + crossfade_samples] += chunk_copy[:crossfade_samples]
                    result[position + crossfade_samples:end_pos] = chunk_copy[crossfade_samples:]
                else:
                    fit = len(result) - position
                    if fit > 0:
                        to_place = min(fit, len(chunk_copy))
                        overlap = min(crossfade_samples, to_place)
                        result[position:position + overlap] += chunk_copy[:overlap]
                        if to_place > overlap:
                            result[position + overlap:position + to_place] = chunk_copy[overlap:to_place]

                if i < len(chunks) - 1:
                    position = end_pos - crossfade_samples
                else:
                    position = end_pos

        # Trim trailing zeros
        last_nonzero = len(result)
        threshold = 1e-6
        while last_nonzero > 0 and abs(result[last_nonzero - 1]) < threshold:
            last_nonzero -= 1

        # Keep a tiny tail
        tail = min(int(sample_rate * 0.1), len(result) - last_nonzero)
        result = result[:last_nonzero + tail]

        logger.info(f"  Crossfade join: {len(chunks)} chunks → {len(result)/sample_rate:.1f}s "
                    f"(crossfade: {crossfade_ms}ms, pause: {pause_ms}ms)")

        return result

    def _convert_to_mp3(self, wav_path, quality="high"):
        """Convert WAV to MP3 using pydub/FFmpeg."""
        from pydub import AudioSegment
        audio = AudioSegment.from_file(wav_path)

        bitrate = "320k" if quality == "high" else "128k"
        mp3_path = wav_path.rsplit('.', 1)[0] + ".mp3"

        audio.export(mp3_path, format="mp3", bitrate=bitrate,
                     tags={"artist": "VOXAR Studio", "album": "VOXAR Generation"})

        # Remove temp WAV
        if os.path.exists(wav_path) and wav_path != mp3_path:
            os.remove(wav_path)

        logger.info(f"  Exported MP3: {bitrate} → {mp3_path}")
        return mp3_path

    def get_profile_info(self):
        return {
            "mode": self.mode,
            "profile": self.profile,
            "available_modes": list(MASTERING_PROFILES.keys()),
        }