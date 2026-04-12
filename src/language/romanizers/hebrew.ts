import { createLazyModuleLoader } from "~/language/lazy";

const hebrewLoader = createLazyModuleLoader("hebrew-transliteration", (mod) => mod.default);
export async function romanizeHebrew(text: string) {
  const romanize = await hebrewLoader.get();
  return romanize(text);
}
