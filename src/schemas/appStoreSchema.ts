import CSSFilterSchema from '@/schemas/cssFilterSchema.ts';
import z from 'zod';
import { boundedNumber } from '../utils/schema.ts';

export const ColorStateSchema = z.object({
  mode: z.enum(['default', 'dynamic', 'custom']),
  accentColor: z.string(),
  isTinted: z.boolean(),
  isDark: z.boolean(),
});

export const BodyClassStateSchema = z.object({
  hideHomeHeader: z.boolean(),
  newHome: z.boolean(),
  flexyHome: z.boolean(),
});

export const BackgroundStateSchema = z.object({
  mode: z.enum(['solid', 'static', 'animated']),
  options: z.object({
    filter: CSSFilterSchema,
    imageMode: z.enum(['custom', 'player', 'page']),
    customUrl: z.url({ error: 'Invalid URL' }),
    color: z.string(),
    autoStopAnimation: z.boolean(),
  }),
});

export const LyricsStateSchema = z.object({
  isSpotifyFont: z.boolean(),
  splitThresholdMs: boundedNumber({ name: 'Split Threshold', min: 0, max: 10000 }),
  maxTranslateUpWord: boundedNumber({ name: 'Max Translate Up Word', min: 0, max: 500 }),
  maxTranslateUpLetter: boundedNumber({ name: 'Max Translate Up Letter', min: 0, max: 500 }),
  scaleCoefficientWord: boundedNumber({ name: 'Scale Coefficient Word', min: 0, max: 10 }),
  scaleCoefficientLetter: boundedNumber({ name: 'Scale Coefficient Letter', min: 0, max: 10 }),
  scrollOffset: boundedNumber({ name: 'Scroll Offset', min: -1000, max: 1000 }),
  forceRomanized: z.boolean(),
  showMetadata: z.boolean(),
  timeOffset: boundedNumber({ min: -9999, max: 9999, name: 'Time Offset' }),
  metadataPosition: z.enum(['left', 'right']),
  fullScreenMetadataPosition: z.enum(['left', 'right']),
});

export const AppStateSchema = z.object({
  bg: BackgroundStateSchema,
  lyrics: LyricsStateSchema,
  disableTippy: z.boolean(),
  isDevMode: z.boolean(),
  isNpvCardOpen: z.boolean(),
  isAnalyticsActive: z.boolean(),
});
