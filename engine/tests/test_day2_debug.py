"""
VOXAR Phase 1 — Day 2 Debug: Hindi & Workaround Test
Run: python -m engine.tests.test_day2_debug
"""

import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from engine.tts_engine import VoxarTTSEngine

def main():
    print("=" * 60)
    print("  VOXAR ENGINE — DAY 2 DEBUG TEST")
    print("=" * 60)
    
    ref_path = "voices/references/sample.wav"
    if not os.path.exists(ref_path):
        print(f"\n❌ Voice reference not found: {ref_path}")
        return

    print("\nLoading engine...")
    engine = VoxarTTSEngine()
    
    os.makedirs("output/day2_debug", exist_ok=True)

    tests = [
        {
            "name": "Hindi (Devanagari Script)",
            "text": "VOXAR Studio mein aapka swagat hai. Yeh ek test hai.",
            "lang": "hi"
        },
        {
            "name": "Hindi (Roman/Hinglish Script)",
            "text": "VOXAR Studio mein aapka swagat hai. Yeh ek test hai.",
            "lang": "en"  # Testing if English mode handles Romanized Hindi better
        },
        {
            "name": "Tamil Workaround (Romanized + 'hi' base)",
            "text": "Vanakkam. VOXAR Studio-vukku ungalai varaverkirom.",
            "lang": "hi"
        },
        {
            "name": "Telugu Workaround (Romanized + 'hi' base)",
            "text": "Namaskaram. VOXAR Studio ki swagatam.",
            "lang": "hi"
        }
    ]

    for test in tests:
        print(f"\n{'-'*50}")
        print(f"  TESTING: {test['name']}")
        print(f"  Text: {test['text']}")
        print(f"  Base Language Used: {test['lang']}")
        
        try:
            start_time = time.time()
            result = engine.generate(
                text=test['text'],
                speaker_wav=ref_path,
                language=test['lang'],
                mode="flash",
                output_filename=f"day2_debug_{test['name'].split()[0].lower()}.wav"
            )
            print(f"  ✅ SUCCESS in {round(time.time() - start_time, 2)}s")
            print(f"  📁 Saved to: {result['output_path']}")
        except Exception as e:
            print(f"  ❌ FAILED: {e}")

    print("\n" + "=" * 60)
    print("  DEBUG TEST COMPLETE")
    print("=" * 60)
    print("\n  🎧 Listen to the output in output/day2_debug/")
    print("  Determine if the Hindi/Romanization workaround sounds natural enough.")

if __name__ == "__main__":
    main()