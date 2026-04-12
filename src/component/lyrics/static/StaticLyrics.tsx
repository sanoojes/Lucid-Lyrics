import type { StaticData } from "~/lib/api/types";
import { $romanize } from "~/stores";
import { useStore } from "@nanostores/solid";
import { type Component, For, createMemo } from "solid-js";

type LineLyricsProps = { lyrics: StaticData };

const StaticLyrics: Component<LineLyricsProps> = (props) => {
  const romanize = useStore($romanize);
  return (
    <div class="static-lyrics">
      <For each={props.lyrics.Lines}>
        {(item) => {
          const text = createMemo(() =>
            romanize() ? (item.RomanizedText ?? item.Text) : item.Text,
          );
          const isLineRTL = createMemo(() => item.IsRTL);
          return (
            <div class="line-wrapper" classList={{ rtl: isLineRTL() }}>
              {text()}
            </div>
          );
        }}
      </For>
    </div>
  );
};

export default StaticLyrics;
