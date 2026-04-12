export function malayalamRomanization(text: string) {
  const normalizedText = text.normalize("NFC");
  const words = normalizedText.split(" ");
  const result: string[] = [];

  for (const word of words) {
    result.push(_malayalamToRoman(word));
  }

  return result.join(" ");
}

const MALAYALAM_MAP: Record<string, string> = {
  // Vowels
  അ: "a",
  ആ: "aa",
  ഇ: "i",
  ഈ: "ee",
  ഉ: "u",
  ഊ: "oo",
  ഋ: "ru",
  എ: "e",
  ഏ: "e",
  ഐ: "ai",
  ഒ: "o",
  ഓ: "o",
  ഔ: "au",
  അം: "am",

  // Consonants
  ക: "k",
  ഖ: "kh",
  ഗ: "g",
  ഘ: "gh",
  ങ: "ng",
  ച: "ch",
  ഛ: "chh",
  ജ: "j",
  ഝ: "jh",
  ഞ: "nj",
  ട: "d",
  ഠ: "th",
  ഡ: "d",
  ഢ: "dh",
  ണ: "n",
  ത: "th",
  ഥ: "th",
  ദ: "d",
  ന: "n",
  പ: "p",
  ഫ: "ph",
  ബ: "b",
  ഭ: "bh",
  മ: "m",
  യ: "y",
  ര: "r",
  ല: "l",
  വ: "v",
  ശ: "sh",
  ഷ: "sh",
  സ: "s",
  ഹ: "h",
  ള: "l",
  ഴ: "zh",
  റ: "r",
  ധ: "dh",

  // Chillu letters
  ൺ: "n",
  ൻ: "n",
  ർ: "r",
  ൽ: "l",
  ൾ: "l",
  ക്‍: "k",

  // Vowel Signs
  "ാ": "aa",
  "ി": "i",
  "ീ": "ee",
  "ു": "u",
  "ൂ": "oo",
  "ൃ": "ru",
  "െ": "e",
  "േ": "e",
  "ൈ": "ai",
  "ൊ": "o",
  "ോ": "o",
  "ൗ": "au",
  "ം": "m",
  "ഃ": "h",
  "്": "",

  ട്ട്: "tt",
  ട്ട: "tt",
  ന്റ: "nt",
  ൻ്റ: "nt",
  റ്റ: "tt",
  മ്പ: "mb",
  ങ്ങ: "ng",
  ഞ്ച: "nch",
  ഞ്ജ: "nj",
};

const CONSONANTS = new Set([
  "ക",
  "ഖ",
  "ഗ",
  "ഘ",
  "ങ",
  "ച",
  "ഛ",
  "ജ",
  "ഝ",
  "ഞ",
  "ട",
  "ഠ",
  "ഡ",
  "ഢ",
  "ണ",
  "ത",
  "ഥ",
  "ദ",
  "ധ",
  "ന",
  "പ",
  "ഫ",
  "ബ",
  "ഭ",
  "മ",
  "യ",
  "ര",
  "ല",
  "വ",
  "ശ",
  "ഷ",
  "സ",
  "ഹ",
  "ള",
  "ഴ",
  "റ",
  "ട്ട",
  "ന്റ",
  "ൻ്റ",
  "റ്റ",
  "മ്പ",
  "ങ്ങ",
  "ഞ്ച",
  "ഞ്ജ",
]);

const VOWEL_SIGNS = new Set(["ാ", "ി", "ീ", "ു", "ൂ", "ൃ", "െ", "േ", "ൈ", "ൊ", "ോ", "ൗ"]);

const MAP_KEYS = Object.keys(MALAYALAM_MAP).sort((a, b) => b.length - a.length);

function _malayalamToRoman(text: string): string {
  let result = "";
  let i = 0;

  while (i < text.length) {
    let matchFound = false;

    for (const key of MAP_KEYS) {
      if (text.startsWith(key, i)) {
        const mappedChar = MALAYALAM_MAP[key];
        const nextChar = text[i + key.length] || "";
        const isConsonant = CONSONANTS.has(key);
        const isFollowedByVowel = VOWEL_SIGNS.has(nextChar);
        const isFollowedByHalant = nextChar === "്";

        if (isConsonant) {
          if (!isFollowedByVowel && !isFollowedByHalant) {
            result += `${mappedChar}a`;
          } else {
            result += mappedChar;
          }
        } else {
          result += mappedChar;
        }

        i += key.length;
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      result += text[i];
      i++;
    }
  }

  return result;
}
