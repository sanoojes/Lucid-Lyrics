import { describe, expect, test } from "vitest";
import { romanizeGothic } from "@/index";

interface Inputs {
  description: string;
  text: string;
  expected: string;
}

describe("romanizeGothic", () => {
  describe("basic letters and digraphs", () => {
    test.each`
      description             | text                      | expected
      ${"first four letters"} | ${"𐌰𐌱𐌲𐌳"}                 | ${"abgd"}
      ${"thorn digraph"}      | ${"𐌸"}                    | ${"th"}
      ${"hwair digraph"}      | ${"𐍈"}                    | ${"hw"}
      ${"all vowels"}         | ${"𐌰𐌴𐌹𐍉𐌿"}                | ${"aeiou"}
      ${"all consonants"}     | ${"𐌱𐌲𐌳𐌵𐌶𐌷𐌸𐌺𐌻𐌼𐌽𐌾𐍀𐍂𐍃𐍄𐍅𐍆𐍇𐍈"} | ${"bgdqzhthklmnjprstwfxhw"}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizeGothic(text)).toBe(expected);
    });
  });

  describe("numeric and edge cases", () => {
    test.each`
      description                  | text             | expected
      ${"drop number 90 (koppa)"}  | ${"𐍁"}           | ${""}
      ${"drop number 900 (sampi)"} | ${"𐍊"}           | ${""}
      ${"mixed letters and nums"}  | ${"𐌰𐍁𐌱𐍊𐌲"}       | ${"abg"}
      ${"preserves spaces"}        | ${"𐌰 𐌱 𐌲"}       | ${"a b g"}
      ${"preserves punctuation"}   | ${"𐌰𐍄𐍄𐌰!"}       | ${"atta!"}
      ${"preserves Latin letters"} | ${"v1. 𐌰𐍄𐍄𐌰"}    | ${"v1. atta"}
      ${"preserves line breaks"}   | ${"𐌰𐍄𐍄𐌰\n𐌿𐌽𐍃𐌰𐍂"} | ${"atta\nunsar"}
      ${"empty string"}            | ${""}            | ${""}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizeGothic(text)).toBe(expected);
    });
  });

  describe("full phrases", () => {
    test.each`
      description             | text                           | expected
      ${"Lord's Prayer"}      | ${"𐌰𐍄𐍄𐌰 𐌿𐌽𐍃𐌰𐍂, 𐌸𐌿 𐌹𐌽 𐌷𐌹𐌼𐌹𐌽𐌰𐌼"} | ${"atta unsar, thu in himinam"}
      ${"Gospel of John 1:1"} | ${"𐌹𐌽 𐍆𐍂𐌿𐌼𐌹𐍃𐍄𐌾𐌰 𐍅𐌰𐍃 𐍅𐌰𐌿𐍂𐌳"}    | ${"in frumistja was waurd"}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizeGothic(text)).toBe(expected);
    });
  });
});
