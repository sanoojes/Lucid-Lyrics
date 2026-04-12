import type { APIResponse, FetchOptions, Lyrics } from "~/lib/api/types";
import { parse } from "~/lib/ttml/parser";
import { logger } from "~/utils/logger";

const missing = { data: null, status: "missing_lyrics" } satisfies APIResponse<Lyrics>;

export async function fetchAMLL({ id }: FetchOptions): Promise<APIResponse<Lyrics>> {
  try {
    const baseURL = "https://raw.githubusercontent.com/amll-dev/amll-ttml-db/main/spotify-lyrics";
    const link = `${baseURL}/${encodeURIComponent(id)}.ttml`;

    const res = await fetch(link);

    if (!res.ok) {
      if (res.status === 404) {
        return missing;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const ttml = await res.text();

    if (ttml.trim() === "") {
      return missing;
    }

    const parsedTTML = parse(ttml, { mode: "amll" });
    if (parsedTTML.success) {
      return {
        data: { ...parsedTTML.data, AmllTTML: ttml, Provider: "amll" },
        status: "success",
      };
    }
    logger.error(`failed_to_parse:${id}:`, parsedTTML);
    return {
      message: "Parsing failed",
      status: "parse_error",
    };
  } catch (err) {
    return {
      message: String(err),
      status: "error",
    };
  }
}
