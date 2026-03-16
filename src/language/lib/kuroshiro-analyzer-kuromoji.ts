import { KUROMOJI_DICT_PATH } from "@/constants";
import { getModule } from "@/lib/dom/load";

let Analyzer: any;
export const init = async (): Promise<void> => {
  if (Analyzer !== undefined) {
    return Promise.resolve();
  }

  const kuromojiModule = await getModule("kuromoji");
  const Kuromoji = kuromojiModule.default || kuromojiModule;
  return new Promise((resolve, reject) => {
    Kuromoji.builder({
      dicPath: KUROMOJI_DICT_PATH,
    }).build((error: any, analyzer: any) => {
      if (error) {
        return reject(error);
      }

      Analyzer = analyzer;
      resolve();
    });
  });
};
export const parse = (text = ""): Promise<any> => {
  if (text.trim() === "" || Analyzer === undefined) {
    return Promise.resolve([]);
  }

  // deno-lint-ignore no-explicit-any
  const result = Analyzer.tokenize(text) as any[];
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
