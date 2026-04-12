/**
 * Mapping between Armenian punctuation characters and their English equivalents.
 * Added two extra guillemets: « and ».
 */
export const ARM_PUNCTUATION_MAP: Record<string, string> = {
  "«": '"',
  "»": '"',
  ՙ: "'",
  "՚": "'",
  "՛": "'",
  "՜": "!",
  "՝": ",",
  "՞": "?",
  "՟": ".",
  "։": ".",
  "֊": "-",
};

/**
 * Regular expression that matches Armenian letters (including the ligature `և`).
 */
export const ARMENIAN_LETTER_REGEX = /[\u0530-\u058Fև]/u;

/**
 * Regex to split text into tokens while preserving delimiters that are not Armenian letters.
 * Example: splits spaces, punctuation, and other symbols but keeps them in the output array.
 */
export const ARM_SPLIT_REGEX = /(\s+|[^ա-ֆԱ-Ֆև՝՛։,.\-0-9«»]+)/u;

/**
 * Set of Armenian vowels, both uppercase and lowercase.
 */
export const ARM_VOWELS = new Set([
  "ա",
  "Ա",
  "ե",
  "Ե",
  "է",
  "Է",
  "ի",
  "Ի",
  "ո",
  "Ո",
  "օ",
  "Օ",
  "ը",
  "Ը",
]);

/**
 * List of special Armenian ligatures from the Alphabetic Presentation Forms block (U+FB13..U+FB17).
 * Each object maps the ligature character to its two-letter expansion.
 */
export const ARMENIAN_LIGATURES = [
  { expansion: "մն", ligature: "ﬓ" }, // U+FB13
  { expansion: "մե", ligature: "ﬔ" }, // U+FB14
  { expansion: "մի", ligature: "ﬕ" }, // U+FB15
  { expansion: "վն", ligature: "ﬖ" }, // U+FB16
  { expansion: "մխ", ligature: "ﬗ" }, // U+FB17
] as const;
