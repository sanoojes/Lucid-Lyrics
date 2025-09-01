import Lyrics from "@/components/lyrics/Lyrics.tsx";
import Scrollable, { type ScrollableRef } from "@/components/ui/Scrollable.tsx";
import { ProgressProvider } from "@/context/ProgressContext.tsx";
import { ReactQueryProvider } from "@/lib/reactQuery.tsx";
import tempStore from "@/store/tempStore.ts";
import { getLyricsData } from "@/utils/fetch/getLyricsData.ts";
import { useQuery } from "@tanstack/react-query";
import { createContext, memo, useContext, useRef } from "react";
import { useStore } from "zustand";

type ScrollContainerContextType = React.RefObject<ScrollableRef | null> | null;

const ScrollContainerContext = createContext<ScrollContainerContextType>(null);

export const useScrollContainer = () => {
  return useContext(ScrollContainerContext);
};

const LyricsContainer = memo(() => {
  const id = useStore(tempStore, (s) => s.player.nowPlaying.id);
  const isOnline = useStore(tempStore, (s) => s.isOnline);

  const scrollContainerRef = useRef<ScrollableRef | null>(null);

  const { data, status, error } = useQuery({
    queryKey: ["lyrics", id],
    queryFn: () => getLyricsData(id),
    enabled: !!id && isOnline,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  return (
    <div className="lyrics-container">
      <ScrollContainerContext.Provider value={scrollContainerRef}>
        <Scrollable ref={scrollContainerRef}>
          <ProgressProvider>
            <Lyrics
              data={data}
              status={status}
              isOnline={isOnline}
              error={error}
            />
          </ProgressProvider>
        </Scrollable>
      </ScrollContainerContext.Provider>
    </div>
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
