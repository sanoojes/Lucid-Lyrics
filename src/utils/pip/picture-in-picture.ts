import { $pip_window_state } from "~/stores";
import { logger } from "~/utils/logger";

export async function _togglePIP() {
  if (!("documentPictureInPicture" in window)) {
    logger.error("Picture-in-Picture API is not supported in this Spotify.", {
      version: (window as any).Spicetify?.Platform?.version ?? "unknown",
    });
    return;
  }

  const currentState = $pip_window_state.get();

  if (currentState.isOpen && currentState.window) {
    currentState.window.close();
    $pip_window_state.set({ isOpen: false, window: null });
    return;
  }

  try {
    const win = await window.documentPictureInPicture.requestWindow({
      width: 480,
      height: 720,
    });

    win.addEventListener("pagehide", () => {
      $pip_window_state.set({ isOpen: false, window: null });
    });

    $pip_window_state.set({ isOpen: true, window: win });
  } catch (error) {
    logger.error("pip_request_failed", error);
  }
}
