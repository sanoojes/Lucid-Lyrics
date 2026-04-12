import { hindiRomanization } from "~/language/lib/hindi-romanization.ts";

export function romanizeHindi(text: string) {
  return hindiRomanization(text);
}
