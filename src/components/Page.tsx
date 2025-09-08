import Background from '@/components/background/Background.tsx';
import LyricsRenderer from '@/components/lyrics/LyricsRenderer.tsx';
import { Button } from '@/components/ui';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import { Languages } from 'lucide-react';
import { StrictMode } from 'react';
import { useStore } from 'zustand';

const PageButtons = () => {
  const hasRomanizedText = useStore(
    tempStore,
    (s) => s.player.nowPlaying.lyricData?.hasRomanizedText
  );

  return (
    <div className="lucid-config-container">
      <Button
        onClick={appStore.getState().toggleRomanization}
        variant="icon"
        className={hasRomanizedText ? 'show' : 'hide'}
      >
        <Languages />
      </Button>
    </div>
  );
};

const Page = () => {
  const mainViewSize = useStore(tempStore, (state) => state.viewSize.main);

  return (
    <StrictMode>
      <main style={mainViewSize}>
        <LyricsRenderer />
        <PageButtons />
        <Background />
      </main>
    </StrictMode>
  );
};

export default Page;
