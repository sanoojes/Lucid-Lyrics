import '@/styles/fullscreen.css';

import Background from '@/components/background/Background.tsx';
import LyricsRenderer from '@/components/lyrics/LyricsRenderer.tsx';
import { Button, NowPlayingWidget, RomanizationButton } from '@/components/ui';
import tempStore from '@/store/tempStore.ts';
import { FullscreenIcon, ImageUpscale, MoveHorizontal, X } from 'lucide-react';
import { useEffect } from 'react';
import cx from '@cx';
import { useStore } from 'zustand';
import appStore from '@/store/appStore.ts';
import type { LyricsState, TempState } from '@/types/store.ts';

const exitFullScreen = () => {
  document.exitFullscreen().catch((err) => {
    console.error('Failed to exit fullscreen:', err);
  });
  tempStore.getState().setFullscreenMode('compact');
};

const WidgetButtons: React.FC<{
  fullScreenMetadataPosition: LyricsState['fullScreenMetadataPosition'];
  fullscreenMode: TempState['fullscreenMode'];
}> = ({ fullScreenMetadataPosition, fullscreenMode }) => {
  return (
    <>
      <RomanizationButton />
      <Button
        variant="icon"
        onClick={() => tempStore.getState().setFullscreenMode('fullscreen')}
        show={fullscreenMode !== 'fullscreen'}
        tippyContent="Enter Fullscreen"
      >
        <FullscreenIcon />
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
  const { fullScreenMetadataPosition } = useStore(appStore, (s) => s.lyrics);
  const fullscreenMode = useStore(tempStore, (s) => s.fullscreenMode);

  useEffect(() => {
    if (fullscreenMode === 'fullscreen') {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
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
      className={`lyrics-fullscreen-root show-now-playing-widget widget-on-${fullScreenMetadataPosition} ${fullscreenMode}`}
      autoFocus
    >
      <div className="lyrics-root">
        <NowPlayingWidget
          className={cx(fullScreenMetadataPosition)}
          customButtons={
            <WidgetButtons
              fullScreenMetadataPosition={fullScreenMetadataPosition}
              fullscreenMode={fullscreenMode}
            />
          }
        />
        <LyricsRenderer />
      </div>
      <div className="background-root">
        <Background />
      </div>
    </div>
  );
};

export default Fullscreen;
