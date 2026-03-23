const PERSIAN_MAP: Record<string, string[]> = {
  // Diacritics
  "\u064E": ["a", "a"], // Fatha
  "\u0650": ["e", "e"], // Kasra
  "\u064F": ["o", "o"], // Damma
  "\u0652": ["."], // Sukun

  // Letters
  ا: ["a", "a"],
  آ: ["a", "a"],
  ئ: ["a"],
  ء: ["a"],
  ب: ["b"],
  پ: ["p"],
  ت: ["t"],
  ث: ["s"],
  ج: ["j"],
  چ: ["ch"],
  ح: ["h"],
  خ: ["kh"],
  د: ["d"],
  ذ: ["z"],
  ر: ["r"],
  ز: ["z"],
  ژ: ["zh"],
  س: ["s"],
  ش: ["sh"],
  ص: ["s"],
  ض: ["z"],
  ط: ["t"],
  ظ: ["z"],
  ع: ["", "a"],
  غ: ["gh"],
  ف: ["f"],
  ق: ["gh"],
  ک: ["k"],
  ك: ["k"],
  گ: ["g"],
  ل: ["l"],
  م: ["m"],
  ن: ["n"],
  و: ["v", "o"],
  ه: ["h"],
  ی: ["y", "i"],
  ي: ["y", "i"],
};
export function romanizePersian(text: string): string {
  if (!text) return "";

  let result = "";
  let state = 0;
  let i = 0;

  while (i < text.length) {
    const ch = text[i] as string;
    const mapping: string[] | undefined = PERSIAN_MAP[ch];

    // Preserve non-Persian characters (spaces, punctuation, English)
    if (!mapping) {
      result += ch;
      state = 0;
      i += 1;
      continue;
    }

    // Sukun explicitly ends a syllable and resets state
    if (mapping[0] === ".") {
      state = 0;
      i += 1;
      continue;
    }

    if (state === 0) {
      result += mapping[0];
      state = 1;
    } else if (state === 1) {
      if (mapping.length > 1) {
        result += mapping[1];
      } else {
        result += "a";
        i -= 1;
      }
      state = 2;
    } else if (state === 2) {
      result += mapping[0];
      state = 3;
    } else if (state === 3) {
      if (mapping.length > 1) {
        result += mapping[1];
        state = 2;
      } else {
        result += mapping[0];
        state = 4;
      }
    } else if (state === 4) {
      if (mapping.length > 1) {
        result += mapping[1];
        state = 2;
      } else {
        result += mapping[0];
        state = 5;
      }
    } else if (state >= 5) {
      if (mapping.length > 1) {
        result += mapping[1];
        state = 2;
      } else {
        result += mapping[0];
        state += 1;
      }
    }

    i += 1;
  }

  return result.replace(/aa/g, "a").replace(/ao/g, "o").replace(/ae/g, "e");
}

export default romanizePersian;
