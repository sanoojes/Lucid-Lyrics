export function bengaliRomanization(text: string) {
  const normalizedText = text.normalize("NFC");
  const words = normalizedText.split(" ");
  const result: string[] = [];

  for (const word of words) {
    result.push(_bengaliToRoman(word));
  }

  return result.join(" ");
}

const BENGALI_MAP: Record<string, string> = {
  // Vowels
  অ: "a",
  আ: "aa",
  ই: "i",
  ঈ: "ii",
  উ: "u",
  ঊ: "uu",
  ঋ: "ri",
  এ: "e",
  ঐ: "oi",
  ও: "o",
  ঔ: "ou",

  // Consonants
  ক: "k",
  খ: "kh",
  গ: "g",
  ঘ: "gh",
  ঙ: "ng",
  চ: "ch",
  ছ: "chh",
  জ: "j",
  ঝ: "jh",
  ঞ: "ny",
  ট: "t",
  ঠ: "th",
  ড: "d",
  ঢ: "dh",
  ণ: "n",
  ত: "t",
  থ: "th",
  দ: "d",
  ধ: "dh",
  ন: "n",
  প: "p",
  ফ: "ph",
  ব: "b",
  ভ: "bh",
  ম: "m",
  য: "j",
  র: "r",
  ল: "l",
  শ: "sh",
  ষ: "sh",
  স: "s",
  হ: "h",
  ড়: "r",
  ঢ়: "rh",
  য়: "y",
  ৎ: "t",

  // Vowel Signs
  "া": "aa",
  "ি": "i",
  "ী": "ii",
  "ু": "u",
  "ূ": "uu",
  "ৃ": "ri",
  "ে": "e",
  "ৈ": "oi",
  "ো": "o",
  "ৌ": "ou",

  // Modifiers
  "ং": "ng", // Anusvara
  "ঃ": "h", // Visarga
  "ঁ": "n", // Chandrabindu
  "্": "", // Hasanta
  "়": "", // Nukta
};

const BENGALI_CONSONANTS = new Set([
  "ক",
  "খ",
  "গ",
  "ঘ",
  "ঙ",
  "চ",
  "ছ",
  "জ",
  "ঝ",
  "ঞ",
  "ট",
  "ঠ",
  "ড",
  "ঢ",
  "ণ",
  "ত",
  "থ",
  "দ",
  "ধ",
  "ন",
  "প",
  "ফ",
  "ব",
  "ভ",
  "ম",
  "য",
  "র",
  "ল",
  "শ",
  "ষ",
  "স",
  "হ",
  "ড়",
  "ঢ়",
  "য়",
  "য়",
  "ড়",
  "ঢ়",
]);

const BENGALI_VOWEL_SIGNS = new Set(["া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ", "ং", "ঃ", "ঁ"]);

const MAP_KEYS = Object.keys(BENGALI_MAP).sort((a, b) => b.length - a.length);

function _bengaliToRoman(text: string): string {
  let result = "";
  let i = 0;

  while (i < text.length) {
    let matchFound = false;

    for (const key of MAP_KEYS) {
      if (text.startsWith(key, i)) {
        const mappedChar = BENGALI_MAP[key];
        const nextChar = text[i + key.length] || "";

        const isConsonant = BENGALI_CONSONANTS.has(key);
        const isFollowedByVowel = BENGALI_VOWEL_SIGNS.has(nextChar);
        const isFollowedByHasanta = nextChar === "্";
        const isFollowedByNukta = nextChar === "়";

        if (isConsonant) {
          const isEndOfWord = nextChar === "" || /[\s.,?!'"]/.test(nextChar);

          if (!isFollowedByVowel && !isFollowedByHasanta && !isEndOfWord && !isFollowedByNukta) {
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
