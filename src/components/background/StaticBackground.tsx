import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import { serializeFilters } from '@utils/dom';
import { useStore } from 'zustand';

const StaticBackground = () => {
  const { imageMode, customUrl, filter } = useStore(appStore, (state) => state.bg.options);
  const npUrl = useStore(tempStore, (state) => state.player?.nowPlaying.imageUrl);
  const imageSrc = (imageMode === 'custom' ? customUrl : npUrl) ?? npUrl;

  return (
    <div
      className="static lucid-lyrics-bg"
      style={
        imageSrc
          ? {
              backgroundImage: `url(${imageSrc})`,
              filter: serializeFilters(filter),
            }
          : {}
      }
    />
  );
};

export default StaticBackground;
