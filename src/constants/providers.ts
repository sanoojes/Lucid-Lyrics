export type LyricsProviders = "spicy" | "spotify" | "user";

const PROVIDER_LIST: Record<LyricsProviders, string> = {
  spicy: "Spicy Lyrics",
  spotify: "Spotify",
  user: "Local TTML",
};
export const getProviderName = (name: string) => PROVIDER_LIST[name as LyricsProviders] || name;
