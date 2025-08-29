import tempStore from '@/store/tempStore.ts';
import { getLyricsData } from '@/utils/fetch/getLyricsData.ts';
import { useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand';

export function useLyrics() {
  const id = useStore(tempStore, (s) => s.player.nowPlaying.id);

  return useQuery({
    queryKey: ['lyrics', id],
    queryFn: () => {
      return getLyricsData(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}
