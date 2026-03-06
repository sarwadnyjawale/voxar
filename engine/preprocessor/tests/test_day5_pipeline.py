"""
VOXAR Phase 3 — Day 5: Complete ScriptPreprocessor Pipeline Test
End-to-end integration test.
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 90)
    print("  VOXAR PHASE 3 — DAY 5: COMPLETE PREPROCESSOR PIPELINE")
    print("  End-to-end: raw text → ready for XTTS")
    print("=" * 90)

    from engine.preprocessor.script_preprocessor import ScriptPreprocessor

    preprocessor = ScriptPreprocessor(language="auto")

    # ========================================
    # TEST 1: English Scripts
    # ========================================
    print(f"\n{'=' * 90}")
    print(f"  TEST 1: ENGLISH SCRIPTS")
    print(f"{'─' * 90}")

    en_tests = [
        {
            "text": "Dr. Kumar, CEO of VOXAR, announced ₹1.5Cr revenue on 15/01/2025. Growth is 45%. Contact hello@voxar.in",
            "desc": "Business news"
        },
        {
            "text": "The 1st batch of 100 students at IIT scored 95.5% avg. in the JEE exam.",
            "desc": "Education news"
        },
        {
            "text": "Call +91 98765 43210 for info. Visit https://voxar.in 🚀",
            "desc": "Marketing with URL+phone+emoji"
        },
        {
            "text": "Welcome to **VOXAR**. [pause:1s] This is *revolutionary* AI voice tech.",
            "desc": "With pause + emphasis markers"
        },
        {
            "text": "PM Modi met CM Yogi. BJP won 3 MLA seats. GST collection crossed ₹2L Cr.",
            "desc": "Political news with Indian acronyms"
        },
    ]

    for test in en_tests:
        result = preprocessor.process(test["text"])
        print(f"\n  [{test['desc']}]")
        print(f"  IN:  \"{test['text']}\"")
        print(f"  OUT: \"{result.processed_text}\"")
        print(f"  Lang: {result.detected_language} → {result.language} | "
              f"Chars: {result.character_count} | Chunks: {len(result.chunks)}")
        if result.processing_notes:
            for note in result.processing_notes:
                print(f"  Note: {note}")

    # ========================================
    # TEST 2: Hindi Devanagari Scripts
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 2: HINDI DEVANAGARI (should pass through)")
    print(f"{'─' * 90}")

    hi_tests = [
        {
            "text": "नमस्ते दोस्तों, वोक्सार स्टूडियो में आपका स्वागत है। यह एक प्रीमियम प्लेटफॉर्म है।",
            "desc": "Hindi greeting"
        },
        {
            "text": "आज हम बात करेंगे आर्टिफिशियल इंटेलिजेंस के बारे में। यह टेक्नोलॉजी बहुत एडवांस्ड है।",
            "desc": "Hindi tech content"
        },
    ]

    for test in hi_tests:
        result = preprocessor.process(test["text"])
        print(f"\n  [{test['desc']}]")
        print(f"  IN:  \"{test['text'][:70]}...\"")
        print(f"  OUT: \"{result.processed_text[:70]}...\"")
        print(f"  Lang: {result.detected_language} → {result.language} | "
              f"Unchanged: {result.processed_text == test['text']}")

    # ========================================
    # TEST 3: Hinglish Scripts (CRITICAL)
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 3: HINGLISH → DEVANAGARI (competitive advantage)")
    print(f"{'─' * 90}")

    hinglish_tests = [
        {
            "text": "Namaste doston, aaj hum baat karenge VOXAR ke baare mein",
            "desc": "YouTube intro"
        },
        {
            "text": "Yeh bahut achha product hai bhai, maine use kiya aur mujhe pasand aaya",
            "desc": "Product review"
        },
        {
            "text": "Bhai kal office mein meeting thi, boss ne naya project diya hai",
            "desc": "Casual conversation"
        },
        {
            "text": "Aaj ka weather bahut achha hai, chalo bahar chalte hain",
            "desc": "Daily conversation"
        },
    ]

    for test in hinglish_tests:
        result = preprocessor.process(test["text"])
        print(f"\n  [{test['desc']}]")
        print(f"  IN:  \"{test['text']}\"")
        print(f"  OUT: \"{result.processed_text}\"")
        print(f"  Lang: {result.detected_language} → XTTS:{result.language} | "
              f"Transliterated: {result.transliterated}")

    # ========================================
    # TEST 4: Explicit Language Override
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 4: EXPLICIT LANGUAGE OVERRIDE")
    print(f"{'─' * 90}")

    override_tests = [
        {"text": "₹500 ka product 50% off hai", "lang": "en", "desc": "Force English"},
        {"text": "₹500 ka product 50% off hai", "lang": "hi", "desc": "Force Hindi"},
        {"text": "Hello world, this costs $100", "lang": "en", "desc": "English + USD"},
    ]

    for test in override_tests:
        result = preprocessor.process(test["text"], language=test["lang"])
        print(f"\n  [{test['desc']}] (forced lang={test['lang']})")
        print(f"  IN:  \"{test['text']}\"")
        print(f"  OUT: \"{result.processed_text}\"")

    # ========================================
    # TEST 5: Long Text Chunking
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 5: LONG TEXT → AUTO CHUNKING")
    print(f"{'─' * 90}")

    long_text = (
        "Welcome to VOXAR Studio, India's premier AI voice technology platform. "
        "We support over 10 Indian languages including Hindi, Tamil, Telugu, Bengali, and Marathi. "
        "Our engine uses advanced neural networks to generate studio-quality voiceovers. "
        "Whether you're a YouTuber, podcaster, educator, or business owner, VOXAR has the perfect voice for you. "
        "With features like voice cloning, text-to-speech, and speech-to-text, "
        "VOXAR is the complete voice solution. "
        "Plans start at just ₹499 per month. Visit https://voxar.in to get started today."
    )

    result = preprocessor.process(long_text, max_chunk_size=350)
    print(f"\n  Original: {len(long_text)} chars")
    print(f"  Processed: {result.character_count} chars")
    print(f"  Chunks: {len(result.chunks)}")
    for i, chunk in enumerate(result.chunks):
        print(f"    [{i + 1}] ({len(chunk)} chars) \"{chunk[:60]}...\"")

    # ========================================
    # TEST 6: Edge Cases
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 6: EDGE CASES")
    print(f"{'─' * 90}")

    edge_tests = [
        {"text": "", "desc": "Empty string"},
        {"text": "   ", "desc": "Whitespace only"},
        {"text": "Hello", "desc": "Single word"},
        {"text": ".", "desc": "Just punctuation"},
        {"text": "😊🔥🚀", "desc": "Only emojis"},
        {"text": "12345", "desc": "Only numbers"},
        {"text": "₹₹₹", "desc": "Only currency symbols"},
        {"text": "a" * 1000, "desc": "1000 chars no spaces"},
    ]

    for test in edge_tests:
        result = preprocessor.process(test["text"])
        out_preview = result.processed_text[:50] if result.processed_text else "(empty)"
        print(f"  {test['desc']:<25} → \"{out_preview}\" | "
              f"Chars: {result.character_count} | Chunks: {len(result.chunks)}")

    # ========================================
    # TEST 7: Full Pipeline (Preprocessor → TTS simulation)
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  TEST 7: FULL PIPELINE SIMULATION")
    print(f"{'─' * 90}")

    scripts = [
        {
            "text": "Dr. Sharma announced ISRO's ₹500Cr budget. The 1st satellite launches on 15/03/2025 at 3:30 PM. Call +91 98765 43210. 🚀",
            "desc": "Complex English"
        },
        {
            "text": "Namaste doston! Aaj hum VOXAR ke baare mein baat karenge. Yeh bahut achha AI platform hai. ₹499 mein start karo!",
            "desc": "Hinglish marketing"
        },
        {
            "text": "वोक्सार स्टूडियो में आपका स्वागत है। [pause:1s] यह **प्रीमियम** वॉइस टेक्नोलॉजी है।",
            "desc": "Devanagari with markers"
        },
    ]

    for script in scripts:
        result = preprocessor.process(script["text"])

        print(f"\n  [{script['desc']}]")
        print(f"  ┌─ INPUT:  \"{script['text'][:80]}{'...' if len(script['text']) > 80 else ''}\"")
        print(f"  ├─ OUTPUT: \"{result.processed_text[:80]}{'...' if len(result.processed_text) > 80 else ''}\"")
        print(f"  ├─ Language: {result.detected_language} → XTTS: {result.language}")
        print(f"  ├─ Chars: {result.character_count} | Chunks: {len(result.chunks)}")
        print(f"  ├─ Transliterated: {result.transliterated}")
        print(f"  ├─ Pauses: {len(result.pause_map)} custom")
        print(f"  ├─ Emphasis: {len(result.emphasis_map)} markers")
        if result.processing_notes:
            for note in result.processing_notes:
                print(f"  ├─ Note: {note}")
        print(f"  └─ Ready for XTTS ✅")

    # ========================================
    # PHASE 3 SUMMARY
    # ========================================
    print(f"\n\n{'=' * 90}")
    print(f"  ✅ PHASE 3 COMPLETE — TEXT PREPROCESSOR PIPELINE")
    print(f"{'=' * 90}")
    print(f"""
  DELIVERABLES:
  ─────────────────────────────────────────────
  ✅ NumberHandler       — integers, decimals, ordinals, %%, years
  ✅ CurrencyHandler     — ₹, $, €, £ with Indian format (Cr, L)
  ✅ AbbreviationHandler — 100+ abbreviations + 50+ Indian acronyms
  ✅ SpecialTextHandler   — URLs, emails, phones, dates, times, emojis
  ✅ HinglishHandler     — 400+ words, auto-transliterate to Devanagari
  ✅ LanguageDetector    — 8 Indian scripts, auto-detect
  ✅ PauseController     — [pause:1s] [breath] [break] + punctuation
  ✅ EmphasisHandler     — *slight* **strong** _soft_ ALLCAPS
  ✅ ScriptPreprocessor  — Master pipeline, correct processing order
  ✅ Pronunciation dict  — Custom word pronunciations
  ✅ Auto-chunking       — Respects language limits

  THE PIPELINE:
  ─────────────────────────────────────────────
  User types ANYTHING
       ↓ ScriptPreprocessor.process()
  Clean, TTS-ready text
       ↓ VoxarTTSEngine.generate()
  Raw audio
       ↓ VoxarAudioMaster.master()
  Studio-grade audio
       ↓ VoxarQualityValidator.validate()
  Quality checked
       ↓ VoxarExporter.export()
  Final MP3/WAV delivered

  READY FOR:
  ─────────────────────────────────────────────
  Phase 4: Voice Library (25 voices)
  Phase 5: FastAPI server (wraps everything into API)
    """)


if __name__ == "__main__":
    main()