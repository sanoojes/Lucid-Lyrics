import { createLazyModuleLoader } from "~/language/lazy";

const gothicLoader = createLazyModuleLoader("gothic-transliteration", (mod) => mod.default);
export async function romanizeGothic(text: string) {
  const romanize = await gothicLoader.get();
  return romanize(text);
}
