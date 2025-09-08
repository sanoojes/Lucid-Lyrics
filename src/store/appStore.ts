import type { AppState, BackgroundState, LyricsState } from '@/types/store.ts';
import { DEFAULT_APP_STATE } from '@constants';
import { merge } from 'lodash';
import { combine, persist, subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import Lyrics from '../components/lyrics/Lyrics.tsx';

const APPSTORE_NAME = 'lucid-lyrics:settings';

type LyricsConfigKey = keyof LyricsState;

type AppStateSetters = {
  setBg: (bg: Partial<BackgroundState>) => void;
  setBgOptions: (options: Partial<BackgroundState['options']>) => void;
  setBgFilter: (filter: Partial<BackgroundState['options']['filter']>) => void;

  setIsDevMode: (isDevMode: boolean) => void;
  setIsAnalyticsActive: (isAnalyticsActive: boolean) => void;
  setIsNpvCardOpen: (isNpvCardOpen: boolean) => void;
  toggleRomanization: () => void;

  setLyrics: <K extends LyricsConfigKey>(key: K, value: LyricsState[K]) => void;

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
        toggleRomanization: () =>
          set({ lyrics: { ...get().lyrics, forceRomanized: !get().lyrics.forceRomanized } }),
        setIsAnalyticsActive: (isAnalyticsActive) => set({ isAnalyticsActive }),
        setIsNpvCardOpen: (isNpvCardOpen) => set({ isNpvCardOpen }),

        setLyrics: (key, value) =>
          set({
            lyrics: {
              ...get().lyrics,
              [key]: value,
            },
          }),

        importConfig: (config) => set(merge({}, DEFAULT_APP_STATE, config)),
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
      migrate: (persistedState) => merge(DEFAULT_APP_STATE, persistedState ?? {}),
    }
  )
);

appStore.getState().importConfig(appStore.getState());
export default appStore;
