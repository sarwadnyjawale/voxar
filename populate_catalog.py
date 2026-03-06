"""
Populate the voice catalog with the best 20 voices from cleaned samples.
Assigns character names, copies embeddings, builds catalog.
Run from project root: python populate_catalog.py
"""
import sys
import os
import shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine.voice_manager import VoiceManager


# Best 20 voices selected by quality score and distribution
VOICES = [
    # ── Female (10) ──
    {
        "voice_id": "v001", "name": "Aisha", "display_name": "Aisha — The Anchor",
        "gender": "female", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral", "styles": ["narration", "news"],
        "description": "Clear, confident voice perfect for news and professional content",
        "tags": ["clear", "confident", "professional", "anchor"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "female_en_01_v2_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v002", "name": "Zara", "display_name": "Zara — The Presenter",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["presentation", "commercial"],
        "description": "Engaging voice for presentations and advertisements",
        "tags": ["engaging", "bright", "commercial", "presenter"],
        "pitch": "medium-high", "energy": "energetic", "warmth": "warm",
        "source_file": "female_en_02_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v003", "name": "Sophia", "display_name": "Sophia — The Narrator",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["narration", "audiobook"],
        "description": "Smooth, flowing voice ideal for audiobooks and storytelling",
        "tags": ["smooth", "flowing", "storytelling", "audiobook"],
        "pitch": "medium", "energy": "calm", "warmth": "warm",
        "source_file": "female_en_03_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v004", "name": "Maya", "display_name": "Maya — The Storyteller",
        "gender": "female", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral_indian", "styles": ["storytelling", "calm"],
        "description": "Warm and inviting voice for educational and narrative content",
        "tags": ["warm", "inviting", "educational", "narrative"],
        "pitch": "medium", "energy": "calm", "warmth": "warm",
        "source_file": "female_en_04_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v005", "name": "Isha", "display_name": "Isha — The Creator",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["youtube", "energetic"],
        "description": "Energetic and youthful voice for YouTube and social media",
        "tags": ["energetic", "youthful", "youtube", "social"],
        "pitch": "medium-high", "energy": "energetic", "warmth": "neutral",
        "source_file": "female_en_05_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v006", "name": "Priya", "display_name": "Priya — The Poet",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["poetry", "calm", "meditation"],
        "description": "Soothing Hindi voice for poetry, meditation, and calm content",
        "tags": ["soothing", "poetic", "calm", "hindi"],
        "pitch": "medium", "energy": "calm", "warmth": "warm",
        "source_file": "female_hi_01_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v007", "name": "Kavya", "display_name": "Kavya — The Guide",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["educational", "guide"],
        "description": "Friendly guide voice for tutorials and educational Hindi content",
        "tags": ["friendly", "guide", "tutorial", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "warm",
        "source_file": "female_hi_02_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v008", "name": "Divya", "display_name": "Divya — The Teacher",
        "gender": "female", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["educational", "professional"],
        "description": "Clear and articulate Hindi voice for lectures and courses",
        "tags": ["clear", "articulate", "teacher", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "female_hi_03_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v009", "name": "Neha", "display_name": "Neha — The Companion",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["conversational", "podcast"],
        "description": "Conversational Hindi voice for podcasts and casual content",
        "tags": ["conversational", "friendly", "podcast", "hindi"],
        "pitch": "medium-high", "energy": "moderate", "warmth": "warm",
        "source_file": "female_hi_04_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v010", "name": "Meera", "display_name": "Meera — The Soulful",
        "gender": "female", "languages": ["mr", "hi"], "primary_language": "mr",
        "accent": "marathi", "styles": ["narration", "soulful"],
        "description": "Deep, soulful Marathi voice for cultural and narrative content",
        "tags": ["soulful", "deep", "cultural", "marathi"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "female_mr_01_cleaned.wav", "quality_score": 8,
    },

    # ── Male (10) ──
    {
        "voice_id": "v011", "name": "Arjun", "display_name": "Arjun — The Narrator",
        "gender": "male", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral", "styles": ["narration", "documentary"],
        "description": "Warm, authoritative voice perfect for documentaries and podcasts",
        "tags": ["warm", "authoritative", "documentary", "narrator"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "male_en_01_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v012", "name": "Vikram", "display_name": "Vikram — The Anchor",
        "gender": "male", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["news", "professional"],
        "description": "Crisp, professional voice for news reading and corporate content",
        "tags": ["crisp", "professional", "news", "corporate"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_en_02_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v013", "name": "Rohan", "display_name": "Rohan — The Presenter",
        "gender": "male", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["presentation", "explainer"],
        "description": "Clear and engaging voice for explainer videos and presentations",
        "tags": ["clear", "engaging", "explainer", "presenter"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_en_05_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v014", "name": "Kabir", "display_name": "Kabir — The Storyteller",
        "gender": "male", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral_indian", "styles": ["storytelling", "cinematic"],
        "description": "Rich, cinematic voice for dramatic narration and storytelling",
        "tags": ["rich", "cinematic", "dramatic", "storytelling"],
        "pitch": "low", "energy": "calm", "warmth": "warm",
        "source_file": "male_en_06_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v015", "name": "Raj", "display_name": "Raj — The Mentor",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["educational", "mentorship"],
        "description": "Trustworthy Hindi voice for educational and motivational content",
        "tags": ["trustworthy", "mentor", "educational", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "warm",
        "source_file": "male_hi_01_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v016", "name": "Aakash", "display_name": "Aakash — The Explorer",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["travel", "adventure"],
        "description": "Adventurous Hindi voice for travel and discovery content",
        "tags": ["adventurous", "explorer", "travel", "hindi"],
        "pitch": "medium", "energy": "energetic", "warmth": "neutral",
        "source_file": "male_hi_02_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v017", "name": "Dev", "display_name": "Dev — The Professional",
        "gender": "male", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["corporate", "professional"],
        "description": "Polished Hindi voice for corporate and business content",
        "tags": ["polished", "corporate", "business", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_hi_04_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v018", "name": "Sahil", "display_name": "Sahil — The Calm",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["meditation", "calm", "asmr"],
        "description": "Gentle, calming Hindi voice for meditation and wellness content",
        "tags": ["gentle", "calming", "meditation", "wellness"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "male_hi_05_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v019", "name": "Omkar", "display_name": "Omkar — The Bold",
        "gender": "male", "languages": ["mr", "hi"], "primary_language": "mr",
        "accent": "marathi", "styles": ["commercial", "bold"],
        "description": "Strong, bold Marathi voice for ads and impactful content",
        "tags": ["strong", "bold", "commercial", "marathi"],
        "pitch": "low", "energy": "energetic", "warmth": "neutral",
        "source_file": "male_mr_01_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v020", "name": "Tejas", "display_name": "Tejas — The Energetic",
        "gender": "male", "languages": ["mr", "hi"], "primary_language": "mr",
        "accent": "marathi", "styles": ["youtube", "energetic"],
        "description": "Energetic Marathi voice for YouTube and social media content",
        "tags": ["energetic", "youthful", "youtube", "marathi"],
        "pitch": "medium", "energy": "energetic", "warmth": "warm",
        "source_file": "male_mr_02_cleaned.wav", "quality_score": 7,
    },
]


def main():
    print("=" * 60)
    print("  VOXAR VOICE CATALOG BUILDER")
    print("=" * 60)

    vm = VoiceManager(voices_dir="voices")
    cleaned_dir = "voices/cleaned_samples"
    embeddings_dir = "voices/embeddings"

    os.makedirs(embeddings_dir, exist_ok=True)

    for v in VOICES:
        source = os.path.join(cleaned_dir, v["source_file"])
        if not os.path.exists(source):
            print(f"  SKIP  {v['voice_id']} — source not found: {v['source_file']}")
            continue

        # Add to catalog
        vm.add_voice(
            voice_id=v["voice_id"],
            name=v["name"],
            display_name=v["display_name"],
            gender=v["gender"],
            languages=v["languages"],
            primary_language=v["primary_language"],
            accent=v["accent"],
            styles=v["styles"],
            description=v["description"],
            tags=v["tags"],
            pitch=v["pitch"],
            energy=v["energy"],
            warmth=v["warmth"],
        )

        # Copy cleaned sample as embedding reference
        emb_filename = f"{v['voice_id']}_{v['name'].lower()}.wav"
        emb_path = os.path.join(embeddings_dir, emb_filename)
        shutil.copy2(source, emb_path)

        # Update embedding path in catalog
        vm.update_voice(v["voice_id"],
                        embedding_path=f"embeddings/{emb_filename}",
                        quality_score=v["quality_score"])

        print(f"  OK  {v['voice_id']}: {v['display_name']} ({v['gender']}, {v['primary_language']}, q={v['quality_score']})")

    # Validate
    print("\n" + "-" * 60)
    report = vm.validate_catalog()
    print(f"\n  Voices: {report['summary']['total_voices']}")
    print(f"  Languages: {report['summary']['languages_covered']}")
    print(f"  Gender: {report['summary']['gender_split']}")
    print(f"  Premium: {report['summary']['premium_count']}")

    if report["issues"]:
        print(f"\n  Issues ({len(report['issues'])}):")
        for issue in report["issues"]:
            print(f"    - {issue}")

    print("\n" + "=" * 60)
    print(f"  CATALOG BUILT: {report['summary']['total_voices']} voices")
    print("=" * 60)


if __name__ == "__main__":
    main()
