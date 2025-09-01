import type { AppState } from '@/types/store.ts';

export const DEFAULT_APP_STATE: AppState = {
  bg: {
    mode: 'static',
    options: {
      filter: {
        blur: 64,
        saturation: 200,
        contrast: 125,
        brightness: 60,
        opacity: 100,
      },
      color: '#060606',
      imageMode: 'player',
      customUrl: 'https://picsum.photos/1920/1080',
      autoStopAnimation: false,
    },
  },
  isDevMode: false,
  isAnalyticsActive: true,
} as const;
