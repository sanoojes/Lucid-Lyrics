import { WordCasing } from "~/common/types";

/**
 * Determines if a character is uppercase by comparing its
 * uppercase and lowercase forms.
 */
export function isCharUppercase(ch: string): boolean {
  return ch.toUpperCase() === ch && ch.toLowerCase() !== ch;
}

/**
 * Splits text into tokens using a given regular expression,
 * while preserving the delimiters in the result array.
 * Example: splits spaces, punctuation, etc., but keeps them.
 */
export function splitTextPreservingDelimiters(text: string, regex: RegExp): string[] {
  return text.split(regex);
}

/**
 * Applies a specific casing pattern (UPPER, LOWER, MIXED) to text.
 */
export function applyCasingPattern(text: string, pattern: WordCasing): string {
  switch (pattern) {
    case WordCasing.UPPER:
      return text.toUpperCase();

    case WordCasing.LOWER:
      return text.toLowerCase();

    case WordCasing.MIXED: {
      // Mixed = first character uppercase, rest lowercase
      const [firstChar, ...rest] = text;
      return firstChar ? firstChar.toUpperCase() + rest.join("").toLowerCase() : text;
    }

    default:
      return text;
  }
}

/**
 * Determine the casing pattern of a word that may contain Armenian characters.
 *
 * Rules:
 * - If there's at least one uppercase Armenian char and no lowercase Armenian chars => UPPER
 * - If there's at least one lowercase Armenian char and no uppercase Armenian chars => LOWER
 * - If there's a mix => MIXED
 * - If no Armenian letters are found => default to LOWER
 */
export function determineCasingPattern(
  word: string,
  isCharInScript: (ch: string) => boolean,
  isCharUpper: (ch: string) => boolean,
): WordCasing {
  let hasUpper = false;
  let hasLower = false;

  for (const ch of word) {
    if (isCharInScript(ch)) {
      if (isCharUpper(ch)) {
        hasUpper = true;
      } else {
        hasLower = true;
      }

      // Early return if we already have both uppercase and lowercase
      if (hasUpper && hasLower) {
        return WordCasing.MIXED;
      }
    }
  }

  // Return the appropriate casing pattern based on flags.
  if (hasUpper && !hasLower) return WordCasing.UPPER;
  if (hasLower && !hasUpper) return WordCasing.LOWER;

  // If no Armenian letters are found, default to LOWER.
  return WordCasing.LOWER;
}
