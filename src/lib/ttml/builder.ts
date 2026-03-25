import { XMLBuilder } from "fast-xml-parser";
import type { LineData, Lyrics, StaticData, SyllableData } from "@/lib/api/types";
import {
  BUILD_TIME_MULTIPLIERS,
  buildStaticBody,
  buildLineBody,
  type BuildOptions,
} from "@/lib/ttml/build/utils";
import { buildAppleMetadata, buildAppleSyllableBody } from "@/lib/ttml/build/apple";
import { buildAmllMetadata, buildAmllSyllableBody } from "@/lib/ttml/build/amll";

export function build(data: Lyrics, options: BuildOptions = {}): string {
  const mode = options.mode || "apple";
  const timeScale = BUILD_TIME_MULTIPLIERS[mode];

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    format: false,
    suppressEmptyNode: true,
  });

  let timingStr = "None";
  let bodyObj: any = {};

  if (data.Type === "Static") {
    timingStr = "None";
    bodyObj = buildStaticBody(data as StaticData);
  } else if (data.Type === "Line") {
    timingStr = "Line";
    bodyObj = buildLineBody(data as LineData, timeScale);
  } else if (data.Type === "Syllable") {
    timingStr = "Word";
    bodyObj =
      mode === "amll"
        ? buildAmllSyllableBody(data as SyllableData, timeScale)
        : buildAppleSyllableBody(data as SyllableData, timeScale);
  }

  const ttmlObj: any = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
    },
    tt: {
      "@_xmlns": "http://www.w3.org/ns/ttml",
      "@_xmlns:ttm": "http://www.w3.org/ns/ttml#metadata",
      "@_xmlns:itunes": "http://music.apple.com/lyric-ttml-internal",
      "@_itunes:timing": timingStr,
      "@_xml:lang": "en",
      head: {
        metadata: mode === "amll" ? buildAmllMetadata(data) : buildAppleMetadata(data),
      },
      body: bodyObj,
    },
  };

  if (mode === "amll") {
    ttmlObj.tt["@_xmlns:amll"] = "http://www.example.com/ns/amll";
  }

  let xmlStr = builder.build(ttmlObj);

  xmlStr = xmlStr.replace(/(\s+)<\/span>/g, "</span>$1");

  return xmlStr;
}

export type { BuildOptions } from "@/lib/ttml/build/utils";
