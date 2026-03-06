"""
VOXAR Abbreviation Handler
Expands abbreviations, acronyms, titles, and special text patterns.
"""

import re
import json
import os
import logging

logger = logging.getLogger("VoxarPreprocessor")


class AbbreviationHandler:
    """Expand abbreviations and acronyms to spoken forms."""

    # Common English abbreviations
    ABBREVIATIONS = {
        # Titles
        "Dr.": "Doctor", "Dr": "Doctor",
        "Mr.": "Mister", "Mr": "Mister",
        "Mrs.": "Missus", "Mrs": "Missus",
        "Ms.": "Miss", "Ms": "Miss",
        "Prof.": "Professor", "Prof": "Professor",
        "Sr.": "Senior", "Sr": "Senior",
        "Jr.": "Junior", "Jr": "Junior",
        "St.": "Saint",
        "Rev.": "Reverend",
        "Sgt.": "Sergeant",
        "Capt.": "Captain",
        "Gen.": "General",
        "Lt.": "Lieutenant",
        "Col.": "Colonel",

        # Common words
        "etc.": "etcetera", "etc": "etcetera",
        "vs.": "versus", "vs": "versus",
        "govt.": "government", "govt": "government",
        "dept.": "department", "dept": "department",
        "approx.": "approximately", "approx": "approximately",
        "no.": "number",
        "nos.": "numbers",
        "inc.": "incorporated",
        "corp.": "corporation",
        "ltd.": "limited", "ltd": "limited",
        "pvt.": "private", "pvt": "private",
        "mgmt.": "management", "mgmt": "management",
        "info.": "information",
        "tech.": "technology",
        "max.": "maximum",
        "min.": "minimum",
        "avg.": "average",
        "temp.": "temperature",
        "est.": "established",
        "fig.": "figure",
        "vol.": "volume",
        "ref.": "reference",
        "req.": "required",
        "qty.": "quantity",

        # Address
        "Ave.": "Avenue",
        "Blvd.": "Boulevard",
        "Rd.": "Road",
        "Ln.": "Lane",
        "Apt.": "Apartment",

        # Time (dotted forms only — bare "am"/"pm" collide with English words;
        # time expressions like "3:30 PM" are handled by SpecialTextHandler._process_times())
        "a.m.": "A M",
        "p.m.": "P M",
        "hrs": "hours",

        # Measurements
        "km": "kilometers",
        "kg": "kilograms",
        "mg": "milligrams",
        "cm": "centimeters",
        "mm": "millimeters",
        "ft": "feet",
        "sq.": "square",
        "sq": "square",
    }

    # Indian-specific abbreviations
    INDIAN_ABBREVIATIONS = {
        # Political
        "PM": "Prime Minister",
        "CM": "Chief Minister",
        "MLA": "M L A",
        "MP": "M P",
        "MLC": "M L C",
        "IAS": "I A S",
        "IPS": "I P S",
        "IFS": "I F S",

        # Organizations
        "BJP": "B J P",
        "AAP": "A A P",
        "RSS": "R S S",
        "RBI": "R B I",
        "SEBI": "SEBI",
        "ISRO": "ISRO",
        "DRDO": "DRDO",
        "BCCI": "B C C I",
        "UPI": "U P I",
        "GST": "G S T",
        "NDA": "N D A",
        "UPA": "U P A",

        # Education
        "IIT": "I I T",
        "IIM": "I I M",
        "NIT": "N I T",
        "AIIMS": "AIIMS",
        "CBSE": "C B S E",
        "ICSE": "I C S E",
        "JEE": "J E E",
        "NEET": "NEET",
        "CAT": "C A T",
        "UPSC": "U P S C",

        # Technology
        "AI": "A I",
        "ML": "M L",
        "API": "A P I",
        "URL": "U R L",
        "WiFi": "why fye",
        "SaaS": "sass",
        "IoT": "I o T",
        "UI": "U I",
        "UX": "U X",
        "IT": "I T",
        "CEO": "C E O",
        "CTO": "C T O",
        "CFO": "C F O",
        "COO": "C O O",
        "HR": "H R",

        # General Indian
        "PIN": "pin",
        "PAN": "pan",
        "EMI": "E M I",
        "SIP": "S I P",
        "FD": "F D",
        "RD": "R D",
        "ATM": "A T M",
        "OTP": "O T P",
        "KYC": "K Y C",
        "RTI": "R T I",
        "PIL": "P I L",
        "FIR": "F I R",
        "NCR": "N C R",
    }

    # Words that LOOK like acronyms but should be spoken as words
    SPOKEN_AS_WORDS = {
        "ISRO", "DRDO", "AIIMS", "NEET", "SaaS", "PIN", "PAN",
        "NASA", "NATO", "UNESCO", "UNICEF", "LASER", "RADAR",
        "SCUBA", "AIDS", "OPEC", "ASAP",
    }

    def __init__(self):
        self.custom_dict = {}
        self._load_custom_dictionaries()

    def _load_custom_dictionaries(self):
        """Load custom abbreviation dictionaries from JSON files."""
        dict_dir = os.path.join(os.path.dirname(__file__), "dictionaries")
        if not os.path.exists(dict_dir):
            return

        for json_file in ["abbreviations.json", "indian_abbreviations.json"]:
            path = os.path.join(dict_dir, json_file)
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        self.custom_dict.update(data)
                        logger.info(f"  Loaded {len(data)} custom abbreviations from {json_file}")
                except Exception as e:
                    logger.warning(f"  Failed to load {json_file}: {e}")

    def process(self, text):
        """Expand all abbreviations in text."""
        # Process in specific order
        text = self._expand_titles(text)
        text = self._expand_abbreviations(text)
        text = self._expand_acronyms(text)

        return text

    def _expand_titles(self, text):
        """Expand titles (Dr., Mr., Mrs., etc.) — context-aware."""
        titles = {
            r'\bDr\.\s': 'Doctor ',
            r'\bMr\.\s': 'Mister ',
            r'\bMrs\.\s': 'Missus ',
            r'\bMs\.\s': 'Miss ',
            r'\bProf\.\s': 'Professor ',
            r'\bSr\.\s': 'Senior ',
            r'\bJr\.\s': 'Junior ',
            r'\bSt\.\s': 'Saint ',
            r'\bGen\.\s': 'General ',
            r'\bCapt\.\s': 'Captain ',
            r'\bLt\.\s': 'Lieutenant ',
            r'\bCol\.\s': 'Colonel ',
            r'\bSgt\.\s': 'Sergeant ',
            r'\bRev\.\s': 'Reverend ',
        }

        for pattern, replacement in titles.items():
            text = re.sub(pattern, replacement, text)

        return text

    def _expand_abbreviations(self, text):
        """Expand common word abbreviations."""
        # Sort by length (longest first) to avoid partial matches
        all_abbrevs = {**self.ABBREVIATIONS, **self.custom_dict}

        for abbrev, expansion in sorted(all_abbrevs.items(), key=lambda x: -len(x[0])):
            # Skip titles (handled separately)
            if abbrev in ("Dr.", "Mr.", "Mrs.", "Ms.", "Prof.", "Sr.", "Jr.",
                          "St.", "Gen.", "Capt.", "Lt.", "Col.", "Sgt.", "Rev.",
                          "Dr", "Mr", "Mrs", "Ms", "Prof", "Sr", "Jr"):
                continue

            # Word boundary matching
            if abbrev.endswith('.'):
                # With period: match exactly
                escaped = re.escape(abbrev)
                text = re.sub(r'\b' + escaped, expansion, text)
            else:
                # Without period: need word boundary
                escaped = re.escape(abbrev)
                text = re.sub(r'\b' + escaped + r'\b', expansion, text)

        return text

    def _expand_acronyms(self, text):
        """Expand acronyms — either spell out or keep as word."""
        all_acronyms = {**self.INDIAN_ABBREVIATIONS}

        for acronym, expansion in sorted(all_acronyms.items(), key=lambda x: -len(x[0])):
            escaped = re.escape(acronym)
            text = re.sub(r'\b' + escaped + r'\b', expansion, text)

        return text

    def add_abbreviation(self, abbrev, expansion):
        """Add custom abbreviation."""
        self.custom_dict[abbrev] = expansion

    def add_acronym(self, acronym, expansion):
        """Add custom acronym."""
        self.INDIAN_ABBREVIATIONS[acronym] = expansion