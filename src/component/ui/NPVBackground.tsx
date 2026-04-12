import { $npv_state, $page_mode } from "~/stores";
import { useStore } from "@nanostores/solid";
import { Background } from "~/component/ui/Background";
import { Show, createEffect } from "solid-js";

function NPVBackground() {
  const npvSettings = useStore($npv_state);
  const pageMode = useStore($page_mode);

  createEffect(() => {
    document.body.classList.toggle("use-lucid-lyrics-npv", npvSettings().useStyles);
  });

  return (
    <div class="lucid-npv-bg-wrapper">
      <Show when={!npvSettings().hideBackground && pageMode() === "page"}>
        <Background class="npv-background" />
      </Show>
    </div>
  );
}

export default NPVBackground;
