import { farsiArabicPhoneticMap, urduArabicPhoneticMap } from "~/maps";
import transliterate from "~/transliterate";

const combinedPhoneticMap: Record<string, string> = {
  ...farsiArabicPhoneticMap,
  ...urduArabicPhoneticMap,
};

const fallbackCharMap: Record<string, string> = {
  ؤ: "و",
  ئ: "ي",
  "ٰ": "ا",
  ٱ: "ا",
  ک: "ك",
  ں: "ن",
  ھ: "ه",
  ۀ: "ه",
  ہ: "ه",
  ی: "ي",
  ے: "ي",
  ﮨ: "ه",
  ﮩ: "ه",
  ﮪ: "ه",
  ﮫ: "ه",
};

export const transliterateArabic = (input: string): string => {
  if (!input) return "";
  const standardized = standardizeArabicScript(input);
  const transliterated = transliterate(standardized);

  return transliterated
    .replace(/-\s*/g, "-")
    .replace(/\bal-lāh\b/gi, "Allāh")
    .replace(/([,؛:])([^\s]|$)/g, "$1 $2");
};

const standardizeArabicScript = (input: string): string => {
  let text = input.normalize("NFKC");

  text = text.replace(/[ٱٰںکیےھۀہﮨﮩﮪﮫؤئ]/g, (match) => fallbackCharMap[match] || match);

  const tokens = text.split(/([\s،؛؟.,٪()[\]]+)/);

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    if (!word || /^[\s،؛؟.,٪()[\]]+$/.test(word)) continue;

    if (combinedPhoneticMap[word]) {
      tokens[i] = combinedPhoneticMap[word];
    } else {
      tokens[i] = safeNaiveVowelize(word);
    }
  }

  return tokens.join("");
};

const safeNaiveVowelize = (word: string): string => {
  if (/^(وی|فی|تْهے|ٱللّٰه)$/.test(word)) return word;
  if (/[َُِّٰ]/.test(word)) return word;

  const isVowelOrHamza = /[اويةىء]/;
  let result = "";

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (char === undefined) continue;
    result += char;

    if (i < word.length - 1) {
      const nextChar = word[i + 1];
      if (nextChar === undefined) continue;
      if (!isVowelOrHamza.test(char) && !isVowelOrHamza.test(nextChar)) {
        result += "َ";
      }
    }
  }

  return result;
};

export default transliterateArabic;
