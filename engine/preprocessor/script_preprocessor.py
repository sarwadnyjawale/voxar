"""
VOXAR Script Preprocessor v1.0
Master pipeline that processes any text before sending to TTS.

Processing Order (MATTERS!):
  1. Clean whitespace/formatting
  2. Detect language/script
  3. Extract pause markers (before any text changes)
  4. Extract emphasis markers
  5. Handle Hinglish → Devanagari (if applicable)
  6. Process URLs, emails (before abbreviation expansion)
  7. Process phone numbers
  8. Process dates and times (before number expansion)
  9. Expand abbreviations
  10. Expand currency
  11. Expand numbers (LAST — after everything else)
  12. Apply pronunciation dictionary
  13. Final cleanup
  14. Split into chunks (if long)
"""

import re
import os
import json
import logging

logger = logging.getLogger("VoxarPreprocessor")


class ProcessedScript:
    """Result of script preprocessing."""

    def __init__(self):
        self.original_text = ""
        self.processed_text = ""
        self.chunks = []
        self.language = "en"
        self.detected_language = "en"
        self.script_type = "latin"
        self.pause_map = []
        self.emphasis_map = []
        self.character_count = 0
        self.transliterated = False
        self.processing_notes = []

    def to_dict(self):
        return {
            "original_text": self.original_text,
            "processed_text": self.processed_text,
            "chunks": self.chunks,
            "language": self.language,
            "detected_language": self.detected_language,
            "script_type": self.script_type,
            "pause_map": self.pause_map,
            "emphasis_map": self.emphasis_map,
            "character_count": self.character_count,
            "transliterated": self.transliterated,
            "processing_notes": self.processing_notes,
        }


class ScriptPreprocessor:
    """
    Master text preprocessing pipeline for VOXAR TTS.
    Handles every possible text input before sending to XTTS.
    """

    def __init__(self, language="auto"):
        self.default_language = language
        self.pronunciation_dict = {}

        # Import all sub-modules
        from engine.preprocessor.number_handler import NumberHandler
        from engine.preprocessor.currency_handler import CurrencyHandler
        from engine.preprocessor.abbreviation_handler import AbbreviationHandler
        from engine.preprocessor.special_text_handler import SpecialTextHandler
        from engine.preprocessor.hinglish_handler import HinglishHandler, LanguageDetector
        from engine.preprocessor.pause_controller import PauseController, EmphasisHandler

        self.number_handler_en = NumberHandler(language="en")
        self.number_handler_hi = NumberHandler(language="hi")
        self.currency_handler_en = CurrencyHandler(language="en")
        self.currency_handler_hi = CurrencyHandler(language="hi")
        self.abbreviation_handler = AbbreviationHandler()
        self.special_text_handler = SpecialTextHandler()
        self.hinglish_handler = HinglishHandler()
        self.language_detector = LanguageDetector()
        self.pause_controller = PauseController()
        self.emphasis_handler = EmphasisHandler()

        # Load pronunciation dictionary
        self._load_pronunciation_dict()

        logger.info("ScriptPreprocessor initialized")

    def _load_pronunciation_dict(self):
        """Load custom pronunciation dictionaries."""
        dict_dir = os.path.join(os.path.dirname(__file__), "dictionaries")

        for fname in ["pronunciations_en.json", "pronunciations_hi.json"]:
            path = os.path.join(dict_dir, fname)
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        self.pronunciation_dict.update(data)
                        logger.info(f"Loaded {len(data)} pronunciations from {fname}")
                except Exception as e:
                    logger.warning(f"Failed to load {fname}: {e}")

    def process(self, raw_text, language="auto", max_chunk_size=350):
        """
        Complete text preprocessing pipeline.

        Args:
            raw_text: any text input from user
            language: "auto", "en", "hi", or any language code
            max_chunk_size: max characters per chunk for TTS

        Returns:
            ProcessedScript object
        """
        result = ProcessedScript()
        result.original_text = raw_text

        if not raw_text or not raw_text.strip():
            result.processed_text = ""
            result.chunks = []
            result.processing_notes.append("Empty input")
            return result

        text = raw_text

        # ── Step 1: Clean whitespace/formatting ──
        text = self._clean_whitespace(text)

        # ── Step 2: Detect language/script ──
        if language == "auto":
            script_info = self.language_detector.detect(text)
            hinglish_detect = self.hinglish_handler.detect_language(text)

            result.script_type = script_info["script"]

            if script_info["script"] != "latin":
                # Non-Latin script detected
                result.detected_language = script_info["language"]
                result.language = script_info["language"]
                result.processing_notes.append(
                    f"Script detected: {script_info['script']} → lang={script_info['language']}"
                )
            elif hinglish_detect == "hinglish":
                result.detected_language = "hinglish"
                result.language = "hi"
                result.processing_notes.append("Hinglish detected → will transliterate to Devanagari")
            else:
                result.detected_language = "en"
                result.language = "en"
        else:
            result.language = language
            result.detected_language = language

        lang = result.language

        # ── Step 3: Extract pause markers ──
        pause_result = self.pause_controller.process(text)
        text = pause_result["cleaned_text"]
        result.pause_map = pause_result["pause_map"]

        # ── Step 4: Extract emphasis markers ──
        emph_result = self.emphasis_handler.process(text)
        text = emph_result["cleaned_text"]
        result.emphasis_map = emph_result["emphasis_map"]

        # ── Step 5: Handle Hinglish ──
        if result.detected_language == "hinglish":
            hinglish_result = self._process_hinglish(text)
            text = hinglish_result["processed_text"]
            result.transliterated = hinglish_result["transliterated"]
            if result.transliterated:
                result.processing_notes.append("Hinglish transliterated to Devanagari")

        # ── Step 6: Process URLs and emails (BEFORE abbreviations) ──
        # Mark URLs/emails to protect from abbreviation expansion
        text, protected = self._protect_special_patterns(text)

        # ── Step 7: Process phone numbers ──
        text = self.special_text_handler._process_phone_numbers(text, lang)

        # ── Step 8: Process dates and times (BEFORE numbers) ──
        text = self.special_text_handler._process_dates(text, lang)
        text = self.special_text_handler._process_times(text, lang)

        # ── Step 9: Expand abbreviations ──
        if lang == "en" or result.detected_language == "en":
            text = self.abbreviation_handler.process(text)

        # Restore protected patterns
        text = self._restore_protected(text, protected)

        # Now process URLs/emails to spoken form
        text = self.special_text_handler._process_urls(text)
        text = self.special_text_handler._process_emails(text)

        # ── Step 10: Expand currency ──
        if lang == "hi":
            text = self.currency_handler_hi.process(text, "hi")
        else:
            text = self.currency_handler_en.process(text, "en")

        # ── Step 11: Expand numbers (LAST) ──
        if lang == "hi" and not result.transliterated:
            text = self.number_handler_hi.process(text, "hi")
        elif lang == "en":
            text = self.number_handler_en.process(text, "en")

        # ── Step 12: Pronunciation dictionary ──
        text = self._apply_pronunciation_dict(text)

        # ── Step 13: Process remaining special chars ──
        text = self.special_text_handler._process_math_symbols(text)
        text = self.special_text_handler._remove_emojis(text)
        text = self.special_text_handler._clean_special_chars(text)

        # ── Step 14: Final cleanup ──
        text = self._final_cleanup(text)

        result.processed_text = text
        result.character_count = len(text)

        # ── Step 15: Split into chunks if needed ──
        if lang == "hi":
            chunk_size = min(max_chunk_size, 250)  # XTTS Hindi limit
        else:
            chunk_size = max_chunk_size

        if len(text) > chunk_size:
            from engine.text_chunker import TextChunker
            chunker = TextChunker(max_chunk_size=chunk_size)
            result.chunks = chunker.split_text(text)
            result.processing_notes.append(f"Split into {len(result.chunks)} chunks (max {chunk_size} chars)")
        else:
            result.chunks = [text]

        return result

    def _clean_whitespace(self, text):
        """Clean and normalize whitespace."""
        # Normalize line endings
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        # Collapse multiple spaces
        text = re.sub(r'[ \t]+', ' ', text)
        # Collapse 3+ newlines to 2
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Strip leading/trailing
        text = text.strip()
        return text

    def _process_hinglish(self, text):
        """Process Hinglish with improved transliteration (dictionary-only)."""
        words = text.split()
        result_words = []
        transliterated = False

        for word in words:
            prefix = ""
            suffix = ""
            clean = word

            while clean and not clean[0].isalnum():
                prefix += clean[0]
                clean = clean[1:]
            while clean and not clean[-1].isalnum():
                suffix = clean[-1] + suffix
                clean = clean[:-1]

            if not clean:
                result_words.append(word)
                continue

            lower = clean.lower()

            # Check dictionary ONLY (no ITRANS fallback — it produces garbage)
            if lower in self.hinglish_handler.HINGLISH_WORDS:
                devanagari = self.hinglish_handler.HINGLISH_WORDS[lower]
                result_words.append(f"{prefix}{devanagari}{suffix}")
                transliterated = True
            else:
                # Keep as-is (English word or unknown)
                result_words.append(word)

        return {
            "processed_text": " ".join(result_words),
            "transliterated": transliterated,
        }

    def _protect_special_patterns(self, text):
        """Temporarily replace URLs/emails to protect from abbreviation expansion.
        Note: counter and protected are per-call locals — thread-safe."""
        protected = {}
        counter = 0

        # Protect URLs
        def protect_url(match):
            nonlocal counter
            key = f"__URL{counter}__"
            protected[key] = match.group(0)
            counter += 1
            return key

        text = re.sub(r'https?://[^\s<>"\']+', protect_url, text)
        text = re.sub(r'www\.[^\s<>"\']+', protect_url, text)

        # Protect emails
        def protect_email(match):
            nonlocal counter
            key = f"__EMAIL{counter}__"
            protected[key] = match.group(0)
            counter += 1
            return key

        text = re.sub(r'[\w.+-]+@[\w.-]+\.\w+', protect_email, text)

        return text, protected

    def _restore_protected(self, text, protected):
        """Restore protected URLs/emails."""
        for key, value in protected.items():
            text = text.replace(key, value)
        return text

    def _apply_pronunciation_dict(self, text):
        """Apply custom pronunciation rules."""
        for word, pronunciation in self.pronunciation_dict.items():
            # Case-insensitive word boundary replacement
            pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
            text = pattern.sub(pronunciation, text)
        return text

    def _final_cleanup(self, text):
        """Final text cleanup before TTS."""
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        # Remove space before punctuation
        text = re.sub(r'\s+([.!?,;:])', r'\1', text)
        # Ensure space after punctuation
        text = re.sub(r'([.!?,;:])([A-Za-z\u0900-\u097F])', r'\1 \2', text)
        # Remove empty parentheses/brackets
        text = re.sub(r'\(\s*\)', '', text)
        text = re.sub(r'\[\s*\]', '', text)
        # Clean up multiple punctuation
        text = re.sub(r'([.!?]){2,}', r'\1', text)
        return text.strip()

    def add_pronunciation(self, word, phonetic):
        """Add custom pronunciation rule."""
        self.pronunciation_dict[word] = phonetic
        logger.info(f"Added pronunciation: '{word}' → '{phonetic}'")