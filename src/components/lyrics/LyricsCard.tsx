import { Button } from '@/components/ui/index.ts';
import { ChevronDown16Filled } from '@fluentui/react-icons';

const LyricsCard = () => {
  return (
    <div className="main-nowPlayingView-section">
      <div className="main-nowPlayingView-sectionHeader">
        <h2
          className="e-9890-text encore-text-body-medium-bold encore-internal-color-text-base"
          data-encore-id="text"
        >
          <div className="main-nowPlayingView-sectionHeaderText">Lyrics</div>
        </h2>
        <div>
          <Button onClick={() => {}} variant="icon">
            <ChevronDown16Filled />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LyricsCard;
