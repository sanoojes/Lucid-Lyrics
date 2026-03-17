import { XMLParser } from "fast-xml-parser";
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

export type ParseResult =
  | {
      success: true;
      data: Lyrics;
    }
  | {
      success: false;
      error: string;
    };

interface TTMLSpan {
  begin?: string;
  end?: string;
  "#text"?: string;
  "ttm:role"?: string;
  span?: TTMLSpan | TTMLSpan[];
}

interface TTMLP {
  begin?: string;
  end?: string;
  "#text"?: string;
  "itunes:key"?: string;
  "ttm:agent"?: string;
  span?: TTMLSpan | TTMLSpan[];
}

interface TTMLDiv {
  begin?: string;
  end?: string;
  "itunes:songPart"?: string;
  "ttm:agent"?: string;
  p?: TTMLP | TTMLP[];
}

interface TTMLBody {
  dur?: string;
  div?: TTMLDiv | TTMLDiv[];
}

interface TTMLMetadataAgent {
  type?: string;
  "xml:id"?: string;
  "ttm:name"?: TTMLMetadataAgentName;
}

interface TTMLMetadataAgentName {
  type?: string;
  "#text"?: string;
}

interface TTMLMetadata {
  "ttm:agent"?: TTMLMetadataAgent | TTMLMetadataAgent[];
  iTunesMetadata?: TTMLiTunesMetadata;
  "amll:meta"?: TTMLMeta | TTMLMeta[];
}

interface TTMLMeta {
  key?: string;
  value?: string;
}

interface TTMLiTunesMetadata {
  leadingSilence?: string;
  translations?: unknown;
  songwriters?: {
    songwriter?: string | string[];
  };
}

interface TTMLHead {
  metadata?: TTMLMetadata;
}

interface TTML {
  xmlns?: string;
  "xmlns:itunes"?: string;
  "xmlns:ttm"?: string;
  "itunes:timing"?: string;
  "xml:lang"?: string;
  head?: TTMLHead;
  body?: TTMLBody;
  audio?: {
    lyricOffset?: string;
  };
}

interface TTMLRoot {
  tt?: TTML;
}

const TIMING_VALID = new Set(["None", "Line", "Word"]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
});

const parseTime = (timeStr: string | undefined): number => {
  if (!timeStr) return 0;
  const colonIdx = timeStr.indexOf(":");
  if (colonIdx === -1) return parseFloat(timeStr);

  const mins = parseInt(timeStr.slice(0, colonIdx), 10);
  const secStart = colonIdx + 1;
  const secLen = timeStr.length - secStart;
  let seconds = 0;
  let decimal = 0;
  let digitsAfterDecimal = 0;

  for (let i = 0; i < secLen; i++) {
    const c = timeStr.charCodeAt(secStart + i);
    if (c === 46) {
      decimal = secLen - i - 1;
      continue;
    }
    if (decimal > 0) {
      digitsAfterDecimal++;
      seconds += (c - 48) / Math.pow(10, digitsAfterDecimal);
    } else {
      seconds = seconds * 10 + (c - 48);
    }
  }
  return mins * 60 + seconds;
};

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractSongwriters(metadata: TTMLMetadata | undefined): string[] {
  if (!metadata?.iTunesMetadata?.songwriters?.songwriter) {
    return [];
  }
  const songwriters = metadata.iTunesMetadata.songwriters.songwriter;
  return Array.isArray(songwriters) ? songwriters : [songwriters];
}

function extractAgents(metadata: TTMLMetadata | undefined): Map<string, string> {
  const agents = new Map<string, string>();
  const metadataAgents = metadata?.["ttm:agent"];
  if (!metadataAgents) return agents;

  const agentArray = toArray(metadataAgents);
  for (const agent of agentArray) {
    const id = agent["xml:id"];
    const type = agent.type;
    if (id) {
      agents.set(id, type || "");
    }
  }
  return agents;
}

function extractMetaData(metadata: TTMLMetadata | undefined): {
  spotifyId?: string;
  artists: string[];
} {
  const result = { spotifyId: undefined as string | undefined, artists: [] as string[] };
  const metaArray = metadata?.["amll:meta"];
  if (!metaArray) return result;

  const metas = toArray(metaArray);
  for (const meta of metas) {
    if (meta.key === "spotifyId" && meta.value) {
      result.spotifyId = meta.value;
    } else if (meta.key === "artists" && meta.value) {
      result.artists.push(meta.value);
    }
  }
  return result;
}

function isOppositeAligned(agentId: string | undefined, agents: Map<string, string>): boolean {
  if (!agentId) return false;
  const type = agents.get(agentId);
  if (!type) return false;

  if (type === "group") return false;

  const match = agentId.match(/^v(\d+)$/);
  if (!match) return false;

  const num = parseInt(match[1], 10);
  if (type === "other" && num > 2) return false;

  return num > 1;
}

function parseSyllableLine(
  p: TTMLP,
  agents: Map<string, string>,
  divAgentId?: string,
  timeOffset: number = 0,
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
        bgSyllables.push({
          Text: bgSpan["#text"] || "",
          IsPartOfWord: false,
          StartTime: start,
          EndTime: end,
        });
        if (start < bgStart) bgStart = start;
        if (end > bgEnd) bgEnd = end;
      }

      if (bgSyllables.length > 0) {
        backgroundVocalParts.push({
          Syllables: bgSyllables,
          StartTime: bgStart,
          EndTime: bgEnd,
        });
      }
    } else if (span["#text"] !== undefined) {
      leadSyllables.push({
        Text: span["#text"] || "",
        IsPartOfWord: false,
        StartTime: parseTime(span.begin) - timeOffset,
        EndTime: parseTime(span.end) - timeOffset,
      });
    }
  }

  const agentId = p["ttm:agent"] || divAgentId;

  return {
    Type: "Vocal",
    OppositeAligned: isOppositeAligned(agentId, agents),
    Lead: {
      Syllables: leadSyllables,
      StartTime: pBegin,
      EndTime: pEnd,
    },
    Background: backgroundVocalParts.length > 0 ? backgroundVocalParts : undefined,
  };
}

function parseLine(ttml: TTMLRoot): LineData {
  const tt = ttml?.tt;
  const body = tt?.body;
  const metadata = tt?.head?.metadata;
  const songwriters = extractSongwriters(metadata);
  const agents = extractAgents(metadata);
  const { spotifyId, artists } = extractMetaData(metadata);

  const lyricOffset = tt?.audio?.lyricOffset ? parseFloat(tt.audio.lyricOffset) : 0.04;
  const timeOffset = lyricOffset;

  const divs = toArray(body?.div);
  const content: LineContent[] = [];
  let startTime = 0;
  let endTime = 0;

  for (let i = 0; i < divs.length; i++) {
    const div = divs[i];
    const ps = toArray(div?.p);
    const divAgentId = div?.["ttm:agent"];

    for (let j = 0; j < ps.length; j++) {
      const p = ps[j];
      const pBegin = parseTime(p.begin) - timeOffset;
      const pEnd = parseTime(p.end) - timeOffset;

      if (content.length === 0) {
        startTime = pBegin;
      }
      endTime = pEnd;

      const agentId = p["ttm:agent"] || divAgentId;

      content.push({
        Type: "Vocal",
        Text: p["#text"] || "",
        StartTime: pBegin,
        EndTime: pEnd,
        OppositeAligned: isOppositeAligned(agentId, agents),
      });
    }
  }

  const id = spotifyId || "unknown";

  return {
    Id: id,
    Type: "Line",
    SongWriters: songwriters,
    Artists: artists.length > 0 ? artists : undefined,
    Content: content,
    StartTime: startTime,
    EndTime: endTime,
  };
}

function parseStatic(ttml: TTMLRoot): StaticData {
  const tt = ttml?.tt;
  const body = tt?.body;
  const metadata = tt?.head?.metadata;
  const songwriters = extractSongwriters(metadata);
  const { spotifyId, artists } = extractMetaData(metadata);

  const divs = toArray(body?.div);
  const lines: StaticLine[] = [];

  for (let i = 0; i < divs.length; i++) {
    const ps = toArray(divs[i]?.p);

    for (let j = 0; j < ps.length; j++) {
      const p = ps[j];
      const text = typeof p === "string" ? p : p["#text"] || "";
      lines.push({
        Text: text,
      });
    }
  }

  const id = spotifyId || "unknown";

  return {
    Id: id,
    Type: "Static",
    SongWriters: songwriters,
    Artists: artists.length > 0 ? artists : undefined,
    Lines: lines,
  };
}

function parseSyllable(ttml: TTMLRoot): SyllableData {
  const tt = ttml?.tt;
  const body = tt?.body;
  const metadata = tt?.head?.metadata;
  const songwriters = extractSongwriters(metadata);
  const agents = extractAgents(metadata);
  const { spotifyId, artists } = extractMetaData(metadata);

  const lyricOffset = tt?.audio?.lyricOffset ? parseFloat(tt.audio.lyricOffset) : 0.04;
  const timeOffset = lyricOffset;

  const divs = toArray(body?.div);
  const content: SyllableContent[] = [];
  let startTime = 0;
  let endTime = 0;

  for (let i = 0; i < divs.length; i++) {
    const div = divs[i];
    const ps = toArray(div?.p);
    const divAgentId = div?.["ttm:agent"];

    for (let j = 0; j < ps.length; j++) {
      const p = ps[j];
      const pBegin = parseTime(p.begin) - timeOffset;
      const pEnd = parseTime(p.end) - timeOffset;

      if (content.length === 0) {
        startTime = pBegin;
      }
      endTime = pEnd;

      content.push(parseSyllableLine(p, agents, divAgentId, timeOffset));
    }
  }

  const id = spotifyId || "unknown";

  return {
    Id: id,
    Type: "Syllable",
    SongWriters: songwriters,
    Artists: artists.length > 0 ? artists : undefined,
    Content: content,
    StartTime: startTime,
    EndTime: endTime,
  };
}

export function parse(ttml: string): ParseResult {
  let parsed: TTMLRoot;
  try {
    parsed = parser.parse(ttml);
  } catch (e) {
    return {
      success: false,
      error: `Invalid XML: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }

  const tt = parsed?.tt;
  if (!tt) {
    return { success: false, error: "Missing root <tt> element" };
  }

  const timing = tt["itunes:timing"];
  if (!timing) {
    return { success: false, error: "Missing itunes:timing attribute" };
  }

  if (!TIMING_VALID.has(timing)) {
    return {
      success: false,
      error: `Invalid itunes:timing value: ${timing}. Must be one of: None, Line, Word`,
    };
  }

  if (!tt.body) {
    return { success: false, error: "Missing <body> element" };
  }

  const divs = toArray(tt.body?.div);
  if (divs.length === 0) {
    return { success: false, error: "Missing <div> elements in body" };
  }

  const hasContent = divs.some((div) => {
    const ps = toArray(div?.p);
    return ps.length > 0;
  });

  if (!hasContent) {
    return { success: false, error: "Missing <p> elements in body" };
  }

  switch (timing) {
    case "None":
      return { success: true, data: parseStatic(parsed) };
    case "Line":
      return { success: true, data: parseLine(parsed) };
    default:
      return { success: true, data: parseSyllable(parsed) };
  }
}
