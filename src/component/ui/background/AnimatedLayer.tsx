import { Renderer, Geometry, Program, Mesh, Texture } from "ogl";
import { useStore } from "@nanostores/solid";
import { $animated_options, $current_track_image } from "@/stores";
import { createMemo, createEffect, onMount, onCleanup } from "solid-js";
import { useLocalImage } from "@/component/ui/background/hooks";
import Tempus from "@darkroom.engineering/tempus";

import vertex from "@/shaders/animatedBg/vertex.glsl";
import fragment from "@/shaders/animatedBg/fragment.glsl";

const AnimatedLayer = () => {
  let canvasRef!: HTMLCanvasElement;
  let containerRef!: HTMLDivElement;

  const options = useStore($animated_options);
  const currentTrackImage = useStore($current_track_image);
  const { localUrl } = useLocalImage();

  const activeUrl = createMemo(() => {
    const opt = options();
    if (opt.mode === "custom") return opt.customUrl;
    if (opt.mode === "local") return localUrl() ?? currentTrackImage();
    return currentTrackImage();
  });

  onMount(() => {
    const renderer = new Renderer({
      canvas: canvasRef,
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
    });
    const gl = renderer.gl;

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    });

    const texture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });
    const prevTexture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tMap: { value: texture },
        tPrevMap: { value: prevTexture },
        uFade: { value: 1.0 },
        uBrightness: { value: 1.0 },
        uSaturation: { value: 1.0 },
        uContrast: { value: 1.0 },
        uOpacity: { value: 1.0 },
        uTime: { value: 0.0 },
        uResolution: { value: [containerRef.clientWidth, containerRef.clientHeight] },
        uScale: { value: options().scale / 100 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(gl, { geometry, program });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        program.uniforms.uResolution.value = [width, height];
        renderer.render({ scene: mesh });
      }
    });
    ro.observe(containerRef);

    let currentUri = "";

    const createBlackImage = (): HTMLCanvasElement => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 1, 1);
      return canvas;
    };

    const applyImage = (image: TexImageSource) => {
      prevTexture.image = (texture.image || image) as any;
      prevTexture.needsUpdate = true;
      texture.image = image as any;
      texture.needsUpdate = true;
      program.uniforms.uFade.value = 0.0;
    };

    const loadImage = async (uri: string) => {
      if (uri === currentUri) return;
      currentUri = uri;
      const canFetch = !uri.startsWith("spotify:");

      const applyIfCurrent = (image: TexImageSource) => {
        if (uri === currentUri) {
          applyImage(image);
        }
      };

      if (canFetch) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob, {
            premultiplyAlpha: "none",
            colorSpaceConversion: "none",
          });
          applyIfCurrent(bitmap);
          return;
        } catch {}
      }

      const img = new Image();
      img.crossOrigin = canFetch ? "anonymous" : null;
      img.src = uri;
      img.onload = () => applyIfCurrent(img);
      img.onerror = () => applyIfCurrent(createBlackImage());
    };

    createEffect(() => {
      const uri = activeUrl();
      if (uri) {
        loadImage(uri);
      } else {
        currentUri = "";
        applyImage(createBlackImage());
      }
    });

    createEffect(() => {
      const opt = options();
      const filter = opt.filter;
      program.uniforms.uBrightness.value = filter.brightness / 100;
      program.uniforms.uSaturation.value = filter.saturation / 100;
      program.uniforms.uContrast.value = filter.contrast / 100;
      program.uniforms.uOpacity.value = filter.opacity / 100;
      program.uniforms.uScale.value = opt.scale / 100;
    });

    const unsubscribe = Tempus.add((_time: number, deltaTime: number) => {
      const dt = deltaTime / 1000;
      program.uniforms.uTime.value += dt * 0.5;

      if (program.uniforms.uFade.value < 1.0) {
        program.uniforms.uFade.value = Math.min(1.0, program.uniforms.uFade.value + dt * 1.6);
      }

      renderer.render({ scene: mesh });
    }, 1);

    onCleanup(() => {
      ro.disconnect();
      unsubscribe();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    });
  });

  return (
    <div ref={containerRef} class="bg-animated">
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          filter: `blur(${options().filter.blur}px)`,
          "pointer-events": "none",
        }}
      />
    </div>
  );
};

export default AnimatedLayer;
