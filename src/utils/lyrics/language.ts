import { franc } from 'franc-min';

const JAPANESE_REGEX = /([ぁ-んァ-ン々])/;
const CHINESE_REGEX = /\p{Script=Han}/u;
const KOREAN_REGEX =
  /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/;
const CYRILLIC_REGEX = /[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]{2,}/;
const GREEK_REGEX = /[\u0370-\u03FF\u1F00-\u1FFF]/;

export type SupportedLanguage = 'japanese' | 'korean' | 'chinese' | 'greek' | 'cyrillic';

export function detectLanguage(text: string): SupportedLanguage | 'unknown' | null {
  const lang = franc(text);

  if (lang === 'jpn' || JAPANESE_REGEX.test(text)) return 'japanese';

  if (lang === 'kor' || KOREAN_REGEX.test(text)) return 'korean';

  if (lang === 'cmn' || CHINESE_REGEX.test(text)) return 'chinese';

  if (
    ['bel', 'bul', 'kaz', 'mkd', 'rus', 'srp', 'tgk', 'ukr'].includes(lang) ||
    CYRILLIC_REGEX.test(text)
  )
    return 'cyrillic';

  if (lang === 'ell' || GREEK_REGEX.test(text)) return 'greek';

  return 'unknown';
}
