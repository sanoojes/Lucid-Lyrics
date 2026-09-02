import { DEFAULT_PICTURE_IN_PICTURE_STATE } from "~/constants";
import { getName } from "~/stores/persist";
import { persistentJSON } from "~/utils/nanostores";

import { atom } from "nanostores";

import { _togglePIP } from "~/utils/pip/picture-in-picture";
export const togglePIP = _togglePIP;

export interface PipState {
  isOpen: boolean;
  window: Window | null;
}

export const $pip_window_state = atom<PipState>({
  isOpen: false,
  window: null,
});

export type PictureInPictureState = {
  widget: DisplayState;
  showCredits: boolean;
  hideScrollbar: boolean;
  showControls: boolean;
  hideStatus: boolean;
  depthEffects: boolean;
};

export const $pip_state = persistentJSON<PictureInPictureState>(
  getName("page-state"),
  DEFAULT_PICTURE_IN_PICTURE_STATE,
);
export function resetPictureInPicture() {
  $pip_state.set(DEFAULT_PICTURE_IN_PICTURE_STATE);
}

export function updatePictureInPicture(
  updater: (state: PictureInPictureState) => PictureInPictureState,
) {
  $pip_state.set(updater($pip_state.get()));
}

export function setPIPShowCredits(showCredits: boolean) {
  updatePictureInPicture((state) => ({ ...state, showCredits }));
}

export function setPIPHideScrollbar(hideScrollbar: boolean) {
  updatePictureInPicture((state) => ({ ...state, hideScrollbar }));
}

export function setPIPShowControls(showControls: boolean) {
  updatePictureInPicture((state) => ({ ...state, showControls }));
}

export function setPIPHideStatus(hideStatus: boolean) {
  updatePictureInPicture((state) => ({ ...state, hideStatus }));
}

export function togglePIPWidget() {
  updatePictureInPicture((state) => ({
    ...state,
    widget: state.widget === "hidden" ? "show" : "hidden",
  }));
}
