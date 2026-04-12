import type { Lyrics, SyllableData } from "~/lib/api/types";
import { formatTime, hasOppositeAligned } from "~/lib/ttml/build/utils";

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
    iTunesMetadata: Object.keys(iTunesMetadata).length > 0 ? iTunesMetadata : undefined,
    "ttm:agent": agents,
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
                "#text": syl.Text + trailingSpace,
                "@_begin": formatTime((syl.StartTime ?? 0) * timeScale),
                "@_end": formatTime((syl.EndTime ?? 0) * timeScale),
              });
            });
          }

          if (line.Lead?.Translated) {
            Object.entries(line.Lead.Translated).forEach(([lang, text]) => {
              spans.push({ "#text": text, "@_ttm:role": "x-translation", "@_xml:lang": lang });
            });
          }
          if (line.Lead?.RomanText) {
            spans.push({ "#text": line.Lead.RomanText, "@_ttm:role": "x-roman" });
          }

          if (line.Background?.length) {
            line.Background.forEach((bg) => {
              const bgSpans: any[] = [];

              bg.Syllables.forEach((syl, idx) => {
                const isLast = idx === bg.Syllables.length - 1;
                let trailingSpace = "";
                if (!syl.IsPartOfWord && !isLast && !/\s$/.test(syl.Text)) trailingSpace = " ";

                bgSpans.push({
                  "#text": syl.Text + trailingSpace,
                  "@_begin": formatTime((syl.StartTime ?? 0) * timeScale),
                  "@_end": formatTime((syl.EndTime ?? 0) * timeScale),
                });
              });

              if (bg.Translated) {
                Object.entries(bg.Translated).forEach(([lang, text]) => {
                  bgSpans.push({
                    "#text": text,
                    "@_ttm:role": "x-translation",
                    "@_xml:lang": lang,
                  });
                });
              }
              if (bg.RomanText) {
                bgSpans.push({ "#text": bg.RomanText, "@_ttm:role": "x-roman" });
              }

              spans.push({
                "@_begin": formatTime((bg.StartTime ?? 0) * timeScale),
                "@_end": formatTime((bg.EndTime ?? 0) * timeScale),
                "@_ttm:role": "x-bg",
                span: bgSpans,
              });
            });
          }

          return {
            "@_begin": formatTime((line.Lead?.StartTime ?? 0) * timeScale),
            "@_end": formatTime((line.Lead?.EndTime ?? 0) * timeScale),
            "@_itunes:key": `L${index + 1}`,
            "@_ttm:agent": line.OppositeAligned ? "v2" : "v1",
            span: spans.length > 0 ? spans : undefined,
          };
        }) || [],
    },
  };
}
