import Background from '@/components/background/Background.tsx';
import LyricsRenderer from '@/components/lyrics/LyricsRenderer.tsx';
import { Button, NowPlayingWidget, RomanizationButton } from '@/components/ui';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import cx from '@cx';
import {
  Fullscreen,
  ImageUpscale,
  ListMusic,
  MoveHorizontal,
  PictureInPicture2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from 'zustand';

const PageButtons: React.FC<{ className?: string; hideMetadataButtons: boolean }> = ({
  className,
  hideMetadataButtons = false,
}) => {
  const { showMetadata, metadataPosition } = useStore(appStore, (s) => s.lyrics);
  const isPIPOpen = useStore(tempStore, (s) => s.pipInstance.isOpen);

  return (
    <div className={cx('lucid-config-container', className)}>
      <Button
        onClick={() => {
          tempStore.getState().setFullscreenMode('fullscreen');
        }}
        variant="icon"
        tippyContent="Enter Fullscreen"
      >
        <Fullscreen />
      </Button>
      <Button
        onClick={() => {
          tempStore.getState().setFullscreenMode('compact');
        }}
        variant="icon"
        tippyContent="Enter Cinema View"
      >
        <ImageUpscale />
      </Button>
      <Button
        onClick={() => {
          tempStore.getState().togglePiP();
        }}
        variant="icon"
        tippyContent={isPIPOpen ? 'Close Miniplayer' : 'Open Miniplayer'}
      >
        <PictureInPicture2 />
      </Button>
      <Button
        onClick={() => appStore.getState().setLyrics('showMetadata', !showMetadata)}
        variant="icon"
        show={!hideMetadataButtons}
        tippyContent={showMetadata ? 'Hide Metadata' : 'Show Metadata'}
      >
        <ListMusic />
      </Button>
      <Button
        show={showMetadata && !hideMetadataButtons}
        onClick={() =>
          appStore
            .getState()
            .setLyrics('metadataPosition', metadataPosition === 'left' ? 'right' : 'left')
        }
        variant="icon"
        tippyContent={
          metadataPosition === 'left' ? 'Move Metadata to Right' : 'Move Metadata to left'
        }
      >
        <MoveHorizontal />
      </Button>
      <RomanizationButton />
      <Button
        onClick={() => tempStore.getState().mainPageInstance?.goBack?.()}
        variant="icon"
        tippyContent="Close"
      >
        <X />
      </Button>
    </div>
  );
};

const Page = () => {
  const mainViewSize = useStore(tempStore, (state) => state.viewSize.main);
  const fullscreenMode = useStore(tempStore, (s) => s.fullscreenMode);
  const lyricFetchStatus = useStore(tempStore, (s) => s.player?.nowPlaying?.lyricFetchStatus);

  const isDevMode = useStore(appStore, (s) => s.isDevMode);
  const { showMetadata, metadataPosition, isSpotifyFont, hideStatus } = useStore(
    appStore,
    (s) => s.lyrics
  );

  const [isHovering, setIsHovering] = useState(false);

  const position = lyricFetchStatus === 'error' && hideStatus ? 'center' : metadataPosition;

  if (fullscreenMode !== 'hidden') return;
  return (
    <main
      className={cx(`lyrics-page-root`, {
        'use-encore-font': isSpotifyFont,
        'show-now-playing-widget': showMetadata,
        [`widget-on-${position}`]: showMetadata,
      })}
      style={{ display: 'flex', ...mainViewSize }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isDevMode ? <div className="dev-mode-banner">DEBUG</div> : null}
      <NowPlayingWidget className={cx(position, { hide: !showMetadata && !hideStatus })} />
      <LyricsRenderer />
      <PageButtons
        className={cx({ 'show-a-bit': isHovering })}
        hideMetadataButtons={position === 'center'}
      />
      <Background />
    </main>
  );
};

export default Page;
