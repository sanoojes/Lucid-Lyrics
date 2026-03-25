import { persistentAtom } from "@nanostores/persistent";
import { persistentJSON } from "@/utils/nanostores";
import { getName } from "@/stores/persist";
import { DEFAULT_CACHE_SETTINGS } from "@/constants";

type OnOff = "off" | "on";

export type CacheSettings = {
  ttlDays: number;
};

export const $cache_settings = persistentJSON<CacheSettings>(
  getName("cache-settings"),
  DEFAULT_CACHE_SETTINGS,
);

export function setCacheTTL(days: number) {
  $cache_settings.set({ ...$cache_settings.get(), ttlDays: days });
}

export const $developer_mode = persistentAtom<OnOff>(getName("developer-mode"), "off");

export const $ttml_maker_mode = persistentAtom<OnOff>(getName("ttml-maker-mode"), "off");

export function setTTMLMakerMode(mode: OnOff) {
  $ttml_maker_mode.set(mode);
}

export function resetTTMLMakerMode() {
  $ttml_maker_mode.set("off");
}

export function setDevMode(mode: OnOff) {
  $developer_mode.set(mode);
}

export function toggleDevMode() {
  $developer_mode.set($developer_mode.get() === "on" ? "off" : "on");
}

export function resetDevMode() {
  $developer_mode.set("off");
}

if (__LUCID_DEV_MODE__) {
  setTTMLMakerMode("on");
  setDevMode("on");
}
