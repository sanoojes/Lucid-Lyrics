import { persistentJSON } from "@nanostores/persistent";
import { getName } from "@/stores/persist";
import type { PlayerWidgetVariants } from "@/component/ui/PlayingWidget";
import { DEFAULT_WIDGET_STATE } from "@/constants";
export type WidgetState = {
  variant: PlayerWidgetVariants;
  centerText: boolean;
  hideTitle: boolean;
  hideAlbum: boolean;
  hideArtist: boolean;
};

export const $widget = persistentJSON<WidgetState>(getName("widget"), DEFAULT_WIDGET_STATE);

export function resetWidget() {
  $widget.set(DEFAULT_WIDGET_STATE);
}

const update = (updates: Partial<WidgetState>) => {
  $widget.set({ ...$widget.get(), ...updates });
};

export const setVariant = (variant: PlayerWidgetVariants) => update({ variant });
export const setCenterText = (centerText: boolean) => update({ centerText });
export const setHideTitle = (hideTitle: boolean) => update({ hideTitle });
export const setHideAlbum = (hideAlbum: boolean) => update({ hideAlbum });
export const setHideArtist = (hideArtist: boolean) => update({ hideArtist });
