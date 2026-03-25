import type { Lyrics, SyllableData } from "@/lib/api/types";
import { formatTime, hasOppositeAligned } from "./utils";

export function buildAppleMetadata(data: Lyrics) {
  const agents: any[] = [{ "@_type": "person", "@_xml:id": "v1" }];

  if (hasOppositeAligned(data)) {
    agents.push({ "@_type": "person", "@_xml:id": "v2" });
  }

  const iTunesMetadata: any = {};
  if (data.SongWriters?.length) {
    iTunesMetadata.songwriters = { songwriter: data.SongWriters };
  }

  return {
    "ttm:agent": agents,
    iTunesMetadata: Object.keys(iTunesMetadata).length > 0 ? iTunesMetadata : undefined,
  };
}

export function buildAppleSyllableBody(data: SyllableData, timeScale: number) {
  return {
    "@_dur": formatTime((data.EndTime ?? 0) * timeScale),
    div: {
      "@_begin": formatTime((data.StartTime ?? 0) * timeScale),
      "@_end": formatTime((data.EndTime ?? 0) * timeScale),
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
                "@_begin": formatTime((syl.StartTime ?? 0) * timeScale),
                "@_end": formatTime((syl.EndTime ?? 0) * timeScale),
                "#text": syl.Text + trailingSpace,
              });
            });
          }

          if (line.Lead?.Translated) {
            Object.entries(line.Lead.Translated).forEach(([lang, text]) => {
              spans.push({ "@_ttm:role": "x-translation", "@_xml:lang": lang, "#text": text });
            });
          }
          if (line.Lead?.RomanText) {
            spans.push({ "@_ttm:role": "x-roman", "#text": line.Lead.RomanText });
          }

          if (line.Background?.length) {
            line.Background.forEach((bg) => {
              const bgSpans: any[] = [];

              bg.Syllables.forEach((syl, idx) => {
                const isLast = idx === bg.Syllables.length - 1;
                let trailingSpace = "";
                if (!syl.IsPartOfWord && !isLast && !/\s$/.test(syl.Text)) trailingSpace = " ";

                bgSpans.push({
                  "@_begin": formatTime((syl.StartTime ?? 0) * timeScale),
                  "@_end": formatTime((syl.EndTime ?? 0) * timeScale),
                  "#text": syl.Text + trailingSpace,
                });
              });

              if (bg.Translated) {
                Object.entries(bg.Translated).forEach(([lang, text]) => {
                  bgSpans.push({
                    "@_ttm:role": "x-translation",
                    "@_xml:lang": lang,
                    "#text": text,
                  });
                });
              }
              if (bg.RomanText) {
                bgSpans.push({ "@_ttm:role": "x-roman", "#text": bg.RomanText });
              }

              spans.push({
                "@_ttm:role": "x-bg",
                "@_begin": formatTime((bg.StartTime ?? 0) * timeScale),
                "@_end": formatTime((bg.EndTime ?? 0) * timeScale),
                span: bgSpans,
              });
            });
          }

          return {
            "@_begin": formatTime((line.Lead?.StartTime ?? 0) * timeScale),
            "@_end": formatTime((line.Lead?.EndTime ?? 0) * timeScale),
            "@_ttm:agent": line.OppositeAligned ? "v2" : "v1",
            "@_itunes:key": `L${index + 1}`,
            span: spans.length > 0 ? spans : undefined,
          };
        }) || [],
    },
  };
}
