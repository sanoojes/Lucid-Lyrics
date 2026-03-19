export default function arabicTransliterate(
  input: string,
  useStandardLatin: boolean = true,
): string {
  if (!input) return "";

  const char = (academic: string, standard: string) => (useStandardLatin ? standard : academic);

  const arabicMap: Record<string, string> = {
    ب: "b",
    ت: "t",
    ث: "th",
    ج: "j",
    ح: char("ḥ", "h"),
    خ: "kh",
    د: "d",
    ذ: "dh",
    ر: "r",
    ز: "z",
    س: "s",
    ش: "sh",
    ص: char("ṣ", "s"),
    ض: char("ḍ", "d"),
    ط: char("ṭ", "t"),
    ظ: char("ẓ", "z"),
    ع: char("ʿ", "'"),
    غ: "gh",
    ف: "f",
    ق: "q",
    ك: "k",
    ل: "l",
    م: "m",
    ن: "n",
    ه: "h",
    ء: char("ʾ", "'"),
    أ: char("ʾ", "'"),
    إ: char("ʾ", "'"),
    ؤ: char("ʾ", "'"),
    ئ: char("ʾ", "'"),
    ة: "a",
    ى: "aa",
    پ: "p",
    چ: "ch",
    ژ: "zh",
    گ: "g",
    ڤ: "v",
  };

  // Vowels & Diacritics Map
  const vowelsMap: Record<string, string> = {
    "\u064E": "a",
    "\u064F": "u",
    "\u0650": "i", // Fatha, Damma, Kasra
    "\u064B": "an",
    "\u064C": "un",
    "\u064D": "in", // Tanwin
    ا: "aa",
    "\u0670": "aa",
    آ: char("ʾā", "'aa"), // Alifs
    "\u0652": "", // Sukun (Silence)
  };

  // Ligatures & Punctuation
  const ligatures: Record<string, string> = {
    ال: "al-",
    لا: "laa",
    لأ: "la'",
    لإ: "li'",
    لآ: "laa'",
  };

  const punctuation: Record<string, string> = {
    "،": ",",
    "؛": ";",
    "؟": "?",
    "۔": ".",
    "٪": "%",
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  const shadda = "\u0651";
  let resultLa = "";
  let lastMappedToken = "";
  for (let i = 0; i < input.length; i++) {
    const charStr = input[i];
    if (charStr === undefined) continue;
    const nextChar = input[i + 1];
    const prevChar = input[i - 1];
    const twoCharStr = charStr + (nextChar || "");
    if (charStr === " " || charStr === "\n" || punctuation[charStr]) {
      resultLa += punctuation[charStr] || charStr;
      lastMappedToken = "";
      continue;
    }
    if (nextChar && ligatures[twoCharStr]) {
      resultLa += ligatures[twoCharStr];
      lastMappedToken = ligatures[twoCharStr];
      i++;
      continue;
    }
    if (charStr === shadda) {
      resultLa += lastMappedToken;
      continue;
    }
    if (charStr === "ي" || charStr === "ی" || charStr === "ے") {
      const isWordStart = !prevChar || /[\s,;?.\n]/.test(prevChar);
      const isFollowedByVowel =
        nextChar === "ا" || nextChar === "و" || nextChar === "َ" || nextChar === "ُ";

      if (isWordStart || isFollowedByVowel) {
        resultLa += "y";
        lastMappedToken = "y";
      } else {
        resultLa += "ii";
        lastMappedToken = "ii";
      }
      continue;
    }
    if (charStr === "و") {
      const isWordStart = !prevChar || /[\s,;?.\n]/.test(prevChar);
      const isFollowedByVowel =
        nextChar === "ا" || nextChar === "ي" || nextChar === "َ" || nextChar === "ِ";

      if (isWordStart || isFollowedByVowel) {
        resultLa += "w";
        lastMappedToken = "w";
      } else {
        resultLa += "uu";
        lastMappedToken = "uu";
      }
      continue;
    }
    if (arabicMap[charStr]) {
      if (charStr === "أ" || charStr === "إ" || charStr === "ء") {
        const isInitial = !prevChar || /[\s,;?.\n]/.test(prevChar);
        if (isInitial) {
          lastMappedToken = "";
          continue;
        }
      }
      const mappedChar = arabicMap[charStr];
      resultLa += mappedChar;
      lastMappedToken = mappedChar;
      continue;
    }

    if (vowelsMap[charStr]) {
      const mappedVowel = vowelsMap[charStr];
      if (mappedVowel === "aa" && resultLa.endsWith("a")) {
        resultLa += "a";
      } else {
        resultLa += mappedVowel;
      }
      continue;
    }
    if (!arabicMap[charStr] && !vowelsMap[charStr]) {
      resultLa += charStr;
      lastMappedToken = charStr;
    }
  }

  return resultLa;
}
