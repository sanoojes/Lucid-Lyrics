import { $npv_settings } from "@/stores";
import { useStore } from "@nanostores/solid";
import { Background } from "@/component/ui/Background";
import { createEffect, Show } from "solid-js";

function NowPlayingView() {
  const npvSettings = useStore($npv_settings);

  createEffect(() => {
    document.body.classList.toggle("use-lucid-lyrics-npv", npvSettings().useStyles);
  });

  return (
    <Show when={!npvSettings().hideBackground}>
      <Background class="npv-background" />
    </Show>
  );
}

export default NowPlayingView;
