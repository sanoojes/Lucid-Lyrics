import Aromanize from '@/lib/Aromanize.ts';
import * as KuromojiAnalyzer from '@/lib/kuroshiro-analyzer-kuromoji.ts';
import type { BestAvailableLyrics } from '@/types/lyrics.ts';
import { eld } from 'eld';
import Kuroshiro from 'kuroshiro';
import { pinyin } from 'pinyin';

const KUROSHIRO_OPTS = { to: 'romaji', mode: 'spaced' };

const JAPANESE_REGEX = /([ぁ-んァ-ン])/;
const CHINESE_REGEX = /([\u4E00-\u9FFF])/;
const KOREAN_REGEX =
  /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/;

export async function processLyrics(lyric: BestAvailableLyrics): Promise<BestAvailableLyrics> {
  try {
    lyric.hasRomanizedText = false;

    let kuroshiro: Kuroshiro | null = null;

    await addRomanizationToLyrics(lyric, async (txt) => {
      let lang = await eld.detect(txt);
      console.log(lang);

      if (JAPANESE_REGEX.test(txt)) {
        lang = 'jpn';
      } else if (KOREAN_REGEX.test(txt)) {
        lang = 'kor';
      } else if (CHINESE_REGEX.test(txt)) {
        lang = 'cmn';
      }

      if (lang === 'jpn') {
        if (!kuroshiro) {
          kuroshiro = new Kuroshiro();
          await kuroshiro.init(KuromojiAnalyzer);
        }
        return kuroshiro.convert(txt, KUROSHIRO_OPTS);
      } else if (lang === 'kor') {
        return Aromanize(txt, 'RevisedRomanizationTransliteration');
      } else if (lang === 'cmn') {
        console.log(pinyin);
        const result = pinyin(txt, { style: 'normal' });
        return result.flat().join(' ');
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
