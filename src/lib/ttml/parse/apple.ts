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
} from "@/lib/api/types";
import {
  toArray,
  parseTime,
  checkIsWordBoundary,
  extractSongwriters,
  extractAgents,
  isOppositeAligned,
  extractAppleMetaData,
  type TTMLRoot,
  type TTMLP,
} from "@/lib/ttml/parse/utils";

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
          Text: rawText.trim(),
          IsPartOfWord: !checkIsWordBoundary(rawText, nextRawText),
          StartTime: start,
          EndTime: end,
        });
        if (start < bgStart) bgStart = start;
        if (end > bgEnd) bgEnd = end;
      }
      if (bgSyllables.length > 0)
        backgroundVocalParts.push({ Syllables: bgSyllables, StartTime: bgStart, EndTime: bgEnd });
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
        Text: rawText.trim(),
        IsPartOfWord: !checkIsWordBoundary(rawText, nextLeadText),
        StartTime: parseTime(span.begin) - timeOffset,
        EndTime: parseTime(span.end) - timeOffset,
      });
    }
  }

  return {
    Type: "Vocal",
    OppositeAligned: isOppositeAligned(p["ttm:agent"] || divAgentId, agents),
    Lead: { Syllables: leadSyllables, StartTime: pBegin, EndTime: pEnd },
    Background: backgroundVocalParts.length > 0 ? backgroundVocalParts : undefined,
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
      Id: spotifyId || "unknown",
      Type: "Static",
      SongWriters: songwriters,
      Artists: artists.length > 0 ? artists : undefined,
      Lines: lines,
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
          Type: "Vocal",
          Text: p["#text"] || "",
          StartTime: pBegin,
          EndTime: pEnd,
          OppositeAligned: isOppositeAligned(p["ttm:agent"] || div?.["ttm:agent"], agents),
        });
      });
    });
    return {
      Id: spotifyId || "unknown",
      Type: "Line",
      SongWriters: songwriters,
      Artists: artists.length > 0 ? artists : undefined,
      Content: content,
      StartTime: startTime,
      EndTime: endTime,
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
    Id: spotifyId || "unknown",
    Type: "Syllable",
    SongWriters: songwriters,
    Artists: artists.length > 0 ? artists : undefined,
    Content: content,
    StartTime: startTime,
    EndTime: endTime,
  } satisfies SyllableData;
}
