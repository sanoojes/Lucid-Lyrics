export type LyricsProviders = "spicy" | "spotify" | "user" | "amll";

const PROVIDER_LIST: Record<LyricsProviders, string> = {
  spicy: "Spicy Lyrics",
  spotify: "Spotify",
  amll: "AMLL",
  user: "Local TTML",
};
export const getProviderName = (name: string | LyricsProviders) =>
  PROVIDER_LIST[name as LyricsProviders] || name;
