import { atom } from "nanostores";
import { EMOJI_SAFE_REGEX } from "~/lib/string/regex";

export const $segmenter = atom<Intl.Segmenter | null>(
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null,
);

/**
 * Splits text into graphemes
 * * @param {string} text - The string to split
 * @returns {string[]} An array of visual characters
 */
export const splitGraphemes = (text: string) => {
  const segmenter = $segmenter.get();
  if (segmenter) {
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }

  return text.match(EMOJI_SAFE_REGEX) || [];
};
