import type { AppState, BackgroundState, LyricsState } from '@/types/store.ts';
import { DEFAULT_APP_STATE } from '@constants';
import deepMerge from '@/utils/deepMerge.ts';
import { combine, persist, subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

const APPSTORE_NAME = 'lucid-lyrics:settings';

type AppStateSetters = {
  setBg: (bg: Partial<BackgroundState>) => void;
  setBgOptions: (options: Partial<BackgroundState['options']>) => void;
  setBgFilter: (filter: Partial<BackgroundState['options']['filter']>) => void;

  setIsDevMode: (isDevMode: boolean) => void;
  setIsAnalyticsActive: (isAnalyticsActive: boolean) => void;
  toggleNpvCardOpen: () => void;
  toggleRomanization: () => void;
  setDisableTippy: (disableTippy: boolean) => void;

  setLyrics: <K extends keyof LyricsState>(key: K, value: LyricsState[K]) => void;

  exportConfig: () => string | null;
  importConfig: (config: AppState) => void;
  resetStore: () => void;
};

const appStore = createStore<AppState & AppStateSetters>()(
  persist(
    subscribeWithSelector(
      combine(DEFAULT_APP_STATE, (set, get) => ({
        setBg: (bg) => set({ bg: { ...get().bg, ...bg } }),
        setBgOptions: (options) =>
          set({
            bg: {
              ...get().bg,
              options: { ...get().bg.options, ...options },
            },
          }),
        setBgFilter: (filter) =>
          set({
            bg: {
              ...get().bg,
              options: {
                ...get().bg.options,
                filter: { ...get().bg.options.filter, ...filter },
              },
            },
          }),
        setIsDevMode: (isDevMode) => {
          set({ isDevMode });
          location.reload();
        },
        setDisableTippy: (disableTippy) => set({ disableTippy }),
        toggleRomanization: () =>
          set({ lyrics: { ...get().lyrics, forceRomanized: !get().lyrics.forceRomanized } }),
        setIsAnalyticsActive: (isAnalyticsActive) => set({ isAnalyticsActive }),
        toggleNpvCardOpen: () => set({ isNpvCardOpen: !get().isNpvCardOpen }),

        setLyrics: (key, value) =>
          set({
            lyrics: {
              ...get().lyrics,
              [key]: value,
            },
          }),

        importConfig: (config) => set(deepMerge(DEFAULT_APP_STATE, config)),
        exportConfig: () => {
          try {
            const config = JSON.stringify(get(), null, 2);
            return config;
          } catch {
            return null;
          }
        },
        resetStore: () => {
          try {
            set(DEFAULT_APP_STATE);
            localStorage.removeItem(APPSTORE_NAME);
          } catch {}
        },
      }))
    ),
    {
      name: APPSTORE_NAME,
      version: 1,
      migrate: (persistedState) => deepMerge(DEFAULT_APP_STATE, persistedState ?? {}),
    }
  )
);

appStore.getState().importConfig(appStore.getState());
export default appStore;
