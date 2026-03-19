import {
  $background,
  $page_state,
  $providers,
  $widget,
  setShowCredits,
  setHideScrollbar,
  toggleRomanize,
  toggleWidget,
  $npv_state,
} from "@/stores";
import { $developer_mode, setDevMode, toggleDevMode } from "@/stores/dev";
import { resetAllConfig } from "@/stores/reset";
import router from "@/router";
import API from "@/api";

function exposeGlobals() {
  window.LucidLyrics = {
    setDevMode,
    setShowCredits,
    setHideScrollbar,
    toggleDevMode,
    toggleRomanize,
    toggleWidget,
    reset: resetAllConfig,
    clearLyricsCache: () => API.clearAllCache(),
    router,
    stores: {
      $widget,
      $developer_mode,
      $page_state,
      $background,
      $providers,
      $npv_state,
    },
  };
}
export default exposeGlobals;
