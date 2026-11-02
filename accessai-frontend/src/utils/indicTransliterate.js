/**
 * indicTransliterate.js
 * Comprehensive transliterator and normalizer for converting Kannada and Hindi (Devanagari)
 * voice speech recognition inputs into clean English Latin text for form fields:
 * - First Name / Last Name (e.g. "ಅಮನ್" -> "Aman", "अमन" -> "Aman")
 * - Email addresses & usernames
 * - Phone numbers & digits (e.g. "೯೮೭..." -> "987...", "ಒಂಬತ್ತು" -> "9")
 * - Age, Gender, Passwords
 * - Yes/No confirmations in Kannada and Hindi
 */

// Common name dictionary for guaranteed idiomatic English spelling
const COMMON_NAMES_DICT = {
  // Aman / Halkude
  "ಅಮನ್": "Aman",
  "अमन": "Aman",
  "amaan": "Aman",
  "aman": "Aman",
  "ammon": "Aman",
  "aman hall": "Aman",
  "ಹಲ್ಕುಡೆ": "Halkude",
  "ಹಾಲ್ಕುಡೆ": "Halkude",
  "हल्कुडे": "Halkude",
  "हलकुडे": "Halkude",
  "halkuday": "Halkude",
  "hal kude": "Halkude",
  "halkud": "Halkude",
  "halkude": "Halkude",
  "halk": "Halkude",

  // Vrusha / Goyal
  "ವೃಷಾ": "Vrusha",
  "ವೃಷ": "Vrusha",
  "वृषा": "Vrusha",
  "vrusha": "Vrusha",
  "ಗೋಯಲ್": "Goyal",
  "ಗೋಯಿಲ್": "Goyal",
  "गोयल": "Goyal",
  "goyal": "Goyal",

  // Other common names
  "ರಾಹುಲ್": "Rahul",
  "राहुल": "Rahul",
  "rahul": "Rahul",
  "ರೋಹಿತ್": "Rohit",
  "रोहित": "Rohit",
  "rohit": "Rohit",
  "ಅಮಿತ್": "Amit",
  "अमित": "Amit",
  "amit": "Amit",
  "ಸುಮಿತ್": "Sumit",
  "सुमित": "Sumit",
  "sumit": "Sumit",
  "ಪ್ರಿಯಾ": "Priya",
  "प्रिया": "Priya",
  "priya": "Priya",
  "ನೇಹಾ": "Neha",
  "नेहा": "Neha",
  "neha": "Neha",
  "ಪೂಜಾ": "Pooja",
  "पूजा": "Pooja",
  "pooja": "Pooja",
  "ಅನನ್ಯ": "Ananya",
  "अनन्या": "Ananya",
  "ಸ್ನೇಹಾ": "Sneha",
  "स्नेहा": "Sneha",
  "ದೀಪಾ": "Deepa",
  "दीपा": "Deepa",
  "ದಿವ್ಯಾ": "Divya",
  "दिव्या": "Divya",
  "ಶ್ರೇಯಾ": "Shreya",
  "श्रेया": "Shreya",
  "ರೋಹನ್": "Rohan",
  "रोहन": "Rohan",
  "ಆಕಾಶ್": "Akash",
  "आकाश": "Akash",
  "ವಿಕಾಸ್": "Vikas",
  "विकास": "Vikas",
  "ಸಚಿನ್": "Sachin",
  "सचिन": "Sachin",
  "ಸುನಿಲ್": "Sunil",
  "सुनील": "Sunil",
  "ಅನಿಲ್": "Anil",
  "अनिल": "Anil",
  "ರಾಜೇಶ್": "Rajesh",
  "राजेश": "Rajesh",
  "ಸಂಜಯ್": "Sanjay",
  "संजय": "Sanjay",
  "ವಿಜಯ್": "Vijay",
  "विजय": "Vijay",
  "ಅಜಯ್": "Ajay",
  "अजय": "Ajay",
  "ಮನೋಜ್": "Manoj",
  "मनोज": "Manoj",
  "ದೀಪಕ್": "Deepak",
  "दीपक": "Deepak",
  "ವಿನಯ್": "Vinay",
  "विनय": "Vinay",
  "ಚೇತನ್": "Chetan",
  "चेतन": "Chetan",
  "ದರ್ಶನ್": "Darshan",
  "दर्शन": "Darshan",
  "ನವೀನ್": "Naveen",
  "नवीन": "Naveen",
  "ಪ್ರವೀಣ್": "Praveen",
  "प्रवीण": "Praveen",
  "ಸಂತೋಷ್": "Santosh",
  "सन्तोष": "Santosh",
  "ಕಿರಣ್": "Kiran",
  "किरण": "Kiran",
  "ಕಾರ್ತಿಕ್": "Karthik",
  "कार्तिक": "Karthik",
  "ಹರೀಶ್": "Harish",
  "हरीश": "Harish",
  "ಗಿರೀಶ್": "Girish",
  "गिरीश": "Girish",
  "ಸತೀಶ್": "Satish",
  "सतीश": "Satish",
  "ರವಿ": "Ravi",
  "रवि": "Ravi",
  "ಅಶೋಕ್": "Ashok",
  "अशोक": "Ashok",
  "ಮೋಹನ್": "Mohan",
  "मोहन": "Mohan",
  "ಪ್ರಸಾದ್": "Prasad",
  "प्रसाद": "Prasad",
  "ಕುಮಾರ್": "Kumar",
  "कुमार": "Kumar",
  "ಶರ್ಮಾ": "Sharma",
  "शर्मा": "Sharma",
  "ವರ್ಮಾ": "Varma",
  "वर्मा": "Varma",
  "ಸಿಂಗ್": "Singh",
  "सिंह": "Singh"
};

// Kannada mapping
const KN_INDEPENDENT_VOWELS = {
  '\u0C85': 'a',   // ಅ
  '\u0C86': 'aa',  // ಆ
  '\u0C87': 'i',   // ಇ
  '\u0C88': 'ee',  // ಈ
  '\u0C89': 'u',   // ಉ
  '\u0C8A': 'oo',  // ಊ
  '\u0C8B': 'ri',  // ಋ
  '\u0C8E': 'e',   // ಎ
  '\u0C8F': 'e',   // ಏ
  '\u0C90': 'ai',  // ಐ
  '\u0C92': 'o',   // ಒ
  '\u0C93': 'o',   // ಓ
  '\u0C94': 'au'   // ಔ
};

const KN_CONSONANTS = {
  '\u0C95': 'k',   // ಕ
  '\u0C96': 'kh',  // ಖ
  '\u0C97': 'g',   // ಗ
  '\u0C98': 'gh',  // ಘ
  '\u0C99': 'ng',  // ಙ
  '\u0C9A': 'ch',  // ಚ
  '\u0C9B': 'chh', // ಛ
  '\u0C9C': 'j',   // ಜ
  '\u0C9D': 'jh',  // ಝ
  '\u0C9E': 'ny',  // ಞ
  '\u0C9F': 't',   // ಟ
  '\u0CA0': 'th',  // ಠ
  '\u0CA1': 'd',   // ಡ
  '\u0CA2': 'dh',  // ಢ
  '\u0CA3': 'n',   // ಣ
  '\u0CA4': 't',   // ತ
  '\u0CA5': 'th',  // ಥ
  '\u0CA6': 'd',   // ದ
  '\u0CA7': 'dh',  // ಧ
  '\u0CA8': 'n',   // ನ
  '\u0CAA': 'p',   // ಪ
  '\u0CAB': 'ph',  // ಫ
  '\u0CAC': 'b',   // ಬ
  '\u0CAD': 'bh',  // ಭ
  '\u0CAE': 'm',   // ಮ
  '\u0CAF': 'y',   // ಯ
  '\u0CB0': 'r',   // ರ
  '\u0CB1': 'r',   // ಱ
  '\u0CB2': 'l',   // ಲ
  '\u0CB3': 'l',   // ಳ
  '\u0CB5': 'v',   // ವ
  '\u0CB6': 'sh',  // ಶ
  '\u0CB7': 'sh',  // ಷ
  '\u0CB8': 's',   // ಸ
  '\u0CB9': 'h'    // ಹ
};

const KN_MATRAS = {
  '\u0CBE': 'a',   // ಾ (aa)
  '\u0CBF': 'i',   // ಿ
  '\u0CC0': 'ee',  // ೀ
  '\u0CC1': 'u',   // ು
  '\u0CC2': 'oo',  // ೂ
  '\u0CC3': 'ru',  // ೃ
  '\u0CC4': 'ru',  // ೄ
  '\u0CC6': 'e',   // ೆ
  '\u0CC7': 'e',   // ೇ
  '\u0CC8': 'ai',  // ೈ
  '\u0CCA': 'o',   // ೊ
  '\u0CCB': 'o',   // ೋ
  '\u0CCC': 'au'   // ೌ
};

const KN_VIRAMA = '\u0CCD';   // ್
const KN_ANUSVARA = '\u0C82'; // ಂ
const KN_VISARGA = '\u0C83';  // ಃ

// Devanagari (Hindi) mapping
const HI_INDEPENDENT_VOWELS = {
  '\u0905': 'a',   // अ
  '\u0906': 'aa',  // आ
  '\u0907': 'i',   // इ
  '\u0908': 'ee',  // ई
  '\u0909': 'u',   // उ
  '\u090A': 'oo',  // ऊ
  '\u090B': 'ri',  // ऋ
  '\u090F': 'e',   // ए
  '\u0910': 'ai',  // ऐ
  '\u0913': 'o',   // ओ
  '\u0914': 'au'   // औ
};

const HI_CONSONANTS = {
  '\u0915': 'k',   // क
  '\u0916': 'kh',  // ख
  '\u0917': 'g',   // ग
  '\u0918': 'gh',  // घ
  '\u0919': 'ng',  // ङ
  '\u091A': 'ch',  // च
  '\u091B': 'chh', // छ
  '\u091C': 'j',   // ज
  '\u091D': 'jh',  // झ
  '\u091E': 'ny',  // ञ
  '\u091F': 't',   // ट
  '\u0920': 'th',  // ठ
  '\u0921': 'd',   // ड
  '\u0922': 'dh',  // ढ
  '\u0923': 'n',   // ण
  '\u0924': 't',   // त
  '\u0925': 'th',  // थ
  '\u0926': 'd',   // द
  '\u0927': 'dh',  // ध
  '\u0928': 'n',   // न
  '\u092A': 'p',   // प
  '\u092B': 'ph',  // फ
  '\u092C': 'b',   // ब
  '\u092D': 'bh',  // भ
  '\u092E': 'm',   // म
  '\u092F': 'y',   // य
  '\u0930': 'r',   // र
  '\u0932': 'l',   // ल
  '\u0933': 'l',   // ळ
  '\u0935': 'v',   // व
  '\u0936': 'sh',  // श
  '\u0937': 'sh',  // ष
  '\u0938': 's',   // स
  '\u0939': 'h',   // ह
  '\u0958': 'q',   // क़
  '\u0959': 'kh',  // ख़
  '\u095A': 'g',   // ग़
  '\u095B': 'z',   // ज़
  '\u095C': 'r',   // ड़
  '\u095D': 'rh',  // ढ़
  '\u095E': 'f'    // फ़
};

const HI_MATRAS = {
  '\u093E': 'a',   // ा (aa)
  '\u093F': 'i',   // ि
  '\u0940': 'ee',  // ी
  '\u0941': 'u',   // ु
  '\u0942': 'oo',  // ू
  '\u0943': 'ri',  // ृ
  '\u0947': 'e',   // े
  '\u0948': 'ai',  // ै
  '\u094B': 'o',   // ो
  '\u094C': 'au'   // ौ
};

const HI_VIRAMA = '\u094D';   // ्
const HI_ANUSVARA = '\u0902'; // ं
const HI_CHANDRABINDU = '\u0901'; // ँ
const HI_VISARGA = '\u0903';  // ः

// Digits mapping
const INDIC_DIGIT_MAP = {
  // Kannada numerals
  '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4',
  '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
  // Hindi / Devanagari numerals
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

// Spoken number words in English, Kannada, and Hindi
const SPOKEN_NUMBER_WORDS = {
  // Kannada
  'ಸೊನ್ನೆ': '0', 'ಶೂನ್ಯ': '0', 'ಝೀರೋ': '0',
  'ಒಂದು': '1', 'ಒಂದ್': '1',
  'ಎರಡು': '2', 'ಎರಡ್': '2',
  'ಮೂರು': '3', 'ಮೂರ್': '3',
  'ನಾಲ್ಕು': '4', 'ನಾಲ್ಕ್': '4',
  'ಐದು': '5', 'ಐದ್': '5',
  'ಆರು': '6', 'ಆರ್': '6',
  'ಏಳು': '7',
  'ಎಂಟು': '8',
  'ಒಂಬತ್ತು': '9',
  'ಹತ್ತು': '10',
  // Hindi
  'शून्य': '0', 'ज़ीरो': '0', 'जीरो': '0', 'सिफर': '0',
  'एक': '1',
  'दो': '2',
  'तीन': '3',
  'चार': '4',
  'पांच': '5', 'पाँच': '5',
  'छह': '6', 'छः': '6',
  'सात': '7',
  'आठ': '8',
  'नौ': '9',
  'दस': '10',
  // English words
  'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
  'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
};

/**
 * Checks if a string contains Kannada characters
 */
export function isKannada(text) {
  return /[\u0C80-\u0CFF]/.test(text);
}

/**
 * Checks if a string contains Devanagari (Hindi) characters
 */
export function isHindi(text) {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Checks if a string contains any Indic characters
 */
export function isIndic(text) {
  return isKannada(text) || isHindi(text);
}

/**
 * Algorithmic transliteration for a single Kannada word to Latin/English
 */
function transliterateKannadaWord(word) {
  let result = '';
  const len = word.length;

  for (let i = 0; i < len; i++) {
    const ch = word[i];
    const nextCh = i + 1 < len ? word[i + 1] : '';

    // Independent Vowel
    if (KN_INDEPENDENT_VOWELS[ch]) {
      result += KN_INDEPENDENT_VOWELS[ch];
      continue;
    }

    // Consonant
    if (KN_CONSONANTS[ch]) {
      const base = KN_CONSONANTS[ch];

      if (nextCh === KN_VIRAMA) {
        // Virama suppresses inherent vowel
        result += base;
        i++; // skip virama
      } else if (KN_MATRAS[nextCh]) {
        // Matra replaces inherent vowel
        result += base + KN_MATRAS[nextCh];
        i++; // skip matra
      } else {
        // In Kannada, inherent 'a' is present, but word-final consonants without matra
        // often drop the trailing 'a' in modern Indian names (e.g. ಅಮನ್ -> Aman)
        const isEnd = (i === len - 1);
        if (isEnd) {
          result += base;
        } else {
          result += base + 'a';
        }
      }
      continue;
    }

    // Anusvara
    if (ch === KN_ANUSVARA) {
      result += 'm';
      continue;
    }

    // Visarga
    if (ch === KN_VISARGA) {
      result += 'h';
      continue;
    }

    // Numerals
    if (INDIC_DIGIT_MAP[ch]) {
      result += INDIC_DIGIT_MAP[ch];
      continue;
    }

    // Passthrough
    result += ch;
  }

  return result;
}

/**
 * Algorithmic transliteration for a single Devanagari (Hindi) word to Latin/English
 */
function transliterateHindiWord(word) {
  let result = '';
  const len = word.length;

  for (let i = 0; i < len; i++) {
    const ch = word[i];
    const nextCh = i + 1 < len ? word[i + 1] : '';

    // Independent Vowel
    if (HI_INDEPENDENT_VOWELS[ch]) {
      result += HI_INDEPENDENT_VOWELS[ch];
      continue;
    }

    // Consonant
    if (HI_CONSONANTS[ch]) {
      const base = HI_CONSONANTS[ch];

      if (nextCh === HI_VIRAMA) {
        // Virama suppresses inherent vowel
        result += base;
        i++; // skip virama
      } else if (HI_MATRAS[nextCh]) {
        // Matra replaces inherent vowel
        result += base + HI_MATRAS[nextCh];
        i++; // skip matra
      } else {
        // Hindi schwa deletion: final consonant doesn't keep inherent 'a' (e.g. अमन -> Aman)
        const isEnd = (i === len - 1);
        if (isEnd) {
          result += base;
        } else {
          result += base + 'a';
        }
      }
      continue;
    }

    // Anusvara / Chandrabindu
    if (ch === HI_ANUSVARA || ch === HI_CHANDRABINDU) {
      result += 'n';
      continue;
    }

    // Visarga
    if (ch === HI_VISARGA) {
      result += 'h';
      continue;
    }

    // Numerals
    if (INDIC_DIGIT_MAP[ch]) {
      result += INDIC_DIGIT_MAP[ch];
      continue;
    }

    // Passthrough
    result += ch;
  }

  return result;
}

/**
 * Full transliterator for any Indic text to English
 */
export function transliterateIndicToEnglish(text) {
  if (!text) return '';
  const trimmed = text.trim();

  // Split into tokens (words and punctuation)
  const words = trimmed.split(/(\s+)/);
  const transliteratedWords = words.map(w => {
    if (!w || /^\s+$/.test(w)) return w;

    // Check exact dictionary match first
    const lowerW = w.toLowerCase();
    if (COMMON_NAMES_DICT[w]) return COMMON_NAMES_DICT[w];
    if (COMMON_NAMES_DICT[lowerW]) return COMMON_NAMES_DICT[lowerW];

    if (isKannada(w)) {
      return transliterateKannadaWord(w);
    }
    if (isHindi(w)) {
      return transliterateHindiWord(w);
    }
    return w;
  });

  return transliteratedWords.join('');
}

/**
 * Normalizes a spoken name (first name, last name, full name):
 * Transliterates Kannada / Hindi to English and capitalizes properly
 * e.g. "ಅಮನ್" -> "Aman", "अमन" -> "Aman", "ಅಮನ್ ಹಲ್ಕುಡೆ" -> "Aman Halkude"
 */
export function normalizeIndicName(spokenName) {
  if (!spokenName) return '';
  const raw = spokenName.trim();

  // Check dictionary first for the entire phrase
  const directMatch = COMMON_NAMES_DICT[raw.toLowerCase()] || COMMON_NAMES_DICT[raw];
  if (directMatch) return directMatch;

  // Transliterate
  const transliterated = transliterateIndicToEnglish(raw);

  // Capitalize each word properly
  return transliterated
    .split(/\s+/)
    .map(word => {
      if (!word) return '';
      // Check dictionary again for the word token
      if (COMMON_NAMES_DICT[word.toLowerCase()]) {
        return COMMON_NAMES_DICT[word.toLowerCase()];
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Normalizes phone numbers / digits spoken in Kannada, Hindi, or English:
 * Converts numerals (೦-೯, ०-९) and spoken number words (ಒಂದು, ಎರಡು, एक, दो) to standard digits 0-9.
 */
export function normalizeIndicDigits(spokenText) {
  if (!spokenText) return '';
  let cleaned = spokenText.trim();

  // Replace Indic digits (೦-೯, ०-९)
  cleaned = cleaned.replace(/[\u0CE6-\u0CEF\u0966-\u096F]/g, match => INDIC_DIGIT_MAP[match] || match);

  // Replace spoken number words
  const words = cleaned.split(/\s+/);
  const mappedWords = words.map(w => {
    const lower = w.toLowerCase().replace(/[,.-]/g, '');
    return SPOKEN_NUMBER_WORDS[lower] !== undefined ? SPOKEN_NUMBER_WORDS[lower] : w;
  });

  cleaned = mappedWords.join('');

  // Extract only digits
  return cleaned.replace(/\D/g, '');
}

/**
 * Normalizes email username or full email address spoken in Kannada, Hindi, or English:
 * Translates spoken symbols:
 * - "ಅಟ್", "ಅಟ್ ದ ರೇಟ್", "एट", "एट द रेट" -> "@"
 * - "ಡಾಟ್", "ಚುಕ್ಕಿ", "डॉट", "बिंदु" -> "."
 * - "ಜಿಮೇಲ್", "जीमेल" -> "gmail"
 * - "ಔಟ್‌ಲುಕ್", "आउटलुक" -> "outlook"
 * - "ಯಾಹೂ", "याहू" -> "yahoo"
 */
export function normalizeIndicEmail(spokenText) {
  if (!spokenText) return '';
  let text = spokenText.toLowerCase().trim();

  // Common email spoken symbol replacements in Kannada & Hindi
  text = text
    .replace(/\b(ಅಟ್\s*ದ\s*ರೇಟ್|ಅಟ್\s*ದಿ\s*ರೇಟ್|ಅಟ್|एट\s*द\s*रेट|ऐट\s*द\s*रेट|एट|ऐट)\b/gi, '@')
    .replace(/\b(ಡಾಟ್|ಚುಕ್ಕಿ|डॉट|बिंदु)\b/gi, '.')
    .replace(/\b(ಅಂಡರ್‌ಸ್ಕೋರ್|ಅಂಡರ್\s*ಸ್ಕೋರ್|अंडरस्कोर|अंडर\s*स्कोर)\b/gi, '_')
    .replace(/\b(ಡ್ಯಾಶ್|डैश)\b/gi, '-')
    .replace(/\b(ಜಿಮೇಲ್|जीमेल)\b/gi, 'gmail')
    .replace(/\b(ಔಟ್‌ಲುಕ್|आउटलुक)\b/gi, 'outlook')
    .replace(/\b(ಯಾಹೂ|याहू)\b/gi, 'yahoo')
    .replace(/\b(ಹಾಟ್‌ಮೇಲ್|हॉटमेल)\b/gi, 'hotmail');

  // Transliterate any remaining Indic characters
  const transliterated = transliterateIndicToEnglish(text);

  // Strip spaces, sanitize for email
  let cleaned = transliterated.toLowerCase().replace(/\s+/g, '');
  cleaned = cleaned.replace(/[^a-z0-9._\-+@]/g, '');
  cleaned = cleaned.replace(/^\.+|\.+$/g, '');

  return cleaned;
}

/**
 * Parses age spoken in Kannada, Hindi, or English
 */
export function parseIndicAge(spokenText) {
  if (!spokenText) return null;
  const digits = normalizeIndicDigits(spokenText);
  if (digits && digits.length > 0) {
    const parsed = parseInt(digits, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 130) {
      return parsed;
    }
  }

  // Kannada tens / words
  const knTens = {
    'ಹತ್ತು': 10, 'ಇಪ್ಪತ್ತು': 20, 'ಮೂವತ್ತು': 30, 'ನಲವತ್ತು': 40,
    'ಐವತ್ತು': 50, 'ಅರವತ್ತು': 60, 'ಎಪ್ಪತ್ತು': 70, 'ಎಂಬತ್ತು': 80, 'ತೊಂಬತ್ತು': 90
  };
  const knOnes = {
    'ಒಂದು': 1, 'ಎರಡು': 2, 'ಮೂರು': 3, 'ನಾಲ್ಕು': 4, 'ಐದು': 5,
    'ಆರು': 6, 'ಏಳು': 7, 'ಎಂಟು': 8, 'ಒಂಬತ್ತು': 9
  };

  // Hindi tens / words
  const hiSpecial = {
    'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
    'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19,
    'बीस': 20, 'इक्कीस': 21, 'बाईस': 22, 'तेईस': 23, 'चौबीस': 24, 'पच्चीस': 25,
    'छब्बीस': 26, 'सत्ताईस': 27, 'अट्ठाइस': 28, 'उनतीस': 29,
    'तीस': 30, 'इकतीस': 31, 'बत्तीस': 32, 'पैंतीस': 35, 'चालीस': 40, 'पचास': 50
  };

  const words = spokenText.toLowerCase().trim().split(/\s+/);
  for (let w of words) {
    if (hiSpecial[w]) return hiSpecial[w];
    if (knTens[w]) return knTens[w];
    if (knOnes[w]) return knOnes[w];
  }

  return null;
}

/**
 * Parses gender spoken in Kannada, Hindi, or English:
 * Returns standard "Male", "Female", or "Other"
 */
export function parseIndicGender(spokenText) {
  if (!spokenText) return "";
  const text = spokenText.toLowerCase().trim();

  // Male
  if (
    text.includes("male") ||
    text.includes("ಪುರುಷ") || text.includes("ಗಂಡು") ||
    text.includes("पुरुष") || text.includes("मर्द")
  ) {
    return "Male";
  }

  // Female
  if (
    text.includes("female") ||
    text.includes("ಮಹಿಳೆ") || text.includes("ಹೆಣ್ಣು") || text.includes("ಸ್ತ್ರೀ") ||
    text.includes("महिला") || text.includes("स्त्री") || text.includes("औरत")
  ) {
    return "Female";
  }

  // Other / Prefer not to say
  if (
    text.includes("other") || text.includes("ಇತರೆ") || text.includes("ಇತರ") ||
    text.includes("अन्य")
  ) {
    return "Other";
  }

  return "";
}

/**
 * Parses spoken confirmations (Yes / No) in Kannada, Hindi, and English
 */
export function parseIndicYesNo(spokenText) {
  if (!spokenText) return null;
  const text = spokenText.toLowerCase().trim();

  // YES
  const yesMatches = [
    "yes", "yeah", "yep", "sure", "correct", "right", "ok", "okay",
    // Kannada
    "ಹೌದು", "ಸರಿ", "ಖಂಡಿತ", "ಖಂಡಿತವಾಗಿ", "ಆಗಲಿ", "ಮುಂದುವರಿಸಿ", "ಯೆಸ್", "ಹೌದ್",
    // Hindi
    "हाँ", "हां", "सही", "ठीक", "अवश्य", "बिल्कुल", "आगे", "यस", "हाँजी", "जी हाँ"
  ];
  for (let y of yesMatches) {
    if (text === y || text.startsWith(y) || text.includes(y)) {
      return "YES";
    }
  }

  // NO
  const noMatches = [
    "no", "nope", "incorrect", "wrong", "again", "cancel",
    // Kannada
    "ಇಲ್ಲ", "ತಪ್ಪು", "ಬೇಡ", "ಮತ್ತೆ", "ಪುನಃ", "ನೋ", "ಇಲ್ಲ ಇಲ್ಲ",
    // Hindi
    "नहीं", "ना", "गलत", "फिर से", "दोबारा", "नो", "नहीं नहीं", "मत करो"
  ];
  for (let n of noMatches) {
    if (text === n || text.startsWith(n) || text.includes(n)) {
      return "NO";
    }
  }

  return null;
}

/**
 * Normalizes password spoken in Kannada, Hindi, or English:
 * Converts Indic numerals to 0-9 digits and transliterates Indic characters to Latin.
 */
export function normalizeIndicPassword(spokenText) {
  if (!spokenText) return '';
  let cleaned = spokenText.trim();
  // Replace Indic digits (೦-೯, ०-९)
  cleaned = cleaned.replace(/[\u0CE6-\u0CEF\u0966-\u096F]/g, match => INDIC_DIGIT_MAP[match] || match);
  // Transliterate Indic characters
  const transliterated = transliterateIndicToEnglish(cleaned);
  // Strip whitespace
  return transliterated.replace(/\s+/g, '');
}
