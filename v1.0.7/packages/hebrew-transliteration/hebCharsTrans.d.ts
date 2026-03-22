import { Schema } from "./schema.js";
interface map {
	[k: string]: keyof Schema;
}
export declare const transliterateMap: map;
export {};
