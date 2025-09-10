import '@/styles/npv.css';
import LyricsRenderer from '@/components/lyrics/LyricsRenderer.tsx';
import { Button, RomanizationButton } from '@/components/ui';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import cx from '@cx';
import { ChevronDown, Maximize2, SquareArrowOutUpLeft } from 'lucide-react';
import { useState } from 'react';
import { useStore } from 'zustand';

const LyricsCard = () => {
  const isOpen = useStore(appStore, (s) => s.isNpvCardOpen);
  const isDevMode = useStore(appStore, (s) => s.isDevMode);
  const mainViewHeight = useStore(tempStore, (s) => s.viewSize.main.height);

  const [showHeader, setShowHeader] = useState(!isOpen);

  const fullscreenMode = useStore(tempStore, (s) => s.fullscreenMode);

  if (fullscreenMode !== 'hidden') return null;
  return (
    <div
      className={cx('main-nowPlayingView-section lyrics-npv', { 'card-open': isOpen })}
      onMouseLeave={() => setShowHeader(false)}
      onMouseEnter={() => setShowHeader(true)}
    >
      {isDevMode ? <div className="dev-mode-banner">DEBUG</div> : null}
      <div className={cx('main-nowPlayingView-sectionHeader card-header', { show: showHeader })}>
        <h2
          className="e-9890-text encore-text-body-medium-bold encore-internal-color-text-base"
          data-encore-id="text"
        >
          <div className="main-nowPlayingView-sectionHeaderText">Lyrics</div>
        </h2>
        <div className="section-btn-wrapper">
          {isOpen ? (
            <>
              <Button
                onClick={() => {
                  tempStore.getState().setFullscreenMode('fullscreen');
                }}
                variant="icon"
                tippyContent="Enter Fullscreen"
              >
                <Maximize2 />
              </Button>
              <Button
                onClick={() => {
                  tempStore.getState().mainPageInstance?.togglePage();
                }}
                variant="icon"
                tippyContent="Open Page"
              >
                <SquareArrowOutUpLeft />
              </Button>
              <RomanizationButton />
            </>
          ) : null}
          <Button
            onClick={() => appStore.getState().toggleNpvCardOpen()}
            tippyContent={isOpen ? 'Close Lyrics' : 'Open Lyrics'}
            variant="icon"
          >
            <ChevronDown className={cx({ rotate: isOpen })} />
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div
          className="npv-lyrics-root"
          style={{ height: `${Math.max(mainViewHeight / 2, 320)}px` }}
        >
          <LyricsRenderer />
        </div>
      ) : null}
    </div>
  );
};

export default LyricsCard;
