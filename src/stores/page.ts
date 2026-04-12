import { persistentJSON } from "~/utils/nanostores";
import { getName } from "~/stores/persist";
import { atom, computed } from "nanostores";
import { DEFAULT_FULLSCREEN_STATE, DEFAULT_PAGE_STATE } from "~/constants";

export type Positions = "top" | "bottom" | "left" | "right";

export type RomanizePosition = "top" | "bottom" | "replace";

export type PageState = {
  widget: "hidden" | "show";
  romanize: boolean;
  romanize_position: RomanizePosition;
  showCredits: boolean;
  hideScrollbar: boolean;
  showControls: boolean;
  floatingPosition: Positions;
  hideStatus: boolean;
};

export type FullscreenState = {
  widget: "hidden" | "show";
  romanize: boolean;
  romanize_position: RomanizePosition;
  showCredits: boolean;
  hideScrollbar: boolean;
  showControls: boolean;
  floatingPosition: Positions;
  hideStatus: boolean;
};

export type PageMode = "page" | "cinema" | "fullscreen";

export const $page_mode = atom<PageMode>("page");

export function setPageMode(mode: PageMode) {
  $page_mode.set(mode);
}

export const $page_state = persistentJSON<PageState>(getName("page-state"), DEFAULT_PAGE_STATE);
export function resetPageState() {
  $page_state.set(DEFAULT_PAGE_STATE);
}

export function updatePageState(updater: (state: PageState) => PageState) {
  $page_state.set(updater($page_state.get()));
}

export const $romanize = computed($page_state, (s) => s.romanize);
export const $romanize_position = computed($page_state, (s) => s.romanize_position);

export function toggleRomanize() {
  updatePageState((state) => ({ ...state, romanize: !state.romanize }));
}

export function setRomanizePosition(position: RomanizePosition) {
  updatePageState((state) => ({ ...state, romanize_position: position }));
}

export function setShowCredits(showCredits: boolean) {
  updatePageState((state) => ({ ...state, showCredits }));
}

export function setHideScrollbar(hideScrollbar: boolean) {
  updatePageState((state) => ({ ...state, hideScrollbar }));
}

export function setShowControls(showControls: boolean) {
  updatePageState((state) => ({ ...state, showControls }));
}

export function setFloatingPosition(floatingPosition: Positions) {
  updatePageState((state) => ({ ...state, floatingPosition }));
}

export function setHideStatus(hideStatus: boolean) {
  updatePageState((state) => ({ ...state, hideStatus }));
}

export function toggleWidget() {
  updatePageState((state) => ({
    ...state,
    widget: state.widget === "hidden" ? "show" : "hidden",
  }));
}

export const $fullscreen_state = persistentJSON<FullscreenState>(
  getName("fullscreen-state"),
  DEFAULT_FULLSCREEN_STATE,
);

export function resetFullscreenState() {
  $fullscreen_state.set(DEFAULT_FULLSCREEN_STATE);
}

export function updateFullscreenState(updater: (state: FullscreenState) => FullscreenState) {
  $fullscreen_state.set(updater($fullscreen_state.get()));
}

export function toggleFullscreenRomanize() {
  updateFullscreenState((state) => ({ ...state, romanize: !state.romanize }));
}

export function setFullscreenRomanizePosition(position: RomanizePosition) {
  updateFullscreenState((state) => ({ ...state, romanize_position: position }));
}

export function setFullscreenShowCredits(showCredits: boolean) {
  updateFullscreenState((state) => ({ ...state, showCredits }));
}

export function setFullscreenHideScrollbar(hideScrollbar: boolean) {
  updateFullscreenState((state) => ({ ...state, hideScrollbar }));
}

export function setFullscreenShowControls(showControls: boolean) {
  updateFullscreenState((state) => ({ ...state, showControls }));
}

export function setFullscreenFloatingPosition(floatingPosition: Positions) {
  updateFullscreenState((state) => ({ ...state, floatingPosition }));
}

export function setFullscreenHideStatus(hideStatus: boolean) {
  updateFullscreenState((state) => ({ ...state, hideStatus }));
}

export function toggleFullscreenWidget() {
  updateFullscreenState((state) => ({
    ...state,
    widget: state.widget === "hidden" ? "show" : "hidden",
  }));
}
