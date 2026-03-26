import { Schema } from "@/schema";
interface map {
	[k: string]: keyof Schema;
}
export declare const transliterateMap: map;
export {};
