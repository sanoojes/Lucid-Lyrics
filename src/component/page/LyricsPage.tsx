import "@/styles/page.scss";
import "@/styles/lenis.css";
import { useStore } from "@nanostores/solid";
import { onMount } from "solid-js";
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

const LyricsPage = () => {
  const pageState = useStore($page_state);
  const isHidden = () => pageState().widget === "hidden";

  return (
    <>
      <div class="lucid-contents">
        <div class="widget-area" classList={{ "widget-area--hidden": isHidden() }}>
          <PlayerWidget />
        </div>
        <Lyrics widgetHidden={isHidden()} showCredits={pageState().showCredits} />
        <div class="floating-hover-target" />
        <div class="floating-area">
          <Controls />
          <div class="separator" />
          <div class="controls">
            <Button variant="ghost" size="icon" onClick={toggleWidget} class="l-btn">
              <ListMusic size={20} />
            </Button>
            <RomanizeButton />
            <ScrollToActiveLyricsButton />
            <LocalTTMLButton />
          </div>
        </div>
      </div>
      <Background />
    </>
  );
};

export default LyricsPage;
