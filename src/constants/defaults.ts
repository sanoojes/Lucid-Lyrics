import type { LyricsProviders } from "@/constants";
import type { BackgroundState, PageState, WidgetState } from "@/stores";
import type { CacheSettings } from "@/stores/dev";

type NpvSettingsState = {
  hideBackground: boolean;
  useStyles: boolean;
};

const customUrl = "https://picsum.photos/1920/1080";
export const DEFAULT_BACKGROUND_STATE = {
  mode: "animated",
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
      scale: 130,
      autoPause: true,
      customUrl,
      filter: {
        blur: 48,
        saturation: 200,
        contrast: 110,
        brightness: 70,
        opacity: 100,
      },
    },
  },
} satisfies BackgroundState;

export const DEFAULT_PROVIDER_ORDER = ["user", "spicy", "spotify"] satisfies LyricsProviders[];

export const DEFAULT_PAGE_STATE = {
  widget: "show",
  romanize: false,
  showCredits: true,
  hideScrollbar: false,
  showControls: true,
  floatingPosition: "bottom",
} satisfies PageState;

export const DEFAULT_WIDGET_STATE = {
  variant: "glass",
  centerText: true,
  hideTitle: false,
  hideArtist: false,
  hideAlbum: true,
} satisfies WidgetState;

export const DEFAULT_CACHE_SETTINGS: CacheSettings = {
  ttlDays: 10,
};

export const DEFAULT_NPV_SETTINGS: NpvSettingsState = {
  hideBackground: false,
  useStyles: true,
};
