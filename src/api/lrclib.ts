import { APP_VERSION } from "@/constants";
import type {
  APIResponse,
  FetchOptions,
  Lyrics,
  LineData,
  StaticData,
  LineContent,
  StaticLine,
  InterludeContent,
} from "@/lib/api/types";

const LRCLIB_BASE_URL = "https://lrclib.net/api/get";
const missing: APIResponse<Lyrics> = { status: "missing_lyrics", data: null };

export async function fetchLRCLIB({ data, id }: FetchOptions): Promise<APIResponse<Lyrics>> {
  let list: LRCResult;

  try {
    list = await fetchLyrics(data);
  } catch (err) {
    return {
      status: "error",
      message: String(err),
    };
  }

  if ("error" in list || "statusCode" in list) {
    return missing;
  }

  const lrcData = list;
  const trackId = id ? id : String(lrcData.id);

  if (lrcData.syncedLyrics) {
    const content = parseLRC(lrcData.syncedLyrics, lrcData.duration || 0);

    const syncedResult: LineData = {
      Id: trackId,
      Type: "Line",
      SongWriters: [],
      Content: content,
      StartTime: content.length > 0 ? content[0].StartTime : 0,
      EndTime: content.length > 0 ? content[content.length - 1].EndTime : 0,
      Provider: "lrclib",
    };

    return { status: "success", data: syncedResult };
  }

  if (lrcData.plainLyrics) {
    const rawLines = lrcData.plainLyrics.split("\n");
    const staticLines: StaticLine[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const text = rawLines[i].trim();
      if (text) staticLines.push({ Text: text });
    }

    const staticResult: StaticData = {
      Id: trackId,
      Type: "Static",
      SongWriters: [],
      Lines: staticLines,
      Provider: "lrclib",
    };

    return { status: "success", data: staticResult };
  }

  return missing;
}

export type LRCSuccess = {
  id: number;
  name: string;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string;
};

export type LRCFail = {
  message: string;
  name: string;
  statusCode: number;
};

export type LRCResult = LRCSuccess | LRCFail;

function parseLRC(lyrics: string, durationSecs: number): (LineContent | InterludeContent)[] {
  const lines = lyrics.split("\n");
  const result: (LineContent | InterludeContent)[] = [];

  let prevLine: LineContent | InterludeContent | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length < 6) continue;

    if (line[0] === "[" && line.charCodeAt(1) >= 65) continue;

    const tagEnd = line.indexOf("]");
    if (line[0] === "[" && tagEnd !== -1) {
      const colonIdx = line.indexOf(":", 1);

      if (colonIdx !== -1 && colonIdx < tagEnd) {
        const mins = Number(line.substring(1, colonIdx));
        const secs = Number(line.substring(colonIdx + 1, tagEnd));
        const startTime = mins * 60 + secs;

        if (!Number.isNaN(startTime)) {
          let text = line.substring(tagEnd + 1).trim();

          if (text.indexOf("[") !== -1) {
            text = text.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, "").trim();
          }
          if (text.indexOf("<") !== -1) {
            text = text.replace(/<[^>]+>/g, "").trim();
          }

          if (!text || text === "♪" || text === "♫") {
            text = " ";
          }

          const newLine: LineContent | InterludeContent = {
            Type: text === " " ? "Interlude" : "Line",
            Text: text,
            StartTime: startTime,
            EndTime: 0,
            OppositeAligned: false,
          };

          if (prevLine) {
            prevLine.EndTime = startTime;
          }

          result.push(newLine);
          prevLine = newLine;
        }
      }
    }
  }

  if (prevLine) {
    prevLine.EndTime = durationSecs > prevLine.StartTime ? durationSecs : prevLine.StartTime + 5;
  }
  return result;
}

async function fetchLyrics(info: FetchOptions["data"]): Promise<LRCResult> {
  const params = new URLSearchParams({
    track_name: info.title!,
    artist_name: info.artist!,
    album_name: info.album!,
    duration: String((info.duration || 0) / 1000),
  });

  const requestUrl = `${LRCLIB_BASE_URL}?${params.toString()}`;

  const response = await fetch(requestUrl, {
    headers: {
      "x-user-agent": `Lucid-Lyrics v${APP_VERSION} (https://github.com/sanoojes/lucid-lyrics)`,
    },
  });

  if (!response.ok) {
    throw new Error("LRC Fetch Failed");
  }

  return (await response.json()) as LRCResult;
}
