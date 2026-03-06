"""
VOXAR Phase 1 - Day 1: Basic Engine Test
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 60)
    print("  VOXAR ENGINE - DAY 1: BASIC TEST")
    print("=" * 60)

    ref_dir = "voices/references"
    found_ref = None
    
    if os.path.exists(ref_dir):
        for f in os.listdir(ref_dir):
            full = os.path.join(ref_dir, f)
            if os.path.isfile(full):
                found_ref = full
                break
    
    if found_ref is None:
        print("\n  ERROR: No voice reference found!")
        print("  Add a WAV or MP3 to voices/references/")
        return
    
    ref_path = found_ref
    print(f"\n  Voice reference: {ref_path}")

    print("\n[TEST 1] Loading VOXAR Engine...")
    print("  First run downloads XTTS v2 model (~1.8GB)")
    print("  Please wait...\n")
    
    try:
        from engine.tts_engine import VoxarTTSEngine
        engine = VoxarTTSEngine()
        print("  Engine loaded successfully!")
    except Exception as e:
        print(f"  FAILED: {e}")
        import traceback
        traceback.print_exc()
        return

    print("\n[TEST 2] GPU Information:")
    gpu = engine.get_gpu_info()
    for key, value in gpu.items():
        print(f"  {key}: {value}")

    print("\n[TEST 3] Model Information:")
    info = engine.get_model_info()
    print(f"  Engine: {info['engine']}")
    print(f"  Model: {info['model']}")
    print(f"  Modes: {list(info['available_modes'].keys())}")
    print(f"  Languages: {len(info['supported_languages'])} supported")
    print(f"  Indian Languages: {list(info['indian_languages'].keys())}")

    print(f"\n[TEST 4] Analyzing voice reference: {ref_path}")
    try:
        analysis = engine.extract_embedding_info(ref_path)
        print(f"  Duration: {analysis['duration_seconds']}s")
        print(f"  Sample Rate: {analysis['sample_rate']} Hz")
        print(f"  Volume: {analysis['volume_db']} dB")
        print(f"  Silence Ratio: {analysis['silence_ratio']:.0%}")
        print(f"  Valid: {analysis['is_valid']}")
        if analysis['issues']:
            for issue in analysis['issues']:
                print(f"  WARNING: {issue}")
        if analysis['recommendations']:
            for rec in analysis['recommendations']:
                print(f"  TIP: {rec}")
    except Exception as e:
        print(f"  Analysis failed: {e}")

    print("\n[TEST 5] Generating English speech (Flash mode)...")
    test_text = (
        "Welcome to VOXAR Studio. This is a test of the voice generation engine. "
        "We are building India's premium AI voice technology platform."
    )
    print(f"  Text: \"{test_text[:60]}...\"")
    print(f"  Characters: {len(test_text)}")
    print(f"  Mode: flash")
    print(f"  Language: en")
    print(f"  Generating... (may take 10-30 seconds)")

    try:
        result = engine.generate(
            text=test_text,
            speaker_wav=ref_path,
            language="en",
            mode="flash"
        )
        print(f"\n  GENERATION SUCCESSFUL!")
        print(f"  Output: {result['output_path']}")
        print(f"  Duration: {result['duration']}s")
        print(f"  Generation Time: {result['generation_time']}s")
        print(f"  File Size: {result['file_size_kb']} KB")
        print(f"  Chunks Used: {result['chunks_used']}")
        if result['quality_notes']:
            for note in result['quality_notes']:
                print(f"  NOTE: {note}")
    except Exception as e:
        print(f"  FAILED: {e}")
        import traceback
        traceback.print_exc()
        return

    print("\n[TEST 6] Available Modes:")
    engine.list_modes()

    print("=" * 60)
    print("  DAY 1 TEST COMPLETE")
    print("=" * 60)
    print(f"\n  Listen to your output: {result['output_path']}")
    print(f"  Open the file and check quality!")
    
    gpu_after = engine.get_gpu_info()
    print(f"\n  GPU VRAM after test:")
    print(f"    Used: {gpu_after['vram_used_gb']} GB")
    print(f"    Free: {gpu_after['vram_free_gb']} GB")
    print()


if __name__ == "__main__":
    main()