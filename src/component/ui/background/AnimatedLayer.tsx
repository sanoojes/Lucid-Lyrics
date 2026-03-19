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
        uResolution: { value: [containerRef.clientHeight, containerRef.clientWidth] },
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

    createEffect(() => {
      const url = activeUrl();
      if (!url) return;

      const loadImage = async () => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob, {
            imageOrientation: 'flipY',
            premultiplyAlpha: 'none',
            colorSpaceConversion: 'none',
          });
          
          prevTexture.image = (texture.image || bitmap) as any;
          prevTexture.needsUpdate = true;
          texture.image = bitmap as any;
          texture.needsUpdate = true;
          program.uniforms.uFade.value = 0.0;
        } catch (e) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = url;
          img.onload = () => {
            prevTexture.image = texture.image || img;
            prevTexture.needsUpdate = true;
            texture.image = img;
            texture.needsUpdate = true;
            program.uniforms.uFade.value = 0.0;
          };
        }
      };
      loadImage();
    });

    createEffect(() => {
      const filter = options().filter;
      program.uniforms.uBrightness.value = filter.brightness / 100;
      program.uniforms.uSaturation.value = filter.saturation / 100;
      program.uniforms.uContrast.value = filter.contrast / 100;
      program.uniforms.uOpacity.value = filter.opacity / 100;
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
          transform: `scale(${options().scale / 100})`,
          "pointer-events": "none",
        }}
      />
    </div>
  );
};

export default AnimatedLayer;
