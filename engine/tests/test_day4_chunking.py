"""
VOXAR Phase 1 - Day 4: Chunking Test
Tests the text chunking + audio concatenation quality.
"""

import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)


def main():
    print("=" * 60)
    print("  VOXAR ENGINE - DAY 4: CHUNKING TEST")
    print("=" * 60)

    # ========================================
    # PART A: Test Chunker Logic (No GPU needed)
    # ========================================
    print("\n[PART A] Text Chunker Logic Tests")
    print("-" * 50)

    from engine.text_chunker import TextChunker

    chunker = TextChunker(max_chunk_size=350)

    test_cases = [
        {
            "name": "Short (no split)",
            "text": "Hello, welcome to VOXAR Studio."
        },
        {
            "name": "Exactly at limit",
            "text": "A" * 350
        },
        {
            "name": "Long paragraph",
            "text": (
                "VOXAR is revolutionizing voice technology in India. "
                "Our platform supports over twenty languages with special focus on Indian languages. "
                "Content creators can generate studio quality voiceovers in seconds. "
                "Whether you need narration for YouTube videos, voiceovers for advertisements, "
                "or audio for e-learning courses, VOXAR delivers professional results. "
                "Our AI models are trained on thousands of hours of high quality speech data. "
                "Every output goes through our proprietary mastering pipeline."
            )
        },
        {
            "name": "Multiple paragraphs",
            "text": (
                "Welcome to VOXAR Studio. This is the first paragraph.\n\n"
                "This is the second paragraph. It talks about voice technology. "
                "AI voices are getting better every day.\n\n"
                "The third paragraph discusses Indian languages."
            )
        },
        {
            "name": "No periods (comma separated)",
            "text": (
                "Welcome to VOXAR, the premium AI voice studio, "
                "where we create amazing voices, in many languages, "
                "for creators all around India, and the world, "
                "using cutting edge technology, and premium audio processing, "
                "to deliver the best quality, that you have ever heard"
            )
        },
        {
            "name": "Hindi Devanagari long text",
            "text": (
                "वोक्सार एक प्रीमियम ए आई वॉइस टेक्नोलॉजी कंपनी है। "
                "हम कंटेंट क्रिएटर्स को सबसे बेहतरीन आवाज प्रदान करते हैं। "
                "हमारे प्लेटफॉर्म पर आपको हिंदी, तमिल, तेलुगु, बंगाली और मराठी "
                "जैसी कई भारतीय भाषाओं में आवाजें मिलती हैं। "
                "चाहे आपको पॉडकास्ट के लिए नैरेटर चाहिए या विज्ञापन के लिए "
                "एक एनर्जेटिक आवाज, वोक्सार के पास हर जरूरत के लिए आवाज है।"
            )
        },
    ]

    for i, test in enumerate(test_cases):
        info = chunker.get_chunk_info(test['text'])
        print(f"\n  Test {i+1}: {test['name']}")
        print(f"    Original: {info['original_length']} chars")
        print(f"    Chunks: {info['num_chunks']}")
        print(f"    Sizes: {info['chunk_sizes']}")
        for j, chunk in enumerate(info['chunks']):
            preview = chunk[:50] + "..." if len(chunk) > 50 else chunk
            print(f"    [{j+1}] ({len(chunk)} chars) \"{preview}\"")

    # ========================================
    # PART B: Chunked Audio Generation
    # ========================================
    print(f"\n\n[PART B] Chunked Audio Generation")
    print("-" * 50)

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

    print(f"  Voice reference: {found_ref}")
    print("  Loading engine...")

    from engine.tts_engine import VoxarTTSEngine
    engine = VoxarTTSEngine()

    os.makedirs("output", exist_ok=True)

    # English long script
    en_long = (
        "Welcome to VOXAR Studio, India's premium AI voice technology platform. "
        "Today we are demonstrating how our engine handles long form content. "
        "Our text to speech system uses advanced neural networks to generate "
        "natural sounding speech in multiple languages. "
        "The voice you are hearing was generated entirely by artificial intelligence. "
        "No human voice actor was involved in creating this output. "
        "VOXAR supports Hindi, Tamil, Telugu, Bengali, Marathi, and many more. "
        "Our goal is to make professional voiceovers accessible to every creator. "
        "Whether you are a YouTuber, podcaster, educator, or business owner, "
        "VOXAR has the perfect voice for your needs. "
        "Thank you for testing our platform."
    )

    # Hindi long script (Devanagari)
    hi_long = (
        "वोक्सार स्टूडियो में आपका स्वागत है। "
        "आज हम आपको दिखाएंगे कि हमारा ए आई वॉइस इंजन कैसे काम करता है। "
        "यह टेक्नोलॉजी बहुत एडवांस्ड है और इससे बहुत सारी भाषाओं में आवाज बनाई जा सकती है। "
        "हिंदी भारत की सबसे ज्यादा बोली जाने वाली भाषा है। "
        "वोक्सार पर आपको हिंदी में कई प्रकार की आवाजें मिलती हैं। "
        "चाहे आपको यूट्यूब वीडियो के लिए वॉइसओवर चाहिए या विज्ञापन के लिए "
        "एक प्रोफेशनल आवाज, वोक्सार आपकी हर जरूरत को पूरा करता है।"
    )

    chunked_tests = [
        {"name": "English Long (Flash)", "text": en_long, "lang": "en",
         "mode": "flash", "file": "day4_en_long_flash.wav"},
        {"name": "English Long (Longform)", "text": en_long, "lang": "en",
         "mode": "longform", "file": "day4_en_long_longform.wav"},
        {"name": "Hindi Long (Flash)", "text": hi_long, "lang": "hi",
         "mode": "flash", "file": "day4_hi_long_flash.wav"},
        {"name": "Hindi Long (Longform)", "text": hi_long, "lang": "hi",
         "mode": "longform", "file": "day4_hi_long_longform.wav"},
    ]

    for test in chunked_tests:
        print(f"\n  --- {test['name']} ---")
        print(f"  Length: {len(test['text'])} chars | Mode: {test['mode']}")

        try:
            result = engine.generate(
                text=test["text"],
                speaker_wav=found_ref,
                language=test["lang"],
                mode=test["mode"],
                output_filename=test["file"]
            )
            print(f"  SUCCESS: {result['duration']}s | "
                  f"{result['chunks_used']} chunks | "
                  f"{result['generation_time']}s gen time")
            print(f"  File: output/{test['file']}")
        except Exception as e:
            print(f"  FAILED: {e}")

    print("\n" + "=" * 60)
    print("  DAY 4 COMPLETE")
    print("=" * 60)
    print("\n  LISTEN AND CHECK:")
    print("    - Are transitions between chunks smooth?")
    print("    - Is the voice consistent across chunks?")
    print("    - Any clicks or artifacts at join points?")
    print("    - Compare Flash vs Longform chunking quality")
    print()


if __name__ == "__main__":
    main()