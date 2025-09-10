import loadAndProcessImage from '@/components/background/helper/loadAndProcessImage.ts';
import { FragmentShader, GetShaderUniforms, VertexShader } from '@/shaders/index.ts';
import appStore from '@/store/appStore.ts';
import { serializeFilters } from '@utils/dom';
import { useCallback, useEffect, useRef } from 'react';
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { useStore } from 'zustand';
import tempStore from '../../store/tempStore.ts';

const AnimatedBackgroundCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const uniformsRef = useRef<ReturnType<typeof GetShaderUniforms> | null>(null);
  const isFocusedRef = useRef(true);
  const sceneRef = useRef(new Scene());

  const { filter, autoStopAnimation, imageMode, customUrl } = useStore(
    appStore,
    (state) => state.bg.options
  );

  const npUrl = useStore(tempStore, (state) => state.player?.nowPlaying.imageUrl);
  const pageImgUrl = useStore(tempStore, (state) => state.pageImg);
  const imageSrc =
    (imageMode === 'custom'
      ? customUrl
      : imageMode === 'page'
        ? (pageImgUrl.desktop ?? pageImgUrl.cover)
        : npUrl) ?? npUrl;

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !scene) return;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const geometry = new PlaneGeometry(2, 2);
    const uniforms = GetShaderUniforms();
    uniformsRef.current = uniforms;

    const material = new ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      uniforms,
      transparent: true,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number | null = null;
    let hasRenderedOnce = false;
    const animate = () => {
      const time = performance.now() / 3500;
      uniforms.Time.value = time;

      if (isFocusedRef.current || !hasRenderedOnce) {
        renderer.render(scene, camera);
        hasRenderedOnce = true;
      }

      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  const updateDimensions = useCallback(() => {
    if (!canvasRef.current || !rendererRef.current || !uniformsRef.current || !sceneRef.current)
      return;

    const renderer = rendererRef.current;
    const uniforms = uniformsRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);

    const scaledWidth = width * window.devicePixelRatio;
    const scaledHeight = height * window.devicePixelRatio;
    const largestAxis = scaledWidth > scaledHeight ? 'X' : 'Y';
    const largestAxisSize = Math.max(scaledWidth, scaledHeight);

    uniforms.BackgroundCircleOrigin.value.set(scaledWidth / 2, scaledHeight / 2);
    uniforms.BackgroundCircleRadius.value = largestAxisSize * 1.5;

    uniforms.CenterCircleOrigin.value.set(scaledWidth / 2, scaledHeight / 2);
    uniforms.CenterCircleRadius.value = largestAxisSize * (largestAxis === 'X' ? 1 : 0.75);

    uniforms.LeftCircleOrigin.value.set(0, scaledHeight);
    uniforms.LeftCircleRadius.value = largestAxisSize * 0.75;

    uniforms.RightCircleOrigin.value.set(scaledWidth, 0);
    uniforms.RightCircleRadius.value = largestAxisSize * (largestAxis === 'X' ? 0.65 : 0.5);

    renderer.render(sceneRef.current, new OrthographicCamera(-1, 1, 1, -1, 0.1, 10));
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  useEffect(() => {
    updateDimensions();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      isFocusedRef.current = true;
    };

    const handleBlur = () => {
      isFocusedRef.current = false;
    };

    if (autoStopAnimation) {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [autoStopAnimation]);

  useEffect(() => {
    if (!imageSrc || !uniformsRef.current) return;

    const uniforms = uniformsRef.current;
    let cancelled = false;

    setTimeout(() => {
      loadAndProcessImage(imageSrc, filter).then((newTexture) => {
        if (!newTexture || cancelled || !uniformsRef.current) return;

        uniforms.BlurredCoverArt.value = newTexture;
      });
    }, 300);

    return () => {
      cancelled = true;
    };
  }, [imageSrc, filter]);

  return (
    <canvas
      ref={canvasRef}
      className="animated-bg-canvas"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: `${filter.opacity ?? 100}%`,
        filter: serializeFilters(filter, { skipBlur: true, skipContrast: true }),
      }}
    />
  );
};

export default AnimatedBackgroundCanvas;
