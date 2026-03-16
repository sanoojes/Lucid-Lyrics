import type { StaticData } from "@/lib/api/types";
import { $romanize } from "@/stores";
import { useStore } from "@nanostores/solid";
import { For, type Component } from "solid-js";

type LineLyricsProps = { lyrics: StaticData };

const StaticLyrics: Component<LineLyricsProps> = (props) => {
  const romanize = useStore($romanize);
  return (
    <div class="static-lyrics">
      <For each={props.lyrics.Lines}>
        {(item) => (
          <div class="line-wrapper">{romanize() ? (item.RomanizedText ?? item.Text) : item.Text}</div>
        )}
      </For>
    </div>
  );
};

export default StaticLyrics;
