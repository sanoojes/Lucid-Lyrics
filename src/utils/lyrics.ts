import type { BestAvailableLyrics } from '@/types/lyrics.ts';
import * as KuromojiAnalyzer from '@kuroshiro-analyzer-kuromoji';
import { franc } from 'franc-all';
import Kuroshiro from 'kuroshiro';

const KUROSHIRO_OPTS = { to: 'romaji', mode: 'spaced' };

export async function processLyrics(lyric: BestAvailableLyrics): Promise<BestAvailableLyrics> {
  try {
    const text = combineLyricsToText(lyric);
    const lang = franc(text);

    lyric.hasRomanizedText = false;

    if (lang === 'jpn') {
      const kuroshiro = new Kuroshiro();
      await kuroshiro.init(KuromojiAnalyzer);

      const enrichedLyrics = lyric;

      await addRomajiToLyrics(enrichedLyrics, kuroshiro);
      enrichedLyrics.hasRomanizedText = true;

      return enrichedLyrics;
    } else {
      return lyric;
    }
  } catch (e) {
    console.trace(e);
    return lyric;
  }
}

async function addRomajiToLyrics(lyric: BestAvailableLyrics, kuroshiro: Kuroshiro) {
  switch (lyric.Type) {
    case 'Line':
      for (const content of lyric.Content) {
        content.RomanizedText = await kuroshiro.convert(content.Text, KUROSHIRO_OPTS);
      }
      break;

    case 'Static':
      for (const line of lyric.Lines) {
        line.RomanizedText = await kuroshiro.convert(line.Text, KUROSHIRO_OPTS);
      }
      break;

    case 'Syllable':
      for (const content of lyric.Content) {
        for (const syllable of content.Lead.Syllables) {
          syllable.RomanizedText = await kuroshiro.convert(syllable.Text, KUROSHIRO_OPTS);
        }

        if (content.Background) {
          for (const bg of content.Background) {
            for (const syllable of bg.Syllables) {
              syllable.RomanizedText = await kuroshiro.convert(syllable.Text, KUROSHIRO_OPTS);
            }
          }
        }
      }
      break;
  }
}

export function combineLyricsToText(lyric: BestAvailableLyrics): string {
  const result: string[] = [];

  switch (lyric.Type) {
    case 'Line':
      for (const content of lyric.Content) {
        result.push(content.Text);
      }
      break;

    case 'Static':
      for (const line of lyric.Lines) {
        result.push(line.Text);
      }
      break;

    case 'Syllable':
      for (const content of lyric.Content) {
        for (const syllable of content.Lead.Syllables) {
          result.push(syllable.Text);
        }

        if (content.Background) {
          for (const bg of content.Background) {
            for (const syllable of bg.Syllables) {
              result.push(syllable.Text);
            }
          }
        }
      }
      break;
  }

  return result.join(' ');
}
