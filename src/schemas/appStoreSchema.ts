import CSSFilterSchema from '@/schemas/cssFilterSchema.ts';
import z from 'zod';

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
    customUrl: z.string().nullable(),
    color: z.string(),
    autoStopAnimation: z.boolean(),
  }),
});

export const AppStateSchema = z.object({
  bg: BackgroundStateSchema,
});
