import { persistentJSON } from "@nanostores/persistent";
import { getName } from "@/stores/persist";
import { computed } from "nanostores";
import { DEFAULT_PAGE_STATE } from "@/constants";

export type PageState = { widget: "hidden" | "show"; romanize: boolean; showCredits: boolean };
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

export function toggleShowCredits() {
  updatePageState((state) => ({ ...state, showCredits: !state.showCredits }));
}

export function toggleWidget() {
  updatePageState((state) => ({
    ...state,
    widget: state.widget === "hidden" ? "show" : "hidden",
  }));
}
