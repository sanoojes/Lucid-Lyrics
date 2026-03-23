import { createLazyModuleLoader } from "@/language/lazy";

const persianLoader = createLazyModuleLoader("persian-transliteration", (mod) => mod.default);
export async function romanizePersian(text: string) {
  const romanize = await persianLoader.get();
  return romanize(text);
}
