import { KUROMOJI_DICT_PATH } from "@/constants";
import { getModule } from "@/lib/dom/load";

const PRE_PROCESS_MAP: Readonly<Record<string, string>> = Object.freeze({
  見窄らしい: "みすぼらしい",
  見窄らし: "みすぼらし",
  何処: "どこ",
  堕とす: "おとす",
  ディスり: "でぃすり",
  ディスる: "でぃする",
  無理: "むり",
  攻撃: "こうげき",
  同担: "どうたん",
  引き換: "ひきかえ",
  更生: "こうせい",
  儘: "まま",
  其処: "そこ",
  疾う: "とう",
  疾うに: "とうに",
  本気: "まじ",
  運命: "さだめ",
  瞬間: "とき",
  宇宙: "そら",
  地球: "ほし",
  明日: "あした",
  昨日: "きのう",
  今更: "いまさら",
  結局: "けっきょく",
  一番: "いちばん",
  一生: "いっしょう",
  "⽣": "なま",
  "⾏": "い",
  "⾒": "み",
  "⾔": "い",
  "⼤": "だい",
  "⼩": "しょう",
  大衆的: "たいしゅうてき",
  大衆: "たいしゅう",
  動画: "どうが",
  通知: "つうち",
  検索: "けんさく",
  一人: "ひとり",
  二人: "ふたり",
  一人で: "ひとりで",
  二人で: "ふたりで",
  星々: "ほしぼし",
  人々: "ひとびと",
  時々: "ときどき",
  色々: "いろいろ",
  銘々: "めいめい",
  "⾟i": "つらい",
  既読: "きどく",
  未読: "みどく",
  推し: "おし",
  陽キャ: "ようきゃ",
  陰キャ: "いんきゃ",
  肚: "はら",
  瞼: "まぶた",
  雫: "しずく",
  揺蕩う: "たゆたう",
  "已(のみ)": "のみ",
  日々: "ひび",
  此れ: "これ",
  此の: "この",
  此処: "ここ",
  此: "これ",
  已に: "すでに",
  已む: "やむ",
  已: "すで",
});

const getReplacer = () => {
  const keys = Object.keys(PRE_PROCESS_MAP).sort((a, b) => b.length - a.length);
  if (keys.length === 0) return (t: string) => t;

  const pattern = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(${pattern})`, "g");

  return (text: string) => text.replace(regex, (match) => PRE_PROCESS_MAP[match]);
};

const preProcess = getReplacer();

let analyzerInstance: any | null = null;

export const init = async (): Promise<void> => {
  if (analyzerInstance) return;

  const kuromojiModule = await getModule("kuromoji");
  const Kuromoji = kuromojiModule.default || kuromojiModule;

  return new Promise((resolve, reject) => {
    Kuromoji.builder({ dicPath: KUROMOJI_DICT_PATH }).build((error: any, analyzer: any) => {
      if (error) return reject(error);
      analyzerInstance = analyzer;
      resolve();
    });
  });
};

export const parse = async (text = ""): Promise<any[]> => {
  const trimmed = text.trim();
  if (!trimmed || !analyzerInstance) return [];
  const preProcessedText = preProcess(trimmed.normalize("NFKC"));
  const tokens = analyzerInstance.tokenize(preProcessedText) as any[];
  return tokens.map(({ word_id, word_type, word_position, ...rest }) => ({
    ...rest,
    verbose: {
      word_id,
      word_type,
      word_position,
    },
  }));
};
