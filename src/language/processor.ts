import { detectLanguage, isRTL, containsRTL } from "@/language/utils";
import type { SupportedLanguage } from "@/language";
import { Romanizers } from "@/language/romanizers";
import { createLogger } from "@/utils/logger";
import type { Lyrics } from "@/lib/api/types";
import { toast } from "@/lib/sonner";
import { t } from "@/i18n";

const log = createLogger("language:processor");

export async function processLyrics(lyric: Lyrics): Promise<Lyrics> {
  if (!lyric?.Type) return lyric;
  const startTime = performance.now();

  const localLangCache = new Map<string, SupportedLanguage | "unknown">();
  const getCachedLang = (text: string): SupportedLanguage | "unknown" => {
    if (localLangCache.has(text)) return localLangCache.get(text)!;
    const lang = detectLanguage(text);
    localLangCache.set(text, lang);
    return lang;
  };

  try {
    log.debug("start", { type: lyric.Type });

    lyric.HasRomanizedText = false;
    lyric.NeedsRomanization = false;
    lyric.IsRTL = false;

    await addRomanizationToLyrics(lyric, getCachedLang, async (textToRomanize, detectedLang) => {
      if (!detectedLang || detectedLang === "unknown") return null;

      if (!lyric.IsRTL && isRTL(detectedLang)) lyric.IsRTL = true;

      const romanizer = Romanizers[detectedLang];
      if (romanizer) {
        lyric.NeedsRomanization = true;
        try {
          const romanizedResult = await romanizer(textToRomanize);
          if (romanizedResult) lyric.HasRomanizedText = true;
          return romanizedResult;
        } catch (err) {
          log.error(`Romanizer failed for language: ${detectedLang}`, err);
          return null;
        }
      }
      return null;
    });

    log.debug("success", {
      durationMs: performance.now() - startTime,
      hasRomanized: lyric.HasRomanizedText,
    });

    return lyric;
  } catch (e) {
    lyric.HasRomanizedText = false;
    toast.error(t("language.romanizeError"));
    log.error("failed", e);
    return lyric;
  }
}

async function addRomanizationToLyrics(
  lyric: Lyrics,
  getCachedLang: (text: string) => SupportedLanguage | "unknown",
  converter: (txt: string, lang: SupportedLanguage | "unknown") => Promise<string | null>,
) {
  const processSyllableGroup = async (
    syllables: { Text: string; RomanizedText?: string | null }[],
  ) => {
    if (!syllables || syllables.length === 0) return false;

    const fullText = syllables.map((s) => s.Text).join("");
    const lang = getCachedLang(fullText);
    const isTextRTL = containsRTL(fullText);

    const [fullRomaji, ...isolatedRomajis] = await Promise.all([
      converter(fullText, lang),
      ...syllables.map((s) => converter(s.Text, lang)),
    ]);

    reconcileRomanizations(syllables, isolatedRomajis, fullRomaji);
    return isTextRTL;
  };

  switch (lyric.Type) {
    case "Line":
    case "Static": {
      const lines = lyric.Type === "Line" ? lyric.Content : lyric.Lines;

      const linePromises = lines.map(async (line) => {
        try {
          const lineLang = getCachedLang(line.Text);
          line.RomanizedText = await converter(line.Text, lineLang);
          line.IsRTL = containsRTL(line.Text);
        } catch {
          log.warn("Failed to romanize line");
        }
      });

      await Promise.all(linePromises);
      break;
    }
    case "Syllable": {
      const linePromises: Promise<void>[] = [];

      for (const content of lyric.Content) {
        linePromises.push(
          (async () => {
            content.IsRTL = await processSyllableGroup(content.Lead.Syllables);

            if (content.Background) {
              await Promise.all(
                content.Background.map(async (bg) => {
                  const isBgRTL = await processSyllableGroup(bg.Syllables);
                  if (isBgRTL && !content.IsRTL) content.IsRTL = true;
                }),
              );
            }
          })(),
        );
      }

      await Promise.all(linePromises);
      break;
    }
  }
}

function reconcileRomanizations(
  syllables: { Text: string; RomanizedText?: string | null }[],
  isolatedRoms: (string | null)[],
  fullRomaji: string | null,
) {
  if (!fullRomaji) {
    syllables.forEach((s, i) => (s.RomanizedText = isolatedRoms[i]));
    return;
  }

  const fullClean = fullRomaji.replace(/\s+/g, "").toLowerCase();
  const isoClean = isolatedRoms
    .map((r) => r || "")
    .join("")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (fullClean === isoClean) {
    syllables.forEach((s, i) => (s.RomanizedText = isolatedRoms[i]));
    return;
  }

  let cursor = 0;
  const fullChars = fullRomaji.replace(/\s+/g, "").split("");

  const totalPhoneticLength = isolatedRoms.reduce((sum, r) => sum + (r ? r.length : 1), 0);

  syllables.forEach((syllable, i) => {
    if (i === syllables.length - 1) {
      syllable.RomanizedText = fullChars.slice(cursor).join("");
      return;
    }

    const isolatedLength = isolatedRoms[i] ? isolatedRoms[i]!.length : 1;
    const weight = isolatedLength / totalPhoneticLength;

    let charsToConsume = Math.round(weight * fullChars.length);
    if (charsToConsume === 0) charsToConsume = 1;

    syllable.RomanizedText = fullChars.slice(cursor, cursor + charsToConsume).join("");
    cursor += charsToConsume;
  });
}
