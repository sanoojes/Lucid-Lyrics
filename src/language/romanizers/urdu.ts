import { createLazyModuleLoader } from "~/language/lazy";

const urduLoader = createLazyModuleLoader("urdu-transliteration", (mod) => mod.default);
export async function romanizeUrdu(text: string) {
  const romanize = await urduLoader.get();
  return romanize(text);
}
