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
  extractAppleMetaData,
  extractSongwriters,
  isOppositeAligned,
  parseTime,
  toArray,
} from "~/lib/ttml/parse/utils";

export function parseAppleSyllableLine(
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

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    if (span["ttm:role"] === "x-bg") {
      const bgSpans = toArray(span.span);
      const bgSyllables: Syllable[] = [];
      let bgStart = Infinity;
      let bgEnd = 0;

      for (let j = 0; j < bgSpans.length; j++) {
        const bgSpan = bgSpans[j];
        const start = parseTime(bgSpan.begin) - timeOffset;
        const end = parseTime(bgSpan.end) - timeOffset;
        const rawText = bgSpan["#text"] || "";

        const nextRawText = j < bgSpans.length - 1 ? bgSpans[j + 1]["#text"] || "" : null;
        bgSyllables.push({
          EndTime: end,
          IsPartOfWord: !checkIsWordBoundary(rawText, nextRawText),
          StartTime: start,
          Text: rawText.trim(),
        });
        if (start < bgStart) bgStart = start;
        if (end > bgEnd) bgEnd = end;
      }
      if (bgSyllables.length > 0)
        backgroundVocalParts.push({ EndTime: bgEnd, StartTime: bgStart, Syllables: bgSyllables });
    } else if (span["#text"] !== undefined) {
      const rawText = span["#text"] || "";
      let nextLeadText: string | null = null;
      for (let k = i + 1; k < spans.length; k++) {
        if (spans[k]["ttm:role"] !== "x-bg" && spans[k]["#text"] !== undefined) {
          nextLeadText = spans[k]["#text"] || "";
          break;
        }
      }
      leadSyllables.push({
        EndTime: parseTime(span.end) - timeOffset,
        IsPartOfWord: !checkIsWordBoundary(rawText, nextLeadText),
        StartTime: parseTime(span.begin) - timeOffset,
        Text: rawText.trim(),
      });
    }
  }

  return {
    Background: backgroundVocalParts.length > 0 ? backgroundVocalParts : undefined,
    Lead: { EndTime: pEnd, StartTime: pBegin, Syllables: leadSyllables },
    OppositeAligned: isOppositeAligned(p["ttm:agent"] || divAgentId, agents),
    Type: "Vocal",
  };
}

export function parseApple(ttml: TTMLRoot, timing: string): Lyrics {
  const tt = ttml.tt;
  const metadata = tt?.head?.metadata;
  const songwriters = extractSongwriters(metadata);
  const agents = extractAgents(metadata);
  const { spotifyId, artists } = extractAppleMetaData(metadata);
  const timeOffset = tt?.audio?.lyricOffset ? parseFloat(tt.audio.lyricOffset) : 0.04;
  const divs = toArray(tt?.body?.div);

  if (timing === "None") {
    const lines: StaticLine[] = [];
    divs.forEach((div) =>
      toArray(div?.p).forEach((p) =>
        lines.push({ Text: typeof p === "string" ? p : p["#text"] || "" }),
      ),
    );
    return {
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
      content.push(parseAppleSyllableLine(p, agents, div?.["ttm:agent"], timeOffset));
    });
  });
  return {
    Artists: artists.length > 0 ? artists : undefined,
    Content: content,
    EndTime: endTime,
    Id: spotifyId || "unknown",
    SongWriters: songwriters,
    StartTime: startTime,
    Type: "Syllable",
  } satisfies SyllableData;
}
