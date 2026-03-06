"""
VOXAR Phase 1 - Day 5: Voice Reference Test
Tests with available voice references.
Tests cross-language voice consistency.
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 60)
    print("  VOXAR ENGINE - DAY 5: VOICE REFERENCE TEST")
    print("=" * 60)

    ref_dir = "voices/references"
    if not os.path.exists(ref_dir):
        print(f"  ERROR: {ref_dir} not found!")
        return

    audio_ext = {'.wav', '.mp3', '.m4a', '.ogg', '.flac'}
    voice_files = []
    for f in os.listdir(ref_dir):
        if os.path.splitext(f)[1].lower() in audio_ext:
            voice_files.append(os.path.join(ref_dir, f))

    if not voice_files:
        print(f"  ERROR: No voice files in {ref_dir}")
        return

    print(f"\n  Found {len(voice_files)} voice reference(s):")
    for vf in voice_files:
        print(f"    {vf}")

    print("\n  Loading engine...")
    from engine.tts_engine import VoxarTTSEngine
    engine = VoxarTTSEngine()

    os.makedirs("output", exist_ok=True)

    # ========================================
    # TEST 1: Analyze each voice reference
    # ========================================
    print("\n[TEST 1] Voice Reference Analysis")
    print("-" * 50)

    valid_voices = []
    for i, vf in enumerate(voice_files):
        vname = os.path.splitext(os.path.basename(vf))[0]
        print(f"\n  Voice {i+1}: {vname}")

        analysis = engine.extract_embedding_info(vf)
        print(f"    Duration: {analysis['duration_seconds']}s")
        print(f"    Sample Rate: {analysis['sample_rate']} Hz")
        print(f"    Volume: {analysis['volume_db']} dB")
        print(f"    Silence: {analysis['silence_ratio']:.0%}")
        print(f"    Valid: {analysis['is_valid']}")

        if analysis['issues']:
            for issue in analysis['issues']:
                print(f"    WARNING: {issue}")
        if analysis['recommendations']:
            for rec in analysis['recommendations']:
                print(f"    TIP: {rec}")

        if analysis['is_valid']:
            valid_voices.append(vf)

    if not valid_voices:
        print("\n  ERROR: No valid voice references!")
        return

    # ========================================
    # TEST 2: Same text, each voice (English)
    # ========================================
    print(f"\n\n[TEST 2] Same Text, Different Voices (English)")
    print("-" * 50)

    en_text = (
        "Welcome to VOXAR Studio. This voice was generated using "
        "artificial intelligence. How does it sound to you?"
    )

    for i, vf in enumerate(valid_voices):
        vname = os.path.splitext(os.path.basename(vf))[0]
        print(f"\n  Voice: {vname}")

        try:
            result = engine.generate(
                text=en_text,
                speaker_wav=vf,
                language="en",
                mode="flash",
                output_filename=f"day5_voice_{vname}_en.wav"
            )
            print(f"  SUCCESS: {result['duration']}s | File: output/day5_voice_{vname}_en.wav")
        except Exception as e:
            print(f"  FAILED: {e}")

    # ========================================
    # TEST 3: Cross-language (same voice)
    # ========================================
    print(f"\n\n[TEST 3] Cross-Language Test (Same Voice)")
    print("-" * 50)

    primary = valid_voices[0]
    vname = os.path.splitext(os.path.basename(primary))[0]
    print(f"  Using voice: {vname}")

    cross_tests = [
        {"lang": "en", "text": "Hello, welcome to VOXAR Studio. This is English.",
         "file": f"day5_cross_{vname}_en.wav"},
        {"lang": "hi",
         "text": "नमस्ते, वोक्सार स्टूडियो में आपका स्वागत है। यह हिंदी है।",
         "file": f"day5_cross_{vname}_hi.wav"},
        {"lang": "es", "text": "Hola, bienvenido a VOXAR Studio. Esto es espanol.",
         "file": f"day5_cross_{vname}_es.wav"},
        {"lang": "fr", "text": "Bonjour, bienvenue au VOXAR Studio. C'est francais.",
         "file": f"day5_cross_{vname}_fr.wav"},
    ]

    for test in cross_tests:
        lang_name = engine.LANGUAGE_NAMES.get(test['lang'], test['lang'])
        print(f"\n  [{test['lang']}] {lang_name}")

        try:
            result = engine.generate(
                text=test["text"],
                speaker_wav=primary,
                language=test["lang"],
                mode="flash",
                output_filename=test["file"]
            )
            print(f"  SUCCESS: {result['duration']}s")
        except Exception as e:
            print(f"  FAILED: {e}")

    # ========================================
    # TEST 4: Multiple reference files
    # ========================================
    if len(valid_voices) >= 2:
        print(f"\n\n[TEST 4] Multiple Reference Files")
        print("-" * 50)

        multi_refs = valid_voices[:3]
        print(f"  Using {len(multi_refs)} references together")

        try:
            result = engine.generate(
                text=en_text,
                speaker_wav=multi_refs,
                language="en",
                mode="cinematic",
                output_filename="day5_multi_ref.wav"
            )
            print(f"  SUCCESS: {result['duration']}s")
        except Exception as e:
            print(f"  FAILED: {e}")
    else:
        print(f"\n  Skipping multi-ref test (need 2+ voice files)")
        print(f"  TIP: Add more voice samples to voices/references/")

    print("\n" + "=" * 60)
    print("  DAY 5 COMPLETE")
    print("=" * 60)
    print("\n  CHECK:")
    print("    - Does each voice sound different?")
    print("    - Is the same voice consistent across languages?")
    print("    - Does English voice sound like your reference?")
    print("    - Does Hindi voice maintain the same character?")
    print()


if __name__ == "__main__":
    main()