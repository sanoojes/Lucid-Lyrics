import type { AppState } from '@/types/store.ts';

export const DEFAULT_APP_STATE: AppState = {
  bg: {
    mode: 'animated',
    options: {
      filter: {
        blur: 48,
        saturation: 150,
        contrast: 110,
        brightness: 70,
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
    scrollOffset: 16,
    forceRomanized: false,
    showMetadata: true,
    metadataPosition: 'left',
    fullScreenMetadataPosition: 'left',
  },
  disableTippy: false,
  isDevMode: false,
  isNpvCardOpen: false,
  isAnalyticsActive: true,
} as const;
