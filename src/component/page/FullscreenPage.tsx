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

import { $fullscreen_state, setPageMode, toggleFullscreenWidget } from "@/stores";
import ScrollToActiveLyricsButton from "@/component/ui/button/ScrollToActiveLyricsButton";
import { $installed_theme } from "@/stores/theme";
import { LyricsRendererProvider } from "@/context/LyricsRenderer";

function FullscreenPage() {
  const pageState = useStore($fullscreen_state);
  const installedTheme = useStore($installed_theme);
  const isHidden = () => pageState().widget === "hidden";
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
        }}
      >
        <div class="widget-area" classList={{ "widget-area--hidden": isHidden() }}>
          <PlayerWidget
            topControls={
              <>
                {/* <CinemaButton />
                <FullscreenButton /> */}
                <Button variant="glass" size="icon" shape="rounded" onClick={handleClose}>
                  <X />
                </Button>
              </>
            }
            controls={<Controls />}
            showLikeBtn
          />
        </div>
        <Lyrics widgetHidden={isHidden()} showCredits={pageState().showCredits} />

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
            <Button variant="ghost" size="icon" onClick={toggleFullscreenWidget}>
              <ListMusic size={20} />
            </Button>
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
