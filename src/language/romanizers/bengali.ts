import { bengaliRomanization } from "~/language/lib/bengali-romanization";

export function romanizeBengali(text: string) {
  return bengaliRomanization(text);
}
