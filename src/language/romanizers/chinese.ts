import { createLazyModuleLoader } from "~/language/lazy";

const chineseLoader = createLazyModuleLoader("pinyin", (mod) => mod.pinyin);

export async function romanizeChinese(text: string): Promise<string> {
  const pinyin = await chineseLoader.get();
  const result = pinyin(text, {
    style: "normal",
  });
  return Array.isArray(result) ? result.flat().join(" ") : result;
}
