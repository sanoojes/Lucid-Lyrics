import type {
  Lyrics,
  APIResponse,
  StaticData,
  LineContent,
  LineData,
  InterludeContent,
  FetchOptions,
  StaticLine,
} from "@/lib/api/types";
import { wait } from "@/lib/dom/wait";

export async function fetchSpotify({ id }: FetchOptions): Promise<APIResponse<Lyrics>> {
  try {
    const baseURL = "https://spclient.wg.spotify.com/color-lyrics/v2/track/";

    let body: any;
    try {
      const get = await wait(() => Spicetify.CosmosAsync?.get);
      body = await get(`${baseURL}${id}?format=json&vocalRemoval=false&market=from_token`);
    } catch {
      return {
        status: "error",
        message: "Spotify Request error",
      };
    }

    const lyrics = body?.lyrics;
    if (!lyrics) {
      return { status: "missing_lyrics" };
    }

    const lines = lyrics.lines;
    let result: Lyrics;

    if (lyrics.syncType === "LINE_SYNCED") {
      const content: LineContent[] = lines.map((line: any, index: number) => {
        const startTimeMs = Number(line.startTimeMs) || 0;
        let endTimeMs = Number(line.endTimeMs) || 0;

        if (endTimeMs === 0) {
          endTimeMs =
            index < lines.length - 1 ? Number(lines[index + 1].startTimeMs) : startTimeMs + 5000;
        }

        const startTime = startTimeMs / 1000;
        const endTime = endTimeMs / 1000;

        if (line.words === "♪") {
          return {
            Type: "Interlude",
            Text: line.words,
            StartTime: startTime,
            EndTime: endTime,
            OppositeAligned: false,
          } satisfies InterludeContent;
        }

        return {
          Type: "Line",
          Text: line.words,
          StartTime: startTime,
          EndTime: endTime,
          OppositeAligned: false,
        } satisfies LineContent;
      });

      result = {
        Id: id,
        Type: "Line",
        SongWriters: [],
        Content: content,
        StartTime: content.length > 0 ? content[0].StartTime : 0,
        EndTime: content.length > 0 ? content[content.length - 1].EndTime : 0,
        Provider: "spotify",
      } satisfies LineData;
    } else {
      result = {
        Id: id,
        Type: "Static",
        SongWriters: [],
        Lines: lines.map(
          (line: any) =>
            ({
              Text: line.words,
            }) satisfies StaticLine,
        ),
        Provider: "spotify",
      } satisfies StaticData;
    }

    return { status: "success", data: result };
  } catch (err) {
    return {
      status: "error",
      message: String(err),
    };
  }
}
