import { tamilRomanization } from "~/language/lib/tamil-romanization";

export function romanizeTamil(text: string) {
  return tamilRomanization(text);
}
