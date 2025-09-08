import { romanizeJapanese } from '@/utils/lyrics/romanizers/japanese.ts';
import { romanizeKorean } from '@/utils/lyrics/romanizers/korean.ts';
import { romanizeChinese } from '@/utils/lyrics/romanizers/chinese.ts';
import { romanizeCyrillic } from '@/utils/lyrics/romanizers/cyrillic.ts';
import type { SupportedLanguage } from '@/utils/lyrics/language.ts';
import { romanizeGreek } from '@/utils/lyrics/romanizers/greek.ts';

export const Romanizers: Record<SupportedLanguage, (text: string) => Promise<string> | string> = {
  japanese: romanizeJapanese,
  korean: romanizeKorean,
  chinese: romanizeChinese,
  cyrillic: romanizeCyrillic,
  greek: romanizeGreek,
};
