import type { APIResponse, FetchOptions, Lyrics } from "@/lib/api/types";
import { parse } from "@/lib/ttml/parser";
import { logger } from "@/utils/logger";

const missing = { status: "missing_lyrics", data: null } satisfies APIResponse<Lyrics>;
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
    console.log(ttml);

    if (ttml.trim() === "") {
      return missing;
    }

    const parsedTTML = parse(ttml, { mode: "amll" });
    if (parsedTTML.success) {
      return {
        status: "success",
        data: { ...parsedTTML.data, AmllTTML: ttml, Provider: "amll" },
      };
    }
    logger.error(`failed_to_parse:${id}:`, parsedTTML);
    return {
      status: "error",
      data: null,
      error: { code: "PARSE_ERROR", message: "Parsing failed" },
    };
  } catch (err) {
    return {
      status: "error",
      data: null,
      error: {
        code: "PROVIDER_FAILED",
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
