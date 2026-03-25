import { type APIStatus, type FetchOptions } from "@/lib/api/types";
import { $player_data } from "@/stores/player";
import { persistentJSON } from "@nanostores/persistent";
import { atom, computed } from "nanostores";
import { getName } from "@/stores/persist";
import { DEFAULT_PROVIDER_ORDER, type LyricsProviders } from "@/constants";

export type LyricsQuery = FetchOptions;

export type BlurmapMode = "default" | "minimal" | "smooth" | "heavy" | "none" | "custom";

export const DEFAULT_BLURMAP: Record<BlurmapMode, number[]> = {
  default: [0, 1, 1, 1, 2, 2],
  minimal: [0, 0.2, 0.5, 0.7, 1, 1],
  none: [0, 0, 0, 0, 0],
  smooth: [0, 1, 1, 2, 3, 4],
  heavy: [0, 2, 4, 6, 8, 8],
  custom: [0, 1, 2, 3, 4, 5],
};

export const $blurmap_mode = persistentJSON<BlurmapMode>(getName("blurmap_mode"), "default");
export const $custom_blurmap = persistentJSON<number[]>(
  getName("custom_blurmap"),
  DEFAULT_BLURMAP.default,
);

export function getBlurmap(): number[] {
  const mode = $blurmap_mode.get();
  if (mode === "custom") {
    return $custom_blurmap.get();
  }
  return DEFAULT_BLURMAP[mode];
}

export function setBlurmapMode(mode: BlurmapMode) {
  $blurmap_mode.set(mode);
}

export function setCustomBlurmap(blurmap: number[]) {
  $custom_blurmap.set(blurmap);
}

export function resetBlurmap() {
  $blurmap_mode.set("default");
  $custom_blurmap.set(DEFAULT_BLURMAP.default);
}
export const $lyrics_query = computed($player_data, (player) => {
  const trackId = player?.uri?.split(":")[2];
  if (!trackId) return null;
  return {
    id: trackId,
    data: { name: player.name },
  } satisfies LyricsQuery;
});

export const $has_romanized = atom<boolean>(false);
export const $lyrics_status = atom<APIStatus | "loading" | undefined>();

export const $providers = persistentJSON<LyricsProviders[]>(
  getName("providers"),
  DEFAULT_PROVIDER_ORDER,
);

export function resetProviders() {
  $providers.set(DEFAULT_PROVIDER_ORDER);
}

(function migrate() {
  const curr = $providers.get();
  if (!curr || !Array.isArray(curr)) {
    $providers.set(DEFAULT_PROVIDER_ORDER);
    return;
  }

  if (!curr.includes("amll")) {
    const nextState = [...curr];
    const spicyIndex = nextState.indexOf("spicy");
    nextState.splice(spicyIndex === -1 ? nextState.length : spicyIndex + 1, 0, "amll");
    $providers.set(nextState);
  }
})();
