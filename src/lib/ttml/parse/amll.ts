import type {
  LineContent,
  LineData,
  Lyrics,
  StaticData,
  StaticLine,
  Syllable,
  SyllableContent,
  SyllableData,
  VocalPart,
} from "~/lib/api/types";
import {
  type TTMLP,
  type TTMLRoot,
  checkIsWordBoundary,
  extractAgents,
  extractAmllMetaData,
  extractSongwriters,
  isOppositeAligned,
  parseTime,
  toArray,
} from "~/lib/ttml/parse/utils";

export function parseAmllSyllableLine(
  p: TTMLP,
  agents: Map<string, string>,
  divAgentId?: string,
  timeOffset = 0,
): SyllableContent {
  const pBegin = parseTime(p.begin) - timeOffset;
  const pEnd = parseTime(p.end) - timeOffset;
  const spans = toArray(p.span);

  const leadSyllables: Syllable[] = [];
  const backgroundVocalParts: VocalPart[] = [];

  let leadTranslated: Record<string, string> | undefined;
  let leadRomanText: string | undefined;
  let nextLeadText: string | null = null;

  for (let i = spans.length - 1; i >= 0; i--) {
    const span = spans[i];
    const role = span["ttm:role"];

    if (role === "x-translation") {
      const text = span["#text"] || "";
      if (text) {
        leadTranslated = leadTranslated || {};
        leadTranslated[span["xml:lang"] || "unknown"] = text.trim();
      }
      continue;
    }

    if (role === "x-roman") {
      const text = span["#text"] || "";
      if (text) leadRomanText = text.trim();
      continue;
    }

    if (role === "x-bg") {
      const bgSpans = toArray(span.span);
      const bgSyllables: Syllable[] = [];
      let bgTranslated: Record<string, string> | undefined;
      let bgRomanText: string | undefined;
      let bgStart = Infinity;
      let bgEnd = 0;
      let nextBgText: string | null = null;

      for (let j = bgSpans.length - 1; j >= 0; j--) {
        const bgSpan = bgSpans[j];
        const bgRole = bgSpan["ttm:role"];

        if (bgRole === "x-translation") {
          const text = bgSpan["#text"] || "";
          if (text) {
            bgTranslated = bgTranslated || {};
            bgTranslated[bgSpan["xml:lang"] || "unknown"] = text.trim();
          }
          continue;
        }

        if (bgRole === "x-roman") {
          const text = bgSpan["#text"] || "";
          if (text) bgRomanText = text.trim();
          continue;
        }

        const rawText = bgSpan["#text"] || "";
        const isPartOfWord = !checkIsWordBoundary(rawText, nextBgText);
        nextBgText = rawText;

        const start = parseTime(bgSpan.begin) - timeOffset;
        const end = parseTime(bgSpan.end) - timeOffset;

        bgSyllables.push({
          EmptyBeat: bgSpan["amll:empty-beat"]
            ? parseInt(bgSpan["amll:empty-beat"], 10)
            : undefined,
          EndTime: end,
          IsPartOfWord: isPartOfWord,
          StartTime: start,
          Text: rawText.trim(),
        });

        if (start < bgStart) bgStart = start;
        if (end > bgEnd) bgEnd = end;
      }

      if (bgSyllables.length > 0) {
        bgSyllables.reverse();
        backgroundVocalParts.push({
          EndTime: bgEnd,
          StartTime: bgStart,
          Syllables: bgSyllables,
          ...(bgTranslated && { Translated: bgTranslated }),
          ...(bgRomanText && { RomanText: bgRomanText }),
        });
      }
    } else if (span["#text"] !== undefined) {
      const rawText = span["#text"] || "";
      const isPartOfWord = !checkIsWordBoundary(rawText, nextLeadText);
      nextLeadText = rawText;

      leadSyllables.push({
        EmptyBeat: span["amll:empty-beat"] ? parseInt(span["amll:empty-beat"], 10) : undefined,
        EndTime: parseTime(span.end) - timeOffset,
        IsPartOfWord: isPartOfWord,
        StartTime: parseTime(span.begin) - timeOffset,
        Text: rawText.trim(),
      });
    }
  }

  leadSyllables.reverse();
  backgroundVocalParts.reverse();

  return {
    Background: backgroundVocalParts.length > 0 ? backgroundVocalParts : undefined,
    Lead: {
      EndTime: pEnd,
      StartTime: pBegin,
      Syllables: leadSyllables,
      ...(leadTranslated && { Translated: leadTranslated }),
      ...(leadRomanText && { RomanText: leadRomanText }),
    },
    OppositeAligned: isOppositeAligned(p["ttm:agent"] || divAgentId, agents),
    Type: "Vocal",
  };
}

export function parseAmll(ttml: TTMLRoot, timing: string): Lyrics {
  const tt = ttml.tt;
  const metadata = tt?.head?.metadata;
  const songwriters = extractSongwriters(metadata);
  const agents = extractAgents(metadata);
  const { spotifyId, artists, amll } = extractAmllMetaData(metadata);
  const timeOffset = tt?.audio?.lyricOffset ? parseFloat(tt.audio.lyricOffset) : 0.04;
  const amllDataFinal =
    amll.spotifyId.length > 0 || amll.appleMusicId.length > 0 ? amll : undefined;
  const divs = toArray(tt?.body?.div);

  if (timing === "None") {
    const lines: StaticLine[] = [];
    divs.forEach((div) =>
      toArray(div?.p).forEach((p) =>
        lines.push({ Text: typeof p === "string" ? p : p["#text"] || "" }),
      ),
    );
    return {
      Amll: amllDataFinal,
      Artists: artists.length > 0 ? artists : undefined,
      Id: spotifyId || "unknown",
      Lines: lines,
      SongWriters: songwriters,
      Type: "Static",
    } satisfies StaticData;
  }

  if (timing === "Line") {
    const content: LineContent[] = [];
    let startTime = 0;
    let endTime = 0;
    divs.forEach((div) => {
      toArray(div?.p).forEach((p) => {
        const pBegin = parseTime(p.begin) - timeOffset;
        const pEnd = parseTime(p.end) - timeOffset;
        if (content.length === 0) startTime = pBegin;
        endTime = pEnd;
        content.push({
          EndTime: pEnd,
          OppositeAligned: isOppositeAligned(p["ttm:agent"] || div?.["ttm:agent"], agents),
          StartTime: pBegin,
          Text: p["#text"] || "",
          Type: "Vocal",
        });
      });
    });
    return {
      Amll: amllDataFinal,
      Artists: artists.length > 0 ? artists : undefined,
      Content: content,
      EndTime: endTime,
      Id: spotifyId || "unknown",
      SongWriters: songwriters,
      StartTime: startTime,
      Type: "Line",
    } satisfies LineData;
  }

  const content: SyllableContent[] = [];
  let startTime = 0;
  let endTime = 0;
  divs.forEach((div) => {
    toArray(div?.p).forEach((p) => {
      if (content.length === 0) startTime = parseTime(p.begin) - timeOffset;
      endTime = parseTime(p.end) - timeOffset;
      content.push(parseAmllSyllableLine(p, agents, div?.["ttm:agent"], timeOffset));
    });
  });
  return {
    Amll: amllDataFinal,
    Artists: artists.length > 0 ? artists : undefined,
    Content: content,
    EndTime: endTime,
    Id: spotifyId || "unknown",
    SongWriters: songwriters,
    StartTime: startTime,
    Type: "Syllable",
  } satisfies SyllableData;
}
