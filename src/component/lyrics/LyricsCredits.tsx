import { Show } from "solid-js";
import { useStore } from "@nanostores/solid";
import type { Lyrics } from "@/lib/api/types";
import { $page_state } from "@/stores/page";
import { getProviderName } from "@/constants";

type LyricsCreditsProps = {
  lyrics: Lyrics;
};

function LyricsCredits(props: LyricsCreditsProps) {
  const pageState = useStore($page_state);
  const lyrics = () => props.lyrics;
  const artists = () => lyrics().Artists;
  const songwriters = () => lyrics().SongWriters;
  const provider = () => lyrics().Provider;

  return (
    <Show when={pageState().showCredits}>
      <div class="lyrics-credits">
        <Show when={artists() && artists()!.length > 0}>
          <p class="credit-item">
            <span class="credit-label">Artists:</span> {artists()?.join(", ")}
          </p>
        </Show>
        <Show when={songwriters() && songwriters()!.length > 0}>
          <p class="credit-item">
            <span class="credit-label">Written By:</span> {songwriters()?.join(", ")}
          </p>
        </Show>
        <Show when={provider()}>
          <p class="credit-item">
            <span class="credit-label">Provider:</span> {getProviderName(provider() ?? "Unknown")}
          </p>
        </Show>
      </div>
    </Show>
  );
}

export default LyricsCredits;
