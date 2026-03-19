import { persistentJSON } from "@nanostores/persistent";
import { getName } from "@/stores/persist";
import { DEFAULT_NPV_SETTINGS } from "@/constants";

export type NpvSettingsState = {
  hideBackground: boolean;
  useStyles: boolean;
  showLyrics: boolean;
  autoHideCardHeader: boolean;
  cardHeightPercent: number;
  cardMinHeight: number;
};

export const $npv_state = persistentJSON<NpvSettingsState>(
  getName("npv_settings"),
  DEFAULT_NPV_SETTINGS,
);

export function resetNpvSettings() {
  $npv_state.set(DEFAULT_NPV_SETTINGS);
}

const update = (
  updates: Partial<NpvSettingsState> | ((prev: NpvSettingsState) => Partial<NpvSettingsState>),
) => {
  const state = $npv_state.get();
  $npv_state.set({
    ...state,
    ...(typeof updates === "function" ? updates(state) : updates),
  } as NpvSettingsState);
};

export const setHideBackground = (hideBackground: boolean) => update({ hideBackground });
export const setUseStyles = (useStyles: boolean) => update({ useStyles });
export const setAutoHideCardHeader = (autoHideCardHeader: boolean) =>
  update({ autoHideCardHeader });
export const setCardHeightPercent = (cardHeightPercent: number) => update({ cardHeightPercent });
export const setCardMinHeight = (cardMinHeight: number) => update({ cardMinHeight });
export const setShowLyrics = (showLyrics: boolean) => update({ showLyrics });
export const toggleShowLyrics = () => update((prev) => ({ showLyrics: !prev.showLyrics }));
