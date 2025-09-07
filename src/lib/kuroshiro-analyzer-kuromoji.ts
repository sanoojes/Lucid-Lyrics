import ImportedKuromoji from "./kuromoji.js"
const Kuromoji = (ImportedKuromoji as unknown as any)

let Analyzer: any
export const init = (): Promise<void> => {
	if (Analyzer !== undefined) {
		return Promise.resolve()
	}

	return new Promise(
		(resolve, reject) => {
			Kuromoji.builder({
                dicPath: "https://kuromoji.pkgs.spikerko.org"
            }).build(
				(error: any, analyzer: any) => {
					if (error) {
						return reject(error)
					}

					Analyzer = analyzer
					resolve()
				}
			)
		}
	)
}
export const parse = (text = ""): Promise<any> => {
	if ((text.trim() === "") || (Analyzer === undefined)) {
		return Promise.resolve([])
	}

	// deno-lint-ignore no-explicit-any
	const result = Analyzer.tokenize(text) as any[]
	for(const token of result) {
		token.verbose = {
			word_id: token.word_id,
			word_type: token.word_type,
			word_position: token.word_position
		}
		delete token.word_id
		delete token.word_type
		delete token.word_position
	}

	return Promise.resolve(result)
}