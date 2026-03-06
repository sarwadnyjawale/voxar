"""
VOXAR Phase 1 - Day 2: Multi-Language Test (with Hindi fix)
"""

import sys
import os
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


TEST_SCRIPTS = {
    "en": {
        "short": "Welcome to VOXAR Studio.",
        "medium": (
            "Welcome to VOXAR Studio. We are building the most advanced "
            "AI voice technology platform in India. Our voices sound natural, "
            "clear, and professional."
        ),
    },
    "hi": {
        "short": "वोक्सर स्टूडियो में आपका स्वागत है।",
        "medium": (
            "वोक्सर स्टूडियो में आपका स्वागत है। हम भारत का सबसे एडवांस्ड "
            "AI वॉइस टेक्नोलॉजी प्लेटफॉर्म बना रहे हैं। हमारी आवाज़ें "
            "बिल्कुल असली लगती हैं।"
        ),
        "long": (
            "वोक्सर एक प्रीमियम AI वॉइस टेक्नोलॉजी कंपनी है। हम कंटेंट "
            "क्रिएटर्स को सबसे बेहतरीन आवाज़ प्रदान करते हैं। हमारे "
            "प्लेटफॉर्म पर आपको हिंदी, तमिल, तेलुगु, बंगाली और मराठी "
            "जैसी कई भारतीय भाषाओं में आवाज़ें मिलती हैं। चाहे आपको "
            "पॉडकास्ट के लिए नैरेटर चाहिए या एडवरटाइजमेंट के लिए एक "
            "एनर्जेटिक आवाज़, वोक्सर के पास हर ज़रूरत के लिए आवाज़ है।"
        ),
    },
    "ta": {
        "short": "Vanakkam, VOXAR Studio-ku varavergiren.",
    },
    "te": {
        "short": "Namaskaram, VOXAR Studio ki swaagatham.",
    },
    "bn": {
        "short": "Namaskar, VOXAR Studio te apnake swagotom.",
    },
    "mr": {
        "short": "Namaskar, VOXAR Studio madhye aapla swagat aahe.",
    },
}


def main():
    print("=" * 60)
    print("  VOXAR ENGINE - DAY 2: MULTI-LANGUAGE TEST")
    print("  (Hindi basic call fix + unsupported language fallback)")
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
        return

    ref_path = found_ref
    print(f"\n  Voice reference: {ref_path}")

    print("\n  Loading engine...")
    from engine.tts_engine import VoxarTTSEngine
    engine = VoxarTTSEngine()

    # Show language info
    engine.list_languages()

    os.makedirs("output", exist_ok=True)
    results = []

    for lang_code, scripts in TEST_SCRIPTS.items():
        lang_name = engine.LANGUAGE_NAMES.get(lang_code, lang_code)
        lang_info = engine.get_language_info(lang_code)

        routing = f"engine={lang_info.get('engine', '?')}"
        if lang_info.get('basic_call'):
            routing += " (basic call, no advanced params)"
        if lang_info.get('actual_code') != lang_code:
            routing += f" (routed to '{lang_info.get('actual_code')}')"

        print(f"\n{'_' * 60}")
        print(f"  TESTING: {lang_name} [{lang_code}] -- {routing}")
        print(f"{'_' * 60}")

        for script_type, text in scripts.items():
            print(f"\n  [{script_type.upper()}] {len(text)} chars")
            preview = text[:70] + "..." if len(text) > 70 else text
            print(f"  Text: \"{preview}\"")

            try:
                result = engine.generate(
                    text=text,
                    speaker_wav=ref_path,
                    language=lang_code,
                    mode="flash",
                    output_filename=f"day2_{lang_code}_{script_type}.wav"
                )

                test_result = {
                    "language": lang_code,
                    "language_name": lang_name,
                    "script_type": script_type,
                    "characters": len(text),
                    "duration": result["duration"],
                    "generation_time": result["generation_time"],
                    "output_path": result["output_path"],
                    "engine_used": result.get("engine_used", "xtts"),
                    "actual_language": result.get("actual_engine_language", lang_code),
                    "used_basic_call": result.get("used_basic_call", False),
                    "status": "SUCCESS",
                }
                results.append(test_result)

                print(f"  SUCCESS: {result['duration']}s in {result['generation_time']}s")
                print(f"  File: {result['output_path']}")
                if result.get("language_notes"):
                    for note in result["language_notes"]:
                        print(f"  NOTE: {note}")

            except Exception as e:
                print(f"  FAILED: {e}")
                results.append({
                    "language": lang_code, "language_name": lang_name,
                    "script_type": script_type, "characters": len(text),
                    "status": "FAILED", "error": str(e)
                })

    # ========== REPORT ==========
    print("\n" + "=" * 60)
    print("  LANGUAGE TEST REPORT")
    print("=" * 60)

    success = sum(1 for r in results if r["status"] == "SUCCESS")
    failed = sum(1 for r in results if r["status"] == "FAILED")

    print(f"\n  Total Tests: {len(results)}")
    print(f"  Passed: {success}")
    print(f"  Failed: {failed}")

    print(f"\n  Results by language:")
    for lang_code in TEST_SCRIPTS.keys():
        lang_results = [r for r in results if r["language"] == lang_code]
        lang_success = sum(1 for r in lang_results if r["status"] == "SUCCESS")
        lang_name = engine.LANGUAGE_NAMES.get(lang_code, lang_code)
        total = len(lang_results)
        status = "PASS" if lang_success == total else ("PARTIAL" if lang_success > 0 else "FAIL")
        print(f"    {status}: {lang_name} [{lang_code}] - {lang_success}/{total}")

    os.makedirs("docs", exist_ok=True)
    report_path = "docs/day2_language_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n  Report saved: {report_path}")

    print(f"\n  LISTEN TO FILES:")
    for lang_code in TEST_SCRIPTS.keys():
        for st in TEST_SCRIPTS[lang_code].keys():
            fname = f"output/day2_{lang_code}_{st}.wav"
            exists = "exists" if os.path.exists(fname) else "MISSING"
            print(f"    {fname} ({exists})")

    print(f"\n  CHECK: Does Hindi sound natural?")
    print(f"  CHECK: Do Tamil/Telugu/Bengali/Marathi sound acceptable?")
    print()


if __name__ == "__main__":
    main()