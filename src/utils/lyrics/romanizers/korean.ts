import Aromanize from '@/lib/aromanize.ts';

export function romanizeKorean(text: string) {
  return Aromanize(text, 'RevisedRomanizationTransliteration');
}
