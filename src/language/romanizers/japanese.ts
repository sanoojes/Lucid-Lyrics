import * as KuromojiAnalyzer from "~/language/lib/kuroshiro-analyzer-kuromoji.ts";
import { createLazyModuleLoader } from "~/language/lazy";

const KUROSHIRO_OPTS = { mode: "spaced", to: "romaji" };

const kuroshiroLoader = createLazyModuleLoader("kuroshiro", async (mod) => {
  const Kuroshiro = mod.default;
  const instance = new Kuroshiro();
  await instance.init(KuromojiAnalyzer);
  return instance;
});

export async function romanizeJapanese(text: string) {
  if (!text) return text;
  const kuroshiro = await kuroshiroLoader.get();
  return kuroshiro.convert(text, KUROSHIRO_OPTS);
}
