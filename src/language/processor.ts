import { detectLanguage, isRTL, containsRTL } from "@/language";
import { Romanizers } from "@/language/romanizers/index.ts";
import { createLogger } from "@/utils/logger";
import type { Lyrics } from "@/lib/api/types";
import { toast } from "@/lib/sonner";
import { t } from "@/i18n";

const log = createLogger("language:processor");

export async function processLyrics(lyric: Lyrics): Promise<Lyrics> {
  if (!lyric?.Type) return lyric;
  let usedFranc = false;
  let failCount = 0;
  let successCount = 0;
  const startTime = performance.now();

  try {
    log.debug("start", { type: lyric.Type });

    lyric.HasRomanizedText = false;
    lyric.NeedsRomanization = false;
    lyric.IsRTL = false;

    let detectedLang: ReturnType<typeof detectLanguage>["language"] = "unknown";

    await addRomanizationToLyrics(lyric, async (txt, contextTxt) => {
      try {
        const { language: lang, usedFranc: francUsed } = detectLanguage(contextTxt);
        usedFranc = usedFranc || francUsed;

        if (!detectedLang || detectedLang === "unknown") {
          detectedLang = lang;
          lyric.IsRTL = isRTL(lang);
        }

        if (lang && lang !== "unknown" && Romanizers[lang]) {
          lyric.NeedsRomanization = true;
          const romanizedResult = await Romanizers[lang](txt);

          if (romanizedResult) {
            successCount++;
            lyric.HasRomanizedText = true;
            return romanizedResult;
          }
        }
        return null;
      } catch (err) {
        log.error("Romanization step failed for segment", { txt, err });
        failCount++;
        return null;
      }
    });

    lyric.UsedFranc = usedFranc;

    if (failCount > 0) {
      if (successCount === 0) {
        toast.error(t("language.romanizeFailedEntirely"));
      } else {
        toast.warning(t("language.romanizePartialFail", { count: failCount }));
      }
    }

    log.debug("success", {
      durationMs: performance.now() - startTime,
      hasRomanized: lyric.HasRomanizedText,
      successCount,
      failCount,
    });

    return lyric;
  } catch (e) {
    toast.error(t("language.romanizeCriticalError"));
    log.error("critical failure", e);
    return lyric;
  }
}

async function addRomanizationToLyrics(
  lyric: Lyrics,
  converter: (txt: string, contextTxt: string) => Promise<string | null>,
) {
  switch (lyric.Type) {
    case "Line":
      await Promise.all(
        lyric.Content.map(async (content) => {
          content.RomanizedText = await converter(content.Text, content.Text);
          content.IsRTL = containsRTL(content.Text);
        }),
      );
      break;

    case "Static":
      await Promise.all(
        lyric.Lines.map(async (line) => {
          line.RomanizedText = await converter(line.Text, line.Text);
          line.IsRTL = containsRTL(line.Text);
        }),
      );
      break;

    case "Syllable": {
      const tasks: Promise<void>[] = [];

      for (const content of lyric.Content) {
        const leadText = content.Lead.Syllables.map((s) => s.Text).join("");
        content.IsRTL = containsRTL(leadText);

        for (const syllable of content.Lead.Syllables) {
          tasks.push(
            (async () => {
              syllable.RomanizedText = await converter(syllable.Text, leadText);
            })(),
          );
        }

        if (content.Background) {
          for (const bg of content.Background) {
            const bgText = bg.Syllables.map((s) => s.Text).join("");
            if (!content.IsRTL) content.IsRTL = containsRTL(bgText);

            for (const syllable of bg.Syllables) {
              tasks.push(
                (async () => {
                  syllable.RomanizedText = await converter(syllable.Text, bgText);
                })(),
              );
            }
          }
        }
      }
      await Promise.all(tasks);
      break;
    }
  }
}
