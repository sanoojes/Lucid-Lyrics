import type { PlayerData, PlayerSlot, SpotifyToken, TempState } from '@/types/store.ts';
import { type PiPRoot, createPiPRoot } from '@/utils/picture-in-picture.ts';
import type { PlayerButtonAPI } from '@/utils/playbar/createButton.ts';
import type { CreatePageInstanceFns } from '@/utils/routes/createPage.ts';
import type { CreateRendererAPI } from '@utils/dom';
import { combine, subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export type TempSetter = {
  setIsLyricsOnPage: (isLyricsOnPage: boolean) => void;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  setSpotifyToken: (spotifyToken: Partial<SpotifyToken>) => void;
  setPlayer: (slot: PlayerSlot, player: Partial<PlayerData>) => void;
  // setPageImg: (pageImg: Partial<TempState['pageImg']>) => void;
  setViewSize: (viewSize: Partial<TempState['viewSize']>) => void;
  setIsOnline: (isOnline: boolean) => void;
  setFullscreenMode: (fullscreenMode: TempState['fullscreenMode']) => void;
  setIsScrolling: (isScrolling: boolean) => void;
  setMainPageInstance: (mainPageInstance: CreatePageInstanceFns) => void;
  setPlayerButtonInstance: (playerButtonInstance: PlayerButtonAPI | null) => void;
  setFullscreenRendererInstance: (fullscreenRendererInstance: CreateRendererAPI) => void;
  setPIPRendererInstance: (pipRendererInstance: CreateRendererAPI) => void;

  setPipRoot: (pipRoot: PiPRoot | null) => void;
  openPiP: () => Promise<void>;
  closePiP: () => void;
  togglePiP: () => Promise<void>;
};

const DEFAULT_PLAYER_STATE: PlayerData = {
  imageUrl: null,
  data: null,
  id: null,
  colors: null,
  lyricFetchStatus: null,
  lyricData: null,
} as const;

const DEFAULT_TEMP_STATE: TempState = {
  isLyricsOnPage: false,
  isSidebarOpen: false,
  fullscreenMode: 'hidden',
  player: {
    nowPlaying: DEFAULT_PLAYER_STATE,
    // next: DEFAULT_PLAYER_STATE,
    // previous: DEFAULT_PLAYER_STATE,
    // prefetched: DEFAULT_PLAYER_STATE,
  },
  // pageImg: {},
  spotifyToken: {},
  viewSize: {
    main: { width: 0, height: 0 },
  },
  isOnline: navigator.onLine,
  isScrolling: false,
  mainPageInstance: null,
  playerButtonInstance: null,
  fullscreenRendererInstance: null,
  pipInstance: {
    renderer: null,
    pipRoot: null,
    isOpen: false,
  },
} as const;

const tempStore = createStore<TempState & TempSetter>()(
  subscribeWithSelector(
    combine(DEFAULT_TEMP_STATE, (set, get) => ({
      setIsLyricsOnPage: (isLyricsOnPage) => set({ isLyricsOnPage }),
      setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      setPlayer: (slot, player) =>
        set({
          player: {
            ...get().player,
            [slot]: { ...get().player[slot], ...player },
          },
        }),

      // setPageImg: (pageImg) => set({ pageImg: { ...get().pageImg, ...pageImg } }),

      setIsOnline: (isOnline) => set({ isOnline }),
      setIsScrolling: (isScrolling) => set({ isScrolling }),
      setFullscreenMode: (fullscreenMode) => {
        tempStore.getState().closePiP();
        set({ fullscreenMode });
      },
      setSpotifyToken: (spotifyToken) =>
        set({ spotifyToken: { ...get().spotifyToken, ...spotifyToken } }),

      setViewSize: (viewSize) => set({ viewSize: { ...get().viewSize, ...viewSize } }),

      setMainPageInstance: (mainPageInstance) => set({ mainPageInstance }),
      setPlayerButtonInstance: (playerButtonInstance) => set({ playerButtonInstance }),
      setFullscreenRendererInstance: (fullscreenRendererInstance) =>
        set({ fullscreenRendererInstance }),
      setPIPRendererInstance: (renderer) =>
        set({ pipInstance: { ...get().pipInstance, renderer } }),
      setPipRoot: (pipRoot) =>
        set({
          pipInstance: {
            ...get().pipInstance,
            pipRoot,
            isOpen: Boolean(pipRoot),
          },
        }),

      openPiP: async () => {
        const { pipInstance } = get();
        if (!pipInstance.pipRoot) {
          const newRoot = await createPiPRoot();
          set({
            pipInstance: {
              ...get().pipInstance,
              pipRoot: newRoot,
              isOpen: true,
            },
          });
        }
      },

      closePiP: () => {
        const { pipInstance } = get();
        if (pipInstance.pipRoot) {
          pipInstance.pipRoot.close();
          set({
            pipInstance: {
              ...get().pipInstance,
              pipRoot: null,
              isOpen: false,
            },
          });
        }
      },

      togglePiP: async () => {
        const { pipInstance } = get();
        if (pipInstance.isOpen) {
          tempStore.getState().closePiP();
        } else {
          await tempStore.getState().openPiP();
        }
      },
    }))
  )
);

export default tempStore;
