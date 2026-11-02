"""
Comprehensive Indic Transliteration & Normalization Engine
Converts Kannada and Hindi (Devanagari) speech input into clean English Latin text for:
- Student names & surnames
- Email addresses & usernames
- Phone numbers & Indic numeric digits
- Age, gender, and affirmative/negative intents
"""

import re
from typing import Dict, Optional, Tuple

# Common Indian names dictionary for high-precision transliteration
COMMON_NAMES: Dict[str, str] = {
    # Team & Flagship Profiles
    "ಅಮನ್": "Aman",
    "अमन": "Aman",
    "amaan": "Aman",
    "aman": "Aman",
    "ammon": "Aman",
    "ಹಲ್ಕುಡೆ": "Halkude",
    "ಹಾಲ್ಕುಡೆ": "Halkude",
    "हल्कुडे": "Halkude",
    "हलकुडे": "Halkude",
    "ವೃಷಾ": "Vrusha",
    "ವೃಷ": "Vrusha",
    "वृषा": "Vrusha",
    "vrusha": "Vrusha",
    "ಗೋಯಲ್": "Goyal",
    "ಗೋಯಿಲ್": "Goyal",
    "गोयल": "Goyal",
    "goyal": "Goyal",
    "ಗೌರಿ": "Gauri",
    "गौरी": "Gauri",
    "gauri": "Gauri",
    "ರಾನ್ಸುಭೆ": "Ransubhe",
    "ರನ್ಸುಭೆ": "Ransubhe",
    "रानसुभे": "Ransubhe",
    "ನೂಪುರ್": "Nupur",
    "नुपुर": "Nupur",
    "ಆರವ್": "Aarav",
    "ಆರಾವ್": "Aarav",
    "आरव": "Aarav",
    "aarav": "Aarav",

    # Common Indian Names
    "ರಾಹುಲ್": "Rahul",
    "राहुल": "Rahul",
    "ರೋಹಿತ್": "Rohit",
    "रोहित": "Rohit",
    "ಅಮಿತ್": "Amit",
    "अमित": "Amit",
    "ಸುಮಿತ್": "Sumit",
    "सुमित": "Sumit",
    "ಪ್ರಿಯಾ": "Priya",
    "प्रिया": "Priya",
    "ನೇಹಾ": "Neha",
    "नेहा": "Neha",
    "ಪೂಜಾ": "Pooja",
    "पूजा": "Pooja",
    "ಅಂಜಲಿ": "Anjali",
    "अंजलि": "Anjali",
    "ಸ್ನೇಹಾ": "Sneha",
    "स्नेहा": "Sneha",
    "ಅನಿಲ್": "Anil",
    "अनिल": "Anil",
    "ಸುನೀಲ್": "Sunil",
    "सुनील": "Sunil",
    "ರವಿ": "Ravi",
    "रवि": "Ravi",
    "ಅಶೋಕ್": "Ashok",
    "अशोक": "Ashok",
    "ಕುಮಾರ್": "Kumar",
    "कुमार": "Kumar",
    "ಶರ್ಮಾ": "Sharma",
    "शर्मा": "Sharma",
    "ವರ್ಮಾ": "Varma",
    "वर्मा": "Varma",
    "ಸಿಂಗ್": "Singh",
    "सिंह": "Singh",
}

# Kannada character mappings
KN_VOWELS = {
    '\u0C85': 'a', '\u0C86': 'aa', '\u0C87': 'i', '\u0C88': 'ee',
    '\u0C89': 'u', '\u0C8A': 'oo', '\u0C8B': 'ri', '\u0C8E': 'e',
    '\u0C8F': 'e', '\u0C90': 'ai', '\u0C92': 'o', '\u0C93': 'o', '\u0C94': 'au'
}

KN_MATRAS = {
    '\u0CBE': 'aa', '\u0CBF': 'i', '\u0CC0': 'ee', '\u0CC1': 'u',
    '\u0CC2': 'oo', '\u0CC3': 'ri', '\u0CC6': 'e', '\u0CC7': 'e',
    '\u0CC8': 'ai', '\u0CCA': 'o', '\u0CCB': 'o', '\u0CCC': 'au',
    '\u0CCD': '' # Halant / Virama
}

KN_CONSONANTS = {
    '\u0C95': 'k', '\u0C96': 'kh', '\u0C97': 'g', '\u0C98': 'gh', '\u0C99': 'ng',
    '\u0C9A': 'ch', '\u0C9B': 'chh', '\u0C9C': 'j', '\u0C9D': 'jh', '\u0C9E': 'ny',
    '\u0C9F': 't', '\u0CA0': 'th', '\u0CA1': 'd', '\u0CA2': 'dh', '\u0CA3': 'n',
    '\u0CA4': 't', '\u0CA5': 'th', '\u0CA6': 'd', '\u0CA7': 'dh', '\u0CA8': 'n',
    '\u0CAA': 'p', '\u0CAB': 'ph', '\u0CAC': 'b', '\u0CAD': 'bh', '\u0CAE': 'm',
    '\u0CAF': 'y', '\u0CB0': 'r', '\u0CB1': 'r', '\u0CB2': 'l', '\u0CB3': 'l',
    '\u0CB5': 'v', '\u0CB6': 'sh', '\u0CB7': 'sh', '\u0CB8': 's', '\u0CB9': 'h'
}

# Devanagari character mappings
HI_VOWELS = {
    '\u0905': 'a', '\u0906': 'aa', '\u0907': 'i', '\u0908': 'ee',
    '\u0909': 'u', '\u090A': 'oo', '\u090B': 'ri', '\u090F': 'e',
    '\u0910': 'ai', '\u0913': 'o', '\u0914': 'au'
}

HI_MATRAS = {
    '\u093E': 'aa', '\u093F': 'i', '\u0940': 'ee', '\u0941': 'u',
    '\u0942': 'oo', '\u0943': 'ri', '\u0947': 'e', '\u0948': 'ai',
    '\u094B': 'o', '\u094C': 'au', '\u094D': '' # Virama
}

HI_CONSONANTS = {
    '\u0915': 'k', '\u0916': 'kh', '\u0917': 'g', '\u0918': 'gh', '\u0919': 'ng',
    '\u091A': 'ch', '\u091B': 'chh', '\u091C': 'j', '\u091D': 'jh', '\u091E': 'ny',
    '\u091F': 't', '\u0920': 'th', '\u0921': 'd', '\u0922': 'dh', '\u0923': 'n',
    '\u0924': 't', '\u0925': 'th', '\u0926': 'd', '\u0927': 'dh', '\u0928': 'n',
    '\u092A': 'p', '\u092B': 'ph', '\u092C': 'b', '\u092D': 'bh', '\u092E': 'm',
    '\u092F': 'y', '\u0930': 'r', '\u0932': 'l', '\u0933': 'l', '\u0935': 'v',
    '\u0936': 'sh', '\u0937': 'sh', '\u0938': 's', '\u0939': 'h'
}

# Digits mapping (Kannada & Devanagari)
INDIC_DIGITS = {
    '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4',
    '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
}

SPOKEN_NUMBER_WORDS = {
    # Hindi
    "शून्य": "0", "एक": "1", "दो": "2", "तीन": "3", "चार": "4",
    "पाँच": "5", "पांच": "5", "छह": "6", "सात": "7", "आठ": "8", "नौ": "9", "दस": "10",
    # Kannada
    "ಸೊನ್ನೆ": "0", "ಒಂದು": "1", "ಎರಡು": "2", "ಮೂರು": "3", "ನಾಲ್ಕು": "4",
    "ಐದು": "5", "ಆರು": "6", "ಏಳು": "7", "ಎಂಟು": "8", "ಒಂಬತ್ತು": "9", "ಹತ್ತು": "10",
    # English phonetics
    "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10"
}


def is_kannada(text: str) -> bool:
    """Returns True if text contains Kannada Unicode characters."""
    return bool(re.search(r"[\u0C80-\u0CFF]", text or ""))


def is_hindi(text: str) -> bool:
    """Returns True if text contains Devanagari Unicode characters."""
    return bool(re.search(r"[\u0900-\u097F]", text or ""))


def is_indic(text: str) -> bool:
    """Returns True if text contains either Kannada or Devanagari characters."""
    return is_kannada(text) or is_hindi(text)


def transliterate_indic_to_english(text: str) -> str:
    """
    Phonetically transliterates Indic script (Kannada or Devanagari) into English Latin characters.
    """
    if not text:
        return ""

    tokens = text.split(" ")
    result_tokens = []

    for token in tokens:
        clean_token = token.strip()
        lower_token = clean_token.lower()

        # Check common names dictionary first
        if clean_token in COMMON_NAMES:
            result_tokens.append(COMMON_NAMES[clean_token])
            continue
        if lower_token in COMMON_NAMES:
            result_tokens.append(COMMON_NAMES[lower_token])
            continue

        # Transliterate character by character
        chars = list(clean_token)
        out = []
        i = 0
        n = len(chars)

        while i < n:
            c = chars[i]
            # Kannada
            if c in KN_VOWELS:
                out.append(KN_VOWELS[c])
            elif c in KN_CONSONANTS:
                base = KN_CONSONANTS[c]
                # Check next char for virama or matra
                if i + 1 < n and chars[i + 1] == '\u0CCD': # Virama
                    out.append(base)
                    i += 1
                elif i + 1 < n and chars[i + 1] in KN_MATRAS:
                    out.append(base + KN_MATRAS[chars[i + 1]])
                    i += 1
                else:
                    out.append(base + 'a') # Inherent vowel
            # Hindi / Devanagari
            elif c in HI_VOWELS:
                out.append(HI_VOWELS[c])
            elif c in HI_CONSONANTS:
                base = HI_CONSONANTS[c]
                if i + 1 < n and chars[i + 1] == '\u094D': # Virama / Halant
                    out.append(base)
                    i += 1
                elif i + 1 < n and chars[i + 1] in HI_MATRAS:
                    out.append(base + HI_MATRAS[chars[i + 1]])
                    i += 1
                else:
                    out.append(base + 'a')
            elif c in INDIC_DIGITS:
                out.append(INDIC_DIGITS[c])
            else:
                out.append(c)
            i += 1

        word = "".join(out)
        # Clean trailing 'a' if word ends with inherent 'a' in Indian English conventions
        if len(word) > 3 and word.endswith('a') and not any(clean_token.endswith(m) for m in ['\u0CBE', '\u093E']):
            word = word[:-1]

        result_tokens.append(word.capitalize() if word else "")

    return " ".join(result_tokens).strip()


def normalize_indic_name(spoken_text: str) -> str:
    """Normalizes spoken name into standard Title Case English format."""
    clean = spoken_text.strip()
    if clean.lower() in COMMON_NAMES:
        return COMMON_NAMES[clean.lower()]
    if is_indic(clean):
        return transliterate_indic_to_english(clean)
    return " ".join([part.capitalize() for part in clean.split()])


def normalize_indic_digits(spoken_text: str) -> str:
    """Converts Indic numerals and spoken number words to standard ASCII digits."""
    if not spoken_text:
        return ""
    res = " " + spoken_text + " "
    for ind_char, asc_char in INDIC_DIGITS.items():
        res = res.replace(ind_char, asc_char)
    # Sort spoken words by length descending so multi-char words are replaced first
    sorted_words = sorted(SPOKEN_NUMBER_WORDS.keys(), key=lambda x: len(x), reverse=True)
    for word in sorted_words:
        dig = SPOKEN_NUMBER_WORDS[word]
        # Match word surrounded by whitespace or string boundaries
        pattern = rf"(?<=\s){re.escape(word)}(?=\s)"
        res = re.sub(pattern, f" {dig} ", res, flags=re.IGNORECASE)
    return "".join(re.findall(r"\d+", res))


def normalize_indic_email(spoken_text: str) -> str:
    """Converts spoken email commands across languages into standard email format."""
    if not spoken_text:
        return ""
    text = spoken_text.lower()
    text = re.sub(r"\b(at the rate|at rate|@|एट दी रेट|ಅಟ್)\b", "@", text)
    text = re.sub(r"\b(dot|point|डॉट|ಪಾಯಿಂಟ್)\b", ".", text)
    text = re.sub(r"\s+", "", text)

    # Transliterate if parts contain Indic characters
    parts = text.split("@")
    if len(parts) == 2:
        user_part = transliterate_indic_to_english(parts[0]).lower().replace(" ", "")
        domain_part = transliterate_indic_to_english(parts[1]).lower().replace(" ", "")
        return f"{user_part}@{domain_part}"
    return text


def parse_indic_age(spoken_text: str) -> Optional[int]:
    """Extracts valid student age from spoken English, Hindi, or Kannada."""
    digits = normalize_indic_digits(spoken_text)
    if digits:
        try:
            val = int(digits[:3])
            if 3 <= val <= 100:
                return val
        except ValueError:
            pass
    return None


def parse_indic_gender(spoken_text: str) -> str:
    """Identifies gender intent from multilingual voice input."""
    clean = spoken_text.strip().lower()
    male_keywords = {"male", "boy", "man", "पुरुष", "लड़का", "गಂಡು", "ಹುಡುಗ"}
    female_keywords = {"female", "girl", "woman", "महिला", "स्त्री", "लड़की", "ಹೆಣ್ಣು", "ಹುಡುಗಿ"}

    for kw in male_keywords:
        if kw in clean:
            return "male"
    for kw in female_keywords:
        if kw in clean:
            return "female"
    return "other"


def parse_indic_yes_no(spoken_text: str) -> Optional[bool]:
    """Recognizes confirmation or rejection in English, Hindi, and Kannada."""
    clean = spoken_text.strip().lower()
    yes_keywords = {"yes", "yeah", "yep", "sure", "ok", "okay", "हाँ", "हा", "सही", "ಹೌದು", "ಸರಿ"}
    no_keywords = {"no", "nope", "cancel", "ना", "नहीं", "नही", "ಬೇಡ", "ಇಲ್ಲ"}

    for kw in yes_keywords:
        if kw in clean:
            return True
    for kw in no_keywords:
        if kw in clean:
            return False
    return None
