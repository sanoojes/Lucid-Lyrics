import { Button } from '@/components/ui';
import { useStore } from 'zustand';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import { LetterA } from '@/components/icons';
import { Languages } from 'lucide-react';

const RomanizationButton = () => {
  const hasRomanizedText = useStore(
    tempStore,
    (s) => s.player.nowPlaying.lyricData?.hasRomanizedText
  );

  const { forceRomanized } = useStore(appStore, (s) => s.lyrics);

  return (
    <Button
      onClick={appStore.getState().toggleRomanization}
      variant="icon"
      show={hasRomanizedText ?? false}
      tippyContent={forceRomanized ? 'Disable Romanization' : 'Enable Romanization'}
    >
      {forceRomanized ? <LetterA /> : <Languages />}
    </Button>
  );
};

export default RomanizationButton;
