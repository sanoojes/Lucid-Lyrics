import type { LyricsProviders } from "~/constants";
import type {
  BackgroundState,
  FullscreenState,
  NowPlayingBarState,
  NpvSettingsState,
  PageState,
  WidgetState,
} from "~/stores";
import type { CacheSettings } from "~/stores/dev";

const customUrl = "https://picsum.photos/1920/1080";
export const DEFAULT_BACKGROUND_STATE = {
  mode: "kawarp",
  options: {
    animated: {
      customUrl,
      filter: {
        blur: 42,
        brightness: 60,
        contrast: 115,
        opacity: 100,
        saturation: 250,
      },
      mode: "player",
      rotationSpeed: 0.4,
      scale: 100,
      transitionDuration: 0.5,
    },
    color: "#000000",
    image: {
      customUrl,
      filter: {
        blur: 48,
        brightness: 70,
        contrast: 110,
        opacity: 100,
        saturation: 200,
      },
      local: {
        direction: "next",
        selectedId: undefined,
        shuffle: true,
        slideshow: true,
        time: 30,
      },
      mode: "player",
      scale: 130,
    },
    kawarp: {
      animationSpeed: 1.0,
      blurPasses: 12,
      brightness: 0.8,
      customUrl,
      dithering: 0.008,
      mode: "player",
      saturation: 3.0,
      scale: 1.0,
      tintColor: [0.157, 0.157, 0.235],
      tintIntensity: 0.15,
      transitionDuration: 1000,
      warpIntensity: 1.0,
    },
  },
} satisfies BackgroundState;

export const DEFAULT_PROVIDER_ORDER = [
  "user",
  "spicy",
  "amll",
  "lrclib",
  "spotify",
] satisfies LyricsProviders[];

export const DEFAULT_PAGE_STATE = {
  floatingPosition: "bottom",
  hideScrollbar: false,
  hideStatus: false,
  romanize: false,
  romanize_position: "replace",
  showControls: false,
  showCredits: true,
  widget: "show",
} satisfies PageState;

export const DEFAULT_FULLSCREEN_STATE = {
  floatingPosition: "bottom",
  hideScrollbar: false,
  hideStatus: true,
  showControls: true,
  showCredits: true,
  widget: "show",
} satisfies FullscreenState;

export const DEFAULT_WIDGET_STATE = {
  centerText: true,
  hideAlbum: true,
  hideArtist: false,
  hideTitle: false,
  variant: "glass",
} satisfies WidgetState;

export const DEFAULT_CACHE_SETTINGS = {
  ttlDays: 14,
} satisfies CacheSettings;

export const DEFAULT_NPV_SETTINGS = {
  autoHideCardHeader: false,
  cardHeightPercent: 37,
  cardMinHeight: 400,
  hideBackground: false,
  showLyrics: true,
  useStyles: true,
} satisfies NpvSettingsState;

export const DEFAULT_NPB_SETTINGS: NowPlayingBarState = {
  hideFullscreen: false,
  hideSpotifyFullscreen: true,
};
