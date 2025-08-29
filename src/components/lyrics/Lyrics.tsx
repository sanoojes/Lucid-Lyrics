import LineLyrics from '@/components/lyrics/type/LineLyrics.tsx';
import StaticLyrics from '@/components/lyrics/type/StaticLyrics.tsx';
import SyllableLyrics from '@/components/lyrics/type/SyllableLyrics.tsx';
import Scrollable, { type ScrollableRef } from '@/components/ui/Scrollable.tsx';
import { ProgressProvider } from '@/context/ProgressContext.tsx';
import type { BestAvailableLyrics } from '@/types/lyrics.ts';
import { createContext, memo, useContext, useRef } from 'react';

type ScrollContainerContextType = React.RefObject<ScrollableRef | null> | null;

const ScrollContainerContext = createContext<ScrollContainerContextType>(null);

export const useScrollContainer = () => {
  return useContext(ScrollContainerContext);
};

const Lyrics: React.FC<{ data: BestAvailableLyrics }> = memo(({ data }) => {
  const scrollContainerRef = useRef<ScrollableRef | null>(null);
  console.log(data);

  let lyricRenderer = null;
  switch (data.Type) {
    case 'Syllable': {
      lyricRenderer = <SyllableLyrics data={data} />;
      break;
    }
    case 'Line': {
      lyricRenderer = <LineLyrics data={data} />;
      break;
    }
    case 'Static': {
      lyricRenderer = <StaticLyrics data={data} />;
      break;
    }
    default:
      lyricRenderer = null;
      break;
  }

  return (
    <ScrollContainerContext.Provider value={scrollContainerRef}>
      <Scrollable ref={scrollContainerRef}>
        <ProgressProvider>
          <div className="lyrics-wrapper">
            <div className="top-spacing" />
            {lyricRenderer}
            {data?.SongWriters ? (
              <div className="line-wrapper credits-wrapper">
                <span className="credits">Credits: {data.SongWriters?.join?.(', ')}</span>
              </div>
            ) : null}
            <div className="bottom-spacing" />
          </div>
        </ProgressProvider>
      </Scrollable>
    </ScrollContainerContext.Provider>
  );
});

export default Lyrics;
