import type { AmllData, Lyrics } from "~/lib/api/types";

export type ParseResult = { success: true; data: Lyrics } | { success: false; error: string };

export interface ParseOptions {
  mode?: "amll" | "apple";
}

export interface TTMLSpan {
  begin?: string;
  end?: string;
  "#text"?: string;
  "ttm:role"?: string;
  "amll:empty-beat"?: string;
  "xml:lang"?: string;
  span?: TTMLSpan | TTMLSpan[];
}

export interface TTMLP {
  begin?: string;
  end?: string;
  "#text"?: string;
  "itunes:key"?: string;
  "ttm:agent"?: string;
  span?: TTMLSpan | TTMLSpan[];
}

export interface TTMLDiv {
  begin?: string;
  end?: string;
  "itunes:songPart"?: string;
  "ttm:agent"?: string;
  p?: TTMLP | TTMLP[];
}

export interface TTMLBody {
  dur?: string;
  div?: TTMLDiv | TTMLDiv[];
}

export interface TTMLMetadataAgent {
  type?: string;
  "xml:id"?: string;
  "ttm:name"?: { type?: string; "#text"?: string };
}

export interface TTMLMetadata {
  "ttm:agent"?: TTMLMetadataAgent | TTMLMetadataAgent[];
  iTunesMetadata?: {
    leadingSilence?: string;
    translations?: unknown;
    songwriters?: { songwriter?: string | string[] };
  };
  "amll:meta"?: { key?: string; value?: string } | { key?: string; value?: string }[];
}

export interface TTMLHead {
  metadata?: TTMLMetadata;
}

export interface TTML {
  xmlns?: string;
  "xmlns:itunes"?: string;
  "xmlns:ttm"?: string;
  "itunes:timing"?: string;
  "xml:lang"?: string;
  head?: TTMLHead;
  body?: TTMLBody;
  audio?: { lyricOffset?: string };
}

export interface TTMLRoot {
  tt?: TTML;
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export const parseTime = (timeStr: string | undefined): number => {
  if (!timeStr) return 0;
  const colonIdx = timeStr.indexOf(":");
  if (colonIdx === -1) return parseFloat(timeStr);

  const mins = parseInt(timeStr.slice(0, colonIdx), 10);
  const secStart = colonIdx + 1;
  const secLen = timeStr.length - secStart;

  let seconds = 0;
  let isDecimal = false;
  let decimalDivisor = 1;

  for (let i = 0; i < secLen; i++) {
    const c = timeStr.charCodeAt(secStart + i);
    if (c === 46) {
      isDecimal = true;
      continue;
    }
    if (isDecimal) {
      decimalDivisor *= 10;
      seconds += (c - 48) / decimalDivisor;
    } else {
      seconds = seconds * 10 + (c - 48);
    }
  }
  return mins * 60 + seconds;
};

const BOUNDARY_END_REGEX = /[\s,.!?;:—]+$/;
const BOUNDARY_START_REGEX = /^[\s,.!?;:—]+/;

export function checkIsWordBoundary(rawText: string, nextRawText: string | null): boolean {
  if (nextRawText === null) return true;
  if (BOUNDARY_END_REGEX.test(rawText)) return true;
  if (BOUNDARY_START_REGEX.test(nextRawText)) return true;
  return false;
}

export function extractSongwriters(metadata: TTMLMetadata | undefined): string[] {
  if (!metadata?.iTunesMetadata?.songwriters?.songwriter) return [];
  const songwriters = metadata.iTunesMetadata.songwriters.songwriter;
  return Array.isArray(songwriters) ? songwriters : [songwriters];
}

export function extractAgents(metadata: TTMLMetadata | undefined): Map<string, string> {
  const agents = new Map<string, string>();
  const metadataAgents = metadata?.["ttm:agent"];
  if (!metadataAgents) return agents;

  const agentArray = toArray(metadataAgents);
  for (const agent of agentArray) {
    if (agent["xml:id"]) agents.set(agent["xml:id"], agent.type || "");
  }
  return agents;
}

export function isOppositeAligned(
  agentId: string | undefined,
  agents: Map<string, string>,
): boolean {
  if (!agentId) return false;
  const type = agents.get(agentId);
  if (!type || type === "group") return false;
  const match = agentId.match(/^v(\d+)$/);
  if (!match) return false;
  const num = parseInt(match[1], 10);
  if (type === "other" && num > 2) return false;
  return num > 1;
}

export function extractAppleMetaData(metadata: TTMLMetadata | undefined) {
  const result = { artists: [] as string[], spotifyId: undefined as string | undefined };
  const metas = toArray(metadata?.["amll:meta"]);
  for (const meta of metas) {
    if (meta.key === "spotifyId" && meta.value) result.spotifyId = meta.value;
    else if (meta.key === "artists" && meta.value) result.artists.push(meta.value);
  }
  return result;
}

export function extractAmllMetaData(metadata: TTMLMetadata | undefined) {
  const amll: AmllData = {
    album: [],
    appleMusicId: [],
    artists: [],
    isrc: [],
    musicName: [],
    ncmMusicId: [],
    spotifyId: [],
  };
  const result = { amll, artists: [] as string[], spotifyId: undefined as string | undefined };

  const metas = toArray(metadata?.["amll:meta"]);
  for (const meta of metas) {
    if (!meta.key || !meta.value) continue;
    switch (meta.key) {
      case "spotifyId":
        amll.spotifyId.push(meta.value);
        result.spotifyId = amll.spotifyId[0];
        break;
      case "appleMusicId":
        amll.appleMusicId.push(meta.value);
        break;
      case "isrc":
        amll.isrc.push(meta.value);
        break;
      case "musicName":
        amll.musicName.push(meta.value);
        break;
      case "artists":
        amll.artists.push(meta.value);
        result.artists.push(meta.value);
        break;
      case "album":
        amll.album.push(meta.value);
        break;
      case "ttmlAuthorGithub":
        amll.ttmlAuthorGithub = meta.value;
        break;
      case "ttmlAuthorGithubLogin":
        amll.ttmlAuthorGithubLogin = meta.value;
        break;
      case "ncmMusicId":
        amll.ncmMusicId.push(meta.value);
        break;
      case "qqMusicId":
        amll.qqMusicId = meta.value;
        break;
    }
  }
  return result;
}
