import { XMLBuilder } from "fast-xml-parser";
import type { LineData, Lyrics, StaticData, SyllableData } from "@/lib/api/types";

const formatTime = (totalSeconds: number | undefined): string => {
  if (typeof totalSeconds !== "number" || isNaN(totalSeconds) || totalSeconds < 0) {
    return "00:00.000";
  }
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  const ms = Math.round((totalSeconds % 1) * 1000);

  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
};

function hasOppositeAligned(data: Lyrics): boolean {
  if (data.Type === "Line" || data.Type === "Syllable") {
    return data.Content?.some((line) => line.OppositeAligned) ?? false;
  }
  return false;
}

function buildMetadata(data: Lyrics) {
  const agents: any[] = [{ "@_type": "person", "@_xml:id": "v1" }];

  if (hasOppositeAligned(data)) {
    agents.push({ "@_type": "person", "@_xml:id": "v2" });
  }

  const metaArray: any[] = [];
  if (data.Id && data.Id !== "unknown") {
    metaArray.push({ "@_key": "spotifyId", "@_value": data.Id });
  }

  if (data.Artists?.length) {
    data.Artists.forEach((artist: string) => {
      metaArray.push({ "@_key": "artists", "@_value": artist });
    });
  }

  const iTunesMetadata: any = {};
  if (data.SongWriters?.length) {
    iTunesMetadata.songwriters = { songwriter: data.SongWriters };
  }

  return {
    "ttm:agent": agents,
    "amll:meta": metaArray.length > 0 ? metaArray : undefined,
    iTunesMetadata: Object.keys(iTunesMetadata).length > 0 ? iTunesMetadata : undefined,
  };
}

function buildStaticBody(data: StaticData) {
  return {
    div: {
      p: data.Lines?.map((line) => line.Text || "") || [],
    },
  };
}

function buildLineBody(data: LineData) {
  return {
    "@_dur": formatTime(data.EndTime),
    div: {
      "@_begin": formatTime(data.StartTime),
      "@_end": formatTime(data.EndTime),
      p:
        data.Content?.map((line, index) => ({
          "@_begin": formatTime(line.StartTime),
          "@_end": formatTime(line.EndTime),
          "@_ttm:agent": line.OppositeAligned ? "v2" : "v1",
          "@_itunes:key": `L${index + 1}`,
          "#text": line.Text || "",
        })) || [],
    },
  };
}

function buildSyllableBody(data: SyllableData) {
  return {
    "@_dur": formatTime(data.EndTime),
    div: {
      "@_begin": formatTime(data.StartTime),
      "@_end": formatTime(data.EndTime),
      p:
        data.Content?.map((line, index) => {
          const spans: any[] = [];

          if (line.Lead?.Syllables) {
            line.Lead.Syllables.forEach((syl, idx) => {
              const isLast = idx === line.Lead!.Syllables.length - 1;

              let trailingSpace = "";
              if (!syl.IsPartOfWord && !isLast && !/\s$/.test(syl.Text)) {
                trailingSpace = " ";
              }

              spans.push({
                "@_begin": formatTime(syl.StartTime),
                "@_end": formatTime(syl.EndTime),
                "#text": syl.Text + trailingSpace,
              });
            });
          }

          if (line.Background?.length) {
            line.Background.forEach((bg) => {
              const bgSpans = bg.Syllables.map((syl, idx) => {
                const isLast = idx === bg.Syllables.length - 1;

                let trailingSpace = "";
                if (!syl.IsPartOfWord && !isLast && !/\s$/.test(syl.Text)) {
                  trailingSpace = " ";
                }

                return {
                  "@_begin": formatTime(syl.StartTime),
                  "@_end": formatTime(syl.EndTime),
                  "#text": syl.Text + trailingSpace,
                };
              });

              spans.push({
                "@_ttm:role": "x-bg",
                span: bgSpans,
              });
            });
          }

          return {
            "@_begin": formatTime(line.Lead?.StartTime),
            "@_end": formatTime(line.Lead?.EndTime),
            "@_ttm:agent": line.OppositeAligned ? "v2" : "v1",
            "@_itunes:key": `L${index + 1}`,
            span: spans.length > 0 ? spans : undefined,
          };
        }) || [],
    },
  };
}

export function build(data: Lyrics): string {
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
    bodyObj = buildLineBody(data as LineData);
  } else if (data.Type === "Syllable") {
    timingStr = "Word";
    bodyObj = buildSyllableBody(data as SyllableData);
  }

  const ttmlObj = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
    },
    tt: {
      "@_xmlns": "http://www.w3.org/ns/ttml",
      "@_xmlns:ttm": "http://www.w3.org/ns/ttml#metadata",
      "@_xmlns:itunes": "http://music.apple.com/lyric-ttml-internal",
      "@_xmlns:amll": "http://www.example.com/ns/amll",
      "@_itunes:timing": timingStr,
      "@_xml:lang": "en",
      head: {
        metadata: buildMetadata(data),
      },
      body: bodyObj,
    },
  };

  return builder.build(ttmlObj);
}
