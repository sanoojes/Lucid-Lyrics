import { persistentJSON } from "@/utils/nanostores";
import { getName } from "@/stores/persist";
import { DEFAULT_NPB_SETTINGS } from "@/constants";

export type NowPlayingBarState = {
  hideFullscreen: boolean;
  hideSpotifyFullscreen: boolean;
};

// now playing bar states
export const $npb_state = persistentJSON<NowPlayingBarState>(getName("npb"), DEFAULT_NPB_SETTINGS);

export function updateNPBState(updater: (state: NowPlayingBarState) => NowPlayingBarState) {
  $npb_state.set(updater($npb_state.get()));
}

export function setHideSpotifyFullscreenBtn(hide: boolean) {
  updateNPBState((state) => ({ ...state, hideSpotifyFullscreen: hide }));
}

export function setHideFullscreenBtn(hide: boolean) {
  updateNPBState((state) => ({ ...state, hideFullscreen: hide }));
}

export function resetNPBState() {
  $npb_state.set(DEFAULT_NPB_SETTINGS);
}
