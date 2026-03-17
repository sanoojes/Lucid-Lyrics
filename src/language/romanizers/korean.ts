import Aromanize from "@/language/lib/aromanize";

export function romanizeKorean(text: string) {
  return Aromanize(text, "RevisedRomanizationTransliteration");
}
