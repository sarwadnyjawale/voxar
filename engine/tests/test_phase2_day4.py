"""
VOXAR Phase 2 — Day 4: Complete Mastering Pipeline Test
Tests VoxarAudioMaster with all modes and chunked mastering.
"""

import sys
import os
import time
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 2 — DAY 4: COMPLETE MASTERING PIPELINE")
    print("  Testing VoxarAudioMaster with all modes + chunked mastering")
    print("=" * 90)

    from engine.audio_processor import VoxarAudioMaster, VoxarAudioAnalyzer

    analyzer = VoxarAudioAnalyzer()
    output_dir = os.path.join(PROJECT_ROOT, "output")
    mastered_dir = os.path.join(output_dir, "mastered_day4")
    os.makedirs(mastered_dir, exist_ok=True)

    # ========================================
    # TEST 1: Single file — all 4 modes
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 1: SAME FILE → 4 DIFFERENT MASTERING MODES")
    print(f"{'=' * 90}")

    test_file = None
    for candidate in ["stress_en_250.wav", "day5_voice_sample_en.wav"]:
        p = os.path.join(output_dir, candidate)
        if os.path.exists(p):
            test_file = p
            break

    if not test_file:
        for f in os.listdir(output_dir):
            if f.endswith('.wav') and not f.startswith('_'):
                test_file = os.path.join(output_dir, f)
                break

    if not test_file:
        print("  ERROR: No audio files!")
        return

    fname = os.path.basename(test_file)
    print(f"\n  Source: {fname}")

    modes = ["flash", "cinematic", "longform", "multilingual"]

    for mode in modes:
        print(f"\n  Mode: {mode.upper()}")
        print(f"  {'─' * 50}")

        master = VoxarAudioMaster(mode=mode)
        out_path = os.path.join(mastered_dir, f"{mode}_{fname}")

        result = master.master(test_file, output_path=out_path)

        print(f"  Duration: {result['original_duration']}s → {result['final_duration']}s")
        print(f"  Peak: {result['original_peak_dbfs']} → {result['final_peak_dbfs']} dBFS")
        print(f"  Time: {result['processing_time']}s")
        print(f"  File: {out_path}")

    # ========================================
    # TEST 2: Chunked mastering with crossfade
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 2: CHUNKED MASTERING WITH CROSSFADE")
    print(f"  This fixes the Phase 1 chunk transition quality issue!")
    print(f"{'=' * 90}")

    # Find chunked files or create test chunks from a long file
    long_file = None
    for candidate in ["day4_en_long_flash.wav", "stress_en_500.wav", "stress_en_1000.wav"]:
        p = os.path.join(output_dir, candidate)
        if os.path.exists(p):
            long_file = p
            break

    if long_file:
        # Split into artificial chunks to test crossfade
        from engine.audio_processor import AudioIO
        io = AudioIO()
        data, sr = io.load(long_file)

        chunk_size = len(data) // 3
        chunk_paths = []
        for i in range(3):
            start = i * chunk_size
            end = start + chunk_size if i < 2 else len(data)
            chunk_data = data[start:end]
            chunk_path = os.path.join(mastered_dir, f"_test_chunk_{i}.wav")
            io.save(chunk_data, sr, chunk_path)
            chunk_paths.append(chunk_path)

        print(f"\n  Source: {os.path.basename(long_file)} (split into 3 chunks)")

        # Test different crossfade settings
        crossfade_tests = [
            {"crossfade": 0, "pause": 400, "label": "No crossfade (old method)"},
            {"crossfade": 30, "pause": 400, "label": "30ms crossfade"},
            {"crossfade": 50, "pause": 400, "label": "50ms crossfade (recommended)"},
            {"crossfade": 100, "pause": 400, "label": "100ms crossfade (aggressive)"},
            {"crossfade": 50, "pause": 200, "label": "50ms CF + short pause"},
            {"crossfade": 50, "pause": 600, "label": "50ms CF + long pause"},
        ]

        for test in crossfade_tests:
            print(f"\n  {test['label']}")
            print(f"  {'─' * 50}")

            out_name = f"chunked_cf{test['crossfade']}_p{test['pause']}_{os.path.basename(long_file)}"
            out_path = os.path.join(mastered_dir, out_name)

            master = VoxarAudioMaster(mode="longform")
            result = master.master_chunked(
                chunk_paths, out_path,
                pause_ms=test["pause"],
                crossfade_ms=test["crossfade"]
            )

            print(f"  Duration: {result['final_duration']}s | "
                  f"Chunks: {result['chunks_processed']} | "
                  f"Time: {result['processing_time']}s")
            print(f"  File: {out_path}")

        # Cleanup temp chunks
        for cp in chunk_paths:
            if os.path.exists(cp):
                os.remove(cp)

    else:
        print("  No long files found for chunked test")

    # ========================================
    # TEST 3: Hindi mastering
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 3: HINDI MASTERING")
    print(f"{'=' * 90}")

    hi_file = None
    for candidate in ["stress_hi_250.wav", "day4_hi_long_flash.wav"]:
        p = os.path.join(output_dir, candidate)
        if os.path.exists(p):
            hi_file = p
            break

    if hi_file:
        fname = os.path.basename(hi_file)
        print(f"\n  Source: {fname}")

        master = VoxarAudioMaster(mode="multilingual")
        out_path = os.path.join(mastered_dir, f"multilingual_{fname}")
        result = master.master(hi_file, output_path=out_path)

        print(f"  Duration: {result['original_duration']}s → {result['final_duration']}s")
        print(f"  Peak: {result['original_peak_dbfs']} → {result['final_peak_dbfs']} dBFS")
        print(f"  Time: {result['processing_time']}s")

    # ========================================
    # TEST 4: MP3 Export
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 4: MP3 EXPORT")
    print(f"{'=' * 90}")

    if test_file:
        master = VoxarAudioMaster(mode="cinematic")
        mp3_path = os.path.join(mastered_dir, f"export_cinematic.mp3")

        # First master as WAV, then we'll test MP3 conversion
        wav_temp = os.path.join(mastered_dir, f"_temp_for_mp3.wav")
        result = master.master(test_file, output_path=wav_temp)

        # Convert to MP3
        from pydub import AudioSegment
        audio = AudioSegment.from_file(wav_temp)

        # High quality (320kbps) — for paid users
        audio.export(mp3_path, format="mp3", bitrate="320k",
                     tags={"artist": "VOXAR Studio", "album": "VOXAR Generation"})
        mp3_size = os.path.getsize(mp3_path) / 1024
        wav_size = os.path.getsize(wav_temp) / 1024

        print(f"\n  WAV: {wav_size:.0f} KB")
        print(f"  MP3 320k: {mp3_size:.0f} KB")
        print(f"  Compression: {wav_size/mp3_size:.1f}x smaller")

        # Standard quality (128kbps) — for free users
        mp3_low = os.path.join(mastered_dir, f"export_standard.mp3")
        audio.export(mp3_low, format="mp3", bitrate="128k")
        mp3_low_size = os.path.getsize(mp3_low) / 1024
        print(f"  MP3 128k: {mp3_low_size:.0f} KB ({wav_size/mp3_low_size:.1f}x smaller)")

        # Cleanup temp
        if os.path.exists(wav_temp):
            os.remove(wav_temp)

    # ========================================
    # TEST 5: Before/After comparison — all mastered files
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 5: QUALITY SCORE COMPARISON")
    print(f"{'=' * 90}")

    mastered_files = [f for f in os.listdir(mastered_dir)
                      if f.endswith('.wav') and not f.startswith('_')]

    if mastered_files:
        print(f"\n  Analyzing {len(mastered_files)} mastered files...")
        results = analyzer.analyze_batch(mastered_dir)
        analyzer.print_report(results)

        scores = [r['score'] for r in results if 'error' not in r]
        if scores:
            print(f"\n  Average mastered score: {np.mean(scores):.0f}/100")
            print(f"  All perfect (100)? {'YES ✅' if min(scores) == 100 else 'NO'}")

    # ========================================
    # Summary
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  DAY 4 COMPLETE — MASTERING PIPELINE READY")
    print(f"{'=' * 90}")

    print(f"\n  🎧 CRITICAL LISTENING TEST:")
    print(f"  Compare these files in output/mastered_day4/:")
    print(f"")
    print(f"  MODE COMPARISON (same source, different mastering):")
    print(f"    flash_*        — Minimal, fast")
    print(f"    cinematic_*    — Full, dramatic")
    print(f"    longform_*     — Stable, warm")
    print(f"    multilingual_* — Clarity focused")
    print(f"")
    print(f"  CROSSFADE COMPARISON (chunk transition fix):")
    print(f"    chunked_cf0_*    — NO crossfade (old method)")
    print(f"    chunked_cf30_*   — 30ms crossfade")
    print(f"    chunked_cf50_*   — 50ms crossfade (RECOMMENDED)")
    print(f"    chunked_cf100_*  — 100ms crossfade")
    print(f"")
    print(f"  QUESTIONS TO ANSWER:")
    print(f"    1. Which mode sounds best for narration?")
    print(f"    2. Which crossfade setting sounds smoothest?")
    print(f"    3. Does 50ms crossfade fix the chunk joint issue?")
    print(f"    4. Is cinematic noticeably richer than flash?")
    print()


if __name__ == "__main__":
    main()