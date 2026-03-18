import { $npv_state } from "@/stores";
import { useStore } from "@nanostores/solid";
import { Background } from "@/component/ui/Background";
import { createEffect, Show } from "solid-js";

function NPVBackground() {
  const npvSettings = useStore($npv_state);

  createEffect(() => {
    document.body.classList.toggle("use-lucid-lyrics-npv", npvSettings().useStyles);
  });

  return (
    <Show when={!npvSettings().hideBackground}>
      <Background class="npv-background" />
    </Show>
  );
}

export default NPVBackground;
