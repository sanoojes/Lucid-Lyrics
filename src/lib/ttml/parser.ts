import { XMLParser } from "fast-xml-parser";
import type { Lyrics } from "~/lib/api/types";
import {
  type ParseOptions,
  type ParseResult,
  type TTMLRoot,
  toArray,
} from "~/lib/ttml/parse/utils";
import { parseApple } from "~/lib/ttml/parse/apple";
import { parseAmll } from "~/lib/ttml/parse/amll";

const TIMING_VALID = new Set(["None", "Line", "Word"]);

const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
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
      error: `Invalid XML: ${e instanceof Error ? e.message : "Unknown error"}`,
      success: false,
    };
  }

  const tt = parsed?.tt;
  if (!tt) {
    return { error: "Missing root <tt> element", success: false };
  }

  let timing = tt["itunes:timing"];
  if (options.mode === "amll") {
    timing = "Syllable";
  } else {
    if (!timing) {
      return { error: "Missing itunes:timing attribute", success: false };
    }
    if (!TIMING_VALID.has(timing)) {
      return { error: `Invalid itunes:timing value: ${timing}.`, success: false };
    }
  }

  if (!tt.body) {
    return { error: "Missing <body> element", success: false };
  }
  const divs = toArray(tt.body?.div);
  if (divs.length === 0) {
    return { error: "Missing <div> elements in body", success: false };
  }

  const hasContent = divs.some((div) => toArray(div?.p).length > 0);
  if (!hasContent) {
    return { error: "Missing <p> elements in body", success: false };
  }

  const lyricsData: Lyrics =
    options.mode === "amll" ? parseAmll(parsed, timing) : parseApple(parsed, timing);

  return { data: lyricsData, success: true };
}

export type { ParseResult, ParseOptions } from "~/lib/ttml/parse/utils";
