import Lyrics from '@/components/lyrics/Lyrics.tsx';
import { ProgressProvider } from '@/context/ProgressContext.tsx';
import { ReactQueryProvider } from '@/lib/reactQuery.tsx';
import tempStore from '@/store/tempStore.ts';
import { getLyricsData } from '@/utils/fetch/getLyricsData.ts';
import { useQuery } from '@tanstack/react-query';
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from 'overlayscrollbars-react';
import { createContext, memo, useContext, useEffect, useRef } from 'react';
import { useStore } from 'zustand';

const ScrollContext = createContext<OverlayScrollbarsComponentRef | null>(null);

export const useScroll = () => {
  return useContext(ScrollContext);
};

const LyricsContainer = memo(() => {
  const id = useStore(tempStore, (s) => s.player.nowPlaying.id);
  const isOnline = useStore(tempStore, (s) => s.isOnline);
  const scrollRef = useRef<OverlayScrollbarsComponentRef | null>(null);

  const { data, status, error } = useQuery({
    queryKey: ['lyrics', id],
    queryFn: () => getLyricsData(id),
    enabled: !!id && isOnline,
    retry: 1,
  });

  useEffect(() => {
    let lyricData = null;
    if (status === 'success') lyricData = data;
    tempStore.getState().setPlayer('nowPlaying', { lyricData });
  }, [data, status]);

  return (
    // 3️⃣ Provide the scroll ref via context
    <ScrollContext.Provider value={scrollRef.current}>
      <div className="lyrics-container">
        <OverlayScrollbarsComponent
          style={{ flex: 1 }}
          ref={scrollRef}
          options={{
            scrollbars: {
              autoHide: 'move',
              dragScroll: true,
            },
          }}
          defer
        >
          <ProgressProvider>
            <Lyrics data={data} status={status} isOnline={isOnline} error={error} />
          </ProgressProvider>
        </OverlayScrollbarsComponent>
      </div>
    </ScrollContext.Provider>
  );
});

const LyricsRenderer = memo(() => {
  return (
    <ReactQueryProvider>
      <LyricsContainer />
    </ReactQueryProvider>
  );
});

export default LyricsRenderer;
