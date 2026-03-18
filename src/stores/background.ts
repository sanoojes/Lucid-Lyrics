import { persistentJSON } from "@/lib/nanostores";
import { computed } from "nanostores";
import { getName } from "@/stores/persist";
import { DEFAULT_BACKGROUND_STATE } from "@/constants";

export const $background = persistentJSON<BackgroundState>(
  getName("background"),
  DEFAULT_BACKGROUND_STATE,
);

type Slideshow = {
  startTime: number;
  elapsedTime: number | null;
};
export const $slideshow = persistentJSON<Slideshow>(getName("bg-slideshow"), {
  startTime: -1,
  elapsedTime: null,
});

export function updateSlideshowStart(startTime: Slideshow["startTime"]) {
  $slideshow.set({
    ...$slideshow.get(),
    startTime,
  });
}
export function updateSlideshowElapsed(elapsedTime: Slideshow["elapsedTime"]) {
  $slideshow.set({
    ...$slideshow.get(),
    elapsedTime,
  });
}

export function updateBackground(updater: (state: BackgroundState) => BackgroundState) {
  $background.set(updater($background.get()));
}

export function resetBackground() {
  $background.set(DEFAULT_BACKGROUND_STATE);
}

export function updateColorOption(color: string) {
  updateBackground((state) => ({
    ...state,
    options: { ...state.options, color },
  }));
}

export function updateImageOptions(partial: Partial<BackgroundState["options"]["image"]>) {
  updateBackground((state) => ({
    ...state,
    options: {
      ...state.options,
      image: { ...state.options.image, ...partial },
    },
  }));
}

export function updateLocalImageOptions(
  partial: Partial<BackgroundState["options"]["image"]["local"]>,
) {
  updateBackground((state) => ({
    ...state,
    options: {
      ...state.options,
      image: { ...state.options.image, local: { ...state.options.image.local, ...partial } },
    },
  }));
}

export function updateLocalSelectedId(id: string | undefined) {
  updateLocalImageOptions({ selectedId: id });
}

export function updateAnimatedOptions(partial: Partial<BackgroundState["options"]["animated"]>) {
  updateBackground((state) => ({
    ...state,
    options: {
      ...state.options,
      animated: { ...state.options.animated, ...partial },
    },
  }));
}

export function updateImageFilter(key: keyof CSSFilter, value: number) {
  updateBackground((state) => ({
    ...state,
    options: {
      ...state.options,
      image: {
        ...state.options.image,
        filter: { ...state.options.image.filter, [key]: value },
      },
    },
  }));
}

export function updateAnimatedFilter(key: keyof CSSFilter, value: number) {
  updateBackground((state) => ({
    ...state,
    options: {
      ...state.options,
      animated: {
        ...state.options.animated,
        filter: { ...state.options.animated.filter, [key]: value },
      },
    },
  }));
}

export const $bg_mode = computed($background, (v) => v.mode);
export const $image_options = computed($background, (v) => v.options.image);
export const $color_options = computed($background, (v) => v.options.color);
export const $animated_options = computed($background, (v) => v.options.animated);

export type ImageTypes = "custom" | "player" | "local";
export type BGTypes = "color" | "image" | "animated";
export type BackgroundState = {
  mode: BGTypes;
  options: {
    color: string;
    image: {
      mode: ImageTypes;
      scale: number;
      filter: CSSFilter;
      customUrl?: string;
      local: {
        time: number;
        slideshow: boolean;
        shuffle: boolean;
        direction: "next" | "prev";
        selectedId: string | undefined;
      };
    };
    animated: {
      mode: ImageTypes;
      scale: number;
      customUrl?: string;
      filter: CSSFilter;
    };
  };
};

type CSSFilter = {
  brightness: number;
  contrast: number;
  saturation: number;
  opacity: number;
  blur: number;
};
