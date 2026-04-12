export const ALL_PROVIDERS = ["spicy", "amll", "lrclib", "spotify"] as const;
export type LyricsProviders = "user" | (typeof ALL_PROVIDERS)[number];

const PROVIDER_LIST: Record<LyricsProviders, string> = {
  amll: "AMLL",
  lrclib: "LRCLIB",
  spicy: "Spicy Lyrics",
  spotify: "Spotify",
  user: "Local TTML",
};
export const getProviderName = (name: string | LyricsProviders) =>
  PROVIDER_LIST[name as LyricsProviders] || name;
