"""
VOXAR Phase 1 - Day 6: Mode Comparison Test
Compares Flash vs Cinematic vs Longform vs Multilingual
Side-by-side quality comparison.
"""

import sys
import os
import json
import time

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 60)
    print("  VOXAR ENGINE - DAY 6: MODE COMPARISON TEST")
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
        print("  ERROR: No voice reference!")
        return

    print(f"\n  Voice reference: {found_ref}")
    print("  Loading engine...")

    from engine.tts_engine import VoxarTTSEngine
    engine = VoxarTTSEngine()
    engine.list_modes()

    os.makedirs("output", exist_ok=True)
    modes = list(engine.configs.keys())

    # ========================================
    # TEST 1: English — All Modes
    # ========================================
    print("\n[TEST 1] English Script — All Modes")
    print("-" * 50)

    en_text = (
        "Ladies and gentlemen, welcome to the future of voice technology. "
        "VOXAR is proud to present our next generation AI voice engine. "
        "What you are hearing is not a human voice. "
        "It is pure artificial intelligence. "
        "Every word, every pause, every breath has been synthesized."
    )
    print(f"  Text: {len(en_text)} chars")

    en_results = []
    for mode in modes:
        print(f"\n  Mode: {mode.upper()}")
        try:
            result = engine.generate(
                text=en_text,
                speaker_wav=found_ref,
                language="en",
                mode=mode,
                output_filename=f"day6_en_{mode}.wav"
            )
            print(f"  SUCCESS: {result['duration']}s | {result['generation_time']}s gen")
            en_results.append({"mode": mode, "status": "SUCCESS",
                             "duration": result["duration"],
                             "gen_time": result["generation_time"]})
        except Exception as e:
            print(f"  FAILED: {e}")
            en_results.append({"mode": mode, "status": "FAILED"})

    # ========================================
    # TEST 2: Hindi Devanagari — All Modes
    # ========================================
    print(f"\n\n[TEST 2] Hindi Script (Devanagari) — All Modes")
    print("-" * 50)

    hi_text = (
        "नमस्कार, वोक्सार स्टूडियो में आपका स्वागत है। "
        "यह आवाज आर्टिफिशियल इंटेलिजेंस द्वारा बनाई गई है। "
        "हमारे एडवांस्ड ए आई मॉडल हर शब्द को बिल्कुल नैचुरल तरीके से बोलते हैं। "
        "आप हिंदी, अंग्रेजी और बहुत सारी भाषाओं में वॉइसओवर बना सकते हैं।"
    )
    print(f"  Text: {len(hi_text)} chars")

    hi_results = []
    for mode in modes:
        print(f"\n  Mode: {mode.upper()}")
        try:
            result = engine.generate(
                text=hi_text,
                speaker_wav=found_ref,
                language="hi",
                mode=mode,
                output_filename=f"day6_hi_{mode}.wav"
            )
            print(f"  SUCCESS: {result['duration']}s | {result['generation_time']}s gen")
            hi_results.append({"mode": mode, "status": "SUCCESS",
                             "duration": result["duration"],
                             "gen_time": result["generation_time"]})
        except Exception as e:
            print(f"  FAILED: {e}")
            hi_results.append({"mode": mode, "status": "FAILED"})

    # ========================================
    # TEST 3: Speed Variations
    # ========================================
    print(f"\n\n[TEST 3] Speed Variations (English, Flash Mode)")
    print("-" * 50)

    speed_text = "VOXAR delivers premium AI voice technology for content creators across India."
    speeds = [0.8, 0.9, 1.0, 1.1, 1.2]

    for spd in speeds:
        print(f"\n  Speed: {spd}x")
        try:
            result = engine.generate(
                text=speed_text,
                speaker_wav=found_ref,
                language="en",
                mode="flash",
                speed=spd,
                output_filename=f"day6_speed_{spd}.wav"
            )
            print(f"  SUCCESS: {result['duration']}s")
        except Exception as e:
            print(f"  FAILED: {e}")

    # ========================================
    # COMPARISON REPORT
    # ========================================
    print("\n" + "=" * 60)
    print("  MODE COMPARISON REPORT")
    print("=" * 60)

    print(f"\n  ENGLISH:")
    print(f"  {'Mode':<15} {'Duration':<10} {'Gen Time':<12} {'Status'}")
    print(f"  {'─'*47}")
    for r in en_results:
        if r["status"] == "SUCCESS":
            print(f"  {r['mode']:<15} {r['duration']:<10.1f} {r['gen_time']:<12.1f} PASS")
        else:
            print(f"  {r['mode']:<15} {'—':<10} {'—':<12} FAIL")

    print(f"\n  HINDI:")
    print(f"  {'Mode':<15} {'Duration':<10} {'Gen Time':<12} {'Status'}")
    print(f"  {'─'*47}")
    for r in hi_results:
        if r["status"] == "SUCCESS":
            print(f"  {r['mode']:<15} {r['duration']:<10.1f} {r['gen_time']:<12.1f} PASS")
        else:
            print(f"  {r['mode']:<15} {'—':<10} {'—':<12} FAIL")

    # Save report
    os.makedirs("docs", exist_ok=True)
    all_results = {
        "english": en_results,
        "hindi": hi_results,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open("docs/day6_mode_report.json", 'w') as f:
        json.dump(all_results, f, indent=2)

    print(f"\n  Report saved: docs/day6_mode_report.json")

    print(f"\n  LISTEN AND COMPARE:")
    print(f"  English:")
    for mode in modes:
        print(f"    output/day6_en_{mode}.wav")
    print(f"  Hindi:")
    for mode in modes:
        print(f"    output/day6_hi_{mode}.wav")
    print(f"  Speed:")
    for spd in speeds:
        print(f"    output/day6_speed_{spd}.wav")

    print(f"\n  RATE EACH MODE 1-10 FOR:")
    print(f"    - Naturalness")
    print(f"    - Clarity")
    print(f"    - Emotion/Expression")
    print(f"    - Best use case")
    print()


if __name__ == "__main__":
    main()