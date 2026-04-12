import { KUROMOJI_DICT_PATH } from "~/constants";
import { getModule } from "~/lib/dom/load";

const PRE_PROCESS_MAP: Readonly<Record<string, string>> = Object.freeze({
  "⼤": "だい",
  "⼩": "しょう",
  "⽣": "なま",
  "⾏": "い",
  "⾒": "み",
  "⾔": "い",
  "⾟i": "つらい",
  ディスり: "でぃすり",
  ディスる: "でぃする",
  一人: "ひとり",
  一人で: "ひとりで",
  一生: "いっしょう",
  一番: "いちばん",
  二人: "ふたり",
  二人で: "ふたりで",
  人々: "ひとびと",
  今更: "いまさら",
  今際: "いまわ",
  何処: "どこ",
  儘: "まま",
  其: "その",
  其処: "そこ",
  動画: "どうが",
  同担: "どうたん",
  地球: "ほし",
  堕とす: "おとす",
  大衆: "たいしゅう",
  大衆的: "たいしゅうてき",
  宇宙: "そら",
  已: "すで",
  "已(のみ)": "のみ",
  已に: "すでに",
  已む: "やむ",
  廻遊: "かいゆう",
  引き換: "ひきかえ",
  推し: "おし",
  揺蕩う: "たゆたう",
  攻撃: "こうげき",
  既読: "きどく",
  日々: "ひび",
  明日: "あした",
  星々: "ほしぼし",
  昨日: "きのう",
  時々: "ときどき",
  更生: "こうせい",
  未読: "みどく",
  本気: "まじ",
  検索: "けんさく",
  此: "これ",
  此の: "この",
  此れ: "これ",
  此処: "ここ",
  氣裸: "ぎら",
  無理: "むり",
  疾う: "とう",
  疾うに: "とうに",
  瞬間: "とき",
  瞼: "まぶた",
  結局: "けっきょく",
  肚: "はら",
  色々: "いろいろ",
  見窄らし: "みすぼらし",
  見窄らしい: "みすぼらしい",
  通知: "つうち",
  運命: "さだめ",
  銘々: "めいめい",
  陰キャ: "いんきゃ",
  陽キャ: "ようきゃ",
  際際: "きわきわ",
  雫: "しずく",
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
      word_position,
      word_type,
    },
  }));
};
