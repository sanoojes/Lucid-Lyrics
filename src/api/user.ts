import type { Lyrics, APIResponse, FetchOptions } from "@/lib/api/types";
import { $ttml_maker_mode } from "@/stores/dev";
import { getLocalTTMLBySongId } from "@/stores/idb/ttml";
import { refetchLyrics } from "@/api/solid";

export async function fetchUser({ id }: FetchOptions): Promise<APIResponse<Lyrics>> {
  try {
    if ($ttml_maker_mode.get() !== "on") return { status: "missing_lyrics", data: null };
    const ttml = await getLocalTTMLBySongId(id);

    if (!ttml) {
      return { status: "missing_lyrics", data: null };
    }

    if (!ttml.parsedTTML.success) {
      return {
        status: "error",
        data: null,
        error: { code: "PARSE_ERROR", message: ttml.parsedTTML.error },
      };
    }

    const lyrics: Lyrics = {
      ...ttml.parsedTTML.data,
      Provider: "user",
    };

    return { status: "success", data: lyrics };
  } catch (err) {
    return {
      status: "error",
      data: null,
      error: {
        code: "FETCH_FAILED",
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

$ttml_maker_mode.listen(() => refetchLyrics());
