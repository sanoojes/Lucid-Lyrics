import { useStore } from "@nanostores/solid";
import { $current_track_image, $image_options } from "@/stores";
import { createMemo, createEffect, Show } from "solid-js";
import { useLocalImage } from "@/component/ui/background/hooks";

const ImageLayer = () => {
  const options = useStore($image_options);
  const currentTrackImage = useStore($current_track_image);

  const { localUrl, isLoaded, setIsLoaded } = useLocalImage();

  const filter = createMemo(() => {
    const f = options().filter;
    return `saturate(${f.saturation}%) contrast(${f.contrast}%) brightness(${f.brightness}%) opacity(${f.opacity}%) blur(${f.blur}px)`;
  });

  const activeUrl = createMemo(() => {
    const opt = options();
    switch (opt.mode) {
      case "custom":
        return opt.customUrl;
      case "local":
        return localUrl() ?? currentTrackImage();
      default:
        return currentTrackImage();
    }
  });

  createEffect(() => {
    activeUrl();
    setIsLoaded(false);
  });

  return (
    <Show when={activeUrl()}>
      <img
        src={activeUrl()}
        class="bg-img"
        classList={{ "bg-loaded": isLoaded() }}
        style={{
          filter: filter(),
          transform: `scale(${options().scale / 100})`,
        }}
        onLoad={() => setIsLoaded(true)}
        aria-hidden="true"
        role="presentation"
      />
    </Show>
  );
};

export default ImageLayer;
