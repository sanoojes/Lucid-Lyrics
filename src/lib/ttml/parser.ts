import { XMLParser } from "fast-xml-parser";
import type { Lyrics } from "@/lib/api/types";
import {
  toArray,
  type ParseResult,
  type ParseOptions,
  type TTMLRoot,
} from "@/lib/ttml/parse/utils";
import { parseApple } from "@/lib/ttml/parse/apple";
import { parseAmll } from "@/lib/ttml/parse/amll";

const TIMING_VALID = new Set(["None", "Line", "Word"]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
});

export function parse(ttml: string, options: ParseOptions = { mode: "apple" }): ParseResult {
  let parsed: TTMLRoot;

  try {
    const cleanTtml =
      options.mode === "amll" ? ttml.replace(/<\/span>(\s+)<span/g, "$1</span><span") : ttml;
    parsed = parser.parse(cleanTtml);
  } catch (e) {
    return {
      success: false,
      error: `Invalid XML: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }

  const tt = parsed?.tt;
  if (!tt) {
    return { success: false, error: "Missing root <tt> element" };
  }

  let timing = tt["itunes:timing"];
  if (options.mode === "amll") {
    timing = "Syllable";
  } else {
    if (!timing) {
      return { success: false, error: "Missing itunes:timing attribute" };
    }
    if (!TIMING_VALID.has(timing)) {
      return { success: false, error: `Invalid itunes:timing value: ${timing}.` };
    }
  }

  if (!tt.body) {
    return { success: false, error: "Missing <body> element" };
  }
  const divs = toArray(tt.body?.div);
  if (divs.length === 0) {
    return { success: false, error: "Missing <div> elements in body" };
  }

  const hasContent = divs.some((div) => toArray(div?.p).length > 0);
  if (!hasContent) {
    return { success: false, error: "Missing <p> elements in body" };
  }

  const lyricsData: Lyrics =
    options.mode === "amll" ? parseAmll(parsed, timing) : parseApple(parsed, timing);

  return { success: true, data: lyricsData };
}

export type { ParseResult, ParseOptions } from "@/lib/ttml/parse/utils";
