import type { LyricsProviders } from "@/lib/api/types";
import type { BackgroundState, PageState, WidgetState } from "@/stores";

const customUrl = "https://picsum.photos/1920/1080";
export const DEFAULT_BACKGROUND_STATE = {
  mode: "image",
  options: {
    color: "#000000",
    image: {
      mode: "player",
      customUrl,
      scale: 130,
      filter: {
        blur: 32,
        saturation: 150,
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
      autoPause: true,
      customUrl,
      filter: {
        blur: 0,
        saturation: 100,
        contrast: 100,
        brightness: 100,
        opacity: 100,
      },
    },
  },
} satisfies BackgroundState;

export const DEFAULT_PROVIDER_ORDER = ["user", "spicy", "spotify"] satisfies LyricsProviders[];

export const DEFAULT_PAGE_STATE = {
  widget: "show",
  romanize: false,
} satisfies PageState;

export const DEFAULT_WIDGET_STATE = {
  variant: "glass",
  centerText: true,
  hideTitle: false,
  hideArtist: false,
  hideAlbum: true,
} satisfies WidgetState;
