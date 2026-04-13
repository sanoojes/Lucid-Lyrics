import { useStore } from "@nanostores/solid";
import { $animated_options, $current_track_image } from "~/stores";
import { createEffect, createMemo, onCleanup, onMount } from "solid-js";
import { useLocalBlob } from "~/component/ui/background/hooks";
import Tempus from "@darkroom.engineering/tempus";

import vertex from "~/shaders/animatedBg/vertex.glsl";
import fragment from "~/shaders/animatedBg/fragment.glsl";

const createImageBitmapOptions = {
  colorSpaceConversion: "none" as const,
  premultiplyAlpha: "none" as const,
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

interface Uniforms {
  t: WebGLUniformLocation | null;
  bca: WebGLUniformLocation | null;
  pca: WebGLUniformLocation | null;
  bco: WebGLUniformLocation | null;
  bcr: WebGLUniformLocation | null;
  cco: WebGLUniformLocation | null;
  ccr: WebGLUniformLocation | null;
  lco: WebGLUniformLocation | null;
  lcr: WebGLUniformLocation | null;
  rco: WebGLUniformLocation | null;
  rcr: WebGLUniformLocation | null;
  br: WebGLUniformLocation | null;
  sa: WebGLUniformLocation | null;
  co: WebGLUniformLocation | null;
  op: WebGLUniformLocation | null;
  tr: WebGLUniformLocation | null;
  sc: WebGLUniformLocation | null;
  rs: WebGLUniformLocation | null;
  di: WebGLUniformLocation | null;
}

const AnimatedLayer = () => {
  let canvasRef!: HTMLCanvasElement;
  let containerRef!: HTMLDivElement;

  const options = useStore($animated_options);
  const currentTrackImage = useStore($current_track_image);

  const { localBlob } = useLocalBlob(() => options().mode);

  const activeSource = createMemo(() => {
    const opt = options();
    if (opt.mode === "custom") return opt.customUrl;
    if (opt.mode === "local") return localBlob() ?? currentTrackImage();
    return currentTrackImage();
  });

  onMount(() => {
    let isDestroyed = false;

    const gl = canvasRef.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Failed to create shader");

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compile error: ${error}`);
      }
      return shader;
    };

    const createProgram = (vertexSource: string, fragmentSource: string) => {
      const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
      const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

      const program = gl.createProgram();
      if (!program) throw new Error("Failed to create program");

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Program link error: ${error}`);
      }

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return program;
    };

    const program = createProgram(vertex, fragment);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms: Uniforms = {
      bca: gl.getUniformLocation(program, "bca"),
      bco: gl.getUniformLocation(program, "bco"),
      bcr: gl.getUniformLocation(program, "bcr"),
      br: gl.getUniformLocation(program, "br"),
      cco: gl.getUniformLocation(program, "cco"),
      ccr: gl.getUniformLocation(program, "ccr"),
      co: gl.getUniformLocation(program, "co"),
      di: gl.getUniformLocation(program, "di"),
      lco: gl.getUniformLocation(program, "lco"),
      lcr: gl.getUniformLocation(program, "lcr"),
      op: gl.getUniformLocation(program, "op"),
      pca: gl.getUniformLocation(program, "pca"),
      rco: gl.getUniformLocation(program, "rco"),
      rcr: gl.getUniformLocation(program, "rcr"),
      rs: gl.getUniformLocation(program, "rs"),
      sa: gl.getUniformLocation(program, "sa"),
      sc: gl.getUniformLocation(program, "sc"),
      t: gl.getUniformLocation(program, "t"),
      tr: gl.getUniformLocation(program, "tr"),
    };

    const createTexture = () => {
      const texture = gl.createTexture();
      if (!texture) throw new Error("Failed to create texture");

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return texture;
    };

    const updateTexture = (texture: WebGLTexture, canvas: OffscreenCanvas) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    };

    const texture = createTexture();
    const previousTexture = createTexture();

    const blackCanvas = createBlackOffscreenCanvas();
    updateTexture(texture, blackCanvas);
    updateTexture(previousTexture, blackCanvas);

    let currentCanvas = blackCanvas;

    const setSize = (width: number, height: number) => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvasRef.width = width * dpr;
      canvasRef.height = height * dpr;
      canvasRef.style.width = `${width}px`;
      canvasRef.style.height = `${height}px`;
      gl.viewport(0, 0, canvasRef.width, canvasRef.height);
    };

    const updateCircleUniforms = (width: number, height: number) => {
      const scaledWidth = width * window.devicePixelRatio;
      const scaledHeight = height * window.devicePixelRatio;
      const cx = scaledWidth / 2;
      const cy = scaledHeight / 2;

      const largestAxis = scaledWidth > scaledHeight ? "X" : "Y";
      const largestAxisSize = Math.max(scaledWidth, scaledHeight);

      gl.uniform2f(uniforms.bco, cx, cy);
      gl.uniform1f(uniforms.bcr, largestAxisSize * 1.5);

      gl.uniform2f(uniforms.cco, cx, cy);
      gl.uniform1f(uniforms.ccr, largestAxisSize * (largestAxis === "X" ? 1 : 0.75));

      gl.uniform2f(uniforms.lco, 0, scaledHeight);
      gl.uniform1f(uniforms.lcr, largestAxisSize * 0.75);

      gl.uniform2f(uniforms.rco, scaledWidth, 0);
      gl.uniform1f(uniforms.rcr, largestAxisSize * (largestAxis === "X" ? 0.65 : 0.5));
    };

    const ro = new ResizeObserver((entries) => {
      if (isDestroyed) return;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize(width, height);
        updateCircleUniforms(width, height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    });
    ro.observe(containerRef);

    let transitionProgress = 1.0;
    let time = 0;

    const updateTextureUniforms = () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.bca, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, previousTexture);
      gl.uniform1i(uniforms.pca, 1);
    };

    const updateTextureFromCanvas = (newCanvas: OffscreenCanvas) => {
      updateTexture(previousTexture, currentCanvas);
      updateTexture(texture, newCanvas);
      currentCanvas = newCanvas;

      transitionProgress = 0.0;
      gl.uniform1f(uniforms.tr, 0.0);
    };

    let currentSource: string | Blob = "";
    let currentBlur = 0;

    const loadImage = async (source: string | Blob, blurAmount: number, signal: AbortSignal) => {
      if (signal.aborted) return;

      if (source === currentSource && blurAmount === currentBlur) return;
      currentSource = source;
      currentBlur = blurAmount;

      if (source instanceof Blob) {
        try {
          const blurred = await generateBlurredCoverArt(source, blurAmount);
          if (signal.aborted) return;

          updateTextureFromCanvas(blurred ?? createBlackOffscreenCanvas());
        } catch {
          if (!signal.aborted) {
            updateTextureFromCanvas(createBlackOffscreenCanvas());
          }
        }
        return;
      }

      const uri = source;
      const isSpotify = uri.startsWith("spotify:");
      const isData = uri.startsWith("data:");
      const canFetch = !isSpotify && !isData;

      if (canFetch) {
        try {
          const response = await fetch(uri, { signal });
          const blob = await response.blob();
          const blurred = await generateBlurredCoverArt(blob, blurAmount);

          if (signal.aborted) return;
          updateTextureFromCanvas(blurred ?? createBlackOffscreenCanvas());
          return;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return; // Quietly ignore deliberate aborts

          if (!signal.aborted) {
            updateTextureFromCanvas(createBlackOffscreenCanvas());
          }
          return;
        }
      }

      const img = new Image();
      img.crossOrigin = isSpotify || isData ? null : "anonymous";
      img.src = uri;

      const onAbort = () => {
        img.src = "";
      };
      signal.addEventListener("abort", onAbort, { once: true });

      img
        .decode?.()
        .then(() => {
          if (signal.aborted) return null;
          return generateBlurredCoverArt(img, blurAmount);
        })
        .then((result) => {
          if (signal.aborted) return;
          updateTextureFromCanvas(result ?? createBlackOffscreenCanvas());
        })
        .catch(() => {
          if (!signal.aborted) {
            updateTextureFromCanvas(createBlackOffscreenCanvas());
          }
        })
        .finally(() => {
          signal.removeEventListener("abort", onAbort);
        });
    };

    createEffect(() => {
      if (isDestroyed) return;
      const source = activeSource();
      const blur = options().filter.blur;

      const controller = new AbortController();

      if (source) {
        loadImage(source, blur, controller.signal);
      } else {
        currentSource = "";
        updateTextureFromCanvas(createBlackOffscreenCanvas());
      }

      onCleanup(() => {
        controller.abort();
      });
    });

    createEffect(() => {
      if (isDestroyed) return;
      const filter = options().filter;
      gl.uniform1f(uniforms.br, filter.brightness / 100);
      gl.uniform1f(uniforms.sa, filter.saturation / 100);
      gl.uniform1f(uniforms.co, filter.contrast / 100);
      gl.uniform1f(uniforms.op, filter.opacity / 100);
    });

    createEffect(() => {
      if (isDestroyed) return;
      gl.uniform1f(uniforms.sc, options().scale / 100);
    });

    createEffect(() => {
      if (isDestroyed) return;
      gl.uniform1f(uniforms.rs, options().rotationSpeed);
    });

    updateTextureUniforms();
    gl.uniform1f(uniforms.t, 0.0);
    gl.uniform1f(uniforms.tr, 1.0);
    gl.uniform1f(uniforms.sc, 1.0);
    gl.uniform1f(uniforms.rs, 1.0);
    gl.uniform1f(uniforms.di, 0.008);

    const unsubscribe = Tempus.add((_time: number, deltaTime: number) => {
      if (isDestroyed) return;
      const dt = deltaTime / 1000;
      time += dt;
      gl.uniform1f(uniforms.t, time);

      if (transitionProgress < 1.0) {
        const transitionDuration = options().transitionDuration;
        transitionProgress = Math.min(1.0, transitionProgress + dt / transitionDuration);
        gl.uniform1f(uniforms.tr, transitionProgress);
      }

      updateTextureUniforms();
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }, 1);

    onCleanup(() => {
      isDestroyed = true;
      ro.disconnect();
      unsubscribe();
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(texture);
      gl.deleteTexture(previousTexture);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) {
        ext.loseContext();
      }
    });
  });

  return (
    <div ref={containerRef} class="bg-animated">
      <canvas
        ref={canvasRef}
        style={{
          inset: 0,
          "pointer-events": "none",
          position: "absolute",
        }}
      />
    </div>
  );
};

export default AnimatedLayer;
