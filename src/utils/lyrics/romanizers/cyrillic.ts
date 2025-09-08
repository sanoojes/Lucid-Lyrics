import cyrilicRomanization from 'cyrillic-romanization';

export function romanizeCyrillic(text: string) {
  return cyrilicRomanization(text);
}
