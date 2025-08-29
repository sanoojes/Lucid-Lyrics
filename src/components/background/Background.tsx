import AnimatedBackground from '@/components/background/AnimatedBackground.tsx';
import StaticBackground from '@/components/background/StaticBackground.tsx';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import React, { type FC } from 'react';
import { useStore } from 'zustand';

const Background: FC = () => {
  const mode = useStore(appStore, (state) => state.bg.mode);
  const { color, imageMode, customUrl, autoStopAnimation, filter } = useStore(
    appStore,
    (state) => state.bg.options
  );
  const npUrl = useStore(tempStore, (state) => state.player?.nowPlaying?.imageUrl);
  const pageImgUrl = useStore(tempStore, (state) => state.pageImg);
  const imageSrc =
    (imageMode === 'custom'
      ? customUrl
      : imageMode === 'page'
        ? (pageImgUrl.desktop ?? pageImgUrl.cover)
        : npUrl) ?? npUrl;

  return (
    <>
      {mode === 'animated' ? (
        <AnimatedBackground imageSrc={imageSrc} autoStop={autoStopAnimation} filter={filter} />
      ) : mode === 'solid' ? (
        <div className="lucid-lyrics-bg solid" style={{ backgroundColor: color }}></div>
      ) : (
        <StaticBackground imageSrc={imageSrc} filter={filter} />
      )}
    </>
  );
};

export default Background;
