"""
VOXAR Phase 1 - Day 3: Stress Test
Finds the BREAKING POINT of your RTX 4060.
Tests progressively longer text to find max safe length.
"""

import sys
import os
import json
import time

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def generate_test_text(char_count):
    """Generate English test text of approximate length."""
    base = (
        "VOXAR is building premium AI voice technology. "
        "Our platform supports multiple languages and voice styles. "
        "Content creators can generate studio quality voiceovers. "
        "The engine uses advanced neural network models for synthesis. "
        "Every output goes through professional audio mastering. "
    )
    text = ""
    while len(text) < char_count:
        text += base
    return text[:char_count]


def generate_hindi_test_text(char_count):
    """Generate Hindi Devanagari test text of approximate length."""
    base = (
        "वोक्सार प्रीमियम ए आई वॉइस टेक्नोलॉजी बना रहा है। "
        "हमारा प्लेटफॉर्म कई भाषाओं और आवाज शैलियों को सपोर्ट करता है। "
        "कंटेंट क्रिएटर्स स्टूडियो क्वालिटी वॉइसओवर बना सकते हैं। "
        "इंजन एडवांस्ड न्यूरल नेटवर्क मॉडल का उपयोग करता है। "
        "हर आउटपुट प्रोफेशनल ऑडियो मास्टरिंग से गुजरता है। "
    )
    text = ""
    while len(text) < char_count:
        text += base
    return text[:char_count]


def main():
    print("=" * 60)
    print("  VOXAR ENGINE - DAY 3: STRESS TEST")
    print("  Finding the breaking point of RTX 4060")
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

    # ========================================
    # ENGLISH STRESS TEST
    # ========================================
    print("\n" + "=" * 60)
    print("  ENGLISH STRESS TEST")
    print("=" * 60)

    test_lengths = [50, 100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000]
    en_results = []

    for char_count in test_lengths:
        text = generate_test_text(char_count)
        actual_chars = len(text)

        print(f"\n  Testing {actual_chars} characters...")

        gpu_before = engine.get_gpu_info()

        try:
            start = time.time()
            result = engine.generate(
                text=text,
                speaker_wav=found_ref,
                language="en",
                mode="flash",
                output_filename=f"stress_en_{actual_chars}.wav"
            )
            total_time = time.time() - start
            gpu_after = engine.get_gpu_info()

            test_result = {
                "characters": actual_chars,
                "duration": result["duration"],
                "generation_time": result["generation_time"],
                "total_time": round(total_time, 2),
                "chunks_used": result["chunks_used"],
                "file_size_kb": result["file_size_kb"],
                "vram_used_gb": gpu_after["vram_used_gb"],
                "chars_per_second": round(actual_chars / max(result["generation_time"], 0.1), 1),
                "status": "SUCCESS"
            }
            en_results.append(test_result)

            print(f"  SUCCESS: {result['duration']}s audio | "
                  f"{result['generation_time']}s gen | "
                  f"{result['chunks_used']} chunks | "
                  f"VRAM: {gpu_after['vram_used_gb']}GB")

        except RuntimeError as e:
            if "out of memory" in str(e).lower():
                print(f"  GPU OUT OF MEMORY at {actual_chars} chars!")
                en_results.append({
                    "characters": actual_chars,
                    "status": "OOM"
                })
                print(f"\n  BREAKING POINT: {actual_chars} characters")
                break
            else:
                print(f"  FAILED: {e}")
                en_results.append({
                    "characters": actual_chars,
                    "status": "FAILED",
                    "error": str(e)
                })
        except Exception as e:
            print(f"  FAILED: {e}")
            en_results.append({
                "characters": actual_chars,
                "status": "FAILED",
                "error": str(e)
            })

    # ========================================
    # HINDI STRESS TEST (Devanagari)
    # ========================================
    print("\n" + "=" * 60)
    print("  HINDI STRESS TEST (Devanagari)")
    print("=" * 60)

    hindi_lengths = [50, 100, 250, 500, 1000, 2000]
    hi_results = []

    for char_count in hindi_lengths:
        text = generate_hindi_test_text(char_count)
        actual_chars = len(text)

        print(f"\n  Testing {actual_chars} Hindi characters...")

        try:
            result = engine.generate(
                text=text,
                speaker_wav=found_ref,
                language="hi",
                mode="flash",
                output_filename=f"stress_hi_{actual_chars}.wav"
            )

            test_result = {
                "characters": actual_chars,
                "duration": result["duration"],
                "generation_time": result["generation_time"],
                "chunks_used": result["chunks_used"],
                "status": "SUCCESS"
            }
            hi_results.append(test_result)

            print(f"  SUCCESS: {result['duration']}s audio | "
                  f"{result['generation_time']}s gen | "
                  f"{result['chunks_used']} chunks")

        except Exception as e:
            print(f"  FAILED: {e}")
            hi_results.append({
                "characters": actual_chars,
                "status": "FAILED",
                "error": str(e)
            })

    # ========================================
    # REPORT
    # ========================================
    print("\n" + "=" * 60)
    print("  STRESS TEST REPORT")
    print("=" * 60)

    en_success = [r for r in en_results if r["status"] == "SUCCESS"]
    hi_success = [r for r in hi_results if r["status"] == "SUCCESS"]

    if en_success:
        max_en = max(r["characters"] for r in en_success)
        avg_speed = sum(r["chars_per_second"] for r in en_success) / len(en_success)
        print(f"\n  ENGLISH:")
        print(f"    Max safe length: {max_en} characters")
        print(f"    Avg speed: {avg_speed:.1f} chars/second")
        print(f"    Tests passed: {len(en_success)}/{len(en_results)}")

        print(f"\n    {'Chars':<8} {'Audio':<8} {'GenTime':<10} {'Chunks':<8} {'Speed':<10}")
        print(f"    {'─'*44}")
        for r in en_success:
            print(f"    {r['characters']:<8} {r['duration']:<8.1f} "
                  f"{r['generation_time']:<10.1f} {r['chunks_used']:<8} "
                  f"{r['chars_per_second']:<10.1f}")

    if hi_success:
        max_hi = max(r["characters"] for r in hi_success)
        print(f"\n  HINDI:")
        print(f"    Max safe length: {max_hi} characters")
        print(f"    Tests passed: {len(hi_success)}/{len(hi_results)}")

        print(f"\n    {'Chars':<8} {'Audio':<8} {'GenTime':<10} {'Chunks':<8}")
        print(f"    {'─'*34}")
        for r in hi_success:
            print(f"    {r['characters']:<8} {r['duration']:<8.1f} "
                  f"{r['generation_time']:<10.1f} {r['chunks_used']:<8}")

    # Save report
    all_results = {
        "english": en_results,
        "hindi": hi_results,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    os.makedirs("docs", exist_ok=True)
    with open("docs/day3_stress_report.json", 'w') as f:
        json.dump(all_results, f, indent=2)
    print(f"\n  Report saved: docs/day3_stress_report.json")
    print()


if __name__ == "__main__":
    main()