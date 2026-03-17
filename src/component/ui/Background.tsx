import "@/styles/component/background.scss";
import { useStore } from "@nanostores/solid";
import { Match, Switch, type JSX } from "solid-js";
import AnimatedLayer from "@/component/ui/background/AnimatedLayer";
import ColorLayer from "@/component/ui/background/ColorLayer";
import ImageLayer from "@/component/ui/background/ImageLayer";
import { $bg_mode } from "@/stores";

type BgProps = JSX.HTMLAttributes<HTMLDivElement>;
export const Background = (props: BgProps) => {
  const mode = useStore($bg_mode);
  return (
    <div {...props} class={`lucid-background ${props.class ? props.class : ""}`} aria-hidden>
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
