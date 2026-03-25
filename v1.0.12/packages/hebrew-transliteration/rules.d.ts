import { Syllable } from "havarotjs/syllable";
import { Word } from "havarotjs/word";
import { Schema } from "@/schema";
export declare const sylRules: (syl: Syllable, schema: Schema) => string;
export declare const wordRules: (word: Word, schema: Schema) => string | Word;
