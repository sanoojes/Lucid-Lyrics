import { createLazyModuleLoader } from "~/language/lazy";

const greekLoader = createLazyModuleLoader("greek-transliteration", (mod) => mod.transliterate);

export async function romanizeGreek(text: string) {
  const transliterate = await greekLoader.get();
  return transliterate(text);
}
