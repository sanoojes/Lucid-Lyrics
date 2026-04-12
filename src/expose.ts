import {
  $background,
  $npv_state,
  $page_state,
  $providers,
  $widget,
  setHideScrollbar,
  setShowCredits,
  toggleRomanize,
  toggleWidget,
} from "~/stores";
import { $developer_mode, setDevMode, toggleDevMode } from "~/stores/dev";
import { resetAllConfig } from "~/stores/reset";
import router from "~/router";
import API from "~/api";

function exposeGlobals() {
  window.LucidLyrics = {
    clearLyricsCache: () => API.clearAllCache(),
    reset: resetAllConfig,
    router,
    setDevMode,
    setHideScrollbar,
    setShowCredits,
    stores: {
      $background,
      $developer_mode,
      $npv_state,
      $page_state,
      $providers,
      $widget,
    },
    toggleDevMode,
    toggleRomanize,
    toggleWidget,
  };
}
export default exposeGlobals;
