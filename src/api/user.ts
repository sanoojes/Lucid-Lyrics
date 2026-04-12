import type { APIResponse, FetchOptions, Lyrics } from "~/lib/api/types";
import { $ttml_maker_mode } from "~/stores/dev";
import { getLocalTTMLBySongId } from "~/stores/idb/ttml";
import { refetchLyrics } from "~/api/solid";

export async function fetchUser({ id }: FetchOptions): Promise<APIResponse<Lyrics>> {
  try {
    if ($ttml_maker_mode.get() !== "on") return { status: "missing_lyrics" };
    const ttml = await getLocalTTMLBySongId(id);

    if (!ttml) {
      return { status: "missing_lyrics" };
    }

    if (!ttml.parsedTTML.success) {
      return {
        message: ttml.parsedTTML.error,
        status: "parse_error",
      };
    }

    const lyrics: Lyrics = {
      ...ttml.parsedTTML.data,
      Provider: "user",
    };

    return { data: lyrics, status: "success" };
  } catch (err) {
    return {
      message: String(err),
      status: "error",
    };
  }
}

$ttml_maker_mode.listen(() => refetchLyrics());
