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
        "voice_id": "v001", "name": "Aisha Trivedi", "display_name": "Aisha Trivedi — The Anchor",
        "gender": "female", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral", "styles": ["narration", "news"],
        "description": "Clear, confident voice perfect for news and professional content",
        "tags": ["clear", "confident", "professional", "anchor"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "female_en_01_v2_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v002", "name": "Zara Bhatt", "display_name": "Zara Bhatt — The Presenter",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["presentation", "commercial"],
        "description": "Engaging voice for presentations and advertisements",
        "tags": ["engaging", "bright", "commercial", "presenter"],
        "pitch": "medium-high", "energy": "energetic", "warmth": "warm",
        "source_file": "female_en_02_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v003", "name": "Sophia Menon", "display_name": "Sophia Menon — The Narrator",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["narration", "audiobook"],
        "description": "Smooth, flowing voice ideal for audiobooks and storytelling",
        "tags": ["smooth", "flowing", "storytelling", "audiobook"],
        "pitch": "medium", "energy": "calm", "warmth": "warm",
        "source_file": "female_en_03_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v004", "name": "Maya Sharma", "display_name": "Maya Sharma — The Storyteller",
        "gender": "female", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral_indian", "styles": ["storytelling", "calm"],
        "description": "Warm and inviting voice for educational and narrative content",
        "tags": ["warm", "inviting", "educational", "narrative"],
        "pitch": "medium", "energy": "calm", "warmth": "warm",
        "source_file": "female_en_04_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v005", "name": "Isha Malhotra", "display_name": "Isha Malhotra — The Creator",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["youtube", "energetic"],
        "description": "Energetic and youthful voice for YouTube and social media",
        "tags": ["energetic", "youthful", "youtube", "social"],
        "pitch": "medium-high", "energy": "energetic", "warmth": "neutral",
        "source_file": "female_en_05_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v006", "name": "Priya Nair", "display_name": "Priya Nair — The Poet",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["poetry", "calm", "meditation"],
        "description": "Soothing Hindi voice for poetry, meditation, and calm content",
        "tags": ["soothing", "poetic", "calm", "hindi"],
        "pitch": "medium", "energy": "calm", "warmth": "warm",
        "source_file": "female_hi_01_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v007", "name": "Kavya Reddy", "display_name": "Kavya Reddy — The Guide",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["educational", "guide"],
        "description": "Friendly guide voice for tutorials and educational Hindi content",
        "tags": ["friendly", "guide", "tutorial", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "warm",
        "source_file": "female_hi_02_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v008", "name": "Divya Iyer", "display_name": "Divya Iyer — The Teacher",
        "gender": "female", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["educational", "professional"],
        "description": "Clear and articulate Hindi voice for lectures and courses",
        "tags": ["clear", "articulate", "teacher", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "female_hi_03_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v009", "name": "Neha Verma", "display_name": "Neha Verma — The Companion",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["conversational", "podcast"],
        "description": "Conversational Hindi voice for podcasts and casual content",
        "tags": ["conversational", "friendly", "podcast", "hindi"],
        "pitch": "medium-high", "energy": "moderate", "warmth": "warm",
        "source_file": "female_hi_04_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v010", "name": "Meera Joshi", "display_name": "Meera Joshi — The Soulful",
        "gender": "female", "languages": ["mr", "hi"], "primary_language": "mr",
        "accent": "marathi", "styles": ["narration", "soulful"],
        "description": "Deep, soulful Marathi voice for cultural and narrative content",
        "tags": ["soulful", "deep", "cultural", "marathi"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "female_mr_01_cleaned.wav", "quality_score": 8,
    },

    # ── Male (10) ──
    {
        "voice_id": "v011", "name": "Arjun Mehta", "display_name": "Arjun Mehta — The Narrator",
        "gender": "male", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral", "styles": ["narration", "documentary"],
        "description": "Warm, authoritative voice perfect for documentaries and podcasts",
        "tags": ["warm", "authoritative", "documentary", "narrator"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "male_en_01_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v012", "name": "Vikram Singh", "display_name": "Vikram Singh — The Anchor",
        "gender": "male", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["news", "professional"],
        "description": "Crisp, professional voice for news reading and corporate content",
        "tags": ["crisp", "professional", "news", "corporate"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_en_02_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v013", "name": "Rohan Kapoor", "display_name": "Rohan Kapoor — The Presenter",
        "gender": "male", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["presentation", "explainer"],
        "description": "Clear and engaging voice for explainer videos and presentations",
        "tags": ["clear", "engaging", "explainer", "presenter"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_en_05_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v014", "name": "Kabir Pandey", "display_name": "Kabir Pandey — The Storyteller",
        "gender": "male", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral_indian", "styles": ["storytelling", "cinematic"],
        "description": "Rich, cinematic voice for dramatic narration and storytelling",
        "tags": ["rich", "cinematic", "dramatic", "storytelling"],
        "pitch": "low", "energy": "calm", "warmth": "warm",
        "source_file": "male_en_06_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v015", "name": "Raj Thakur", "display_name": "Raj Thakur — The Mentor",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["educational", "mentorship"],
        "description": "Trustworthy Hindi voice for educational and motivational content",
        "tags": ["trustworthy", "mentor", "educational", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "warm",
        "source_file": "male_hi_01_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v016", "name": "Aakash Chauhan", "display_name": "Aakash Chauhan — The Explorer",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["travel", "adventure"],
        "description": "Adventurous Hindi voice for travel and discovery content",
        "tags": ["adventurous", "explorer", "travel", "hindi"],
        "pitch": "medium", "energy": "energetic", "warmth": "neutral",
        "source_file": "male_hi_02_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v017", "name": "Dev Rathore", "display_name": "Dev Rathore — The Professional",
        "gender": "male", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["corporate", "professional"],
        "description": "Polished Hindi voice for corporate and business content",
        "tags": ["polished", "corporate", "business", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_hi_04_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v018", "name": "Sahil Tiwari", "display_name": "Sahil Tiwari — The Calm",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["meditation", "calm", "asmr"],
        "description": "Gentle, calming Hindi voice for meditation and wellness content",
        "tags": ["gentle", "calming", "meditation", "wellness"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "male_hi_05_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v019", "name": "Omkar Patil", "display_name": "Omkar Patil — The Bold",
        "gender": "male", "languages": ["mr", "hi"], "primary_language": "mr",
        "accent": "marathi", "styles": ["commercial", "bold"],
        "description": "Strong, bold Marathi voice for ads and impactful content",
        "tags": ["strong", "bold", "commercial", "marathi"],
        "pitch": "low", "energy": "energetic", "warmth": "neutral",
        "source_file": "male_mr_01_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v020", "name": "Tejas Desai", "display_name": "Tejas Desai — The Energetic",
        "gender": "male", "languages": ["mr", "hi"], "primary_language": "mr",
        "accent": "marathi", "styles": ["youtube", "energetic"],
        "description": "Energetic Marathi voice for YouTube and social media content",
        "tags": ["energetic", "youthful", "youtube", "marathi"],
        "pitch": "medium", "energy": "energetic", "warmth": "warm",
        "source_file": "male_mr_02_cleaned.wav", "quality_score": 7,
    },

    # ── New Batch (v021–v041) ──
    {
        "voice_id": "v021", "name": "Naina", "display_name": "Naina — The Dreamer",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["lifestyle", "vlog"],
        "description": "Soft and dreamy voice for lifestyle and vlog content",
        "tags": ["soft", "dreamy", "lifestyle", "vlog"],
        "pitch": "medium-high", "energy": "calm", "warmth": "warm",
        "source_file": "female_en_06_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v022", "name": "Tara", "display_name": "Tara — The Coach",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["motivational", "coaching"],
        "description": "Empowering and motivational voice for coaching and self-help",
        "tags": ["motivational", "empowering", "coaching", "self-help"],
        "pitch": "medium", "energy": "energetic", "warmth": "warm",
        "source_file": "female_en_07_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v023", "name": "Riya", "display_name": "Riya — The Tutor",
        "gender": "female", "languages": ["en"], "primary_language": "en",
        "accent": "neutral_indian", "styles": ["educational", "elearning"],
        "description": "Clear and patient voice perfect for e-learning and tutoring",
        "tags": ["clear", "patient", "elearning", "tutor"],
        "pitch": "medium", "energy": "moderate", "warmth": "warm",
        "source_file": "female_en_08_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v024", "name": "Ananya", "display_name": "Ananya — The Host",
        "gender": "female", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral_indian", "styles": ["podcast", "interview"],
        "description": "Warm and conversational voice ideal for podcast hosting",
        "tags": ["podcast", "interview", "conversational", "host"],
        "pitch": "medium", "energy": "moderate", "warmth": "warm",
        "source_file": "female_en_09_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v025", "name": "Shreya", "display_name": "Shreya — The Reciter",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["poetry", "recitation"],
        "description": "Melodic Hindi voice for poetry recitation and devotional content",
        "tags": ["melodic", "poetry", "recitation", "hindi"],
        "pitch": "medium-high", "energy": "calm", "warmth": "warm",
        "source_file": "female_hi_05_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v026", "name": "Diya", "display_name": "Diya — The Newscaster",
        "gender": "female", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["news", "formal"],
        "description": "Sharp and authoritative Hindi voice for news and formal announcements",
        "tags": ["news", "formal", "authoritative", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "female_hi_06_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v027", "name": "Pooja", "display_name": "Pooja — The Narrator",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["narration", "documentary"],
        "description": "Rich and expressive Hindi voice for documentary narration",
        "tags": ["rich", "expressive", "documentary", "hindi"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "female_hi_07_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v028", "name": "Sana", "display_name": "Sana — The Storyteller",
        "gender": "female", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["storytelling", "children"],
        "description": "Gentle and expressive Hindi voice for stories and children content",
        "tags": ["gentle", "storytelling", "children", "hindi"],
        "pitch": "medium-high", "energy": "moderate", "warmth": "warm",
        "source_file": "female_hi_08_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v029", "name": "Simran", "display_name": "Simran — The Creator",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["youtube", "social"],
        "description": "Upbeat and youthful Hindi voice for YouTube and social media",
        "tags": ["upbeat", "youthful", "youtube", "hindi"],
        "pitch": "medium-high", "energy": "energetic", "warmth": "neutral",
        "source_file": "female_hi_09_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v030", "name": "Radha", "display_name": "Radha — The Devotional",
        "gender": "female", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["devotional", "spiritual"],
        "description": "Soulful and devotional Hindi voice for spiritual and religious content",
        "tags": ["devotional", "spiritual", "soulful", "hindi"],
        "pitch": "medium", "energy": "calm", "warmth": "warm",
        "source_file": "female_hi_10_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v031", "name": "Aditi", "display_name": "Aditi — The Anchor",
        "gender": "female", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["news", "professional"],
        "description": "Confident and clear Hindi voice for news anchoring",
        "tags": ["confident", "news", "anchor", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "female_hi_11_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v032", "name": "Gauri", "display_name": "Gauri — The Companion",
        "gender": "female", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["conversational", "friendly"],
        "description": "Warm and friendly Hindi voice for casual and conversational content",
        "tags": ["friendly", "conversational", "warm", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "warm",
        "source_file": "female_hi_12_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v033", "name": "Nikhil", "display_name": "Nikhil — The Anchor",
        "gender": "male", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["news", "documentary"],
        "description": "Deep and commanding voice for news and documentary content",
        "tags": ["deep", "commanding", "news", "documentary"],
        "pitch": "low", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_en_07_cleaned.wav", "quality_score": 9,
    },
    {
        "voice_id": "v034", "name": "Siddharth", "display_name": "Siddharth — The Narrator",
        "gender": "male", "languages": ["en"], "primary_language": "en",
        "accent": "neutral", "styles": ["narration", "audiobook"],
        "description": "Smooth and rich voice for audiobooks and long-form narration",
        "tags": ["smooth", "rich", "audiobook", "narrator"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "male_en_08_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v035", "name": "Ishaan", "display_name": "Ishaan — The Presenter",
        "gender": "male", "languages": ["en", "hi"], "primary_language": "en",
        "accent": "neutral_indian", "styles": ["presentation", "corporate"],
        "description": "Confident and polished voice for corporate presentations",
        "tags": ["confident", "polished", "corporate", "presenter"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_en_09_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v036", "name": "Manav", "display_name": "Manav — The Storyteller",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["storytelling", "cinematic"],
        "description": "Powerful and cinematic Hindi voice for drama and storytelling",
        "tags": ["powerful", "cinematic", "drama", "hindi"],
        "pitch": "low", "energy": "moderate", "warmth": "warm",
        "source_file": "male_hi_06_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v037", "name": "Yash", "display_name": "Yash — The Creator",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["youtube", "energetic"],
        "description": "Energetic and youthful Hindi voice for YouTube and reels",
        "tags": ["energetic", "youthful", "youtube", "hindi"],
        "pitch": "medium", "energy": "energetic", "warmth": "neutral",
        "source_file": "male_hi_07_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v038", "name": "Pranav", "display_name": "Pranav — The Mentor",
        "gender": "male", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["educational", "motivational"],
        "description": "Trustworthy and motivational Hindi voice for education and mentorship",
        "tags": ["trustworthy", "motivational", "educational", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "warm",
        "source_file": "male_hi_08_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v039", "name": "Kunal", "display_name": "Kunal — The Professional",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["corporate", "professional"],
        "description": "Sharp and polished Hindi voice for business and corporate content",
        "tags": ["sharp", "polished", "corporate", "hindi"],
        "pitch": "medium", "energy": "moderate", "warmth": "neutral",
        "source_file": "male_hi_09_cleaned.wav", "quality_score": 8,
    },
    {
        "voice_id": "v040", "name": "Vivek", "display_name": "Vivek — The Guide",
        "gender": "male", "languages": ["hi"], "primary_language": "hi",
        "accent": "hindi", "styles": ["educational", "calm"],
        "description": "Calm and clear Hindi voice for tutorials and guided learning",
        "tags": ["calm", "clear", "tutorial", "hindi"],
        "pitch": "medium-low", "energy": "calm", "warmth": "warm",
        "source_file": "male_hi_10_cleaned.wav", "quality_score": 7,
    },
    {
        "voice_id": "v041", "name": "Harsh", "display_name": "Harsh — The Bold",
        "gender": "male", "languages": ["hi", "en"], "primary_language": "hi",
        "accent": "hindi", "styles": ["commercial", "bold"],
        "description": "Bold and commanding Hindi voice for ads and impactful content",
        "tags": ["bold", "commanding", "commercial", "hindi"],
        "pitch": "low", "energy": "energetic", "warmth": "neutral",
        "source_file": "male_hi_11_cleaned.wav", "quality_score": 10,
    },
    {
        "voice_id": "v042", "name": "Gaurav", "display_name": "Gaurav — The Narrator",
        "gender": "male", "languages": ["mr", "hi"], "primary_language": "mr",
        "accent": "marathi", "styles": ["narration", "documentary"],
        "description": "Steady and authoritative Marathi voice for narration and documentary",
        "tags": ["steady", "authoritative", "documentary", "marathi"],
        "pitch": "medium-low", "energy": "calm", "warmth": "neutral",
        "source_file": "male_mr_03_cleaned.wav", "quality_score": 7,
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
        emb_filename = f"{v['voice_id']}_{v['name'].lower().replace(' ', '_')}.wav"
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
