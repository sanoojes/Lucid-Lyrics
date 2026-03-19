import { createLazyModuleLoader } from "@/language/lazy";

const arabicLoader = createLazyModuleLoader("arabic-transliteration", (mod) => mod.default);
export async function romanizeArabic(text: string) {
  const romanize = await arabicLoader.get();
  return romanize(text);
}
