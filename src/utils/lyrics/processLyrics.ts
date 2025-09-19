import type { BestAvailableLyrics } from '@/types/lyrics.ts';
import { detectLanguage } from '@/utils/lyrics/language.ts';
import { Romanizers } from '@/utils/lyrics/romanizers/index.ts';

export async function processLyrics(lyric: BestAvailableLyrics): Promise<BestAvailableLyrics> {
  try {
    lyric.hasRomanizedText = false;

    await addRomanizationToLyrics(lyric, async (txt) => {
      const lang = detectLanguage(txt);

      if (lang && lang !== 'unknown' && Romanizers[lang]) {
        lyric.hasRomanizedText = true;
        return await Romanizers[lang](txt);
      }

      return txt;
    });

    return lyric;
  } catch (e) {
    logger.trace(e);
    return lyric;
  }
}

async function addRomanizationToLyrics(
  lyric: BestAvailableLyrics,
  converter: (txt: string) => Promise<string> | string
) {
  switch (lyric.Type) {
    case 'Line':
      for (const content of lyric.Content) {
        content.RomanizedText = await converter(content.Text);
      }
      break;

    case 'Static':
      for (const line of lyric.Lines) {
        line.RomanizedText = await converter(line.Text);
      }
      break;

    case 'Syllable':
      for (const content of lyric.Content) {
        for (const syllable of content.Lead.Syllables) {
          syllable.RomanizedText = await converter(syllable.Text);
        }

        if (content.Background) {
          for (const bg of content.Background) {
            for (const syllable of bg.Syllables) {
              syllable.RomanizedText = await converter(syllable.Text);
            }
          }
        }
      }
      break;
  }
}
