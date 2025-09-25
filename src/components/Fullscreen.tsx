import '@/styles/fullscreen.css';

import Background from '@/components/background/Background.tsx';
import LyricsRenderer from '@/components/lyrics/LyricsRenderer.tsx';
import { Button, NowPlayingWidget, RomanizationButton } from '@/components/ui';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import type { LyricsState, TempState } from '@/types/store.ts';
import cx from '@cx';
import { logger } from '@logger';
import { ImageUpscale, Maximize2, MoveHorizontal, PictureInPicture2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from 'zustand';

const exitFullScreen = () => {
  document.exitFullscreen().catch((err) => {
    logger.error('Failed to exit fullscreen:', err);
  });
  tempStore.getState().setFullscreenMode('compact');
};

const WidgetButtons: React.FC<{
  fullScreenMetadataPosition: LyricsState['fullScreenMetadataPosition'] | 'center';
  fullscreenMode: TempState['fullscreenMode'];
}> = ({ fullScreenMetadataPosition, fullscreenMode }) => {
  const isPIPOpen = useStore(tempStore, (s) => s.pipInstance.isOpen);
  return (
    <>
      <RomanizationButton />
      <Button
        variant="icon"
        onClick={() => tempStore.getState().setFullscreenMode('fullscreen')}
        show={fullscreenMode !== 'fullscreen'}
        tippyContent="Enter Fullscreen"
      >
        <Maximize2 />
      </Button>

      <Button
        variant="icon"
        onClick={() => tempStore.getState().setFullscreenMode('compact')}
        show={fullscreenMode !== 'compact'}
        tippyContent="Enter Cinema View"
      >
        <ImageUpscale />
      </Button>
      <Button
        variant="icon"
        show={fullScreenMetadataPosition !== 'center'}
        onClick={() =>
          appStore
            .getState()
            .setLyrics(
              'fullScreenMetadataPosition',
              fullScreenMetadataPosition === 'left' ? 'right' : 'left'
            )
        }
        tippyContent={
          fullScreenMetadataPosition === 'left' ? 'Move Metadata to Right' : 'Move Metadata to left'
        }
      >
        <MoveHorizontal />
      </Button>
      <Button
        onClick={() => {
          tempStore.getState().togglePiP();
        }}
        variant="icon"
        tippyContent={isPIPOpen ? 'Close PiP Window' : 'Open PiP Window'}
      >
        <PictureInPicture2 />
      </Button>
      <Button
        variant="icon"
        onClick={() => {
          exitFullScreen();
          tempStore.getState().setFullscreenMode('hidden');
        }}
        tippyContent="Close"
      >
        <X />
      </Button>
    </>
  );
};

const Fullscreen: React.FC = () => {
  const { fullScreenMetadataPosition, isSpotifyFont, hideStatus } = useStore(
    appStore,
    (s) => s.lyrics
  );
  const fullscreenMode = useStore(tempStore, (s) => s.fullscreenMode);
  const lyricFetchStatus = useStore(tempStore, (s) => s.player?.nowPlaying?.lyricFetchStatus);

  const position =
    lyricFetchStatus === 'error' && hideStatus ? 'center' : fullScreenMetadataPosition;

  useEffect(() => {
    if (fullscreenMode === 'fullscreen') {
      document.documentElement.requestFullscreen().catch((err) => {
        logger.error('Failed to enter fullscreen:', err);
      });
    } else if (fullscreenMode === 'compact') {
      exitFullScreen();
    }
  }, [fullscreenMode]);

  useEffect(() => {
    const handleKeyPress = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') exitFullScreen();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (fullscreenMode === 'hidden') return;

  return (
    <div
      className={cx(
        `lyrics-fullscreen-root show-now-playing-widget widget-on-${position} ${fullscreenMode}`,
        { 'use-encore-font': isSpotifyFont }
      )}
      autoFocus
    >
      <div className="lyrics-root">
        <NowPlayingWidget
          className={cx(position)}
          customButtons={
            <WidgetButtons fullScreenMetadataPosition={position} fullscreenMode={fullscreenMode} />
          }
        />
        <LyricsRenderer />
      </div>
      <div className="lyrics-background-root">
        <Background />
      </div>
    </div>
  );
};

export default Fullscreen;
