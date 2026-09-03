import "~/styles/page.scss";
import "~/styles/lenis.css";
import { useStore } from "@nanostores/solid";
import { Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { X } from "lucide-solid";
import { t } from "~/i18n";

import { Button } from "~/component/ui/Button";
import { Background } from "~/component/ui/Background";
import Lyrics from "~/component/lyrics/Lyrics";
import Controls from "~/component/ui/player/Controls";
import PlayerWidget from "~/component/ui/PlayingWidget";
import CinemaButton from "~/component/ui/button/CinemaButton";
import RomanizeButton from "~/component/ui/button/RomanizeButton";
import FullscreenButton from "~/component/ui/button/FullscreenButton";
import TogglePIPWidgetButton from "~/component/ui/button/TogglePIPWidgetButton";
import VolumeSlider from "~/component/ui/player/VolumeSlider";

import { $pip_state, $lyrics_status, togglePIP } from "~/stores";
import ScrollToActiveLyricsButton from "~/component/ui/button/ScrollToActiveLyricsButton";
import { $installed_theme } from "~/stores/theme";
import { LyricsRendererProvider } from "~/context/LyricsRenderer";

function PictureInPicture() {
  const [isLoading, setIsLoading] = createSignal(true);
  const [isInitialPop, setIsInitialPop] = createSignal(false);

  const pipState = useStore($pip_state);
  const installedTheme = useStore($installed_theme);
  const lyricsStatus = useStore($lyrics_status);

  const isStatusHidable = () => !["success", "loading"].includes(lyricsStatus() ?? "loading");
  const hideStatus = () => pipState().hideStatus && isStatusHidable();
  const isWidgetHidden = () => {
    if (hideStatus()) return false;
    return pipState().widget === "hidden";
  };
  const themeClassname = () => (installedTheme() ? ` has-${installedTheme()}-theme` : "");

  const handleClose = () => {
    togglePIP();
  };

  const [isFloatingVisible, setIsFloatingVisible] = createSignal(true);
  const [isHovered, setIsHovered] = createSignal(false);
  let timeoutId: number | undefined;
  let popTimerId: number | undefined;

  const resetTimeout = () => {
    setIsFloatingVisible(true);
    clearTimeout(timeoutId);

    if (!isHovered()) {
      timeoutId = setTimeout(() => {
        setIsFloatingVisible(false);
      }, 800);
    }
  };

  createEffect(() => {
    clearTimeout(popTimerId);

    if (pipState().depthEffects) {
      setIsInitialPop(true);
      popTimerId = setTimeout(() => {
        setIsInitialPop(false);
      }, 600);
    } else {
      setIsInitialPop(false);
    }
  });

  onMount(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);

    resetTimeout();

    onCleanup(() => {
      clearTimeout(timer);
      clearTimeout(popTimerId);
      clearTimeout(timeoutId);
    });
  });

  return (
    <main
      id="lucid-page"
      onMouseEnter={() => {
        setIsHovered(true);
        resetTimeout();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        resetTimeout();
      }}
    >
      <LyricsRendererProvider>
        <div
          class="pip-viewport"
          classList={{
            "is-active": pipState().depthEffects && isFloatingVisible(),
          }}
          onMouseMove={resetTimeout}
          onTouchStart={resetTimeout}
        >
          <div class="pip-topbar">
            <Button
              class="pip-close-btn"
              variant="ghost"
              size="icon-sm"
              shape="rounded"
              onClick={handleClose}
              title={t("common.close") ?? "Close"}
            >
              <X size={14} />
            </Button>
          </div>

          <div
            class={`lucid-contents${themeClassname()}`}
            style={{ width: "100%" }}
            classList={{
              "hide-lyrics-status": hideStatus(),
              "hide-scrollbars": pipState().hideScrollbar,
              "is-active": pipState().depthEffects && isFloatingVisible(),
              "initial-pop": isInitialPop(),
            }}
          >
            <VolumeSlider hidden={!isFloatingVisible()} />
            <div
              class="widget-area"
              classList={{
                "hide-lyrics-status": hideStatus(),
                "widget-area--hidden": isWidgetHidden(),
              }}
            >
              <PlayerWidget
                topControls={
                  <div class="top-controls">
                    <CinemaButton glass />
                    <FullscreenButton glass />
                    <RomanizeButton glass />
                  </div>
                }
                controls={<Controls />}
                showLikeBtn
              />
            </div>
            <Lyrics
              widgetHidden={isWidgetHidden()}
              showCredits={pipState().showCredits}
              hideStatus={hideStatus()}
            />
            <div
              class={`floating-area on-bottom`}
              classList={{ "floating-area--hidden": !isFloatingVisible() }}
            >
              <Show when={pipState().showControls}>
                <Controls />
                <div class="separator" />
              </Show>
              <div class="controls">
                <Show when={!hideStatus()}>
                  <TogglePIPWidgetButton />
                </Show>
                <RomanizeButton />
                <ScrollToActiveLyricsButton />
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X />
                </Button>
              </div>
            </div>
          </div>
          <Background />
          <div class="pip-loading-overlay" classList={{ "is-hidden": !isLoading() }}>
            <div class="pip-spinner" />
            <p class="pip-loading-text">{t("pip.loading")}</p>
          </div>
        </div>
      </LyricsRendererProvider>
    </main>
  );
}

export default PictureInPicture;
