import { createLazyModuleLoader } from "~/language/lazy";

const armenianLoader = createLazyModuleLoader("armenian-transliteration", (mod) => mod.default);
export async function romanizeArmenian(text: string) {
  const romanize = await armenianLoader.get();
  return romanize(text);
}
