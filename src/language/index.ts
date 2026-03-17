import { getModule } from "@/lib/dom/load";

let f: Awaited<ReturnType<typeof getModule<"franc">>> | null;
let id: ReturnType<typeof setTimeout> | undefined;

const MAX_DELAY = 30000;
(async function loadFranc(delay = 1000) {
  if (id) clearTimeout(id);
  try {
    f = await getModule("franc");
  } catch {
    f = null;
    id = setTimeout(() => loadFranc(Math.min(delay * 2, MAX_DELAY)), delay);
  }
})();

export type SupportedLanguage =
  | "japanese"
  | "korean"
  | "chinese"
  | "greek"
  | "georgian"
  | "cyrillic"
  | "hindi"
  | "punjabi"
  | "malayalam"
  | "gujarati"
  | "tamil"
  | "telugu"
  | "bengali"
  | "arabic"
  | "hebrew"
  | "persian"
  | "urdu";

export const RTL_LANGUAGES: SupportedLanguage[] = ["arabic", "hebrew", "persian", "urdu"];

export const RTL_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/;

export function isRTL(language: SupportedLanguage | "unknown"): boolean {
  if (language === "unknown") return false;
  return RTL_LANGUAGES.includes(language);
}

export function containsRTL(text: string): boolean {
  return RTL_REGEX.test(text);
}

interface LanguageConfig {
  name: SupportedLanguage;
  regex: RegExp;
  francCodes: string[];
}

const LANGUAGE_CONFIGS: LanguageConfig[] = [
  { name: "japanese", regex: /([ぁ-んァ-ン々])/, francCodes: ["jpn"] },
  { name: "chinese", regex: /([\u4E00-\u9FFF])/, francCodes: ["cmn"] },
  {
    name: "korean",
    regex: /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/,
    francCodes: ["kor"],
  },
  {
    name: "cyrillic",
    regex: /[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]{2,}/,
    francCodes: ["bel", "bul", "kaz", "mkd", "rus", "srp", "tgk", "ukr"],
  },
  { name: "greek", regex: /[\u0370-\u03FF\u1F00-\u1FFF]/, francCodes: ["ell"] },
  { name: "bengali", regex: /[\u0980-\u09ff]/, francCodes: ["ben"] },
  { name: "gujarati", regex: /[\u0a80-\u0aff]/, francCodes: ["guj"] },
  { name: "punjabi", regex: /[\u0a00-\u0a7f]/, francCodes: ["pan"] },
  { name: "malayalam", regex: /[\u0d00-\u0d7f]/, francCodes: ["mal"] },
  { name: "tamil", regex: /[\u0b80-\u0bff]/, francCodes: ["tam"] },
  { name: "telugu", regex: /[\u0c00-\u0c7f]/, francCodes: ["tel"] },
  { name: "hindi", regex: /[\u0900-\u097F]/, francCodes: ["hin"] },
  { name: "georgian", regex: /[\u10A0-\u10FF]/, francCodes: ["kat"] },
  {
    name: "arabic",
    regex: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
    francCodes: ["ara"],
  },
  { name: "hebrew", regex: /[\u0590-\u05FF]/, francCodes: ["heb"] },
  { name: "persian", regex: /[\u0600-\u06FF\uFB50-\uFDFF]/, francCodes: ["pes", "fas"] },
  { name: "urdu", regex: /[\u0600-\u06FF\u0750-\u077F]/, francCodes: ["urd"] },
];

export function detectLanguage(text: string): {
  language: SupportedLanguage | "unknown";
  usedFranc: boolean;
} {
  let francCode: string | undefined;
  if (f) {
    francCode = f.franc(text);
  }

  for (const { name, regex, francCodes } of LANGUAGE_CONFIGS) {
    if ((francCode && francCodes.includes(francCode)) || regex.test(text)) {
      return {
        language: name,
        usedFranc: !!f,
      };
    }
  }

  return { language: "unknown", usedFranc: false };
}
