import API from "~/api";
import { $has_romanized, $lyrics_query, $lyrics_status } from "~/stores";
import { createLogger } from "~/utils/logger";
import { useStore } from "@nanostores/solid";
import { createEffect, createResource, createRoot, onCleanup } from "solid-js";

const log = createLogger("api:fetch");

export const { lyricsResource, lyricsResourceAction, refetchLyrics } = createRoot(() => {
  const requestParams = useStore($lyrics_query);

  const [lyricsResource, lyricsResourceAction] = createResource(
    () => {
      const params = requestParams();
      if (!params || !params.id) return null;
      return { ...params };
    },
    async (source) => {
      log.debug("request", source);
      $lyrics_status.set("loading");

      try {
        const result = await API.fetch(source);
        log.debug("result", result);
        return result;
      } catch (error) {
        log.error("rejected", source, error);
        throw error;
      }
    },
  );

  createEffect(() => {
    const res = lyricsResource();
    $lyrics_status.set(res?.status);
    $has_romanized.set(!!res?.data?.HasRomanizedText);
  });

  createEffect(() => {
    const handleOnline = () => {
      const data = lyricsResource();
      if (data?.status === "offline") {
        log.debug("online_refetching");
        lyricsResourceAction.refetch();
      }
    };
    window.addEventListener("online", handleOnline);
    onCleanup(() => window.removeEventListener("online", handleOnline));
  });

  return { lyricsResource, lyricsResourceAction, refetchLyrics: lyricsResourceAction.refetch };
});
