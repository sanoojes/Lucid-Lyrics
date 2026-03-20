import { persistentJSON } from "@nanostores/persistent";
import { getName } from "@/stores/persist";
import { atom, computed } from "nanostores";
import { DEFAULT_PAGE_STATE, DEFAULT_FULLSCREEN_STATE } from "@/constants";

export type Positions = "top" | "bottom" | "left" | "right";

export type PageState = {
  widget: "hidden" | "show";
  romanize: boolean;
  showCredits: boolean;
  hideScrollbar: boolean;
  showControls: boolean;
  floatingPosition: Positions;
};

export type FullscreenState = {
  widget: "hidden" | "show";
  romanize: boolean;
  showCredits: boolean;
  hideScrollbar: boolean;
  showControls: boolean;
  floatingPosition: Positions;
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

export const $show_widget = computed($page_state, (s) => s.widget);
export const $romanize = computed($page_state, (s) => s.romanize);

export function toggleRomanize() {
  updatePageState((state) => ({ ...state, romanize: !state.romanize }));
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

export function toggleFullscreenWidget() {
  updateFullscreenState((state) => ({
    ...state,
    widget: state.widget === "hidden" ? "show" : "hidden",
  }));
}
