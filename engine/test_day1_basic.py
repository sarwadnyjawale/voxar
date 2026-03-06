"""
VOXAR Phase 1 — Day 1: Basic Engine Test
=========================================
Tests:
1. GPU detection
2. Model loading
3. Basic English generation
4. Output file verification

Run: python -m engine.tests.test_day1_basic
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from engine.tts_engine import VoxarTTSEngine


def main():
    print("=" * 60)
    print("  VOXAR ENGINE — DAY 1: BASIC TEST")
    print("=" * 60)

    # Check voice reference exists
    ref_path = "voices/references/sample.wav"
    if not os.path.exists(ref_path):
        print(f"\n❌ ERROR: Voice reference not found at '{ref_path}'")
        print("   Please add a voice sample first!")
        print("   See Phase 1 instructions — Step 4")
        return

    # ========== TEST 1: Engine Load ==========
    print("\n[TEST 1] Loading VOXAR Engine...")
    try:
        engine = VoxarTTSEngine()
        print("  ✅ Engine loaded successfully")
    except Exception as e:
        print(f"  ❌ FAILED: {e}")
        return

    # ========== TEST 2: GPU Info ==========
    print("\n[TEST 2] GPU Information:")
    gpu = engine.get_gpu_info()
    for key, value in gpu.items():
        print(f"  {key}: {value}")
    if gpu["gpu_available"]:
        print("  ✅ GPU ready")
    else:
        print("  ⚠️  Running on CPU (will be slow)")

    # ========== TEST 3: Model Info ==========
    print("\n[TEST 3] Model Information:")
    info = engine.get_model_info()
    print(f"  Engine: {info['engine']}")
    print(f"  Model: {info['model']}")
    print(f"  Modes: {list(info['available_modes'].keys())}")
    print(f"  Languages: {len(info['supported_languages'])} supported")
    print(f"  Indian Languages: {list(info['indian_languages'].keys())}")
    print("  ✅ Model info retrieved")

    # ========== TEST 4: Voice Reference Analysis ==========
    print(f"\n[TEST 4] Analyzing voice reference: {ref_path}")
    analysis = engine.extract_embedding_info(ref_path)
    print(f"  Duration: {analysis['duration_seconds']}s")
    print(f"  Sample Rate: {analysis['sample_rate']} Hz")
    print(f"  Volume: {analysis['volume_db']} dB")
    print(f"  Silence Ratio: {analysis['silence_ratio']:.0%}")
    print(f"  Valid: {analysis['is_valid']}")
    if analysis['issues']:
        for issue in analysis['issues']:
            print(f"  ⚠️  {issue}")
    if analysis['recommendations']:
        for rec in analysis['recommendations']:
            print(f"  💡 {rec}")

    if not analysis['is_valid']:
        print("  ❌ Voice reference has issues. Fix them before continuing.")
        return

    print("  ✅ Voice reference is valid")

    # ========== TEST 5: Basic Generation ==========
    print("\n[TEST 5] Generating English speech (Flash mode)...")
    test_text = (
        "Welcome to VOXAR Studio. This is a test of the voice generation engine. "
        "We are building India's premium AI voice technology platform."
    )
    print(f"  Text: \"{test_text[:60]}...\"")
    print(f"  Characters: {len(test_text)}")
    print(f"  Mode: flash")
    print(f"  Language: en")
    print(f"  Generating...")

    try:
        result = engine.generate(
            text=test_text,
            speaker_wav=ref_path,
            language="en",
            mode="flash"
        )
        print(f"\n  ✅ GENERATION SUCCESSFUL!")
        print(f"  Output: {result['output_path']}")
        print(f"  Duration: {result['duration']}s")
        print(f"  Generation Time: {result['generation_time']}s")
        print(f"  File Size: {result['file_size_kb']} KB")
        print(f"  Chunks Used: {result['chunks_used']}")
        if result['quality_notes']:
            for note in result['quality_notes']:
                print(f"  ⚠️  {note}")
    except Exception as e:
        print(f"  ❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return

    # ========== TEST 6: List Modes ==========
    print("\n[TEST 6] Available Modes:")
    engine.list_modes()

    # ========== FINAL REPORT ==========
    print("=" * 60)
    print("  DAY 1 TEST COMPLETE ✅")
    print("=" * 60)
    print(f"\n  🎧 Listen to your output: {result['output_path']}")
    print(f"  Open the file and check if it sounds good!")
    print(f"\n  GPU VRAM after test:")
    gpu_after = engine.get_gpu_info()
    print(f"    Used: {gpu_after['vram_used_gb']} GB")
    print(f"    Free: {gpu_after['vram_free_gb']} GB")
    print()


if __name__ == "__main__":
    main()
    