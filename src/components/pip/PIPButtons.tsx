import { Button, RomanizationButton } from '@/components/ui';
import tempStore from '@/store/tempStore.ts';
import type { PiPRoot } from '@/utils/picture-in-picture.ts';
import cx from '@cx';
import { Fullscreen, ImageUpscale, ListMusic, X } from 'lucide-react';
import { useStore } from 'zustand';
import appStore from '../../store/appStore.ts';

interface PIPButtonsProps {
  className?: string;
  pipRoot: PiPRoot;
}

const PIPButtons: React.FC<PIPButtonsProps> = ({ className, pipRoot }) => {
  const pipShowMetadata = useStore(appStore, (s) => s.lyrics.pipShowMetadata);
  const body = pipRoot.window?.document.body;

  return (
    <div className={cx('lucid-config-container', className)}>
      <Button
        onClick={() => tempStore.getState().setFullscreenMode('fullscreen')}
        variant="icon"
        tippyContainer={body}
        tippyContent="Enter Fullscreen"
      >
        <Fullscreen />
      </Button>

      <Button
        onClick={() => tempStore.getState().setFullscreenMode('compact')}
        variant="icon"
        tippyContainer={body}
        tippyContent="Enter Cinema View"
      >
        <ImageUpscale />
      </Button>
      <Button
        onClick={() => appStore.getState().setLyrics('pipShowMetadata', !pipShowMetadata)}
        variant="icon"
        tippyContainer={body}
        tippyContent={pipShowMetadata ? 'Hide Metadata' : 'Show Metadata'}
      >
        <ListMusic />
      </Button>
      <RomanizationButton />
      <Button
        onClick={() => tempStore.getState().closePiP()}
        variant="icon"
        tippyContainer={pipRoot.window?.document.body}
        tippyContent="Close"
      >
        <X />
      </Button>
    </div>
  );
};

export default PIPButtons;
