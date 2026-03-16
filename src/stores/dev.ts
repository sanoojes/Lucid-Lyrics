import { persistentAtom } from "@nanostores/persistent";
import { getName } from "@/stores/persist";

type OnOff = "off" | "on";

export const $developer_mode = persistentAtom<OnOff>(
  getName("developer-mode"),
  __LUCID_DEV_MODE__ ? "on" : "off",
);

export const $ttml_maker_mode = persistentAtom<OnOff>(
  getName("ttml-maker-mode"),
  __LUCID_DEV_MODE__ ? "on" : "off",
);

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
