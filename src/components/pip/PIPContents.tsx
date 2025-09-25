import Background from '@/components/background/Background.tsx';
import LyricsRenderer from '@/components/lyrics/LyricsRenderer.tsx';
import PIPButtons from '@/components/pip/PIPButtons.tsx';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import cx from '@cx';
import { useCallback, useState } from 'react';
import { useStore } from 'zustand';
import { NowPlayingWidget } from '@/components/ui';

tempStore.getState().openPiP();
const PIPContents: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { pipShowMetadata, hideStatus } = useStore(appStore, (s) => s.lyrics);
  const pipRoot = useStore(tempStore, (s) => s.pipInstance.pipRoot);
  const lyricFetchStatus = useStore(tempStore, (s) => s.player?.nowPlaying?.lyricFetchStatus);

  const isFullWidget = lyricFetchStatus === 'error' && hideStatus;

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
        <div
          style={
            {
              '-webkit-app-region': 'drag',
              'app-region': 'drag',
              position: 'fixed',
              height: '40px',
              inset: '0',
              width: '100%',
            } as React.CSSProperties
          }
        ></div>
        <NowPlayingWidget
          className={cx('top', {
            hide: !pipShowMetadata,
            'flex-column': isFullWidget,
            'align-left': !isFullWidget,
            'cover-full': isFullWidget,
          })}
        />
        <LyricsRenderer />
        <PIPButtons className={cx({ 'show-a-bit': isHovered })} pipRoot={pipRoot} />
        <Background customWindow={pipRoot?.window ?? undefined} />
      </div>
    )
  );
};

export default PIPContents;
