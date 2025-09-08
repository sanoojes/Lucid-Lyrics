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
  lyrics: {
    splitThresholdMs: 1000,
    maxTranslateUpWord: 2,
    maxTranslateUpLetter: 2,
    scaleCoefficientWord: 4,
    scaleCoefficientLetter: 2,
    scrollTimeout: 2000,
    scrollOffset: 16,
    forceRomanized: false,
  },
  isDevMode: false,
  isNpvCardOpen: false,
  isAnalyticsActive: true,
} as const;
