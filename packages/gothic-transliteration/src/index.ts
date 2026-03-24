export const GOTHIC_PHONETIC_MAP: Record<string, string> = {
  𐌲𐌲: "ng",
  𐌲𐌺: "nk",
  𐌲𐌵: "nq",
  𐌰: "a",
  𐌱: "b",
  𐌲: "g",
  𐌳: "d",
  𐌴: "e",
  𐌵: "q",
  𐌶: "z",
  𐌷: "h",
  𐌸: "th",
  𐌹: "i",
  𐌺: "k",
  𐌻: "l",
  𐌼: "m",
  𐌽: "n",
  𐌾: "j",
  𐌿: "u",
  𐍀: "p",
  𐍂: "r",
  𐍃: "s",
  𐍄: "t",
  𐍅: "w",
  𐍆: "f",
  𐍇: "x",
  𐍈: "hw",
  𐍉: "o",
  𐍁: "",
  𐍊: "",
};

const GOTHIC_REGEX = /𐌲𐌲|𐌲𐌺|𐌲𐌵|./gu;

export function romanizeGothic(text: string): string {
  return text.replace(GOTHIC_REGEX, (match) => GOTHIC_PHONETIC_MAP[match] ?? match);
}

export default romanizeGothic;
