import { teluguRomanization } from "@/language/lib/telugu-romanization";

export function romanizeTelugu(text: string) {
  return teluguRomanization(text);
}
