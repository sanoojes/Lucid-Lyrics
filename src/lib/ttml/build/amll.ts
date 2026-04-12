import type { AmllData, Lyrics, SyllableData } from "~/lib/api/types";
import { formatTime, hasOppositeAligned } from "~/lib/ttml/build/utils";

export function buildAmllMetadata(data: Lyrics) {
  const agents: any[] = [{ "@_type": "person", "@_xml:id": "v1" }];

  if (hasOppositeAligned(data)) {
    agents.push({ "@_type": "person", "@_xml:id": "v2" });
  }

  const metaArray: any[] = [];
  const amll = (data as any).Amll as AmllData | undefined;

  if (amll?.spotifyId?.length)
    amll.spotifyId.forEach((id) => metaArray.push({ "@_key": "spotifyId", "@_value": id }));
  else if (data.Id && data.Id !== "unknown")
    metaArray.push({ "@_key": "spotifyId", "@_value": data.Id });

  if (amll?.appleMusicId?.length)
    amll.appleMusicId.forEach((id) => metaArray.push({ "@_key": "appleMusicId", "@_value": id }));
  if (amll?.isrc?.length)
    amll.isrc.forEach((id) => metaArray.push({ "@_key": "isrc", "@_value": id }));
  if (amll?.musicName?.length)
    amll.musicName.forEach((name) => metaArray.push({ "@_key": "musicName", "@_value": name }));

  if (amll?.artists?.length)
    amll.artists.forEach((artist) => metaArray.push({ "@_key": "artists", "@_value": artist }));
  else if (data.Artists?.length)
    data.Artists.forEach((artist) => metaArray.push({ "@_key": "artists", "@_value": artist }));

  if (amll?.album?.length)
    amll.album.forEach((album) => metaArray.push({ "@_key": "album", "@_value": album }));
  if (amll?.ttmlAuthorGithub)
    metaArray.push({ "@_key": "ttmlAuthorGithub", "@_value": amll.ttmlAuthorGithub });
  if (amll?.ttmlAuthorGithubLogin)
    metaArray.push({ "@_key": "ttmlAuthorGithubLogin", "@_value": amll.ttmlAuthorGithubLogin });
  if (amll?.ncmMusicId?.length)
    amll.ncmMusicId.forEach((id) => metaArray.push({ "@_key": "ncmMusicId", "@_value": id }));
  if (amll?.qqMusicId) metaArray.push({ "@_key": "qqMusicId", "@_value": amll.qqMusicId });

  const iTunesMetadata: any = {};
  if (data.SongWriters?.length) {
    iTunesMetadata.songwriters = { songwriter: data.SongWriters };
  }

  return {
    "amll:meta": metaArray.length > 0 ? metaArray : undefined,
    iTunesMetadata: Object.keys(iTunesMetadata).length > 0 ? iTunesMetadata : undefined,
    "ttm:agent": agents,
  };
}

export function buildAmllSyllableBody(data: SyllableData, timeScale: number) {
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
              if (!syl.IsPartOfWord && !isLast && !/\s$/.test(syl.Text)) trailingSpace = " ";

              const spanObj: any = {
                "#text": syl.Text + trailingSpace,
                "@_begin": formatTime((syl.StartTime ?? 0) * timeScale),
                "@_end": formatTime((syl.EndTime ?? 0) * timeScale),
              };

              if (syl.EmptyBeat !== undefined)
                spanObj["@_amll:empty-beat"] = syl.EmptyBeat.toString();
              spans.push(spanObj);
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

                const bgSpanObj: any = {
                  "#text": syl.Text + trailingSpace,
                  "@_begin": formatTime((syl.StartTime ?? 0) * timeScale),
                  "@_end": formatTime((syl.EndTime ?? 0) * timeScale),
                };

                if (syl.EmptyBeat !== undefined)
                  bgSpanObj["@_amll:empty-beat"] = syl.EmptyBeat.toString();
                bgSpans.push(bgSpanObj);
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
