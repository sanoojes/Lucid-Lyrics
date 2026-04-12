import { describe, expect, test } from "vitest";
import { romanizePersian } from "~/index";

interface Inputs {
  description: string;
  text: string;
  expected: string;
}

describe("romanizePersian", () => {
  describe("basic letters", () => {
    test.each`
      description | text   | expected
      ${"alef"}   | ${"ا"} | ${"a"}
      ${"beh"}    | ${"ب"} | ${"b"}
      ${"peh"}    | ${"پ"} | ${"p"}
      ${"teh"}    | ${"ت"} | ${"t"}
      ${"jeem"}   | ${"ج"} | ${"j"}
      ${"cheh"}   | ${"چ"} | ${"ch"}
      ${"heh"}    | ${"ح"} | ${"h"}
      ${"kheh"}   | ${"خ"} | ${"kh"}
      ${"dal"}    | ${"د"} | ${"d"}
      ${"zal"}    | ${"ذ"} | ${"z"}
      ${"reh"}    | ${"ر"} | ${"r"}
      ${"zeh"}    | ${"ز"} | ${"z"}
      ${"zheh"}   | ${"ژ"} | ${"zh"}
      ${"seen"}   | ${"س"} | ${"s"}
      ${"sheen"}  | ${"ش"} | ${"sh"}
      ${"sad"}    | ${"ص"} | ${"s"}
      ${"zad"}    | ${"ض"} | ${"z"}
      ${"tah"}    | ${"ط"} | ${"t"}
      ${"zah"}    | ${"ظ"} | ${"z"}
      ${"ayn"}    | ${"ع"} | ${""}
      ${"ghayn"}  | ${"غ"} | ${"gh"}
      ${"feh"}    | ${"ف"} | ${"f"}
      ${"qaf"}    | ${"ق"} | ${"gh"}
      ${"kaf"}    | ${"ک"} | ${"k"}
      ${"gaf"}    | ${"گ"} | ${"g"}
      ${"lam"}    | ${"ل"} | ${"l"}
      ${"meem"}   | ${"م"} | ${"m"}
      ${"noon"}   | ${"ن"} | ${"n"}
      ${"vav"}    | ${"و"} | ${"v"}
      ${"yeh"}    | ${"ی"} | ${"y"}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizePersian(text)).toBe(expected);
    });
  });

  describe("words and phrases", () => {
    test.each`
      description | text       | expected
      ${"hello"}  | ${"سلام"}   | ${"salam"}
      ${"Iran"}   | ${"ایران"} | ${"airan"}
      ${"book"}   | ${"کتاب"}  | ${"katab"}
      ${"Persia"} | ${"ایران"} | ${"airan"}
      ${"Tehran"} | ${"تهران"} | ${"tahran"}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizePersian(text)).toBe(expected);
    });
  });

  describe("edge cases", () => {
    test.each`
      description                  | text           | expected
      ${"preserves spaces"}        | ${"ا ب پ"}     | ${"a b p"}
      ${"preserves punctuation"}   | ${"سلام!"}      | ${"salam!"}
      ${"preserves Latin letters"} | ${"Hello سلام"} | ${"Hello salam"}
      ${"preserves line breaks"}   | ${"سلام\nخوبی"} | ${"salam\nkhobi"}
      ${"empty string"}            | ${""}          | ${""}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizePersian(text)).toBe(expected);
    });
  });
});
