import { useStore } from "@nanostores/solid";
import { $current_track_image, $image_options } from "~/stores";
import { Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { useLocalBlob } from "~/component/ui/background/hooks";

const ImageLayer = () => {
  const options = useStore($image_options);
  const currentTrackImage = useStore($current_track_image);

  const { localBlob } = useLocalBlob(() => options().mode);

  const [currentUrl, setCurrentUrl] = createSignal<string | null>(null);
  const [prevUrl, setPrevUrl] = createSignal<string | null>(null);
  const [isTransitioning, setIsTransitioning] = createSignal(false);
  const activeBlobUrls = new Set<string>();

  const revokeSafe = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
      activeBlobUrls.delete(url);
    }
  };

  const filter = createMemo(() => {
    const f = options().filter;
    return `saturate(${f.saturation}%) contrast(${f.contrast}%) brightness(${f.brightness}%) opacity(${f.opacity}%) blur(${f.blur}px)`;
  });

  const activeSource = createMemo(() => {
    const opt = options();
    switch (opt.mode) {
      case "custom":
        return opt.customUrl;
      case "local":
        return localBlob() ?? currentTrackImage();
      default:
        return currentTrackImage();
    }
  });

  createEffect(() => {
    const source = activeSource();
    if (!source) return;

    let targetUrl: string;

    if (source instanceof Blob) {
      targetUrl = URL.createObjectURL(source);
      activeBlobUrls.add(targetUrl);
    } else {
      targetUrl = source;
    }

    let isCancelled = false;
    const img = new Image();

    img.onload = () => {
      if (isCancelled) return;

      const previous = currentUrl();
      setPrevUrl(previous);
      setCurrentUrl(targetUrl);
      setIsTransitioning(true);

      setTimeout(() => {
        if (!isCancelled) {
          setPrevUrl(null);
          setIsTransitioning(false);

          if (previous !== currentUrl()) {
            revokeSafe(previous);
          }
        }
      }, 1200);
    };

    img.onerror = () => {
      revokeSafe(targetUrl);
    };

    img.src = targetUrl;

    onCleanup(() => {
      isCancelled = true;
      img.onload = null;
      img.onerror = null;

      if (targetUrl !== currentUrl()) {
        revokeSafe(targetUrl);
      }
    });
  });

  onCleanup(() => {
    activeBlobUrls.forEach((url) => URL.revokeObjectURL(url));
    activeBlobUrls.clear();
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
