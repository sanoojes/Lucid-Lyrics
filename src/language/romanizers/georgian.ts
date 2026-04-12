import { georgianRomanization } from "~/language/lib/georgian-romanization";

export async function romanizeGeorgian(text: string) {
  return georgianRomanization(text);
}
