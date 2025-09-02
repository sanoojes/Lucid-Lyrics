import type { AppState, BackgroundState } from '@/types/store.ts';
import { DEFAULT_APP_STATE } from '@constants';
import { merge } from 'lodash';
import { combine, persist, subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

const APPSTORE_NAME = 'lucid-lyrics:settings';
type AppStateSetters = {
  setBg: (bg: Partial<BackgroundState>) => void;
  setBgOptions: (options: Partial<BackgroundState['options']>) => void;
  setBgFilter: (filter: Partial<BackgroundState['options']['filter']>) => void;

  setIsDevMode: (isDevMode: boolean) => void;

  setIsAnalyticsActive: (isAnalyticsActive: boolean) => void;

  setIsNpvCardOpen: (isNpvCardOpen: boolean) => void;

  toggleRomanization: () => void;

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
        toggleRomanization: () => set({ forceRomanized: !get().forceRomanized }),
        setIsAnalyticsActive: (isAnalyticsActive) => set({ isAnalyticsActive }),
        setIsNpvCardOpen: (isNpvCardOpen) => set({ isNpvCardOpen }),

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
