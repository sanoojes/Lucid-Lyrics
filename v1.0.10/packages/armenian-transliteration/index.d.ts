//#region src/index.d.ts
/**
 * Transliterates arbitrary text containing both Armenian and non-Armenian characters
 * (including punctuation) into Latin.
 *
 * Process:
 *   1) Split the text into tokens (words, punctuation, etc.), preserving delimiters.
 *   2) Replace Armenian punctuation in each token.
 *   3) For any token containing Armenian letters, split it by whitespace,
 *      transliterate each piece, and rejoin.
 *   4) Reconstruct the final string from the processed tokens.
 *
 * @param {string} text - The input string (can contain Armenian, Latin, punctuation, etc.).
 * @returns {string} - The transliterated string.
 */
declare function transliterateArmenian(text: string): string;
//#endregion
export { transliterateArmenian as default, transliterateArmenian };