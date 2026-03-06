"""
VOXAR Voice Manager v1.0
Manages the voice catalog: embedding extraction, preview generation, catalog CRUD.

Usage:
    from engine.voice_manager import VoiceManager

    manager = VoiceManager(voices_dir="voices")

    # Add a voice (after cleaning the sample)
    manager.add_voice(
        voice_id="v001", name="Arjun", display_name="Arjun — The Narrator",
        gender="male", languages=["en", "hi"], primary_language="en",
        accent="neutral_indian", styles=["narration", "calm"],
        description="Warm, authoritative voice for documentaries",
    )

    # Extract embedding (requires engine)
    manager.extract_embedding(engine, "voices/cleaned_samples/arjun.wav", "v001")

    # Generate preview (requires engine)
    manager.generate_preview(engine, "v001", "en")

    # Validate everything
    report = manager.validate_catalog()
"""

import os
import json
import logging
from pathlib import Path
from datetime import datetime

logger = logging.getLogger("VoxarVoiceManager")


class VoiceManager:
    """Manages the VOXAR voice catalog, embeddings, and previews."""

    def __init__(self, voices_dir="voices"):
        self.voices_dir = Path(voices_dir)
        self.catalog_path = self.voices_dir / "voices_catalog.json"
        self.embeddings_dir = self.voices_dir / "embeddings"
        self.previews_dir = self.voices_dir / "previews"
        self.cleaned_dir = self.voices_dir / "cleaned_samples"
        self.scripts_path = self.voices_dir / "preview_scripts.json"

        # Ensure dirs exist
        for d in [self.embeddings_dir, self.previews_dir, self.cleaned_dir]:
            d.mkdir(parents=True, exist_ok=True)

        # Load or create catalog
        self._catalog = self._load_catalog()

        logger.info(f"VoiceManager initialized: {len(self._catalog['voices'])} voices loaded")

    def _load_catalog(self):
        """Load catalog from JSON, or create empty one."""
        if self.catalog_path.exists():
            with open(self.catalog_path, "r", encoding="utf-8") as f:
                return json.load(f)

        return {
            "version": "1.0",
            "total_voices": 0,
            "voices": [],
        }

    def _save_catalog(self):
        """Save catalog to JSON."""
        self._catalog["total_voices"] = len(self._catalog["voices"])
        with open(self.catalog_path, "w", encoding="utf-8") as f:
            json.dump(self._catalog, f, indent=2, ensure_ascii=False)
        logger.info(f"Catalog saved: {self._catalog['total_voices']} voices")

    def add_voice(self, voice_id, name, display_name, gender, languages,
                  primary_language, accent="neutral", styles=None,
                  description="", tags=None, pitch="medium",
                  energy="moderate", warmth="neutral", is_premium=False):
        """
        Add a new voice entry to the catalog.

        Args:
            voice_id: unique ID (e.g., "v001")
            name: short name (e.g., "Arjun")
            display_name: full display name (e.g., "Arjun — The Narrator")
            gender: "male" or "female"
            languages: list of language codes (e.g., ["en", "hi"])
            primary_language: main language code
            accent: accent description
            styles: list of styles (e.g., ["narration", "calm"])
            description: human-readable description
            tags: list of tags for search
            pitch: "low", "medium-low", "medium", "medium-high", "high"
            energy: "calm", "moderate", "energetic"
            warmth: "cool", "neutral", "warm"
            is_premium: whether this voice requires paid plan

        Returns:
            dict — the new voice entry
        """
        # Check for duplicate
        if self.get_voice(voice_id) is not None:
            raise ValueError(f"Voice '{voice_id}' already exists in catalog")

        voice_entry = {
            "id": voice_id,
            "name": name,
            "display_name": display_name,
            "gender": gender,
            "languages": languages,
            "primary_language": primary_language,
            "accent": accent,
            "styles": styles or [],
            "description": description,
            "tags": tags or [],
            "pitch": pitch,
            "energy": energy,
            "warmth": warmth,
            "embedding_path": f"embeddings/{voice_id}_{name.lower()}.pth",
            "preview_urls": {},
            "is_premium": is_premium,
            "quality_score": 0,
            "usage_count": 0,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }

        self._catalog["voices"].append(voice_entry)
        self._save_catalog()

        logger.info(f"Added voice: {display_name} ({voice_id})")
        return voice_entry

    def remove_voice(self, voice_id):
        """Remove a voice from the catalog."""
        self._catalog["voices"] = [
            v for v in self._catalog["voices"] if v["id"] != voice_id
        ]
        self._save_catalog()
        logger.info(f"Removed voice: {voice_id}")

    def get_voice(self, voice_id):
        """Get a voice entry by ID. Returns None if not found."""
        for voice in self._catalog["voices"]:
            if voice["id"] == voice_id:
                return voice
        return None

    def list_voices(self):
        """List all voices in the catalog."""
        return self._catalog["voices"]

    def get_voices_by_language(self, language):
        """Get voices that support a specific language."""
        return [
            v for v in self._catalog["voices"]
            if language in v["languages"]
        ]

    def get_voices_by_gender(self, gender):
        """Get voices by gender."""
        return [
            v for v in self._catalog["voices"]
            if v["gender"] == gender
        ]

    def extract_embedding(self, engine, cleaned_wav_path, voice_id):
        """
        Extract a speaker embedding from a cleaned voice sample using XTTS.

        Args:
            engine: VoxarTTSEngine instance (must be loaded)
            cleaned_wav_path: path to cleaned WAV file
            voice_id: voice ID for naming the embedding file

        Returns:
            str — path to saved embedding .pth file
        """
        voice = self.get_voice(voice_id)
        if voice is None:
            raise ValueError(f"Voice '{voice_id}' not found in catalog. Add it first.")

        embedding_filename = os.path.basename(voice["embedding_path"])
        embedding_path = self.embeddings_dir / embedding_filename

        logger.info(f"Extracting embedding for {voice_id} from {cleaned_wav_path}")

        try:
            # XTTS uses the speaker WAV directly for cloning
            # The "embedding" is effectively the speaker WAV reference
            # For XTTS, we store the cleaned sample path as the reference
            import shutil
            shutil.copy2(str(cleaned_wav_path), str(embedding_path))

            # Update catalog with actual path
            voice["embedding_path"] = str(embedding_path)
            self._save_catalog()

            logger.info(f"Embedding saved: {embedding_path}")
            return str(embedding_path)

        except Exception as e:
            logger.error(f"Embedding extraction failed: {e}")
            raise

    def generate_preview(self, engine, voice_id, language, script=None):
        """
        Generate a preview audio clip for a voice.

        Args:
            engine: VoxarTTSEngine or EngineRouter (must be loaded)
            voice_id: voice ID
            language: language code for the preview
            script: preview text (auto-loaded from preview_scripts.json if None)

        Returns:
            str — path to generated preview MP3
        """
        voice = self.get_voice(voice_id)
        if voice is None:
            raise ValueError(f"Voice '{voice_id}' not found in catalog")

        if script is None:
            script = self._get_preview_script(language)

        # Get speaker reference
        embedding_path = voice.get("embedding_path", "")
        if not os.path.exists(embedding_path):
            # Try relative path from voices dir
            embedding_path = str(self.voices_dir / voice.get("embedding_path", ""))
        if not os.path.exists(embedding_path):
            raise FileNotFoundError(
                f"Embedding not found for {voice_id}: {embedding_path}. "
                f"Run extract_embedding() first."
            )

        preview_filename = f"{voice_id}_{voice['name'].lower()}_{language}_preview.wav"
        preview_wav = self.previews_dir / preview_filename

        logger.info(f"Generating preview: {voice_id} / {language}")

        # Generate using engine
        result = engine.generate(
            text=script,
            speaker_wav=embedding_path,
            language=language,
            mode="cinematic",  # Best quality for previews
            output_filename=str(preview_wav),
        )

        # Convert to MP3 for storage efficiency
        mp3_filename = preview_filename.replace(".wav", ".mp3")
        mp3_path = self.previews_dir / mp3_filename

        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_file(result["output_path"])
            audio.export(
                str(mp3_path), format="mp3",
                bitrate="320k",
                tags={"artist": "VOXAR", "title": f"{voice['display_name']} Preview"}
            )
            # Remove temp WAV
            if os.path.exists(result["output_path"]):
                os.remove(result["output_path"])
        except Exception as e:
            logger.warning(f"MP3 conversion failed: {e} — keeping WAV")
            mp3_path = preview_wav

        # Update catalog
        if "preview_urls" not in voice:
            voice["preview_urls"] = {}
        voice["preview_urls"][language] = f"previews/{mp3_path.name}"
        self._save_catalog()

        logger.info(f"Preview saved: {mp3_path}")
        return str(mp3_path)

    def _get_preview_script(self, language):
        """Load preview script for a language from preview_scripts.json."""
        if self.scripts_path.exists():
            with open(self.scripts_path, "r", encoding="utf-8") as f:
                scripts = json.load(f)
            if language in scripts:
                return scripts[language]

        # Fallback defaults
        defaults = {
            "en": "Welcome to VOXAR Studio. Every voice tells a story. Let yours be heard.",
            "hi": "VOXAR Studio mein aapka swagat hai. Har awaaz ek kahani sunati hai.",
            "ta": "VOXAR Studio-ku varavergiren. Ungal kural oru kadhai solkiradhu.",
            "te": "VOXAR Studio ki swaagatham. Mee gonthu oka katha chepthundhi.",
            "bn": "VOXAR Studio-te apnake swagotom. Apnar kontho ekti golpo bole.",
            "mr": "VOXAR Studio madhye aapla swagat aahe. Tumcha awaaz ek katha sangto.",
        }
        return defaults.get(language, defaults["en"])

    def validate_catalog(self):
        """
        Validate the entire voice catalog.

        Checks:
        - All embedding files exist
        - All preview files exist
        - No duplicate IDs
        - All required fields present

        Returns:
            dict with: valid (bool), issues (list), summary (dict)
        """
        issues = []
        voice_ids = set()

        required_fields = ["id", "name", "display_name", "gender", "languages",
                           "primary_language"]

        for voice in self._catalog["voices"]:
            vid = voice.get("id", "UNKNOWN")

            # Duplicate check
            if vid in voice_ids:
                issues.append(f"{vid}: Duplicate voice ID")
            voice_ids.add(vid)

            # Required fields
            for field in required_fields:
                if field not in voice or not voice[field]:
                    issues.append(f"{vid}: Missing required field '{field}'")

            # Embedding file
            emb_path = voice.get("embedding_path", "")
            full_emb = self.voices_dir / emb_path if not os.path.isabs(emb_path) else Path(emb_path)
            if not full_emb.exists():
                issues.append(f"{vid}: Embedding file not found: {emb_path}")

            # Preview files
            for lang, preview_path in voice.get("preview_urls", {}).items():
                full_preview = self.voices_dir / preview_path if not os.path.isabs(preview_path) else Path(preview_path)
                if not full_preview.exists():
                    issues.append(f"{vid}: Preview not found for {lang}: {preview_path}")

        summary = {
            "total_voices": len(self._catalog["voices"]),
            "unique_ids": len(voice_ids),
            "issues_found": len(issues),
            "languages_covered": sorted(set(
                lang for v in self._catalog["voices"]
                for lang in v.get("languages", [])
            )),
            "gender_split": {
                "male": sum(1 for v in self._catalog["voices"] if v.get("gender") == "male"),
                "female": sum(1 for v in self._catalog["voices"] if v.get("gender") == "female"),
            },
            "premium_count": sum(1 for v in self._catalog["voices"] if v.get("is_premium")),
        }

        valid = len(issues) == 0

        if valid:
            logger.info(f"Catalog validation PASSED: {summary['total_voices']} voices")
        else:
            logger.warning(f"Catalog validation FAILED: {len(issues)} issues found")
            for issue in issues:
                logger.warning(f"  - {issue}")

        return {
            "valid": valid,
            "issues": issues,
            "summary": summary,
        }

    def update_voice(self, voice_id, **kwargs):
        """Update fields on an existing voice entry."""
        voice = self.get_voice(voice_id)
        if voice is None:
            raise ValueError(f"Voice '{voice_id}' not found")

        for key, value in kwargs.items():
            if key != "id":  # Don't allow ID change
                voice[key] = value

        self._save_catalog()
        logger.info(f"Updated voice {voice_id}: {list(kwargs.keys())}")
        return voice
