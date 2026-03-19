/**
 * Defines the casing pattern used for transliterated words.
 */
export enum WordCasing {
  UPPER = "upper",
  LOWER = "lower",
  MIXED = "mixed",
}

/**
 * Defines a rule that may match the first character(s) of a word
 * and return a special transliteration for that initial segment.
 */
export interface FirstCharRule {
  name: string;
  match: (first: string, second?: string) => boolean;
  transliteration: (first: string, second?: string) => string;
}
