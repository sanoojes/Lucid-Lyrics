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
  const startTime = performance.now();

  try {
    log.debug("start", { type: lyric.Type });

    lyric.HasRomanizedText = false;
    lyric.NeedsRomanization = false;
    lyric.IsRTL = false;

    let detectedLang: ReturnType<typeof detectLanguage>["language"] = "unknown";

    await addRomanizationToLyrics(lyric, async (txt, contextTxt) => {
      const { language: lang, usedFranc: francUsed } = detectLanguage(contextTxt);
      usedFranc = usedFranc || francUsed;

      if (!detectedLang || detectedLang === "unknown") {
        detectedLang = lang;
        lyric.IsRTL = isRTL(lang);
      }

      if (lang && lang !== "unknown" && Romanizers[lang]) {
        lyric.NeedsRomanization = true;
        lyric.HasRomanizedText = true;
        return await Romanizers[lang](txt);
      }

      return null;
    });

    lyric.UsedFranc = usedFranc;

    log.debug("success", {
      durationMs: performance.now() - startTime,
      hasRomanized: lyric.HasRomanizedText,
      usedFranc: lyric.UsedFranc,
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
  converter: (txt: string, contextTxt: string) => Promise<string | null> | string | null,
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
      const syllablePromises: Promise<void>[] = [];

      for (const content of lyric.Content) {
        const leadText = content.Lead.Syllables.map((s) => s.Text).join("");
        content.IsRTL = containsRTL(leadText);

        const leadContext = leadText;

        for (const syllable of content.Lead.Syllables) {
          syllablePromises.push(
            (async () => {
              syllable.RomanizedText = await converter(syllable.Text, leadContext);
            })(),
          );
        }

        if (content.Background) {
          for (const bg of content.Background) {
            const bgText = bg.Syllables.map((s) => s.Text).join("");
            if (!content.IsRTL) {
              content.IsRTL = containsRTL(bgText);
            }

            const bgContext = bgText;

            for (const syllable of bg.Syllables) {
              syllablePromises.push(
                (async () => {
                  syllable.RomanizedText = await converter(syllable.Text, bgContext);
                })(),
              );
            }
          }
        }
      }

      await Promise.all(syllablePromises);
      break;
    }

    default:
      log.warn("Unknown lyric type encountered");
      break;
  }
}
