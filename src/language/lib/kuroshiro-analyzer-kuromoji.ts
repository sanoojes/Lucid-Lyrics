import { KUROMOJI_DICT_PATH } from "@/constants";
import { getModule } from "@/lib/dom/load";

const PRE_PROCESS_MAP: Record<string, string> = {
  星々: "ほしぼし",
  揺蕩う: "たゆたう",
  閻魔: "えんま",
  おくんなまし: "おくんなまし",
  申し入り: "もうしいり",
  口遊み: "くちずさみ",
  阿呆: "あほう",
  虚仮: "こけ",
  狼狽: "ろうばい",
  佗: "わび",
  昏: "くら",
  仄: "ほの",
  嘘: "うそ",
  肚: "はら",
  嘴: "くちばし",
  瞼: "まぶた",
  雫: "しずく",
  既読: "きどく",
  未読: "みどく",
  生配信: "なまはいしん",
  神対応: "かみたいおう",
  炎上: "えんじょう",
  陽キャ: "ようきゃ",
  陰キャ: "いんきゃ",
  黒歴史: "くろれきし",
  親ガチャ: "おやがちゃ",
  自己中: "じこちゅう",
  推し: "おし",
  元カレ: "もとかれ",
  元カノ: "もとかの",
  "已(のみ)": "のみ",
  日々: "ひび",
  此れ: "これ",
  此の: "この",
  此処: "ここ",
  此: "これ",
  已に: "すでに",
  已む: "やむ",
  已: "すで",
} as const;

function createReplacer(map: Record<string, string>) {
  const keys = Object.keys(map);
  if (keys.length === 0) return (text: string) => text;
  keys.sort((a, b) => b.length - a.length);

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = keys.map(escapeRegExp).join("|");
  const regex = new RegExp(pattern, "g");

  return (text: string) => text.replace(regex, (match) => map[match]);
}

const preProcess = createReplacer(PRE_PROCESS_MAP);

let Analyzer: any;

export const init = async (): Promise<void> => {
  if (Analyzer !== undefined) return;

  const kuromojiModule = await getModule("kuromoji");
  const Kuromoji = kuromojiModule.default || kuromojiModule;

  return new Promise((resolve, reject) => {
    Kuromoji.builder({ dicPath: KUROMOJI_DICT_PATH }).build((error: any, analyzer: any) => {
      if (error) return reject(error);
      Analyzer = analyzer;
      resolve();
    });
  });
};

export const parse = (text = ""): Promise<any> => {
  if (text.trim() === "" || Analyzer === undefined) {
    return Promise.resolve([]);
  }

  const preProcessedText = preProcess(text);
  const result = Analyzer.tokenize(preProcessedText) as any[];

  for (const token of result) {
    token.verbose = {
      word_id: token.word_id,
      word_type: token.word_type,
      word_position: token.word_position,
    };
    delete token.word_id;
    delete token.word_type;
    delete token.word_position;
  }

  return Promise.resolve(result);
};
