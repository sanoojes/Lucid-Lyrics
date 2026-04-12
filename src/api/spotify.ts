import type {
  APIResponse,
  FetchOptions,
  InterludeContent,
  LineContent,
  LineData,
  Lyrics,
  StaticData,
  StaticLine,
} from "~/lib/api/types";
import { wait } from "~/lib/dom/wait";

export async function fetchSpotify({ id }: FetchOptions): Promise<APIResponse<Lyrics>> {
  try {
    const baseURL = "https://spclient.wg.spotify.com/color-lyrics/v2/track/";

    let body: any;
    try {
      const get = await wait(() => Spicetify.CosmosAsync?.get);
      body = await get(`${baseURL}${id}?format=json&vocalRemoval=false&market=from_token`);
    } catch {
      return {
        message: "Spotify Request error",
        status: "error",
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
            EndTime: endTime,
            OppositeAligned: false,
            StartTime: startTime,
            Text: line.words,
            Type: "Interlude",
          } satisfies InterludeContent;
        }

        return {
          EndTime: endTime,
          OppositeAligned: false,
          StartTime: startTime,
          Text: line.words,
          Type: "Line",
        } satisfies LineContent;
      });

      result = {
        Content: content,
        EndTime: content.length > 0 ? content[content.length - 1].EndTime : 0,
        Id: id,
        Provider: "spotify",
        SongWriters: [],
        StartTime: content.length > 0 ? content[0].StartTime : 0,
        Type: "Line",
      } satisfies LineData;
    } else {
      result = {
        Id: id,
        Lines: lines.map(
          (line: any) =>
            ({
              Text: line.words,
            }) satisfies StaticLine,
        ),
        Provider: "spotify",
        SongWriters: [],
        Type: "Static",
      } satisfies StaticData;
    }

    return { data: result, status: "success" };
  } catch (err) {
    return {
      message: String(err),
      status: "error",
    };
  }
}
