"""
VOXAR Pause Controller
Handles punctuation-based pauses and custom pause markers.
Also processes emphasis markers for expressive TTS.
"""

import re
import logging

logger = logging.getLogger("VoxarPreprocessor")


class PauseController:
    """
    Control pauses and pacing in TTS output.
    
    Two types of pauses:
    1. Punctuation-based: automatic from text punctuation
    2. Custom markers: user inserts [pause:1s] etc.
    
    Pauses are stored as a pause_map and applied AFTER
    audio generation by inserting silence.
    """

    # Punctuation → pause duration in milliseconds
    PUNCTUATION_PAUSES = {
        ".": 500,
        "!": 400,
        "?": 400,
        ",": 200,
        ";": 350,
        ":": 300,
        "—": 400,
        "–": 300,
        "...": 800,
        "…": 800,
        "\n\n": 1000,
        "\n": 500,
    }

    # Custom marker pattern: [pause:0.5s] or [pause:500ms] or [breath]
    MARKER_PATTERN = re.compile(
        r'\[pause:(\d+\.?\d*)\s*(s|ms|sec|seconds?|milliseconds?)?\]',
        re.IGNORECASE
    )
    BREATH_PATTERN = re.compile(r'\[breath\]', re.IGNORECASE)
    BREAK_PATTERN = re.compile(r'\[break\]', re.IGNORECASE)

    def __init__(self):
        pass

    def process(self, text):
        """
        Process text for pause information.
        
        1. Extract custom pause markers
        2. Build pause map (position → duration_ms)
        3. Strip markers from text
        4. Return clean text + pause_map
        
        Returns:
            dict with cleaned_text, pause_map, total_custom_pauses
        """
        pause_map = []  # List of (position, duration_ms, type)

        # Step 1: Extract and remove custom markers
        text, custom_pauses = self._extract_custom_pauses(text)
        pause_map.extend(custom_pauses)

        # Step 2: Build punctuation pause map
        punct_pauses = self._build_punctuation_map(text)

        # Step 3: Clean up text
        cleaned = self._clean_text(text)

        return {
            "cleaned_text": cleaned,
            "original_text": text,
            "pause_map": pause_map,
            "punctuation_pauses": punct_pauses,
            "custom_pause_count": len(custom_pauses),
            "total_custom_pause_ms": sum(p[1] for p in custom_pauses),
        }

    def _extract_custom_pauses(self, text):
        """Extract [pause:Xs] markers and return cleaned text + pause list."""
        pauses = []
        offset = 0

        # Process [pause:Xs] markers
        for match in self.MARKER_PATTERN.finditer(text):
            value = float(match.group(1))
            unit = (match.group(2) or "s").lower()

            # Convert to milliseconds
            if unit.startswith("ms") or unit.startswith("milli"):
                duration_ms = int(value)
            else:
                duration_ms = int(value * 1000)

            # Clamp: 100ms to 5000ms
            duration_ms = max(100, min(5000, duration_ms))

            position = match.start() - offset
            pauses.append((position, duration_ms, "custom"))
            offset += len(match.group(0))

        # Remove markers from text
        text = self.MARKER_PATTERN.sub('', text)

        # Process [breath] markers
        for match in self.BREATH_PATTERN.finditer(text):
            position = match.start()
            pauses.append((position, 300, "breath"))

        text = self.BREATH_PATTERN.sub('', text)

        # Process [break] markers
        for match in self.BREAK_PATTERN.finditer(text):
            position = match.start()
            pauses.append((position, 1000, "break"))

        text = self.BREAK_PATTERN.sub('', text)

        return text, pauses

    def _build_punctuation_map(self, text):
        """Build a map of where punctuation-based pauses should occur."""
        pauses = []

        # Check for ellipsis first (before checking individual periods)
        for match in re.finditer(r'\.{3}|…', text):
            pauses.append({
                "position": match.start(),
                "duration_ms": self.PUNCTUATION_PAUSES.get("...", 800),
                "type": "ellipsis",
                "char": match.group(0),
            })

        # Paragraph breaks
        for match in re.finditer(r'\n\n+', text):
            pauses.append({
                "position": match.start(),
                "duration_ms": self.PUNCTUATION_PAUSES["\n\n"],
                "type": "paragraph",
                "char": "\\n\\n",
            })

        # Sentence-ending punctuation
        for match in re.finditer(r'[.!?](?:\s|$)', text):
            char = match.group(0)[0]
            pauses.append({
                "position": match.start(),
                "duration_ms": self.PUNCTUATION_PAUSES.get(char, 400),
                "type": "sentence_end",
                "char": char,
            })

        # Mid-sentence pauses
        for match in re.finditer(r'[,;:]', text):
            char = match.group(0)
            pauses.append({
                "position": match.start(),
                "duration_ms": self.PUNCTUATION_PAUSES.get(char, 200),
                "type": "mid_sentence",
                "char": char,
            })

        # Dashes
        for match in re.finditer(r'[—–]', text):
            char = match.group(0)
            pauses.append({
                "position": match.start(),
                "duration_ms": self.PUNCTUATION_PAUSES.get(char, 350),
                "type": "dash",
                "char": char,
            })

        return pauses

    def _clean_text(self, text):
        """Clean text after marker extraction."""
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        # Remove spaces before punctuation
        text = re.sub(r'\s+([.!?,;:])', r'\1', text)
        return text.strip()

    def estimate_total_duration(self, text, chars_per_second=15):
        """
        Estimate total audio duration including pauses.
        
        Args:
            text: processed text
            chars_per_second: average TTS speed
            
        Returns:
            estimated duration in seconds
        """
        result = self.process(text)
        
        # Speech duration
        clean_chars = len(result["cleaned_text"])
        speech_duration = clean_chars / chars_per_second
        
        # Custom pause duration
        custom_pause = result["total_custom_pause_ms"] / 1000.0
        
        # Punctuation pause estimate
        punct_pause = sum(p["duration_ms"] for p in result["punctuation_pauses"]) / 1000.0
        
        return round(speech_duration + custom_pause + punct_pause * 0.5, 1)  # 50% of punct pauses (XTTS handles some)


class EmphasisHandler:
    """
    Process emphasis markers in text.
    
    Markers:
      *word*   → slight emphasis
      **word** → strong emphasis  
      _word_   → softer delivery
      ALLCAPS  → emphatic delivery
    
    These are stripped from text before TTS
    and stored as emphasis_map for post-processing.
    """

    def process(self, text):
        """
        Extract emphasis markers from text.
        
        Returns:
            dict with cleaned_text, emphasis_map
        """
        emphasis_map = []

        # Strong emphasis: **word**
        for match in re.finditer(r'\*\*(.+?)\*\*', text):
            emphasis_map.append({
                "word": match.group(1),
                "type": "strong",
                "position": match.start(),
            })

        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)

        # Slight emphasis: *word*
        for match in re.finditer(r'\*(.+?)\*', text):
            emphasis_map.append({
                "word": match.group(1),
                "type": "slight",
                "position": match.start(),
            })

        text = re.sub(r'\*(.+?)\*', r'\1', text)

        # Soft/whisper: _word_
        for match in re.finditer(r'_(.+?)_', text):
            emphasis_map.append({
                "word": match.group(1),
                "type": "soft",
                "position": match.start(),
            })

        text = re.sub(r'(?<!\w)_(.+?)_(?!\w)', r'\1', text)

        # ALLCAPS detection (3+ letter words in ALL CAPS)
        for match in re.finditer(r'\b([A-Z]{3,})\b', text):
            word = match.group(1)
            # Skip known acronyms
            known_acronyms = {"VOXAR", "XTTS", "AI", "API", "URL", "CEO",
                              "IIT", "BJP", "ISRO", "PM", "CM", "UPI"}
            if word not in known_acronyms:
                emphasis_map.append({
                    "word": word,
                    "type": "emphatic",
                    "position": match.start(),
                })

        return {
            "cleaned_text": text,
            "emphasis_map": emphasis_map,
            "emphasis_count": len(emphasis_map),
        }