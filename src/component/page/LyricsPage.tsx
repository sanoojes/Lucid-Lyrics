import "@/styles/page.scss";
import "@/styles/lenis.css";
import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { ListMusic } from "lucide-solid";

import { Background } from "@/component/ui/Background";
import PlayerWidget from "@/component/ui/PlayingWidget";
import { Button } from "@/component/ui/Button";
import Controls from "@/component/ui/player/Controls";
import Lyrics from "@/component/lyrics/Lyrics";
import RomanizeButton from "@/component/ui/button/RomanizeButton";

import { $page_state, toggleWidget } from "@/stores";
import ScrollToActiveLyricsButton from "@/component/ui/button/ScrollToActiveLyricsButton";
import LocalTTMLButton from "@/component/ui/button/LocalTTMLButton";
import { $installed_theme } from "@/stores/theme";

const LyricsPage = () => {
  const pageState = useStore($page_state);
  const installedTheme = useStore($installed_theme);
  const isHidden = () => pageState().widget === "hidden";
  const themeClassname = () => (installedTheme() ? ` has-${installedTheme()}-theme` : "");

  return (
    <>
      <div
        class={`lucid-contents${themeClassname()}`}
        classList={{
          "hide-scrollbars": pageState().hideScrollbar,
        }}
      >
        <div class="widget-area" classList={{ "widget-area--hidden": isHidden() }}>
          <PlayerWidget />
        </div>
        <Lyrics widgetHidden={isHidden()} showCredits={pageState().showCredits} />
        <div class={`floating-area on-${pageState().floatingPosition}`}>
          <Show when={pageState().showControls}>
            <Controls />
            <div class="separator" />
          </Show>
          <div class="controls">
            <Button variant="ghost" size="icon" onClick={toggleWidget} class="l-btn">
              <ListMusic size={20} />
            </Button>
            <RomanizeButton />
            <ScrollToActiveLyricsButton />
            <LocalTTMLButton />
          </div>
        </div>
        {/* <div class={`floating-hover-target on-${pageState().floatingPosition}`} /> */}
      </div>
      <Background />
    </>
  );
};

export default LyricsPage;
