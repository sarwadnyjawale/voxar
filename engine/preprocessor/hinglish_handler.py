"""
VOXAR Hinglish Handler
Detects Hinglish (Roman Hindi), auto-transliterates to Devanagari,
and handles code-mixed Hindi-English text.

THIS IS VOXAR'S COMPETITIVE ADVANTAGE.
ElevenLabs can't do this.
"""

import re
import json
import os
import logging

logger = logging.getLogger("VoxarPreprocessor")


class HinglishHandler:
    """
    Detect and process Hinglish (Romanized Hindi) text.
    
    Pipeline:
      1. Detect if text contains Hinglish words
      2. Identify which words are Hindi vs English
      3. Transliterate Hindi words to Devanagari
      4. Return processed text with language tags
    """

    # Common Romanized Hindi words (500+ most used)
    HINGLISH_WORDS = {
        # Greetings
        "namaste": "नमस्ते", "namaskar": "नमस्कार",
        "pranam": "प्रणाम", "dhanyawad": "धन्यवाद",
        "dhanyavaad": "धन्यवाद", "shukriya": "शुक्रिया",
        "alvida": "अलविदा", "swagat": "स्वागत",

        # Common words
        "acha": "अच्छा", "accha": "अच्छा", "achha": "अच्छा",
        "aaj": "आज", "kal": "कल", "abhi": "अभी",
        "bahut": "बहुत", "bohot": "बहुत",
        "bhai": "भाई", "bhaiya": "भैया",
        "didi": "दीदी", "ji": "जी",
        "haan": "हाँ", "ha": "हा", "nahi": "नहीं", "nai": "नई",
        "kya": "क्या", "kaise": "कैसे", "kaisa": "कैसा",
        "kyun": "क्यों", "kyon": "क्यों", "kyunki": "क्योंकि",
        "lekin": "लेकिन", "magar": "मगर", "par": "पर",
        "aur": "और", "ya": "या", "toh": "तो", "to": "तो",
        "hai": "है", "hain": "हैं", "tha": "था", "thi": "थी",
        "ho": "हो", "hoga": "होगा", "hogi": "होगी",
        "ka": "का", "ki": "की", "ke": "के",
        "ko": "को", "se": "से", "me": "में", "mein": "में",
        "pe": "पे", "par": "पर", "tak": "तक",
        "yeh": "यह", "ye": "ये", "woh": "वो", "wo": "वो",
        "kuch": "कुछ", "sab": "सब", "sabhi": "सभी",
        "log": "लोग", "logo": "लोगों",
        "kaam": "काम", "kaam": "काम",
        "samay": "समय", "waqt": "वक्त",
        "jagah": "जगह", "ghar": "घर",
        "dost": "दोस्त", "doston": "दोस्तों",
        "zindagi": "ज़िंदगी", "duniya": "दुनिया",

        # Verbs
        "karna": "करना", "karo": "करो", "kiya": "किया",
        "kar": "कर", "karte": "करते", "karti": "करती",
        "bolna": "बोलना", "bolo": "बोलो", "bola": "बोला",
        "jana": "जाना", "jao": "जाओ", "gaya": "गया",
        "aana": "आना", "aao": "आओ", "aaya": "आया",
        "dekhna": "देखना", "dekho": "देखो", "dekha": "देखा",
        "sunna": "सुनना", "suno": "सुनो", "suna": "सुना",
        "likhna": "लिखना", "likho": "लिखो", "likha": "लिखा",
        "padhna": "पढ़ना", "padho": "पढ़ो", "padha": "पढ़ा",
        "khana": "खाना", "khao": "खाओ", "khaya": "खाया",
        "peena": "पीना", "piyo": "पियो", "piya": "पिया",
        "sochna": "सोचना", "socho": "सोचो", "socha": "सोचा",
        "samajhna": "समझना", "samjho": "समझो",
        "batana": "बताना", "batao": "बताओ", "bataya": "बताया",
        "milna": "मिलना", "milo": "मिलो", "mila": "मिला",
        "rakhna": "रखना", "rakho": "रखो", "rakha": "रखा",
        "dena": "देना", "do": "दो", "diya": "दिया",
        "lena": "लेना", "lo": "लो", "liya": "लिया",
        "chahna": "चाहना", "chahiye": "चाहिए",
        "sakna": "सकना", "sakta": "सकता", "sakti": "सकती",
        "hona": "होना", "hua": "हुआ", "hui": "हुई",
        "raha": "रहा", "rahi": "रही", "rahe": "रहे",
        "chalna": "चलना", "chalo": "चलो", "chala": "चला",
        "rukna": "रुकना", "ruko": "रुको",
        "bhejna": "भेजना", "bhejo": "भेजो",

        # Adjectives
        "achha": "अच्छा", "bura": "बुरा",
        "bada": "बड़ा", "bara": "बड़ा",
        "chhota": "छोटा", "chota": "छोटा",
        "naya": "नया", "nayi": "नयी", "naye": "नये",
        "purana": "पुराना", "puraani": "पुरानी",
        "sundar": "सुंदर", "khoobsurat": "खूबसूरत",
        "mazedaar": "मज़ेदार", "behtareen": "बेहतरीन",
        "zabardast": "ज़बरदस्त", "shaandaar": "शानदार",
        "sasta": "सस्ता", "mehenga": "महंगा",
        "asaan": "आसान", "mushkil": "मुश्किल",
        "zaruri": "ज़रूरी", "important": "important",
        "sahi": "सही", "galat": "गलत",
        "pehla": "पहला", "doosra": "दूसरा",
        "akhiri": "आखिरी", "aakhri": "आखिरी",

        # Nouns
        "desh": "देश", "shahar": "शहर",
        "gaon": "गाँव", "sadak": "सड़क",
        "paisa": "पैसा", "paise": "पैसे",
        "khushi": "खुशी", "dukh": "दुख",
        "pyaar": "प्यार", "mohabbat": "मोहब्बत",
        "sapna": "सपना", "sapne": "सपने",
        "awaaz": "आवाज़", "tasveer": "तस्वीर",
        "kahani": "कहानी", "gaana": "गाना",
        "padhai": "पढ़ाई", "naukri": "नौकरी",
        "parivaar": "परिवार", "bachche": "बच्चे",
        "insaan": "इंसान",

        # Time
        "subah": "सुबह", "dopahar": "दोपहर",
        "shaam": "शाम", "raat": "रात",
        "parson": "परसों", "hafte": "हफ्ते",
        "mahina": "महीना", "saal": "साल",

        # Numbers (spoken)
        "ek": "एक", "do": "दो", "teen": "तीन",
        "chaar": "चार", "paanch": "पाँच",
        "chhah": "छह", "saat": "सात",
        "aath": "आठ", "nau": "नौ", "das": "दस",

        # Particles and connectors
        "wala": "वाला", "wali": "वाली", "wale": "वाले",
        "vaala": "वाला", "vaali": "वाली",
        "ke liye": "के लिए",
        "ki taraf": "की तरफ",
        "ke baad": "के बाद",
        "ke pehle": "के पहले",
        "ke saath": "के साथ",
        "ke baare": "के बारे",

        # Modern Hinglish
        "yaar": "यार", "bro": "bro",
        "matlab": "मतलब", "bilkul": "बिल्कुल",
        "bas": "बस", "pakka": "पक्का",
        "sach": "सच", "jhooth": "झूठ",
        "bindaas": "बिंदास", "mast": "मस्त",
        "fatafat": "फटाफट", "jaldi": "जल्दी",
        "thoda": "थोड़ा", "thodi": "थोड़ी",
        "zyada": "ज़्यादा", "kam": "कम",
        "sirf": "सिर्फ", "sach": "सच",
        "waise": "वैसे", "isliye": "इसलिए",
        "actually": "actually", "basically": "basically",
    }

    # English words commonly used in Hinglish (keep as-is)
    ENGLISH_IN_HINGLISH = {
        "phone", "mobile", "computer", "laptop", "internet",
        "video", "audio", "camera", "photo", "selfie",
        "office", "meeting", "boss", "team", "project",
        "school", "college", "university", "exam", "class",
        "doctor", "hospital", "medicine", "report",
        "train", "bus", "car", "bike", "flight",
        "hotel", "restaurant", "menu", "bill",
        "market", "shop", "mall", "online", "order",
        "cricket", "football", "match", "player",
        "movie", "song", "show", "channel",
        "WhatsApp", "Instagram", "YouTube", "Google",
        "Facebook", "Twitter",
        "sorry", "thank", "thanks", "please", "welcome",
        "ok", "okay", "yes", "no", "hello", "hi", "bye",
        "problem", "solution", "reason", "result",
        "amazing", "awesome", "nice", "good", "bad",
        "sure", "done", "ready", "start", "stop",
        "update", "download", "upload", "share", "post",
        "subscribe", "like", "comment", "follow",
        "product", "service", "quality", "premium",
        "feature", "option", "setting", "mode",
        "voice", "studio", "engine", "platform",
    }

    def __init__(self):
        self._load_custom_dictionary()

    def _load_custom_dictionary(self):
        """Load custom Hinglish dictionary if available."""
        dict_path = os.path.join(
            os.path.dirname(__file__), "dictionaries", "hinglish_words.json"
        )
        if os.path.exists(dict_path):
            try:
                with open(dict_path, 'r', encoding='utf-8') as f:
                    custom = json.load(f)
                    self.HINGLISH_WORDS.update(custom)
                    logger.info(f"Loaded {len(custom)} custom Hinglish words")
            except Exception as e:
                logger.warning(f"Failed to load hinglish dictionary: {e}")

    def detect_language(self, text):
        """
        Detect language of text.
        Returns: "en", "hi", "hinglish", or "devanagari"
        """
        # Check for Devanagari script
        devanagari_chars = len(re.findall(r'[\u0900-\u097F]', text))
        total_alpha = len(re.findall(r'[a-zA-Z\u0900-\u097F]', text))

        if total_alpha == 0:
            return "en"

        devanagari_ratio = devanagari_chars / max(total_alpha, 1)

        if devanagari_ratio > 0.5:
            return "devanagari"

        # Check for Hinglish words
        words = text.lower().split()
        hindi_count = 0
        english_count = 0

        for word in words:
            clean = re.sub(r'[^\w]', '', word)
            if not clean:
                continue

            if clean in self.HINGLISH_WORDS:
                hindi_count += 1
            elif clean in self.ENGLISH_IN_HINGLISH:
                english_count += 1
            elif self._looks_hindi(clean):
                hindi_count += 1
            else:
                english_count += 1

        total = hindi_count + english_count
        if total == 0:
            return "en"

        hindi_ratio = hindi_count / total

        if hindi_ratio > 0.6:
            return "hinglish"  # Mostly Hindi words in Latin script
        elif hindi_ratio > 0.2:
            return "hinglish"  # Mixed
        else:
            return "en"

    def _looks_hindi(self, word):
        """Heuristic: does this Latin word look like a Hindi word?"""
        hindi_patterns = [
            r'.*aa$',      # padaa, gaya
            r'.*ii$',      # ladkii
            r'.*oo$',      # zaroor
            r'.*ey$',      # parey
            r'.*ai$',      # hai, chai
            r'.*ou$',      # mou
            r'^ch[aeiou]', # chahiye, chalo
            r'^dh[aeiou]', # dhan, dhyan
            r'^bh[aeiou]', # bhai, bharat
            r'^kh[aeiou]', # khana, khelna
            r'^gh[aeiou]', # ghar
            r'^ph[aeiou]', # phal
            r'^th[aeiou]', # thanda (but conflicts with English "the")
            r'^sh[aeiou]', # shaadi
            r'.*wala$',    # chaiwala
            r'.*wali$',    # sabziwali
        ]

        for pattern in hindi_patterns:
            if re.match(pattern, word.lower()):
                return True

        return False

    def transliterate_to_devanagari(self, text):
        """
        Convert Romanized Hindi text to Devanagari script.
        Uses dictionary lookup first, then indic-transliteration library.
        """
        words = text.split()
        result_words = []

        for word in words:
            # Preserve punctuation
            prefix = ""
            suffix = ""
            clean = word

            # Extract leading punctuation
            while clean and not clean[0].isalnum():
                prefix += clean[0]
                clean = clean[1:]

            # Extract trailing punctuation
            while clean and not clean[-1].isalnum():
                suffix = clean[-1] + suffix
                clean = clean[:-1]

            if not clean:
                result_words.append(word)
                continue

            lower = clean.lower()

            # Step 1: Check dictionary
            if lower in self.HINGLISH_WORDS:
                devanagari = self.HINGLISH_WORDS[lower]
                result_words.append(f"{prefix}{devanagari}{suffix}")
                continue

            # Step 2: Check if it's an English word (keep as-is)
            if lower in self.ENGLISH_IN_HINGLISH:
                result_words.append(word)
                continue

            # No ITRANS fallback — produces garbage (see ERRORS_LOG.md)

            # Step 3: Keep as-is (likely English)
            result_words.append(word)

        return " ".join(result_words)

    def process(self, text, target_script="devanagari"):
        """
        Process Hinglish text for TTS.

        If text is Hinglish → transliterate Hindi words to Devanagari
        If text is already Devanagari → pass through
        If text is English → pass through

        Args:
            text: input text
            target_script: "devanagari" (for XTTS hi) or "roman" (keep as-is)

        Returns:
            dict with processed text, detected language, segments
        """
        detected = self.detect_language(text)

        result = {
            "original": text,
            "detected_language": detected,
            "processed_text": text,
            "segments": [],
            "transliterated": False,
        }

        if detected == "devanagari":
            # Already in Devanagari — pass through
            result["processed_text"] = text
            result["recommended_lang"] = "hi"

        elif detected == "hinglish" and target_script == "devanagari":
            # Transliterate to Devanagari
            result["processed_text"] = self.transliterate_to_devanagari(text)
            result["transliterated"] = True
            result["recommended_lang"] = "hi"

        elif detected == "en":
            # Pure English — pass through
            result["processed_text"] = text
            result["recommended_lang"] = "en"

        else:
            result["processed_text"] = text
            result["recommended_lang"] = "en"

        return result


class LanguageDetector:
    """
    Detect script and language of text.
    Supports: Latin (English), Devanagari (Hindi/Marathi),
    Tamil, Telugu, Bengali scripts.
    """

    SCRIPT_RANGES = {
        "devanagari": (0x0900, 0x097F),   # Hindi, Marathi, Sanskrit
        "bengali": (0x0980, 0x09FF),       # Bengali, Assamese
        "tamil": (0x0B80, 0x0BFF),         # Tamil
        "telugu": (0x0C00, 0x0C7F),        # Telugu
        "kannada": (0x0C80, 0x0CFF),       # Kannada
        "malayalam": (0x0D00, 0x0D7F),     # Malayalam
        "gujarati": (0x0A80, 0x0AFF),      # Gujarati
        "gurmukhi": (0x0A00, 0x0A7F),      # Punjabi
        "oriya": (0x0B00, 0x0B7F),         # Odia
    }

    SCRIPT_TO_LANG = {
        "devanagari": "hi",
        "bengali": "bn",
        "tamil": "ta",
        "telugu": "te",
        "kannada": "kn",
        "malayalam": "ml",
        "gujarati": "gu",
        "gurmukhi": "pa",
        "oriya": "or",
        "latin": "en",
    }

    def detect(self, text):
        """
        Detect script and language of text.

        Returns:
            dict with script, language, confidence
        """
        if not text or not text.strip():
            return {"script": "latin", "language": "en", "confidence": 0.0}

        script_counts = {}

        for char in text:
            code = ord(char)

            # Check each script range
            for script_name, (start, end) in self.SCRIPT_RANGES.items():
                if start <= code <= end:
                    script_counts[script_name] = script_counts.get(script_name, 0) + 1
                    break
            else:
                if char.isalpha() and ord(char) < 0x0250:
                    script_counts["latin"] = script_counts.get("latin", 0) + 1

        if not script_counts:
            return {"script": "latin", "language": "en", "confidence": 0.0}

        # Find dominant script
        total = sum(script_counts.values())
        dominant = max(script_counts, key=script_counts.get)
        confidence = script_counts[dominant] / max(total, 1)

        language = self.SCRIPT_TO_LANG.get(dominant, "en")

        return {
            "script": dominant,
            "language": language,
            "confidence": round(confidence, 2),
            "all_scripts": {k: round(v / total, 2) for k, v in script_counts.items()},
        }