import { FragmentShader, GetShaderUniforms, VertexShader } from '@/shaders/color.ts';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import { useEffect, useRef } from 'react';
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { useStore } from 'zustand';

interface AnimatedBackgroundProps {
  timeScale?: number;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ timeScale = 50 }) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const uniformsRef = useRef<ReturnType<typeof GetShaderUniforms> | null>(null);
  const isFocusedRef = useRef(true);
  const startTimeRef = useRef(performance.now());
  const colors = useStore(tempStore, (s) => s.player.nowPlaying.colors);

  useEffect(() => {
    if (!parentRef.current) return;

    const scene = new Scene();
    const renderer = new WebGLRenderer({
      canvas: canvasRef.current ?? undefined,
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(window.devicePixelRatio || 1);
    rendererRef.current = renderer;

    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const geometry = new PlaneGeometry(2, 2);

    const palette: string[] = colors
      ? [
          colors.Muted,
          colors.DarkVibrant,
          colors.Vibrant,
          colors.DarkMuted,
          colors.LightVibrant,
          colors.LightMuted,
          colors.DarkVibrant,
          colors.Muted,
        ]
      : Array(8).fill('#000000');

    const uniforms = GetShaderUniforms(
      palette.map((c) => new Vector3(...new Color(c).toArray())) as [
        Vector3,
        Vector3,
        Vector3,
        Vector3,
        Vector3,
        Vector3,
        Vector3,
        Vector3,
      ]
    );

    uniformsRef.current = uniforms;

    const material = new ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      uniforms,
      transparent: true,
      premultipliedAlpha: true,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const UpdateDimensions = () => {
      if (!canvasRef.current || !parentRef.current) return;
      const width = Math.max(1, parentRef.current.clientWidth);
      const height = Math.max(1, parentRef.current.clientHeight);

      renderer.setSize(width, height);
      if (uniformsRef.current) {
        uniformsRef.current.iResolution.value.set(width, height);
      }

      renderer.render(scene, camera);
    };

    UpdateDimensions();

    let frameId: number | null = null;
    let hasRenderedOnce = false;

    const animate = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      if (uniformsRef.current) {
        uniformsRef.current.iTime.value = elapsed * (timeScale / 100); // scaled time
      }

      if (isFocusedRef.current || !hasRenderedOnce) {
        renderer.render(scene, camera);
        hasRenderedOnce = true;
      }

      frameId = requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      UpdateDimensions();
    });
    resizeObserver.observe(parentRef.current);

    isFocusedRef.current = document.visibilityState === 'visible';
    if (isFocusedRef.current) {
      renderer.render(scene, camera);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      try {
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      } catch (e) {
        console.warn('Error disposing renderer resources:', e);
      }
    };
  }, [colors, timeScale]);

  return (
    <div className="lucid-lyrics-bg animated" ref={parentRef}>
      <canvas ref={canvasRef} className="animated-bg-canvas" />
    </div>
  );
};

export default AnimatedBackground;
