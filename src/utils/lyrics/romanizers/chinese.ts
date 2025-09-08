import { loadModuleFromUrl } from '@utils/dom';

export async function romanizeChinese(text: string) {
  try {
    const pinyinModule = await loadModuleFromUrl<{
      pinyin: (text: string, opts?: any) => string[];
    }>('https://cdn.jsdelivr.net/gh/sanoojes/Lucid-Lyrics/src/lib/pinyin.mjs');

    return pinyinModule.pinyin(text, { style: 'normal' }).flat().join(' ');
  } catch {
    return text;
  }
}
