import "@/styles/component/background.css";
import { useStore } from "@nanostores/solid";
import { Match, Switch } from "solid-js";
import AnimatedLayer from "@/component/ui/background/AnimatedLayer";
import ColorLayer from "@/component/ui/background/ColorLayer";
import ImageLayer from "@/component/ui/background/ImageLayer";
import { $bg_mode } from "@/stores";

export const Background = () => {
  const mode = useStore($bg_mode);
  return (
    <div class="lucid-background" aria-hidden>
      <Switch fallback={<AnimatedLayer />}>
        <Match when={mode() === "image"}>
          <ImageLayer />
        </Match>
        <Match when={mode() === "color"}>
          <ColorLayer />
        </Match>
      </Switch>
    </div>
  );
};
