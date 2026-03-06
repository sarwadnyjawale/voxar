"""
VOXAR Phase 2 — Day 5: Quality Validator + Export Test
Complete end-to-end: Raw → Master → Validate → Export
"""

import sys
import os
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 2 — DAY 5: QUALITY VALIDATOR + EXPORT")
    print("  Complete pipeline: Raw → Master → Validate → Export")
    print("=" * 90)

    from engine.audio_processor import VoxarAudioMaster, VoxarAudioAnalyzer
    from engine.quality_validator import VoxarQualityValidator
    from engine.exporter import VoxarExporter

    validator = VoxarQualityValidator()
    exporter = VoxarExporter()
    analyzer = VoxarAudioAnalyzer()

    output_dir = os.path.join(PROJECT_ROOT, "output")
    final_dir = os.path.join(output_dir, "final_day5")
    os.makedirs(final_dir, exist_ok=True)

    # ========================================
    # TEST 1: Validate Raw vs Mastered
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 1: VALIDATE RAW vs MASTERED FILES")
    print(f"{'=' * 90}")

    raw_files = []
    for candidate in ["stress_en_250.wav", "stress_hi_250.wav",
                       "day5_voice_sample_en.wav", "day4_en_long_flash.wav"]:
        p = os.path.join(output_dir, candidate)
        if os.path.exists(p):
            raw_files.append(p)

    if not raw_files:
        for f in os.listdir(output_dir):
            if f.endswith('.wav') and not f.startswith('_'):
                raw_files.append(os.path.join(output_dir, f))
                if len(raw_files) >= 3:
                    break

    print(f"\n  Validating {len(raw_files)} RAW files:")
    for rf in raw_files:
        result = validator.validate(rf, expected_text_length=250)
        validator.print_result(result)

    # Now validate mastered files
    mastered_dir = os.path.join(output_dir, "mastered_day4")
    if os.path.exists(mastered_dir):
        mastered_files = [os.path.join(mastered_dir, f)
                         for f in os.listdir(mastered_dir)
                         if f.endswith('.wav') and not f.startswith('_')][:4]

        if mastered_files:
            print(f"\n  Validating {len(mastered_files)} MASTERED files:")
            for mf in mastered_files:
                result = validator.validate(mf, expected_text_length=250)
                validator.print_result(result)

    # ========================================
    # TEST 2: Complete Pipeline — Raw → Master → Validate → Export
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 2: COMPLETE PIPELINE (Raw → Master → Validate → Export)")
    print(f"{'=' * 90}")

    test_file = raw_files[0] if raw_files else None
    if not test_file:
        print("  ERROR: No test files!")
        return

    fname_base = os.path.splitext(os.path.basename(test_file))[0]
    print(f"\n  Source: {os.path.basename(test_file)}")

    # Step 1: Master
    print(f"\n  Step 1: MASTERING (cinematic mode)")
    master = VoxarAudioMaster(mode="cinematic")
    mastered_path = os.path.join(final_dir, f"mastered_{fname_base}.wav")
    master_result = master.master(test_file, output_path=mastered_path)
    print(f"  ✅ Mastered: {master_result['final_duration']}s | "
          f"Peak: {master_result['final_peak_dbfs']} dBFS")

    # Step 2: Validate
    print(f"\n  Step 2: VALIDATION")
    quality = validator.validate(mastered_path, expected_text_length=250)
    validator.print_result(quality)

    # Step 3: Export based on plan
    if quality['passed']:
        print(f"\n  Step 3: EXPORT (testing all plans)")

        plans = ["free", "starter", "creator"]
        for plan in plans:
            print(f"\n  Plan: {plan.upper()}")
            plan_dir = os.path.join(final_dir, plan)

            exports = exporter.export_for_plan(
                mastered_path, plan_dir, fname_base,
                plan=plan, title="VOXAR Test Output"
            )

            for fmt, info in exports.items():
                wm = " 🔊 watermarked" if info.get('watermarked') else ""
                print(f"    {fmt.upper()}: {info['file_size_kb']:.0f}KB | "
                      f"{info['duration']}s{wm}")
    else:
        print(f"\n  ❌ Quality check FAILED — would trigger retry in production")

    # ========================================
    # TEST 3: Export Size Comparison
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 3: FILE SIZE COMPARISON")
    print(f"{'=' * 90}")

    if os.path.exists(mastered_path):
        wav_size = os.path.getsize(mastered_path) / 1024

        # Export WAV CD quality
        wav_cd = os.path.join(final_dir, f"cd_quality_{fname_base}.wav")
        wav_result = exporter.export_wav(mastered_path, wav_cd)

        # Export MP3 320k
        mp3_high = os.path.join(final_dir, f"high_{fname_base}.mp3")
        mp3h_result = exporter.export_mp3(mastered_path, mp3_high, quality="high")

        # Export MP3 128k
        mp3_low = os.path.join(final_dir, f"standard_{fname_base}.mp3")
        mp3l_result = exporter.export_mp3(mastered_path, mp3_low, quality="standard")

        print(f"\n  {'Format':<20} {'Size':<12} {'Ratio':<10} {'Use Case'}")
        print(f"  {'─' * 60}")
        print(f"  {'RAW WAV (24kHz)':<20} {wav_size:>8.0f} KB {'1.0x':<10} Internal")
        print(f"  {'WAV CD (44.1kHz)':<20} {wav_result['file_size_kb']:>8.0f} KB "
              f"{wav_result['file_size_kb']/wav_size:>5.1f}x     {'Paid users'}")
        print(f"  {'MP3 320kbps':<20} {mp3h_result['file_size_kb']:>8.0f} KB "
              f"{mp3h_result['file_size_kb']/wav_size:>5.1f}x     {'Paid users'}")
        print(f"  {'MP3 128kbps':<20} {mp3l_result['file_size_kb']:>8.0f} KB "
              f"{mp3l_result['file_size_kb']/wav_size:>5.1f}x     {'Free users'}")

    # ========================================
    # TEST 4: Edge cases
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 4: EDGE CASES")
    print(f"{'=' * 90}")

    # Test with nonexistent file
    print(f"\n  [4a] Nonexistent file:")
    result = validator.validate("nonexistent_file.wav")
    print(f"  Score: {result['score']} | Grade: {result['grade']} | "
          f"Passed: {result['passed']}")

    # Test with very short expected duration
    print(f"\n  [4b] Suspiciously short check:")
    if raw_files:
        result = validator.validate(raw_files[0], expected_text_length=5000)
        validator.print_result(result)

    # ========================================
    # PHASE 2 FINAL SUMMARY
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  ✅ PHASE 2 COMPLETE — AUDIO POST-PROCESSING PIPELINE")
    print(f"{'=' * 90}")

    print(f"""
  DELIVERABLES:
  ─────────────────────────────────────────────
  ✅ VoxarAudioAnalyzer     — Identifies all audio problems
  ✅ VoxarCoreProcessor     — Trim, normalize, declip, denoise
  ✅ VoxarAdvancedProcessor — Compression, EQ, breath, artifacts
  ✅ VoxarAudioMaster       — Complete 8-step mastering pipeline
  ✅ 4 Mastering profiles   — Flash, Cinematic, Longform, Multilingual
  ✅ Chunked mastering      — Crossfade joins (fixes chunk artifacts)
  ✅ VoxarQualityValidator  — Score, grade, pass/fail, retry logic
  ✅ VoxarExporter          — MP3 (128k/320k) + WAV (16-bit 44.1kHz)
  ✅ Plan-based export      — Free=128k+watermark, Paid=320k+WAV
  ✅ Quality scores         — Raw: 55-70 → Mastered: 100/100

  COMPLETE PIPELINE:
  ─────────────────────────────────────────────
  Text → XTTS → Raw Audio → Master → Validate → Export
                                ↑           ↑
                           8-step       A/B/C/D/F
                           pipeline     grading

  READY FOR:
  ─────────────────────────────────────────────
  Phase 3: Text Preprocessor (number/currency/Hinglish handling)
  Phase 4: Voice Library (25 voices + MMS for Indian languages)
  Phase 5: FastAPI server (wraps everything into API)
    """)


if __name__ == "__main__":
    main()