import Background from '@/components/background/Background.tsx';
import LyricsRenderer from '@/components/lyrics/LyricsRenderer.tsx';
import PIPButtons from '@/components/pip/PIPButtons.tsx';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import cx from '@cx';
import { useCallback, useState } from 'react';
import { useStore } from 'zustand';

tempStore.getState().openPiP();
const PIPContents: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const pipShowMetadata = useStore(appStore, (s) => s.lyrics.pipShowMetadata);
  const pipRoot = useStore(tempStore, (s) => s.pipInstance.pipRoot);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsHovered(false);
  }, []);

  return (
    pipRoot && (
      <div
        className={cx('lucid-lyrics-pip-root', {
          hovering: isHovered,
          'widget-on-top': pipShowMetadata,
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* <NowPlayingWidget className={cx('top bg-blur', { hide: !pipShowMetadata })} /> */}
        <LyricsRenderer />
        <PIPButtons className={cx({ 'show-a-bit': isHovered })} pipRoot={pipRoot} />
        <Background customWindow={pipRoot?.window ?? undefined} />
      </div>
    )
  );
};

export default PIPContents;
