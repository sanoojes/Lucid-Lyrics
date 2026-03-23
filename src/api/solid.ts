import API from "@/api";
import { build } from "@/lib/ttml/builder";
import { $has_romanized, $lyrics_query, $lyrics_status } from "@/stores";
import { createLogger } from "@/utils/logger";
import { useStore } from "@nanostores/solid";
import { createEffect, createResource, createRoot, onCleanup } from "solid-js";

const log = createLogger("api:fetch");

export const { lyricsResource, lyricsResourceAction, refetchLyrics } = createRoot(() => {
  const requestParams = useStore($lyrics_query);

  const [lyricsResource, lyricsResourceAction] = createResource(
    () => {
      const p = requestParams();
      if (!p?.id) return null;
      return { id: p.id, data: p.data };
    },
    async (source) => {
      log.debug("request", source);
      $lyrics_status.set("loading");

      try {
        const result = await API.fetch(source);
        log.debug("result", result);
        console.log("ttml!!!!!!");
        console.log(build(result.data));
        return result;
      } catch (error) {
        log.error("rejected", source, error);
        throw error;
      }
    },
  );
  createEffect(() => {
    const data = lyricsResource();
    $lyrics_status.set(data?.status);
    $has_romanized.set(!!data?.data?.HasRomanizedText);
  });

  createEffect(() => {
    const handleOnline = () => {
      const data = lyricsResource();
      if ((data?.status === "error" || !!data?.error) && data?.error?.code === "OFFLINE") {
        log.debug("online_refetching");
        lyricsResourceAction.refetch();
      }
    };
    window.addEventListener("online", handleOnline);
    onCleanup(() => window.removeEventListener("online", handleOnline));
  });

  return { lyricsResource, lyricsResourceAction, refetchLyrics: lyricsResourceAction.refetch };
});
