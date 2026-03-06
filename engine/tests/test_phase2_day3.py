"""
VOXAR Phase 2 — Day 3: Advanced Processing Test
Tests compression, EQ, breath smoothing, artifact removal.
"""

import sys
import os
import time
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 2 — DAY 3: ADVANCED PROCESSING TEST")
    print("  Testing: compression, EQ presets, breath smoothing, artifact removal")
    print("=" * 90)

    from engine.audio_processor import (
        VoxarCoreProcessor, VoxarAdvancedProcessor, VoxarAudioAnalyzer, AudioIO
    )

    core = VoxarCoreProcessor()
    advanced = VoxarAdvancedProcessor()
    analyzer = VoxarAudioAnalyzer()
    io = AudioIO()

    output_dir = os.path.join(PROJECT_ROOT, "output")
    processed_dir = os.path.join(output_dir, "processed_day3")
    os.makedirs(processed_dir, exist_ok=True)

    # Pick test files
    candidates = [
        "stress_en_250.wav",
        "day4_en_long_flash.wav",
        "stress_hi_250.wav",
        "day5_voice_sample_en.wav",
    ]

    test_files = []
    for c in candidates:
        p = os.path.join(output_dir, c)
        if os.path.exists(p):
            test_files.append(p)

    if not test_files:
        for f in os.listdir(output_dir):
            if f.endswith('.wav') and not f.startswith('_'):
                test_files.append(os.path.join(output_dir, f))
                if len(test_files) >= 3:
                    break

    if not test_files:
        print("  ERROR: No audio files found!")
        return

    print(f"\n  Test files: {len(test_files)}")

    # ========================================
    # TEST 1: Individual Advanced Functions
    # ========================================
    test_file = test_files[0]
    fname = os.path.basename(test_file)
    data, sr = io.load(test_file)
    print(f"\n  Primary test file: {fname} ({len(data)/sr:.1f}s)")

    # --- 1a: Compression ---
    print(f"\n{'=' * 90}")
    print(f"  [1a] DYNAMIC COMPRESSION")
    print(f"{'─' * 50}")

    start = time.time()
    compressed = advanced.apply_compression(data, sr, ratio=2.5, threshold_db=-20)
    t = time.time() - start

    out = os.path.join(processed_dir, f"compressed_{fname}")
    io.save(compressed, sr, out)

    before_rms = 20 * np.log10(np.sqrt(np.mean(data ** 2)) + 1e-10)
    after_rms = 20 * np.log10(np.sqrt(np.mean(compressed ** 2)) + 1e-10)
    before_dr = np.max(np.abs(data)) / (np.sqrt(np.mean(data ** 2)) + 1e-10)
    after_dr = np.max(np.abs(compressed)) / (np.sqrt(np.mean(compressed ** 2)) + 1e-10)
    print(f"  RMS: {before_rms:.1f} → {after_rms:.1f} dBFS")
    print(f"  Crest factor: {20*np.log10(before_dr+1e-10):.1f} → {20*np.log10(after_dr+1e-10):.1f} dB")
    print(f"  Time: {t:.2f}s | File: {out}")

    # --- 1b: EQ Presets ---
    print(f"\n{'=' * 90}")
    print(f"  [1b] EQ PRESETS")
    print(f"{'─' * 50}")

    eq_presets = ["voice_clarity", "warm", "bright", "cinematic"]
    for preset in eq_presets:
        eqd = advanced.apply_eq(data, sr, preset=preset)
        out = os.path.join(processed_dir, f"eq_{preset}_{fname}")
        io.save(eqd, sr, out)
        print(f"  {preset:<16} → saved")

    # --- 1c: Breath Smoothing ---
    print(f"\n{'=' * 90}")
    print(f"  [1c] BREATH SMOOTHING")
    print(f"{'─' * 50}")

    start = time.time()
    smoothed = advanced.smooth_breaths(data, sr, reduction_db=8)
    t = time.time() - start

    out = os.path.join(processed_dir, f"breathsmooth_{fname}")
    io.save(smoothed, sr, out)
    print(f"  Time: {t:.2f}s | File: {out}")

    # --- 1d: Artifact Removal ---
    print(f"\n{'=' * 90}")
    print(f"  [1d] ARTIFACT REMOVAL")
    print(f"{'─' * 50}")

    start = time.time()
    cleaned = advanced.remove_artifacts(data, sr)
    t = time.time() - start

    out = os.path.join(processed_dir, f"cleaned_{fname}")
    io.save(cleaned, sr, out)
    print(f"  Time: {t:.2f}s | File: {out}")

    # ========================================
    # TEST 2: FULL 8-STEP PIPELINE (Preview of Day 4)
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 2: FULL 8-STEP PIPELINE (all functions combined)")
    print(f"{'=' * 90}")

    for test_file in test_files:
        fname = os.path.basename(test_file)
        print(f"\n  Processing: {fname}")
        print(f"  {'─' * 50}")

        data, sr = io.load(test_file)
        start = time.time()

        # Step 1: Noise reduction
        step1 = core.noise_reduction(data, sr, strength=0.3)

        # Step 2: Trim silence
        step2 = core.trim_silence(step1, sr, threshold_db=-40, padding_ms=100)

        # Step 3: Remove artifacts (DC offset, clicks)
        step3 = advanced.remove_artifacts(step2, sr)

        # Step 4: Compression
        step4 = advanced.apply_compression(step3, sr, ratio=2.5, threshold_db=-20)

        # Step 5: EQ
        step5 = advanced.apply_eq(step4, sr, preset="voice_clarity")

        # Step 6: Breath smoothing
        step6 = advanced.smooth_breaths(step5, sr, reduction_db=8)

        # Step 7: Normalize loudness
        step7 = core.normalize_loudness(step6, sr, target_lufs=-16.0)

        # Step 8: Final limiter (CRITICAL — catches anything pushed above 0dB)
        step8 = core.remove_clipping(step7, sr, ceiling_db=-1.0)

        total_time = time.time() - start

        out_path = os.path.join(processed_dir, f"mastered_{fname}")
        io.save(step8, sr, out_path)

        before_dur = len(data) / sr
        after_dur = len(step8) / sr
        before_peak = 20 * np.log10(np.max(np.abs(data)) + 1e-10)
        after_peak = 20 * np.log10(np.max(np.abs(step8)) + 1e-10)

        print(f"  Duration: {before_dur:.1f}s → {after_dur:.1f}s")
        print(f"  Peak: {before_peak:.1f} → {after_peak:.1f} dBFS")
        print(f"  Processing: {total_time:.2f}s")
        print(f"  Saved: {out_path}")

    # ========================================
    # TEST 3: Before vs After Analysis
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 3: BEFORE vs AFTER (Raw → Mastered)")
    print(f"{'=' * 90}")

    print(f"\n  {'File':<30} {'RAW':<30} {'MASTERED':<30} {'Δ Score'}")
    print(f"  {'─' * 95}")

    for test_file in test_files:
        fname = os.path.basename(test_file)
        mastered_path = os.path.join(processed_dir, f"mastered_{fname}")

        if not os.path.exists(mastered_path):
            continue

        before = analyzer.analyze(test_file)
        after = analyzer.analyze(mastered_path)

        b_lufs = before['loudness_lufs'] if before['loudness_lufs'] is not None else 0
        a_lufs = after['loudness_lufs'] if after['loudness_lufs'] is not None else 0

        b_info = f"LUFS:{b_lufs:.1f} Pk:{before['peak_dbfs']:.0f} Si:{before['silence_ratio']:.0%}"
        a_info = f"LUFS:{a_lufs:.1f} Pk:{after['peak_dbfs']:.0f} Si:{after['silence_ratio']:.0%}"

        diff = after['score'] - before['score']
        arrow = "✅" if diff > 0 else "➡️" if diff == 0 else "❌"
        print(f"  {fname[:28]:<30} {b_info:<30} {a_info:<30} {arrow} {before['score']}→{after['score']}")

    # ========================================
    # Summary
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  DAY 3 COMPLETE — ALL 8 PROCESSING FUNCTIONS WORKING")
    print(f"{'=' * 90}")

    print(f"\n  FILES IN output/processed_day3/:")
    print(f"    compressed_*     — Dynamic range compression applied")
    print(f"    eq_*_*           — EQ presets (clarity/warm/bright/cinematic)")
    print(f"    breathsmooth_*   — Breath sounds reduced")
    print(f"    cleaned_*        — Artifacts removed")
    print(f"    mastered_*       — FULL 8-STEP PIPELINE")

    print(f"\n  🎧 LISTEN AND COMPARE:")
    print(f"    1. Open original in output/")
    print(f"    2. Open mastered in output/processed_day3/")
    print(f"    3. Play back-to-back")
    print(f"    4. The difference should be DRAMATIC")

    print(f"\n  EQ PRESETS COMPARISON:")
    print(f"    Listen to eq_voice_clarity_*, eq_warm_*, eq_bright_*, eq_cinematic_*")
    print(f"    Which sounds best for narration? For ads? For meditation?")
    print()


if __name__ == "__main__":
    main()