import { Text } from "havarotjs";
import { Schema } from "./schema.js";
/**
* Transliterates Hebrew text according to a given schema
*
* @param text - a string or {@link https://charlesloder.github.io/havarotjs/classes/text.Text.html | Text} of Hebrew characters
* @param schema - a {@link Schema} for transliterating the text
* @returns a transliterated text
*
* @example
* Default
* ```ts
* import { transliterate } from "hebrew-transliteration";
*
* transliterate("אֱלֹהִים");
* // "ʾĕlōhîm";
* ```
*
* @example
* Using `Partial<Schema>`
* ```ts
* import { transliterate } from "hebrew-transliteration";
*
* transliterate("שָׁלוֹם", { SHIN: "sh" })
* // shālôm
* ```
*
* @example
* Using a custom `Schema`
* ```ts
* import { transliterate, Schema } from "hebrew-transliteration";
*
* const schema = new Schema({ ALEF: "'", BET: "B", ... QAMETS: "A", ... }) // truncated for brevity
*
* transliterate("אָ֣ב", schema)
* // 'AB
* ```
*
* @remarks
* If no {@link Schema} is passed, then the package defaults to SBL's academic style. You can pass in a partial schema that will modify SBL's academic style.
* If you need a fully custom schema, it is best to use the {@link Schema} constructor.
*
*/
export declare const transliterate: (text: string | Text, schema?: Partial<Schema> | Schema) => string;
