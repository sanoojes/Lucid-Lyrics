export function georgianRomanization(text: string): string {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += GEORGIAN_MAP[char] !== undefined ? GEORGIAN_MAP[char] : char;
  }

  return result;
}

const GEORGIAN_MAP: Record<string, string> = {
  ა: "a",
  ბ: "b",
  გ: "g",
  დ: "d",
  ე: "e",
  ვ: "v",
  ზ: "z",
  თ: "t",
  ი: "i",
  კ: "k'",
  ლ: "l",
  მ: "m",
  ნ: "n",
  ო: "o",
  პ: "p'",
  ჟ: "zh",
  რ: "r",
  ს: "s",
  ტ: "t'",
  უ: "u",
  ფ: "p",
  ქ: "k",
  ღ: "gh",
  ყ: "q'",
  შ: "sh",
  ჩ: "ch",
  ც: "ts",
  ძ: "dz",
  წ: "ts'",
  ჭ: "ch'",
  ხ: "kh",
  ჯ: "j",
  ჰ: "h",
};
