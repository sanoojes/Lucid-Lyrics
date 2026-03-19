import { ARM_VOWELS } from "@/common";
import { TEMP_SYMBOLS_MAP } from "@/constants";

/**
 * Checks if a character (or a temporary symbol) should be treated as a vowel in Armenian.
 */
export function isArmenianVowel(ch: string): boolean {
  const { backward } = TEMP_SYMBOLS_MAP;

  // If it's a temporary symbol, map it back to see if it starts with a vowel.
  if (ch in backward) {
    return true;
  }

  return ARM_VOWELS.has(ch);
}
