import { type FetchOptions } from "@/lib/api/types";
import { $player_data } from "@/stores/player";
import { persistentJSON } from "@/lib/nanostores";
import { atom, computed } from "nanostores";
import { getName } from "@/stores/persist";
import { DEFAULT_PROVIDER_ORDER, type LyricsProviders } from "@/constants";

export type LyricsQuery = FetchOptions;
export const $lyrics_query = computed($player_data, (player) => {
  const trackId = player?.uri?.split(":")[2];
  if (!trackId) return null;
  return {
    id: trackId,
    data: { name: player.name },
  } satisfies LyricsQuery;
});

export const $has_romanized = atom<boolean>(false);

export const $providers = persistentJSON<LyricsProviders[]>(
  getName("providers"),
  DEFAULT_PROVIDER_ORDER,
);

export function resetProviders() {
  $providers.set(DEFAULT_PROVIDER_ORDER);
}
