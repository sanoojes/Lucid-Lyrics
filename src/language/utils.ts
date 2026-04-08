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
  | "urdu"
  | "armenian"
  | "gothic";

export const RTL_LANGUAGES: SupportedLanguage[] = ["arabic", "hebrew", "persian", "urdu"];

export function detectLanguage(text: string): SupportedLanguage | "unknown" {
  if (!text) return "unknown";
  if (/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(text)) return "korean";
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "japanese";
  if (/\p{Script=Han}/u.test(text)) return "chinese";

  if (/[\u0590-\u05FF]/.test(text)) return "hebrew";

  if (/[\u0600-\u06FF]/.test(text)) {
    if (/[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06D2]/.test(text)) return "urdu";
    if (/[\u067E\u0686\u06AF\u06CC\u06A9\u0698]/.test(text)) return "persian";
    return "arabic";
  }

  if (/[\u0900-\u097F]/.test(text)) return "hindi";
  if (/[\u0980-\u09ff]/.test(text)) return "bengali";
  if (/[\u0a00-\u0a7f]/.test(text)) return "punjabi";
  if (/[\u0a80-\u0aff]/.test(text)) return "gujarati";
  if (/[\u0b80-\u0bff]/.test(text)) return "tamil";
  if (/[\u0c00-\u0c7f]/.test(text)) return "telugu";
  if (/[\u0d00-\u0d7f]/.test(text)) return "malayalam";

  if (/[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]{2,}/.test(text)) return "cyrillic";
  if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(text)) return "greek";
  if (/[\u0530-\u058F]/.test(text)) return "armenian";
  if (/[\u10A0-\u10FF]/.test(text)) return "georgian";
  if (/[\u{10330}-\u{1034F}]/u.test(text)) return "gothic";

  return "unknown";
}

export function containsRTL(text: string): boolean {
  const RTL_REGEX = /[\u0590-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return RTL_REGEX.test(text);
}

export function isRTL(language: SupportedLanguage | "unknown"): boolean {
  return language !== "unknown" && RTL_LANGUAGES.includes(language);
}
