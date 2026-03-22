import "@/styles/page.scss";
import "@/styles/lenis.css";
import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { ListMusic } from "lucide-solid";

import { Button } from "@/component/ui/Button";
import { Background } from "@/component/ui/Background";
import Lyrics from "@/component/lyrics/Lyrics";
import Controls from "@/component/ui/player/Controls";
import PlayerWidget from "@/component/ui/PlayingWidget";
import CinemaButton from "@/component/ui/button/CinemaButton";
import RomanizeButton from "@/component/ui/button/RomanizeButton";
import LocalTTMLButton from "@/component/ui/button/LocalTTMLButton";
import FullscreenButton from "@/component/ui/button/FullscreenButton";

import { $lyrics_status, $page_mode, $page_state, toggleWidget } from "@/stores";
import ScrollToActiveLyricsButton from "@/component/ui/button/ScrollToActiveLyricsButton";
import { $installed_theme } from "@/stores/theme";
import { LyricsRendererProvider } from "@/context/LyricsRenderer";

const LyricsPage = () => {
  const pageState = useStore($page_state);
  const pageMode = useStore($page_mode);
  const installedTheme = useStore($installed_theme);
  const lyricsStatus = useStore($lyrics_status);
  const isStatusHidable = () => !["success", "loading"].includes(lyricsStatus() ?? "loading");
  const hideStatus = () => pageState().hideStatus && isStatusHidable();
  const isWidgetHidden = () => {
    if (hideStatus()) return false;
    return pageState().widget === "hidden";
  };
  const themeClassname = () => (installedTheme() ? ` has-${installedTheme()}-theme` : "");

  return (
    <LyricsRendererProvider>
      <div
        class={`lucid-contents${themeClassname()} ${lyricsStatus()}`}
        classList={{
          "hide-scrollbars": pageState().hideScrollbar,
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
          <PlayerWidget controls={<Controls />} showLikeBtn />
        </div>
        <Show when={pageMode() === "page"}>
          <Lyrics
            widgetHidden={isWidgetHidden()}
            showCredits={pageState().showCredits}
            hideStatus={hideStatus()}
          />
        </Show>
        <div class={`floating-area on-${pageState().floatingPosition}`}>
          <Show when={pageState().showControls}>
            <Controls />
            <div class="separator" />
          </Show>
          <div class="controls">
            <Show when={!hideStatus()}>
              <Button variant="ghost" size="icon" onClick={toggleWidget}>
                <ListMusic size={20} />
              </Button>
            </Show>
            <RomanizeButton />
            <ScrollToActiveLyricsButton />
            <LocalTTMLButton />
            <CinemaButton />
            <FullscreenButton />
          </div>
        </div>
      </div>
      <Show when={pageMode() === "page"}>
        <Background />
      </Show>
    </LyricsRendererProvider>
  );
};

export default LyricsPage;
