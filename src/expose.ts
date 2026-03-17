import {
  $background,
  $page_state,
  $providers,
  $widget,
  setShowCredits,
  setHideScrollbar,
  toggleRomanize,
  toggleWidget,
} from "@/stores";
import { $developer_mode, setDevMode, toggleDevMode } from "@/stores/dev";
import { resetAllConfig } from "@/stores/reset";

function exposeGlobals() {
  window.LucidLyrics = {
    setDevMode,
    setShowCredits,
    setHideScrollbar,
    toggleDevMode,
    toggleRomanize,
    toggleWidget,
    reset: resetAllConfig,
    stores: {
      $widget,
      $developer_mode,
      $page_state,
      $background,
      $providers,
    },
  };
}
export default exposeGlobals;
