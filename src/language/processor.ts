import { containsRTL, detectLanguage, isRTL } from "~/language/utils";
import type { SupportedLanguage } from "~/language";
import { Romanizers } from "~/language/romanizers";
import { createLogger } from "~/utils/logger";
import type { Lyrics } from "~/lib/api/types";
import { toast } from "~/lib/sonner";
import { t } from "~/i18n";

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

  const romanizationErrors: Error[] = [];

  try {
    log.debug("start", { type: lyric.Type });

    lyric.HasRomanizedText = false;
    lyric.NeedsRomanization = false;
    lyric.IsRTL = false;

    await addRomanizationToLyrics(
      lyric,
      getCachedLang,
      romanizationErrors,
      async (textToRomanize, detectedLang) => {
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
            romanizationErrors.push(err instanceof Error ? err : new Error(String(err)));
            return null;
          }
        }
        return null;
      },
    );

    if (romanizationErrors.length > 0) {
      log.warn(`Completed with ${romanizationErrors.length} romanization errors.`);

      if (lyric.HasRomanizedText) {
        toast.error(t("language.romanizePartialFail", { count: romanizationErrors.length }));
      } else {
        toast.error(t("language.romanizeFailedEntirely"));
      }
    }

    log.debug("success", {
      durationMs: performance.now() - startTime,
      errorCount: romanizationErrors.length,
      hasRomanized: lyric.HasRomanizedText,
    });

    return lyric;
  } catch (e) {
    lyric.HasRomanizedText = false;
    toast.error(t("language.romanizeCriticalError"));
    log.error("Fatal failure in processLyrics", e);
    return lyric;
  }
}

async function addRomanizationToLyrics(
  lyric: Lyrics,
  getCachedLang: (text: string) => SupportedLanguage | "unknown",
  errorTracker: Error[],
  converter: (txt: string, lang: SupportedLanguage | "unknown") => Promise<string | null>,
) {
  const resolveContextLang = (
    token: string,
    primaryLang: SupportedLanguage | "unknown",
  ): SupportedLanguage | "unknown" => {
    const cleanText = token.trim();
    if (!cleanText) return "unknown";

    const lang = getCachedLang(cleanText);
    if (lang === "chinese") {
      if (primaryLang === "japanese") return "japanese";
      if (primaryLang === "korean") return "korean";
    }

    if (lang === "arabic") {
      if (primaryLang === "urdu") return "urdu";
      if (primaryLang === "persian") return "persian";
    }
    return lang;
  };

  const processSyllableGroup = async (
    syllables: { Text: string; RomanizedText?: string | null }[],
  ) => {
    if (!syllables || syllables.length === 0) return false;

    const fullText = syllables.map((s) => s.Text).join("");
    const primaryLang = getCachedLang(fullText);
    let isTextRTL = containsRTL(fullText);

    const chunks: { lang: SupportedLanguage | "unknown"; syllables: typeof syllables }[] = [];

    for (const syllable of syllables) {
      let lang = resolveContextLang(syllable.Text, primaryLang);

      const isSpaceOrPunctuation = /^[\s\p{P}]+$/u.test(syllable.Text);
      if (lang === "unknown" && isSpaceOrPunctuation && chunks.length > 0) {
        lang = chunks[chunks.length - 1].lang;
      }

      if (chunks.length > 0 && chunks[chunks.length - 1].lang === lang) {
        chunks[chunks.length - 1].syllables.push(syllable);
      } else {
        chunks.push({ lang, syllables: [syllable] });
      }
    }

    const chunkPromises = chunks.map(async (chunk) => {
      if (chunk.lang === "unknown") {
        chunk.syllables.forEach((s) => (s.RomanizedText = null));
        return;
      }

      const chunkText = chunk.syllables.map((s) => s.Text).join("");
      const [fullRomaji, ...isolatedRomajis] = await Promise.all([
        converter(chunkText, chunk.lang),
        ...chunk.syllables.map((s) => converter(s.Text, chunk.lang)),
      ]);

      reconcileRomanizations(chunk.syllables, isolatedRomajis, fullRomaji);
    });

    await Promise.all(chunkPromises);

    return isTextRTL;
  };

  switch (lyric.Type) {
    case "Line":
    case "Static": {
      const lines = lyric.Type === "Line" ? lyric.Content : lyric.Lines;

      const linePromises = lines.map(async (line) => {
        try {
          line.IsRTL = containsRTL(line.Text);
          const primaryLang = getCachedLang(line.Text);

          const tokens = line.Text.split(/([\s\p{P}]+)/u).filter(Boolean);
          const chunks: { text: string; lang: SupportedLanguage | "unknown" }[] = [];

          for (const token of tokens) {
            let lang = resolveContextLang(token, primaryLang);
            const isSpaceOrPunctuation = /^[\s\p{P}]+$/u.test(token);

            if (lang === "unknown" && isSpaceOrPunctuation && chunks.length > 0) {
              lang = chunks[chunks.length - 1].lang;
            }

            if (chunks.length > 0 && chunks[chunks.length - 1].lang === lang) {
              chunks[chunks.length - 1].text += token;
            } else {
              chunks.push({ lang, text: token });
            }
          }

          const romanizedParts = await Promise.all(
            chunks.map(async (chunk) => {
              if (chunk.lang === "unknown") return chunk.text;
              return await converter(chunk.text, chunk.lang);
            }),
          );

          const finalRomanized = romanizedParts.join("");
          if (finalRomanized !== line.Text) {
            line.RomanizedText = finalRomanized;
          }
        } catch (err) {
          log.error("Failed to process line for romanization", err);
          errorTracker.push(err instanceof Error ? err : new Error(String(err)));
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
            try {
              content.IsRTL = await processSyllableGroup(content.Lead.Syllables);

              if (content.Background) {
                await Promise.all(
                  content.Background.map(async (bg) => {
                    const isBgRTL = await processSyllableGroup(bg.Syllables);
                    if (isBgRTL && !content.IsRTL) content.IsRTL = true;
                  }),
                );
              }
            } catch (err) {
              log.error("Failed to process syllable group", err);
              errorTracker.push(err instanceof Error ? err : new Error(String(err)));
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
