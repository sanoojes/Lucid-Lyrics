type Nullable<T> = T | null;

declare const __APP_NAME__: string;
declare const __APP_VERSION__: string;
declare const __IS_DEV__: boolean;
declare const __LUCID_DEV_MODE__: boolean;

type HistoryLocation = { pathname: string };

type PlatformHistory = {
  location: HistoryLocation;
  entries: HistoryLocation[];
  push: (location: string) => void;
  listen: (cb: (location: HistoryLocation | undefined) => void) => void;
};

declare namespace Spicetify {
  interface Platform extends global.Spicetify.Platform {
    History: PlatformHistory;
    PlayerAPI: PlayerAPI;
  }
}

type GlobalLucid = {
  setDevMode: (c: "on" | "off") => void;
  toggleDevMode: () => void;
  toggleRomanize: () => void;
  toggleWidget: () => void;
  reset: () => void;
  clearLyricsCache: () => void;
  setShowCredits: (c: boolean) => void;
  setHideScrollbar: (c: boolean) => void;
  stores: Record<string, any>;
  router: any;
};

interface Window {
  __lucid_lyrics_loaded?: boolean;
  LucidLyrics: GlobalLucid;
}
