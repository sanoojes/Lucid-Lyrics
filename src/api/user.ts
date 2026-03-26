import type { Lyrics, APIResponse, FetchOptions } from "@/lib/api/types";
import { $ttml_maker_mode } from "@/stores/dev";
import { getLocalTTMLBySongId } from "@/stores/idb/ttml";
import { refetchLyrics } from "@/api/solid";

export async function fetchUser({ id }: FetchOptions): Promise<APIResponse<Lyrics>> {
  try {
    if ($ttml_maker_mode.get() !== "on") return { status: "missing_lyrics" };
    const ttml = await getLocalTTMLBySongId(id);

    if (!ttml) {
      return { status: "missing_lyrics" };
    }

    if (!ttml.parsedTTML.success) {
      return {
        status: "parse_error",
        message: ttml.parsedTTML.error,
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
      message: String(err),
    };
  }
}

$ttml_maker_mode.listen(() => refetchLyrics());
