import { URDU_CHAR_MAP, WORD_PRIORITY_MAP } from "~/maps";

const DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06DF-\u06E1]/g;
const TOKEN_REGEX = /[\p{L}\p{M}\u200C\u200D]+|[،؟۔٪٫٬]/gu;

export function romanizeUrdu(text: string): string {
  if (!text) return "";

  return text.normalize("NFC").replace(TOKEN_REGEX, (match) => {
    if (match.length === 1 && !match.match(/[\p{L}\p{M}]/u)) {
      const charMatch = URDU_CHAR_MAP[match];
      if (charMatch !== undefined) return charMatch;
    }

    const cleanWord = match
      .replace(DIACRITICS_REGEX, "")
      .replace(/[\u200C\u200D]/g, "")
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک");

    const dictMatch = WORD_PRIORITY_MAP[cleanWord];
    if (dictMatch !== undefined) {
      const hasIzhafat = match.endsWith("\u0650");
      return dictMatch + (hasIzhafat ? "-e" : "");
    }

    let result = "";
    const chars = [...match.replace(/[\u200C\u200D]/g, "")];
    const len = chars.length;

    const nextBaseCharIs = (startIndex: number, targetList: string[]) => {
      for (let j = startIndex; j < len; j++) {
        const nextChar = chars[j] as string;
        if (nextChar.match(DIACRITICS_REGEX)) continue;
        return targetList.includes(nextChar);
      }
      return false;
    };

    let firstBaseIdx = 0;
    while (firstBaseIdx < len && (chars[firstBaseIdx] as string).match(DIACRITICS_REGEX))
      firstBaseIdx++;

    let lastBaseIdx = len - 1;
    while (lastBaseIdx >= 0 && (chars[lastBaseIdx] as string).match(DIACRITICS_REGEX))
      lastBaseIdx--;

    for (let i = 0; i < len; i++) {
      const char = chars[i] as string;

      if (char === "\u0650" && i >= lastBaseIdx) {
        result += "-e";
        continue;
      }

      if (char === "ی" || char === "ي") {
        if (i <= firstBaseIdx || nextBaseCharIs(i + 1, ["ا", "و"])) result += "y";
        else result += "i";
      } else if (char === "و") {
        if (i <= firstBaseIdx || nextBaseCharIs(i + 1, ["ا"])) result += "w";
        else result += "o";
      } else if (char === "ہ") {
        if (i === lastBaseIdx) result += "a";
        else result += "h";
      } else {
        const mappedChar = URDU_CHAR_MAP[char];
        result += mappedChar !== undefined ? mappedChar : char;
      }
    }

    return result;
  });
}

export default romanizeUrdu;
