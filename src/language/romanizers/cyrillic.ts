import { createLazyModuleLoader } from "~/language/lazy";

const cyrillicLoader = createLazyModuleLoader("cyrillic-romanization", (mod) => mod.default);

export async function romanizeCyrillic(text: string) {
  const romanize = await cyrillicLoader.get();
  return romanize(text);
}
