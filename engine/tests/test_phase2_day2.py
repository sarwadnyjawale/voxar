"""
VOXAR Phase 2 — Day 2: Core Processing Test
Tests trim, normalize, declip, denoise on Phase 1 outputs.
Before/after comparison.
"""

import sys
import os
import time
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 2 — DAY 2: CORE PROCESSING TEST")
    print("  Testing: trim_silence, normalize_loudness, remove_clipping, noise_reduction")
    print("=" * 90)

    from engine.audio_processor import VoxarCoreProcessor, VoxarAudioAnalyzer, AudioIO

    processor = VoxarCoreProcessor()
    analyzer = VoxarAudioAnalyzer()
    io = AudioIO()

    # Pick test files — one short, one long, one Hindi
    output_dir = os.path.join(PROJECT_ROOT, "output")
    test_files = []

    candidates = [
        "stress_en_250.wav",       # Short English
        "day4_en_long_flash.wav",  # Chunked English
        "stress_hi_250.wav",       # Short Hindi
        "day4_hi_long_flash.wav",  # Chunked Hindi
        "day5_voice_sample_en.wav", # Voice test
    ]

    for c in candidates:
        path = os.path.join(output_dir, c)
        if os.path.exists(path):
            test_files.append(path)

    if not test_files:
        # Fallback: use any wav file
        for f in os.listdir(output_dir):
            if f.endswith('.wav') and not f.startswith('_'):
                test_files.append(os.path.join(output_dir, f))
                if len(test_files) >= 3:
                    break

    if not test_files:
        print("  ERROR: No audio files found in output/")
        return

    print(f"\n  Test files: {len(test_files)}")
    for f in test_files:
        print(f"    {os.path.basename(f)}")

    processed_dir = os.path.join(output_dir, "processed_day2")
    os.makedirs(processed_dir, exist_ok=True)

    # ========================================
    # TEST 1: Individual function tests
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 1: INDIVIDUAL FUNCTION TESTS")
    print(f"{'=' * 90}")

    test_file = test_files[0]
    fname = os.path.basename(test_file)
    print(f"\n  Using: {fname}")

    data, sr = io.load(test_file)
    print(f"  Loaded: {len(data)} samples, {sr} Hz, {len(data)/sr:.1f}s")

    # --- 1a: Trim Silence ---
    print(f"\n  [1a] TRIM SILENCE")
    print(f"  {'─' * 50}")
    trimmed = processor.trim_silence(data, sr, threshold_db=-40, padding_ms=100)
    before_dur = len(data) / sr
    after_dur = len(trimmed) / sr
    print(f"  Before: {before_dur:.2f}s → After: {after_dur:.2f}s "
          f"(removed {(before_dur - after_dur) * 1000:.0f}ms)")

    out_path = os.path.join(processed_dir, f"trimmed_{fname}")
    io.save(trimmed, sr, out_path)
    print(f"  Saved: {out_path}")

    # --- 1b: Normalize Loudness ---
    print(f"\n  [1b] NORMALIZE LOUDNESS")
    print(f"  {'─' * 50}")
    normalized = processor.normalize_loudness(data, sr, target_lufs=-16.0)

    out_path = os.path.join(processed_dir, f"normalized_{fname}")
    io.save(normalized, sr, out_path)
    print(f"  Saved: {out_path}")

    # --- 1c: Remove Clipping ---
    print(f"\n  [1c] REMOVE CLIPPING")
    print(f"  {'─' * 50}")
    declipped = processor.remove_clipping(data, sr, ceiling_db=-1.0)
    before_peak = np.max(np.abs(data))
    after_peak = np.max(np.abs(declipped))
    print(f"  Peak before: {20*np.log10(before_peak+1e-10):.1f} dBFS → "
          f"After: {20*np.log10(after_peak+1e-10):.1f} dBFS")

    out_path = os.path.join(processed_dir, f"declipped_{fname}")
    io.save(declipped, sr, out_path)
    print(f"  Saved: {out_path}")

    # --- 1d: Noise Reduction ---
    print(f"\n  [1d] NOISE REDUCTION")
    print(f"  {'─' * 50}")
    start = time.time()
    denoised = processor.noise_reduction(data, sr, strength=0.5)
    nr_time = time.time() - start
    print(f"  Processing time: {nr_time:.1f}s")

    out_path = os.path.join(processed_dir, f"denoised_{fname}")
    io.save(denoised, sr, out_path)
    print(f"  Saved: {out_path}")

    # ========================================
    # TEST 2: Combined processing (correct order)
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 2: COMBINED PROCESSING (all 4 steps)")
    print(f"{'=' * 90}")

    for test_file in test_files:
        fname = os.path.basename(test_file)
        print(f"\n  Processing: {fname}")
        print(f"  {'─' * 50}")

        data, sr = io.load(test_file)
        start = time.time()

        # Step 1: Noise reduction (do first — before trimming)
        step1 = processor.noise_reduction(data, sr, strength=0.3)

        # Step 2: Trim silence
        step2 = processor.trim_silence(step1, sr, threshold_db=-40, padding_ms=100)

        # Step 3: Remove clipping
        step3 = processor.remove_clipping(step2, sr, ceiling_db=-1.0)

        # Step 4: Normalize loudness (do last — after all volume changes)
        step4 = processor.normalize_loudness(step3, sr, target_lufs=-16.0)

        total_time = time.time() - start

        # Save processed
        out_path = os.path.join(processed_dir, f"processed_{fname}")
        io.save(step4, sr, out_path)

        before_dur = len(data) / sr
        after_dur = len(step4) / sr
        before_peak = np.max(np.abs(data))
        after_peak = np.max(np.abs(step4))

        print(f"  Duration: {before_dur:.1f}s → {after_dur:.1f}s")
        print(f"  Peak: {20*np.log10(before_peak+1e-10):.1f} → "
              f"{20*np.log10(after_peak+1e-10):.1f} dBFS")
        print(f"  Processing time: {total_time:.2f}s")
        print(f"  Saved: {out_path}")

    # ========================================
    # TEST 3: Before/After Comparison
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 3: BEFORE vs AFTER ANALYSIS")
    print(f"{'=' * 90}")

    print(f"\n  Analyzing original files...")
    before_results = []
    for test_file in test_files:
        result = analyzer.analyze(test_file)
        before_results.append(result)

    print(f"  Analyzing processed files...")
    after_results = []
    for test_file in test_files:
        fname = os.path.basename(test_file)
        proc_path = os.path.join(processed_dir, f"processed_{fname}")
        if os.path.exists(proc_path):
            result = analyzer.analyze(proc_path)
            after_results.append(result)

    if before_results and after_results:
        print(f"\n  {'File':<30} {'BEFORE':<25} {'AFTER':<25} {'IMPROVED'}")
        print(f"  {'─' * 90}")

        for before, after in zip(before_results, after_results):
            fname = before['file_name'][:28]

            b_lufs = f"{before['loudness_lufs']}" if before['loudness_lufs'] else "N/A"
            a_lufs = f"{after['loudness_lufs']}" if after['loudness_lufs'] else "N/A"

            b_info = f"LUFS:{b_lufs} Peak:{before['peak_dbfs']:.0f} Sil:{before['silence_ratio']:.0%}"
            a_info = f"LUFS:{a_lufs} Peak:{after['peak_dbfs']:.0f} Sil:{after['silence_ratio']:.0%}"

            score_diff = after['score'] - before['score']
            improved = f"{'✅' if score_diff > 0 else '➡️'} {before['score']}→{after['score']}"

            print(f"  {fname:<30} {b_info:<25} {a_info:<25} {improved}")

    # ========================================
    # Summary
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  DAY 2 COMPLETE")
    print(f"{'=' * 90}")

    print(f"\n  LISTEN AND COMPARE (in output/processed_day2/):")
    print(f"    Original files in output/")
    print(f"    Processed files in output/processed_day2/")
    print(f"\n  Individual function outputs:")
    print(f"    trimmed_*      — silence removed from start/end")
    print(f"    normalized_*   — loudness set to -16 LUFS")
    print(f"    declipped_*    — soft limiter applied")
    print(f"    denoised_*     — background noise reduced")
    print(f"    processed_*    — ALL 4 steps combined")
    print(f"\n  CHECK:")
    print(f"    - Is trimmed version tighter? (no dead air)")
    print(f"    - Is declipped version smoother? (no harsh peaks)")
    print(f"    - Is denoised version cleaner? (less hiss)")
    print(f"    - Does processed_ sound better overall?")
    print(f"    - Is voice still natural? (not robotic)")
    print()


if __name__ == "__main__":
    main()