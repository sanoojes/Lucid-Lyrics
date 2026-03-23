import { useStore } from "@nanostores/solid";
import { $current_track_image, $image_options } from "@/stores";
import { createMemo, createEffect, Show, createSignal, onCleanup } from "solid-js";
import { useLocalImage } from "@/component/ui/background/hooks";

const ImageLayer = () => {
  const options = useStore($image_options);
  const currentTrackImage = useStore($current_track_image);
  const { localUrl } = useLocalImage();

  const [currentUrl, setCurrentUrl] = createSignal<string | null>(null);
  const [prevUrl, setPrevUrl] = createSignal<string | null>(null);
  const [isTransitioning, setIsTransitioning] = createSignal(false);

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
    const targetUrl = activeUrl();
    if (!targetUrl) return;

    let isCancelled = false;
    const img = new Image();

    img.onload = () => {
      if (isCancelled) return;
      setPrevUrl(currentUrl());
      setCurrentUrl(targetUrl);
      setIsTransitioning(true);
      setTimeout(() => {
        if (!isCancelled) {
          setPrevUrl(null);
          setIsTransitioning(false);
        }
      }, 1200);
    };

    img.src = targetUrl;

    onCleanup(() => {
      isCancelled = true;
      img.onload = null;
    });
  });

  return (
    <div aria-hidden="true" role="presentation">
      <Show when={prevUrl()}>
        <div
          class="bg-img bg-prev"
          style={{
            "background-image": `url("${prevUrl()}")`,
            filter: filter(),
            transform: `scale(${options().scale / 100})`,
          }}
        />
      </Show>
      <Show when={currentUrl()}>
        <div
          class="bg-img bg-current"
          classList={{ "is-blending": isTransitioning() }}
          style={{
            "background-image": `url("${currentUrl()}")`,
            filter: filter(),
            transform: `scale(${options().scale / 100})`,
          }}
        />
      </Show>
    </div>
  );
};

export default ImageLayer;
