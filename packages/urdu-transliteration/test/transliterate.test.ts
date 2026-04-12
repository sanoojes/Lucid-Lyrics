import { describe, expect, test } from "vitest";
import romanizeUrdu from "~/index";

interface Inputs {
  description: string;
  text: string;
  expected: string;
}

describe("romanizeUrdu", () => {
  describe("basic letters", () => {
    test.each`
      description          | text   | expected
      ${"alif"}            | ${"ا"} | ${"a"}
      ${"alif with madda"} | ${"آ"} | ${"aa"}
      ${"ain"}             | ${"ع"} | ${"a"}
      ${"hamza"}           | ${"ء"} | ${""}
      ${"waw"}             | ${"و"} | ${"o"}
      ${"ye"}              | ${"ی"} | ${"i"}
      ${"ye with hamza"}   | ${"ے"} | ${"e"}
      ${"bay"}             | ${"ب"} | ${"b"}
      ${"pay"}             | ${"پ"} | ${"p"}
      ${"tay"}             | ${"ت"} | ${"t"}
      ${"tta"}             | ${"ٹ"} | ${"t"}
      ${"say"}             | ${"ث"} | ${"s"}
      ${"jeem"}            | ${"ج"} | ${"j"}
      ${"chay"}            | ${"چ"} | ${"ch"}
      ${"hay"}             | ${"ح"} | ${"h"}
      ${"khay"}            | ${"خ"} | ${"kh"}
      ${"dal"}             | ${"د"} | ${"d"}
      ${"ddal"}            | ${"ڈ"} | ${"d"}
      ${"zal"}             | ${"ذ"} | ${"z"}
      ${"ray"}             | ${"ر"} | ${"r"}
      ${"rray"}            | ${"ڑ"} | ${"r"}
      ${"zay"}             | ${"ز"} | ${"z"}
      ${"seen"}            | ${"س"} | ${"s"}
      ${"sheen"}           | ${"ش"} | ${"sh"}
      ${"swad"}            | ${"ص"} | ${"s"}
      ${"dwad"}            | ${"ض"} | ${"z"}
      ${"tway"}            | ${"ط"} | ${"t"}
      ${"zway"}            | ${"ظ"} | ${"z"}
      ${"ghayn"}           | ${"غ"} | ${"gh"}
      ${"fay"}             | ${"ف"} | ${"f"}
      ${"qaf"}             | ${"ق"} | ${"q"}
      ${"kaf"}             | ${"ک"} | ${"k"}
      ${"gaf"}             | ${"گ"} | ${"g"}
      ${"lam"}             | ${"ل"} | ${"l"}
      ${"meem"}            | ${"م"} | ${"m"}
      ${"noon"}            | ${"ن"} | ${"n"}
      ${"nun with ghunna"} | ${"ں"} | ${"n"}
      ${"he"}              | ${"ہ"} | ${"h"}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizeUrdu(text)).toBe(expected);
    });
  });

  describe("common words", () => {
    test.each`
      description           | text      | expected
      ${"I am"}             | ${"میں"}  | ${"mein"}
      ${"we"}               | ${"ہم"}   | ${"hum"}
      ${"he/she"}           | ${"وہ"}   | ${"woh"}
      ${"this"}             | ${"یہ"}   | ${"yeh"}
      ${"you (respectful)"} | ${"آپ"}   | ${"aap"}
      ${"you (informal)"}   | ${"تو"}   | ${"to"}
      ${"is"}               | ${"ہے"}   | ${"hai"}
      ${"am"}               | ${"ہوں"}  | ${"hoon"}
      ${"are"}              | ${"ہیں"}  | ${"hain"}
      ${"even"}             | ${"ہی"}   | ${"hi"}
      ${"was"}              | ${"تھا"}  | ${"tha"}
      ${"was (feminine)"}   | ${"تھی"}  | ${"thi"}
      ${"was (plural)"}     | ${"تھے"}  | ${"the"}
      ${"what"}             | ${"کیا"}  | ${"kya"}
      ${"to"}               | ${"کو"}   | ${"ko"}
      ${"from"}             | ${"سے"}   | ${"se"}
      ${"on"}               | ${"پر"}   | ${"par"}
      ${"and"}              | ${"اور"}  | ${"aur"}
      ${"if"}               | ${"اگر"}  | ${"agar"}
      ${"but"}              | ${"لیکن"} | ${"lekin"}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizeUrdu(text)).toBe(expected);
    });
  });

  describe("family terms", () => {
    test.each`
      description               | text             | expected
      ${"sister"}               | ${"بہن"}         | ${"behan"}
      ${"brother"}              | ${"بھائی"}       | ${"bhai"}
      ${"step-brother"}         | ${"سوتیلا بھائی"} | ${"sotela bhai"}
      ${"mother"}               | ${"ماں"}         | ${"maan"}
      ${"father"}               | ${"باپ"}         | ${"baap"}
      ${"son"}                  | ${"بیٹا"}        | ${"beta"}
      ${"daughter"}             | ${"بیٹی"}        | ${"beti"}
      ${"paternal uncle"}       | ${"چاچا"}        | ${"chacha"}
      ${"maternal uncle"}       | ${"ماموں"}       | ${"mamoo"}
      ${"paternal aunt"}        | ${"خالہ"}        | ${"khala"}
      ${"maternal aunt"}        | ${"پھوپھی"}      | ${"phuphi"}
      ${"maternal grandmother"} | ${"نانی"}        | ${"nani"}
      ${"paternal grandfather"} | ${"دادا"}        | ${"dada"}
      ${"paternal grandmother"} | ${"دادی"}        | ${"dadi"}
      ${"grandson"}             | ${"پوتا"}        | ${"pota"}
      ${"granddaughter"}        | ${"پوتی"}        | ${"poti"}
      ${"orphan"}               | ${"یتیم"}        | ${"yateem"}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizeUrdu(text)).toBe(expected);
    });
  });

  describe("Islamic terms", () => {
    test.each`
      description             | text              | expected
      ${"Allah"}              | ${"اللہ"}         | ${"Allah"}
      ${"Muhammad"}           | ${"محمد"}         | ${"Muhammad"}
      ${"Prophet"}            | ${"رسول"}         | ${"Rasool"}
      ${"Messenger"}          | ${"نبی"}          | ${"Nabi"}
      ${"Quran"}              | ${"قرآن"}         | ${"Quran"}
      ${"Hadith"}             | ${"حدیث"}         | ${"Hadith"}
      ${"Islam"}              | ${"اسلام"}         | ${"Islam"}
      ${"Muslim"}             | ${"مسلمان"}       | ${"Muslim"}
      ${"faith"}              | ${"ایمان"}        | ${"Iman"}
      ${"prayer"}             | ${"نماز"}         | ${"Namaz"}
      ${"fasting"}            | ${"روزہ"}         | ${"Roza"}
      ${"charity"}            | ${"زکوٰۃ"}         | ${"Zakat"}
      ${"pilgrimage"}         | ${"حج"}           | ${"Hajj"}
      ${"charitable giving"}  | ${"صدقہ"}         | ${"Sadaqah"}
      ${"paradise"}           | ${"جنت"}          | ${"Jannat"}
      ${"hell"}               | ${"دوزخ"}         | ${"Dozakh"}
      ${"afterlife"}          | ${"آخرت"}         | ${"Aakhirat"}
      ${"Alhamdulillah"}      | ${"الحمد للہ"}    | ${"Alhamdulillah"}
      ${"InshaAllah"}         | ${"ان شاء اللہ"}  | ${"InshaAllah"}
      ${"MashaAllah"}         | ${"ما شاء اللہ"}  | ${"MashaAllah"}
      ${"JazakAllah"}         | ${"جزاک اللہ"}    | ${"JazakAllah"}
      ${"Allahu Akbar"}       | ${"اللہ اکبر"}    | ${"Allahu Akbar"}
      ${"Assalamu Alaikum"}   | ${"السلام علیکم"}  | ${"Assalamu Alaikum"}
      ${"Wa Alaikum Assalam"} | ${"وعلیکم السلام"} | ${"Wa Alaikum Assalam"}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizeUrdu(text)).toBe(expected);
    });
  });

  describe("edge cases", () => {
    test.each`
      description                  | text          | expected
      ${"preserves spaces"}        | ${"میں ہوں"}  | ${"mein hoon"}
      ${"preserves punctuation"}   | ${"وہ!"}      | ${"woh!"}
      ${"preserves Latin letters"} | ${"urdu ہے"}  | ${"urdu hai"}
      ${"preserves line breaks"}   | ${"میں\nہوں"} | ${"mein\nhoon"}
      ${"empty string"}            | ${""}         | ${""}
    `("$description", ({ text, expected }: Inputs) => {
      expect(romanizeUrdu(text)).toBe(expected);
    });
  });
});
