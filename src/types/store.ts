import type { BestAvailableLyrics } from '@/types/lyrics.ts';
import type { CSSFilter } from '@/types/styles.ts';
import type { ColorPalette } from '@/utils/color.ts';

type Nullable<T> = T | null;

/* ---------- Temp Store Types ---------- */
export type PlayerData = {
  imageUrl: Nullable<string>;
  data: Nullable<Partial<Spicetify.PlayerTrack>>;
  id: Nullable<string>;
  colors: Nullable<ColorPalette>;
  lyricData: Nullable<BestAvailableLyrics>;
};

export type SpotifyToken = {
  accessToken?: string;
  expiresAtTime?: number;
};

export type PlayerSlot = 'nowPlaying';
// | "next" | "previous" | "prefetched";

export type PlayerState = Record<PlayerSlot, PlayerData>;

export type TempState = {
  isLyricsOnPage: boolean;
  isSidebarOpen: boolean;
  player: PlayerState;
  pageImg: {
    cover?: string;
    desktop?: string;
  };
  viewSize: {
    main: { width: number; height: number };
  };
  spotifyToken: SpotifyToken;
  isOnline: boolean;
  isScrolling: boolean;
};

/* ---------- App Store Types ---------- */
// deno-lint-ignore ban-types
type Stringify<T extends string> = T | (string & {}); // just to trick the compiler

type Color = string;

type BackgroundMode = Stringify<'solid' | 'static' | 'animated'>;
type BackgroundImageMode = Stringify<'custom' | 'player' | 'page'>;
export type BackgroundState = {
  mode: BackgroundMode;
  options: {
    // For Animated and Static
    filter: CSSFilter;
    imageMode: BackgroundImageMode;
    customUrl: Nullable<string>;

    // Solid Background
    color: Color;

    // Animated Background
    autoStopAnimation: boolean;
  };
};

export type AppState = {
  bg: BackgroundState;
  isDevMode: boolean;
  forceRomanized: boolean;
  isNpvCardOpen: boolean;
  isAnalyticsActive: boolean;
};
