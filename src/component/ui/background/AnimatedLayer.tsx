import { Renderer, Geometry, Program, Mesh, Texture } from "ogl";
import { useStore } from "@nanostores/solid";
import { $animated_options, $current_track_image } from "@/stores";
import { createMemo, createEffect, onMount, onCleanup } from "solid-js";
import { useLocalImage } from "@/component/ui/background/hooks";
import Tempus from "@darkroom.engineering/tempus";

import vertex from "@/shaders/animatedBg/vertex.glsl";
import fragment from "@/shaders/animatedBg/fragment.glsl";

export type ShaderUniforms = {
  Time: { value: number };
  BlurredCoverArt: { value: Texture };
  PreviousCoverArt: { value: Texture };

  BackgroundCircleOrigin: { value: number[] };
  BackgroundCircleRadius: { value: number };

  CenterCircleOrigin: { value: number[] };
  CenterCircleRadius: { value: number };

  LeftCircleOrigin: { value: number[] };
  LeftCircleRadius: { value: number };

  RightCircleOrigin: { value: number[] };
  RightCircleRadius: { value: number };

  uBrightness: { value: number };
  uSaturation: { value: number };
  uContrast: { value: number };
  uOpacity: { value: number };
  uTransition: { value: number };
  uScale: { value: number };
};

const createImageBitmapOptions = {
  premultiplyAlpha: "none" as const,
  colorSpaceConversion: "none" as const,
};

const generateBlurredCoverArt = async (
  imageSource: ImageBitmapSource,
  blurAmount: number,
): Promise<OffscreenCanvas | null> => {
  try {
    const bitmap = await createImageBitmap(imageSource, createImageBitmapOptions);

    const originalSize = Math.min(bitmap.width, bitmap.height);
    const blurExtent = Math.ceil(3 * blurAmount);

    const circleCanvas = new OffscreenCanvas(originalSize, originalSize);
    const circleCtx = circleCanvas.getContext("2d")!;

    circleCtx.beginPath();
    circleCtx.arc(originalSize / 2, originalSize / 2, originalSize / 2, 0, Math.PI * 2);
    circleCtx.closePath();
    circleCtx.clip();

    circleCtx.drawImage(
      bitmap,
      (bitmap.width - originalSize) / 2,
      (bitmap.height - originalSize) / 2,
      originalSize,
      originalSize,
      0,
      0,
      originalSize,
      originalSize,
    );

    bitmap.close();

    const padding = blurExtent * 1.5;
    const expandedSize = originalSize + padding;
    const blurredCanvas = new OffscreenCanvas(expandedSize, expandedSize);
    const blurredCtx = blurredCanvas.getContext("2d")!;

    blurredCtx.filter = `blur(${blurAmount}px)`;
    blurredCtx.drawImage(circleCanvas, padding / 2, padding / 2);

    return blurredCanvas;
  } catch {
    return null;
  }
};

const createBlackOffscreenCanvas = (): OffscreenCanvas => {
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1, 1);
  return canvas;
};

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

    const previousTexture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });

    const blackCanvas = createBlackOffscreenCanvas();
    texture.image = blackCanvas as unknown as HTMLCanvasElement;
    texture.needsUpdate = true;
    previousTexture.image = blackCanvas as unknown as HTMLCanvasElement;
    previousTexture.needsUpdate = true;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        Time: { value: 0.0 },
        BlurredCoverArt: { value: texture },
        PreviousCoverArt: { value: previousTexture },
        BackgroundCircleOrigin: { value: [0, 0] },
        BackgroundCircleRadius: { value: 0 },
        CenterCircleOrigin: { value: [0, 0] },
        CenterCircleRadius: { value: 0 },
        LeftCircleOrigin: { value: [0, 0] },
        LeftCircleRadius: { value: 0 },
        RightCircleOrigin: { value: [0, 0] },
        RightCircleRadius: { value: 0 },
        uBrightness: { value: 1.0 },
        uSaturation: { value: 1.0 },
        uContrast: { value: 1.0 },
        uOpacity: { value: 1.0 },
        uTransition: { value: 1.0 },
        uScale: { value: 1.0 },
      } as ShaderUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(gl, { geometry, program });

    let currentUri = "";
    let currentBlur = 0;

    const updateCircleUniforms = (width: number, height: number) => {
      const scaledWidth = width * window.devicePixelRatio;
      const scaledHeight = height * window.devicePixelRatio;
      const cx = scaledWidth / 2;
      const cy = scaledHeight / 2;

      const largestAxis = scaledWidth > scaledHeight ? "X" : "Y";
      const largestAxisSize = Math.max(scaledWidth, scaledHeight);

      program.uniforms.BackgroundCircleOrigin.value = [cx, cy];
      program.uniforms.BackgroundCircleRadius.value = largestAxisSize * 1.5;

      program.uniforms.CenterCircleOrigin.value = [cx, cy];
      program.uniforms.CenterCircleRadius.value =
        largestAxisSize * (largestAxis === "X" ? 1 : 0.75);

      program.uniforms.LeftCircleOrigin.value = [0, scaledHeight];
      program.uniforms.LeftCircleRadius.value = largestAxisSize * 0.75;

      program.uniforms.RightCircleOrigin.value = [scaledWidth, 0];
      program.uniforms.RightCircleRadius.value =
        largestAxisSize * (largestAxis === "X" ? 0.65 : 0.5);
    };

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        updateCircleUniforms(width, height);
        renderer.render({ scene: mesh });
      }
    });
    ro.observe(containerRef);

    let transitionProgress = 1.0;
    const TRANSITION_DURATION = 0.5;

    const updateTexture = (blurredCanvas: OffscreenCanvas) => {
      const currentImage = texture.image;
      previousTexture.image = currentImage as unknown as HTMLCanvasElement;
      previousTexture.needsUpdate = true;

      texture.image = blurredCanvas as unknown as HTMLCanvasElement;
      texture.needsUpdate = true;

      transitionProgress = 0.0;
      program.uniforms.uTransition.value = 0.0;
    };

    const loadImage = async (uri: string, blurAmount: number) => {
      if (uri === currentUri && blurAmount === currentBlur) return;
      currentUri = uri;
      currentBlur = blurAmount;

      const isBlob = uri.startsWith("blob:");
      const isSpotify = uri.startsWith("spotify:");
      const canFetch = !isSpotify && !isBlob;

      if (isBlob) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const blurred = await generateBlurredCoverArt(blob, blurAmount);
          if (uri === currentUri) {
            updateTexture(blurred ?? createBlackOffscreenCanvas());
          }
          return;
        } catch {
          updateTexture(createBlackOffscreenCanvas());
          return;
        }
      }

      if (canFetch) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const blurred = await generateBlurredCoverArt(blob, blurAmount);
          if (uri === currentUri) {
            updateTexture(blurred ?? createBlackOffscreenCanvas());
          }
          return;
        } catch {
          updateTexture(createBlackOffscreenCanvas());
          return;
        }
      }

      const img = new Image();
      img.crossOrigin = uri.startsWith("spotify:") || uri.startsWith("blob:") ? null : "anonymous";
      img.src = uri;
      img.decode?.().then(() => {
        if (uri !== currentUri) return;
        const blurred = generateBlurredCoverArt(img, blurAmount);
        blurred.then((result) => {
          if (uri === currentUri) {
            updateTexture(result ?? createBlackOffscreenCanvas());
          }
        });
      }).catch(() => {
        if (uri === currentUri) {
          updateTexture(createBlackOffscreenCanvas());
        }
      });
    };

    createEffect(() => {
      const uri = activeUrl();
      const blur = options().filter.blur;
      if (uri) {
        loadImage(uri, blur);
      } else {
        currentUri = "";
        updateTexture(createBlackOffscreenCanvas());
      }
    });

    createEffect(() => {
      const filter = options().filter;
      program.uniforms.uBrightness.value = filter.brightness / 100;
      program.uniforms.uSaturation.value = filter.saturation / 100;
      program.uniforms.uContrast.value = filter.contrast / 100;
      program.uniforms.uOpacity.value = filter.opacity / 100;
    });

    createEffect(() => {
      program.uniforms.uScale.value = options().scale / 100;
    });

    const unsubscribe = Tempus.add((_time: number, deltaTime: number) => {
      const dt = deltaTime / 1000;
      program.uniforms.Time.value += dt;

      if (transitionProgress < 1.0) {
        transitionProgress = Math.min(1.0, transitionProgress + dt / TRANSITION_DURATION);
        program.uniforms.uTransition.value = transitionProgress;
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
          "pointer-events": "none",
        }}
      />
    </div>
  );
};

export default AnimatedLayer;
