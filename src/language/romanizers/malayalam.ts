import { malayalamRomanization } from "~/language/lib/malayalam-romanization";

export function romanizeMalayalam(text: string) {
  return malayalamRomanization(text);
}
