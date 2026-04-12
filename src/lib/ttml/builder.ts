import { XMLBuilder } from "fast-xml-parser";
import type { LineData, Lyrics, StaticData, SyllableData } from "~/lib/api/types";
import {
  BUILD_TIME_MULTIPLIERS,
  type BuildOptions,
  buildLineBody,
  buildStaticBody,
} from "~/lib/ttml/build/utils";
import { buildAppleMetadata, buildAppleSyllableBody } from "~/lib/ttml/build/apple";
import { buildAmllMetadata, buildAmllSyllableBody } from "~/lib/ttml/build/amll";

export function build(data: Lyrics, options: BuildOptions = {}): string {
  const mode = options.mode || "apple";
  const timeScale = BUILD_TIME_MULTIPLIERS[mode];

  const builder = new XMLBuilder({
    attributeNamePrefix: "@_",
    format: false,
    ignoreAttributes: false,
    suppressEmptyNode: true,
    textNodeName: "#text",
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
      "@_encoding": "UTF-8",
      "@_version": "1.0",
    },
    tt: {
      "@_itunes:timing": timingStr,
      "@_xml:lang": "en",
      "@_xmlns": "http://www.w3.org/ns/ttml",
      "@_xmlns:itunes": "http://music.apple.com/lyric-ttml-internal",
      "@_xmlns:ttm": "http://www.w3.org/ns/ttml#metadata",
      body: bodyObj,
      head: {
        metadata: mode === "amll" ? buildAmllMetadata(data) : buildAppleMetadata(data),
      },
    },
  };

  if (mode === "amll") {
    ttmlObj.tt["@_xmlns:amll"] = "http://www.example.com/ns/amll";
  }

  let xmlStr = builder.build(ttmlObj);

  xmlStr = xmlStr.replace(/(\s+)<\/span>/g, "</span>$1");

  return xmlStr;
}

export type { BuildOptions } from "~/lib/ttml/build/utils";
