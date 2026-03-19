import { mapArmenianCharToLatin } from "@/transformations";
import { isArmenianVowel } from "@/utils";
import { type FirstCharRule } from "@/common";

/**
 * List of rules that apply specifically to the first character (and possibly the second)
 * in an Armenian word for special transliteration cases.
 */
export const FIRST_CHAR_RULES: FirstCharRule[] = [
  {
    name: "YeRule",
    // Trigger only if the first character is uppercase Ե
    match: (firstChar) => firstChar === "Ե",
    transliteration: (_, secondChar) => {
      const secondCharLat = secondChar ? mapArmenianCharToLatin(secondChar) : "";
      return `Ye${secondCharLat}`;
    },
  },
  {
    name: "VoRule",
    // Trigger if the first character is Ո or ո
    match: (firstChar) => firstChar === "Ո" || firstChar === "ո",
    transliteration: (_, secondChar) => {
      // Check if the second char is a vowel or v/V to decide if we do "o" vs "vo".
      const isNextCharVowelOrV =
        secondChar !== undefined &&
        (isArmenianVowel(secondChar) || secondChar === "վ" || secondChar === "Վ");

      const secondCharLat = secondChar ? mapArmenianCharToLatin(secondChar) : "";
      const firstCharLat = isNextCharVowelOrV ? "o" : "vo";
      return `${firstCharLat}${secondCharLat}`;
    },
  },
  {
    name: "YevRule",
    // Trigger if the word starts with "\u00A4" (which corresponds to "և" and variations)
    match: (first) => first === "\u00A4",
    transliteration: (_, secondChar) => {
      const secondCharLat = secondChar ? mapArmenianCharToLatin(secondChar) : "";
      // "\u00A4" -> "ev", but if it's the first character in a word, it's "yev"
      return `yev${secondCharLat}`;
    },
  },
];
