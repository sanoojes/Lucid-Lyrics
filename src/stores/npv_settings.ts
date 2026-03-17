import { persistentJSON } from "@nanostores/persistent";
import { getName } from "@/stores/persist";
import { DEFAULT_NPV_SETTINGS } from "@/constants";

export type NpvSettingsState = {
  hideBackground: boolean;
  useStyles: boolean;
};

export const $npv_settings = persistentJSON<NpvSettingsState>(
  getName("npv_settings"),
  DEFAULT_NPV_SETTINGS,
);

export function resetNpvSettings() {
  $npv_settings.set(DEFAULT_NPV_SETTINGS);
}

const update = (updates: Partial<NpvSettingsState>) => {
  $npv_settings.set({ ...$npv_settings.get(), ...updates } as NpvSettingsState);
};

export const setHideBackground = (hideBackground: boolean) => update({ hideBackground });
export const setUseStyles = (useStyles: boolean) => update({ useStyles });
