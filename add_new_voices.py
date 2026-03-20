"""Add v021-v042 to the existing voice catalog."""
import sys, os, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine.voice_manager import VoiceManager

vm = VoiceManager(voices_dir="voices")
cleaned_dir = "voices/cleaned_samples"
embeddings_dir = "voices/embeddings"
os.makedirs(embeddings_dir, exist_ok=True)

NEW_VOICES = [
    {"voice_id":"v021","name":"Naina","display_name":"Naina — The Dreamer","gender":"female","languages":["en"],"primary_language":"en","accent":"neutral","styles":["lifestyle","vlog"],"description":"Soft and dreamy voice for lifestyle and vlog content","tags":["soft","dreamy","lifestyle","vlog"],"pitch":"medium-high","energy":"calm","warmth":"warm","source_file":"female_en_06_cleaned.wav","quality_score":8},
    {"voice_id":"v022","name":"Tara","display_name":"Tara — The Coach","gender":"female","languages":["en"],"primary_language":"en","accent":"neutral","styles":["motivational","coaching"],"description":"Empowering and motivational voice for coaching and self-help","tags":["motivational","empowering","coaching","self-help"],"pitch":"medium","energy":"energetic","warmth":"warm","source_file":"female_en_07_cleaned.wav","quality_score":7},
    {"voice_id":"v023","name":"Riya","display_name":"Riya — The Tutor","gender":"female","languages":["en"],"primary_language":"en","accent":"neutral_indian","styles":["educational","elearning"],"description":"Clear and patient voice perfect for e-learning and tutoring","tags":["clear","patient","elearning","tutor"],"pitch":"medium","energy":"moderate","warmth":"warm","source_file":"female_en_08_cleaned.wav","quality_score":7},
    {"voice_id":"v024","name":"Ananya","display_name":"Ananya — The Host","gender":"female","languages":["en","hi"],"primary_language":"en","accent":"neutral_indian","styles":["podcast","interview"],"description":"Warm and conversational voice ideal for podcast hosting","tags":["podcast","interview","conversational","host"],"pitch":"medium","energy":"moderate","warmth":"warm","source_file":"female_en_09_cleaned.wav","quality_score":7},
    {"voice_id":"v025","name":"Shreya","display_name":"Shreya — The Reciter","gender":"female","languages":["hi","en"],"primary_language":"hi","accent":"hindi","styles":["poetry","recitation"],"description":"Melodic Hindi voice for poetry recitation and devotional content","tags":["melodic","poetry","recitation","hindi"],"pitch":"medium-high","energy":"calm","warmth":"warm","source_file":"female_hi_05_cleaned.wav","quality_score":7},
    {"voice_id":"v026","name":"Diya","display_name":"Diya — The Newscaster","gender":"female","languages":["hi"],"primary_language":"hi","accent":"hindi","styles":["news","formal"],"description":"Sharp and authoritative Hindi voice for news and formal announcements","tags":["news","formal","authoritative","hindi"],"pitch":"medium","energy":"moderate","warmth":"neutral","source_file":"female_hi_06_cleaned.wav","quality_score":7},
    {"voice_id":"v027","name":"Pooja","display_name":"Pooja — The Narrator","gender":"female","languages":["hi","en"],"primary_language":"hi","accent":"hindi","styles":["narration","documentary"],"description":"Rich and expressive Hindi voice for documentary narration","tags":["rich","expressive","documentary","hindi"],"pitch":"medium-low","energy":"calm","warmth":"warm","source_file":"female_hi_07_cleaned.wav","quality_score":7},
    {"voice_id":"v028","name":"Sana","display_name":"Sana — The Storyteller","gender":"female","languages":["hi"],"primary_language":"hi","accent":"hindi","styles":["storytelling","children"],"description":"Gentle and expressive Hindi voice for stories and children content","tags":["gentle","storytelling","children","hindi"],"pitch":"medium-high","energy":"moderate","warmth":"warm","source_file":"female_hi_08_cleaned.wav","quality_score":8},
    {"voice_id":"v029","name":"Simran","display_name":"Simran — The Creator","gender":"female","languages":["hi","en"],"primary_language":"hi","accent":"hindi","styles":["youtube","social"],"description":"Upbeat and youthful Hindi voice for YouTube and social media","tags":["upbeat","youthful","youtube","hindi"],"pitch":"medium-high","energy":"energetic","warmth":"neutral","source_file":"female_hi_09_cleaned.wav","quality_score":7},
    {"voice_id":"v030","name":"Radha","display_name":"Radha — The Devotional","gender":"female","languages":["hi"],"primary_language":"hi","accent":"hindi","styles":["devotional","spiritual"],"description":"Soulful and devotional Hindi voice for spiritual and religious content","tags":["devotional","spiritual","soulful","hindi"],"pitch":"medium","energy":"calm","warmth":"warm","source_file":"female_hi_10_cleaned.wav","quality_score":7},
    {"voice_id":"v031","name":"Aditi","display_name":"Aditi — The Anchor","gender":"female","languages":["hi","en"],"primary_language":"hi","accent":"hindi","styles":["news","professional"],"description":"Confident and clear Hindi voice for news anchoring","tags":["confident","news","anchor","hindi"],"pitch":"medium","energy":"moderate","warmth":"neutral","source_file":"female_hi_11_cleaned.wav","quality_score":7},
    {"voice_id":"v032","name":"Gauri","display_name":"Gauri — The Companion","gender":"female","languages":["hi"],"primary_language":"hi","accent":"hindi","styles":["conversational","friendly"],"description":"Warm and friendly Hindi voice for casual and conversational content","tags":["friendly","conversational","warm","hindi"],"pitch":"medium","energy":"moderate","warmth":"warm","source_file":"female_hi_12_cleaned.wav","quality_score":7},
    {"voice_id":"v033","name":"Nikhil","display_name":"Nikhil — The Anchor","gender":"male","languages":["en"],"primary_language":"en","accent":"neutral","styles":["news","documentary"],"description":"Deep and commanding voice for news and documentary content","tags":["deep","commanding","news","documentary"],"pitch":"low","energy":"moderate","warmth":"neutral","source_file":"male_en_07_cleaned.wav","quality_score":9},
    {"voice_id":"v034","name":"Siddharth","display_name":"Siddharth — The Narrator","gender":"male","languages":["en"],"primary_language":"en","accent":"neutral","styles":["narration","audiobook"],"description":"Smooth and rich voice for audiobooks and long-form narration","tags":["smooth","rich","audiobook","narrator"],"pitch":"medium-low","energy":"calm","warmth":"warm","source_file":"male_en_08_cleaned.wav","quality_score":7},
    {"voice_id":"v035","name":"Ishaan","display_name":"Ishaan — The Presenter","gender":"male","languages":["en","hi"],"primary_language":"en","accent":"neutral_indian","styles":["presentation","corporate"],"description":"Confident and polished voice for corporate presentations","tags":["confident","polished","corporate","presenter"],"pitch":"medium","energy":"moderate","warmth":"neutral","source_file":"male_en_09_cleaned.wav","quality_score":7},
    {"voice_id":"v036","name":"Manav","display_name":"Manav — The Storyteller","gender":"male","languages":["hi","en"],"primary_language":"hi","accent":"hindi","styles":["storytelling","cinematic"],"description":"Powerful and cinematic Hindi voice for drama and storytelling","tags":["powerful","cinematic","drama","hindi"],"pitch":"low","energy":"moderate","warmth":"warm","source_file":"male_hi_06_cleaned.wav","quality_score":7},
    {"voice_id":"v037","name":"Yash","display_name":"Yash — The Creator","gender":"male","languages":["hi","en"],"primary_language":"hi","accent":"hindi","styles":["youtube","energetic"],"description":"Energetic and youthful Hindi voice for YouTube and reels","tags":["energetic","youthful","youtube","hindi"],"pitch":"medium","energy":"energetic","warmth":"neutral","source_file":"male_hi_07_cleaned.wav","quality_score":7},
    {"voice_id":"v038","name":"Pranav","display_name":"Pranav — The Mentor","gender":"male","languages":["hi"],"primary_language":"hi","accent":"hindi","styles":["educational","motivational"],"description":"Trustworthy and motivational Hindi voice for education and mentorship","tags":["trustworthy","motivational","educational","hindi"],"pitch":"medium","energy":"moderate","warmth":"warm","source_file":"male_hi_08_cleaned.wav","quality_score":7},
    {"voice_id":"v039","name":"Kunal","display_name":"Kunal — The Professional","gender":"male","languages":["hi","en"],"primary_language":"hi","accent":"hindi","styles":["corporate","professional"],"description":"Sharp and polished Hindi voice for business and corporate content","tags":["sharp","polished","corporate","hindi"],"pitch":"medium","energy":"moderate","warmth":"neutral","source_file":"male_hi_09_cleaned.wav","quality_score":8},
    {"voice_id":"v040","name":"Vivek","display_name":"Vivek — The Guide","gender":"male","languages":["hi"],"primary_language":"hi","accent":"hindi","styles":["educational","calm"],"description":"Calm and clear Hindi voice for tutorials and guided learning","tags":["calm","clear","tutorial","hindi"],"pitch":"medium-low","energy":"calm","warmth":"warm","source_file":"male_hi_10_cleaned.wav","quality_score":7},
    {"voice_id":"v041","name":"Harsh","display_name":"Harsh — The Bold","gender":"male","languages":["hi","en"],"primary_language":"hi","accent":"hindi","styles":["commercial","bold"],"description":"Bold and commanding Hindi voice for ads and impactful content","tags":["bold","commanding","commercial","hindi"],"pitch":"low","energy":"energetic","warmth":"neutral","source_file":"male_hi_11_cleaned.wav","quality_score":10},
    {"voice_id":"v042","name":"Gaurav","display_name":"Gaurav — The Narrator","gender":"male","languages":["mr","hi"],"primary_language":"mr","accent":"marathi","styles":["narration","documentary"],"description":"Steady and authoritative Marathi voice for narration and documentary","tags":["steady","authoritative","documentary","marathi"],"pitch":"medium-low","energy":"calm","warmth":"neutral","source_file":"male_mr_03_cleaned.wav","quality_score":7},
]

print("=" * 60)
print("  ADDING v021-v042 TO CATALOG")
print("=" * 60)

for v in NEW_VOICES:
    source = os.path.join(cleaned_dir, v["source_file"])
    if not os.path.exists(source):
        print(f"  MISSING {v['voice_id']}: {v['source_file']}")
        continue
    vm.add_voice(
        voice_id=v["voice_id"], name=v["name"], display_name=v["display_name"],
        gender=v["gender"], languages=v["languages"], primary_language=v["primary_language"],
        accent=v["accent"], styles=v["styles"], description=v["description"],
        tags=v["tags"], pitch=v["pitch"], energy=v["energy"], warmth=v["warmth"],
    )
    emb_filename = f"{v['voice_id']}_{v['name'].lower()}.wav"
    emb_path = os.path.join(embeddings_dir, emb_filename)
    shutil.copy2(source, emb_path)
    vm.update_voice(v["voice_id"], embedding_path=f"embeddings/{emb_filename}", quality_score=v["quality_score"])
    print(f"  OK  {v['voice_id']}: {v['display_name']} (q={v['quality_score']})")

report = vm.validate_catalog()
print("\n" + "-" * 60)
print(f"  Total voices : {report['summary']['total_voices']}")
print(f"  Languages    : {report['summary']['languages_covered']}")
print(f"  Gender split : {report['summary']['gender_split']}")
print("=" * 60)

if __name__ == "__main__":
    pass
