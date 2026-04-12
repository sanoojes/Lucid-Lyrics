import Kawarp from "~/lib/kawarp";
import { useStore } from "@nanostores/solid";
import { $current_track_image, $kawarp_options } from "~/stores";
import { createEffect, createMemo, onCleanup, onMount } from "solid-js";
import { useLocalBlob } from "~/component/ui/background/hooks";

const KawarpLayer = () => {
  let canvasRef!: HTMLCanvasElement;
  let containerRef!: HTMLDivElement;
  let kawarp: Kawarp | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const options = useStore($kawarp_options);
  const currentTrackImage = useStore($current_track_image);

  const { localBlob } = useLocalBlob(() => options().mode);

  const activeSource = createMemo(() => {
    const opt = options();
    if (opt.mode === "custom") return opt.customUrl;
    if (opt.mode === "local") return localBlob() ?? currentTrackImage();
    return currentTrackImage();
  });

  const loadImage = (source?: string | Blob) => {
    if (!kawarp || !source) return;

    if (typeof source === "string") {
      const crossOrigin =
        source.startsWith("spotify:") || source.startsWith("data:") ? null : "anonymous";
      kawarp.loadImage(source, crossOrigin);
      return;
    }

    if (source instanceof Blob) {
      kawarp.loadBlob(source);
    }
  };

  onMount(() => {
    kawarp = new Kawarp(canvasRef, options());

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef) {
          const { width, height } = entry.contentRect;
          canvasRef.width = width;
          canvasRef.height = height;
          kawarp?.resize();
          kawarp?.renderFrame();
        }
      }
    });

    if (containerRef) {
      resizeObserver.observe(containerRef);
    }

    kawarp.start();
    loadImage(activeSource());
  });

  createEffect(() => {
    loadImage(activeSource());
  });

  createEffect(() => {
    kawarp?.setOptions(options());
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    kawarp?.dispose();
  });

  return (
    <div
      ref={containerRef}
      class="bg-animated is-kawarp"
      style={{ height: "100%", position: "relative", width: "100%" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          height: "100%",
          inset: 0,
          "pointer-events": "none",
          position: "absolute",
          width: "100%",
        }}
      />
    </div>
  );
};

export default KawarpLayer;
