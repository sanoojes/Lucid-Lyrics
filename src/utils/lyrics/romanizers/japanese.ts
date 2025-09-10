import * as KuromojiAnalyzer from '@/lib/kuroshiro-analyzer-kuromoji.ts';
import Kuroshiro from 'kuroshiro';

let kuroshiro: Kuroshiro | null = null;
const KUROSHIRO_OPTS = { to: 'romaji', mode: 'spaced' };

export async function romanizeJapanese(text: string) {
  if (!kuroshiro) {
    kuroshiro = new Kuroshiro();
    await kuroshiro.init(KuromojiAnalyzer);
  }
  return kuroshiro.convert(text, KUROSHIRO_OPTS);
}
