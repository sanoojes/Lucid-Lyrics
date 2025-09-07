import Aromanize from '@/lib/Aromanize.ts';
import * as KuromojiAnalyzer from '@/lib/kuroshiro-analyzer-kuromoji.ts';
import type { BestAvailableLyrics } from '@/types/lyrics.ts';
import { franc } from 'franc-all';
import Kuroshiro from 'kuroshiro';

const KUROSHIRO_OPTS = { to: 'romaji', mode: 'spaced' };

const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF]/;

export async function processLyrics(lyric: BestAvailableLyrics): Promise<BestAvailableLyrics> {
  try {
    lyric.hasRomanizedText = false;

    let kuroshiro: Kuroshiro | null = null;

    await addRomanizationToLyrics(lyric, async (txt) => {
      let lang = franc(txt);

      if (JAPANESE_REGEX.test(txt)) {
        lang = 'jpn';
      } else if (KOREAN_REGEX.test(txt)) {
        lang = 'kor';
      }

      if (lang === 'jpn') {
        if (!kuroshiro) {
          kuroshiro = new Kuroshiro();
          await kuroshiro.init(KuromojiAnalyzer);
        }
        return kuroshiro.convert(txt, KUROSHIRO_OPTS);
      }

      if (lang === 'kor') {
        return Aromanize(txt, 'RevisedRomanizationTransliteration');
      }

      return txt;
    });

    lyric.hasRomanizedText = true;
    return lyric;
  } catch (e) {
    console.trace(e);
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
