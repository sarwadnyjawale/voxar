"""
VOXAR - Quick Marathi Devanagari Test
Tests if Marathi works with Devanagari script + lang="hi"
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 60)
    print("  VOXAR - MARATHI DEVANAGARI TEST")
    print("=" * 60)

    ref_dir = "voices/references"
    found_ref = None
    if os.path.exists(ref_dir):
        for f in os.listdir(ref_dir):
            full = os.path.join(ref_dir, f)
            if os.path.isfile(full):
                found_ref = full
                break

    if not found_ref:
        print("  ERROR: No voice reference found!")
        return

    print(f"\n  Voice reference: {found_ref}")
    print("\n  Loading engine...")

    from engine.tts_engine import VoxarTTSEngine
    engine = VoxarTTSEngine()

    os.makedirs("output", exist_ok=True)

    tests = [
        {
            "name": "Marathi Devanagari + lang=hi",
            "text": "नमस्कार, वोक्सार स्टूडियो मध्ये आपले स्वागत आहे।",
            "lang": "hi",
            "file": "marathi_devanagari_hi.wav"
        },
        {
            "name": "Marathi Devanagari paragraph + lang=hi",
            "text": (
                "वोक्सार एक प्रीमियम ए आय व्हॉइस टेक्नॉलॉजी कंपनी आहे। "
                "आम्ही कंटेंट क्रिएटर्सना सर्वोत्तम आवाज प्रदान करतो। "
                "आमच्या प्लॅटफॉर्मवर तुम्हाला अनेक भारतीय भाषांमध्ये आवाज मिळतात।"
            ),
            "lang": "hi",
            "file": "marathi_devanagari_para_hi.wav"
        },
        {
            "name": "Marathi Romanized + lang=en (compare)",
            "text": "Namaskar, VOXAR Studio madhye aapla swagat aahe.",
            "lang": "en",
            "file": "marathi_romanized_en.wav"
        },
    ]

    for test in tests:
        print(f"\n  --- {test['name']} ---")
        print(f"  Text: {test['text'][:60]}...")
        print(f"  Lang: {test['lang']}")

        try:
            result = engine.generate(
                text=test["text"],
                speaker_wav=found_ref,
                language=test["lang"],
                mode="flash",
                output_filename=test["file"]
            )
            print(f"  SUCCESS: {result['duration']}s in {result['generation_time']}s")
            print(f"  File: output/{test['file']}")
        except Exception as e:
            print(f"  FAILED: {e}")

    print("\n" + "=" * 60)
    print("  COMPARE THESE FILES:")
    print("  1. output/marathi_devanagari_hi.wav    (Devanagari + hi)")
    print("  2. output/marathi_devanagari_para_hi.wav (paragraph)")
    print("  3. output/marathi_romanized_en.wav     (Romanized + en)")
    print("  WHICH SOUNDS BEST?")
    print("=" * 60)


if __name__ == "__main__":
    main()