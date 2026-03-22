import "@/styles/page.scss";
import "@/styles/lenis.css";
import { useStore } from "@nanostores/solid";
import { Show, createSignal, onMount, onCleanup } from "solid-js";
import { ListMusic, X } from "lucide-solid";

import { Button } from "@/component/ui/Button";
import { Background } from "@/component/ui/Background";
import Lyrics from "@/component/lyrics/Lyrics";
import Controls from "@/component/ui/player/Controls";
import PlayerWidget from "@/component/ui/PlayingWidget";
import CinemaButton from "@/component/ui/button/CinemaButton";
import RomanizeButton from "@/component/ui/button/RomanizeButton";
import LocalTTMLButton from "@/component/ui/button/LocalTTMLButton";
import FullscreenButton from "@/component/ui/button/FullscreenButton";

import { $fullscreen_state, $lyrics_status, setPageMode, toggleFullscreenWidget } from "@/stores";
import ScrollToActiveLyricsButton from "@/component/ui/button/ScrollToActiveLyricsButton";
import { $installed_theme } from "@/stores/theme";
import { LyricsRendererProvider } from "@/context/LyricsRenderer";

function FullscreenPage() {
  const pageState = useStore($fullscreen_state);
  const installedTheme = useStore($installed_theme);
  const lyricsStatus = useStore($lyrics_status);
  const isStatusHidable = () => !["success", "loading"].includes(lyricsStatus() ?? "loading");
  const hideStatus = () => pageState().hideStatus && isStatusHidable();
  const isWidgetHidden = () => {
    if (hideStatus()) return false;
    return pageState().widget === "hidden";
  };
  const themeClassname = () => (installedTheme() ? ` has-${installedTheme()}-theme` : "");
  const handleClose = () => {
    setPageMode("page");
  };

  const [isFloatingVisible, setIsFloatingVisible] = createSignal(true);
  const [isHovered, setIsHovered] = createSignal(false);
  let timeoutId: number | undefined;

  const resetTimeout = () => {
    setIsFloatingVisible(true);
    clearTimeout(timeoutId);

    if (!isHovered()) {
      timeoutId = setTimeout(() => {
        setIsFloatingVisible(false);
      }, 1500);
    }
  };

  onMount(() => {
    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("touchstart", resetTimeout);
    resetTimeout();
  });

  onCleanup(() => {
    window.removeEventListener("mousemove", resetTimeout);
    window.removeEventListener("touchstart", resetTimeout);
    clearTimeout(timeoutId);
  });

  return (
    <LyricsRendererProvider>
      <div
        class={`lucid-contents${themeClassname()}`}
        classList={{
          "hide-scrollbars": pageState().hideScrollbar,
          "hide-cursor": !isFloatingVisible(),
          "hide-lyrics-status": hideStatus(),
        }}
      >
        <div
          class="widget-area"
          classList={{
            "widget-area--hidden": isWidgetHidden(),
            "hide-lyrics-status": hideStatus(),
          }}
        >
          <PlayerWidget
            topControls={
              <div class="top-controls">
                <CinemaButton glass />
                <FullscreenButton glass />
                <Button variant="glass" size="icon" shape="rounded" onClick={handleClose}>
                  <X />
                </Button>
              </div>
            }
            controls={<Controls />}
            showLikeBtn
          />
        </div>
        <Lyrics
          widgetHidden={isWidgetHidden()}
          showCredits={pageState().showCredits}
          hideStatus={hideStatus()}
        />

        <div
          class={`floating-area on-${pageState().floatingPosition}`}
          classList={{ "floating-area--hidden": !isFloatingVisible() }}
          onMouseEnter={() => {
            setIsHovered(true);
            resetTimeout();
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            resetTimeout();
          }}
        >
          <Show when={pageState().showControls}>
            <Controls />
            <div class="separator" />
          </Show>
          <div class="controls">
            <Show when={!hideStatus()}>
              <Button variant="ghost" size="icon" onClick={toggleFullscreenWidget}>
                <ListMusic size={20} />
              </Button>
            </Show>
            <RomanizeButton />
            <ScrollToActiveLyricsButton />
            <LocalTTMLButton />
            <CinemaButton />
            <FullscreenButton />
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X />
            </Button>
          </div>
        </div>
      </div>
      <Background />
    </LyricsRendererProvider>
  );
}

export default FullscreenPage;
