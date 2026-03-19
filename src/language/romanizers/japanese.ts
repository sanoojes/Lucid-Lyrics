import * as KuromojiAnalyzer from "@/language/lib/kuroshiro-analyzer-kuromoji.ts";
import { createLazyModuleLoader } from "@/language/lazy";

const KUROSHIRO_OPTS = { to: "romaji", mode: "spaced" };

const kuroshiroLoader = createLazyModuleLoader("kuroshiro", async (mod) => {
  const Kuroshiro = mod.default;
  const instance = new Kuroshiro();
  await instance.init(KuromojiAnalyzer);
  return instance;
});

export async function romanizeJapanese(text: string) {
  const kuroshiro = await kuroshiroLoader.get();

  return kuroshiro
    .convert(text, KUROSHIRO_OPTS)
    .replace(/\b(\w+)\s+(ta|te|nai|masu|desu|da)\b/g, "$1$2") // Join artificial verb splits (like "megumare ta" -> "megumareta"), which are artifacts of Kuroshiro's spaced mode.
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?！？。、])/g, "$1");
}
