import type { PlayerData, PlayerSlot, SpotifyToken, TempState } from '@/types/store.ts';
import { combine, subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export type TempSetter = {
  setIsLyricsOnPage: (isLyricsOnPage: boolean) => void;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  setSpotifyToken: (spotifyToken: Partial<SpotifyToken>) => void;
  setPlayer: (slot: PlayerSlot, player: Partial<PlayerData>) => void;
  setPageImg: (pageImg: Partial<TempState['pageImg']>) => void;
  setViewSize: (viewSize: Partial<TempState['viewSize']>) => void;
};

const DEFAULT_PLAYER_STATE: PlayerData = {
  lyricsData: null,
  imageUrl: null,
  data: null,
  id: null,
} as const;

const DEFAULT_TEMP_STATE: TempState = {
  isLyricsOnPage: false,
  isSidebarOpen: false,
  player: {
    nowPlaying: DEFAULT_PLAYER_STATE,
    // next: DEFAULT_PLAYER_STATE,
    // previous: DEFAULT_PLAYER_STATE,
    // prefetched: DEFAULT_PLAYER_STATE,
  },
  pageImg: {},
  spotifyToken: {},
  viewSize: {
    main: { width: 0, height: 0 },
  },
} as const;

const mergeDeep = <T extends object>(base: T, update: Partial<T>): T => ({
  ...base,
  ...update,
});

const tempStore = createStore<TempState & TempSetter>()(
  subscribeWithSelector(
    combine(DEFAULT_TEMP_STATE, (set, get) => ({
      setIsLyricsOnPage: (isLyricsOnPage) => set({ isLyricsOnPage }),
      setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

      setPlayer: (slot, player) =>
        set({
          player: {
            ...get().player,
            [slot]: mergeDeep(get().player[slot], player),
          },
        }),

      setPageImg: (pageImg) => set({ pageImg: mergeDeep(get().pageImg, pageImg) }),

      setSpotifyToken: (spotifyToken) =>
        set({ spotifyToken: mergeDeep(get().spotifyToken, spotifyToken) }),

      setViewSize: (viewSize) => set({ viewSize: mergeDeep(get().viewSize, viewSize) }),
    }))
  )
);

export default tempStore;
