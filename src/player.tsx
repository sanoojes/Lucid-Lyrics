import { toast } from "~/lib/sonner";
import Brand from "~/component/icon/Brand";
import { createButton } from "~/lib/spotify/player";
import router from "~/router";
import { logger } from "~/utils/logger";
import { t } from "~/i18n";
import { BASE_ROUTE } from "~/constants";
import { Maximize2 } from "lucide-solid";
import { $npb_state, setPageMode } from "~/stores";

const PAGE_PATH = BASE_ROUTE;

export async function setupPlayerButtons() {
  try {
    // Lyrics Page Button
    const toggleBtn = await createButton({
      icon: <Brand size={18} />,
      label: t("menu.appName"),
      onClick: (api) => {
        const active = router.togglePath(PAGE_PATH);
        api.update({ active });
      },
    });

    const unsubscribeRouter = router.state.listen(({ path }) => {
      toggleBtn.update({ active: path === PAGE_PATH });
    });

    // Fullscreen Button
    const fullscreenBtnApi = await createButton(
      {
        icon: <Maximize2 size={18} />,
        label: t("fullscreen.enter"),
        onClick: () => {
          setPageMode("fullscreen");
        },
        order: 0,
      },
      { autoRegister: false, placement: "end" },
    );

    const unsubscribeState = $npb_state.subscribe((state) => {
      setSpotifyFullscreenDisplay(state.hideSpotifyFullscreen ? "none" : "");

      if (state.hideFullscreen) {
        fullscreenBtnApi.deregister();
      } else {
        fullscreenBtnApi.register();
      }
    });

    return () => {
      unsubscribeRouter();
      unsubscribeState();

      toggleBtn.destroy();
      fullscreenBtnApi.destroy();
    };
  } catch (e) {
    const msg = t("player.addButtons");
    logger.error(msg, e);
    toast.error(msg);
  }
}

function setSpotifyFullscreenDisplay(display: string) {
  const btn = getSpotifyFullscreenBtn();
  if (btn) btn.style.display = display;
}

function getSpotifyFullscreenBtn() {
  return document.querySelector<HTMLButtonElement>(
    '.main-nowPlayingBar-extraControls button[data-testid="fullscreen-mode-button"]',
  );
}
