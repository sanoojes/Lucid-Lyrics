import type { LyricsProviders } from "@/constants";
import type {
  BackgroundState,
  FullscreenState,
  NpvSettingsState,
  PageState,
  WidgetState,
} from "@/stores";
import type { CacheSettings } from "@/stores/dev";

const customUrl = "https://picsum.photos/1920/1080";
export const DEFAULT_BACKGROUND_STATE = {
  mode: "kawarp",
  options: {
    color: "#000000",
    image: {
      mode: "player",
      customUrl,
      scale: 130,
      filter: {
        blur: 48,
        saturation: 200,
        contrast: 110,
        brightness: 70,
        opacity: 100,
      },
      local: {
        time: 30,
        shuffle: true,
        direction: "next",
        slideshow: true,
        selectedId: undefined,
      },
    },
    animated: {
      mode: "player",
      customUrl,
      scale: 100,
      filter: {
        blur: 42,
        saturation: 250,
        contrast: 115,
        brightness: 60,
        opacity: 100,
      },
      transitionDuration: 0.5,
      rotationSpeed: 0.8,
    },
    kawarp: {
      mode: "player",
      customUrl,
      scale: 1.0,
      saturation: 1.5,
      brightness: 0.8,
      animationSpeed: 1.0,
      blurPasses: 12,
      warpIntensity: 1.0,
      dithering: 0.008,
      tintIntensity: 0.15,
      tintColor: [0.157, 0.157, 0.235],
      transitionDuration: 1000,
    },
  },
} satisfies BackgroundState;

export const DEFAULT_PROVIDER_ORDER = ["user", "spicy", "spotify"] satisfies LyricsProviders[];

export const DEFAULT_PAGE_STATE = {
  widget: "show",
  romanize: false,
  romanize_position: "bottom",
  showCredits: true,
  hideScrollbar: false,
  showControls: false,
  hideStatus: false,
  floatingPosition: "bottom",
} satisfies PageState;

export const DEFAULT_FULLSCREEN_STATE = {
  widget: "show",
  romanize: false,
  romanize_position: "bottom",
  showCredits: true,
  hideScrollbar: false,
  showControls: true,
  hideStatus: true,
  floatingPosition: "bottom",
} satisfies FullscreenState;

export const DEFAULT_WIDGET_STATE = {
  variant: "glass",
  centerText: true,
  hideTitle: false,
  hideArtist: false,
  hideAlbum: true,
} satisfies WidgetState;

export const DEFAULT_CACHE_SETTINGS = {
  ttlDays: 14,
} satisfies CacheSettings;

export const DEFAULT_NPV_SETTINGS = {
  hideBackground: false,
  useStyles: true,
  showLyrics: true,
  cardHeightPercent: 37,
  cardMinHeight: 400,
  autoHideCardHeader: false,
} satisfies NpvSettingsState;
