import { persistentJSON } from "@/lib/nanostores";
import { getName } from "@/stores/persist";
import { computed } from "nanostores";
import { DEFAULT_PAGE_STATE } from "@/constants";

export type Positions = "top" | "bottom" | "left" | "right";

export type PageState = {
  widget: "hidden" | "show";
  romanize: boolean;
  showCredits: boolean;
  hideScrollbar: boolean;
  showControls: boolean;
  floatingPosition: Positions;
};
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
