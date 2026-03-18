import { $npv_state, $page_state, toggleShowLyrics } from "@/stores";
import { useStore } from "@nanostores/solid";
import { ChevronDown } from "lucide-solid";
import { Show } from "solid-js";
import { Button } from "@/component/ui/Button";
import Lyrics from "@/component/lyrics/Lyrics";
import ScrollToActiveLyricsButton from "@/component/ui/button/ScrollToActiveLyricsButton";
import { LyricsRendererProvider } from "@/context/LyricsRenderer";
import RomanizeButton from "./button/RomanizeButton";

const NPVCard = () => {
  const npvState = useStore($npv_state);
  const pageState = useStore($page_state);
  const isOpen = () => npvState().showLyrics;

  return (
    <div
      class="main-nowPlayingView-section lyrics-npv-card"
      classList={{
        "is-open": isOpen(),
      }}
    >
      <LyricsRendererProvider>
        <section
          class="main-nowPlayingView-sectionHeader npv-card-header"
          classList={{
            "auto-hide": npvState().autoHideCardHeader,
          }}
        >
          <h2
            class="e-9890-text encore-text-body-medium-bold encore-internal-color-text-base"
            data-encore-id="text"
          >
            <div class="main-nowPlayingView-sectionHeaderText">Lyrics</div>
          </h2>
          <div class="section-btn-wrapper">
            <Show when={isOpen()}>
              <ScrollToActiveLyricsButton isSmall />
              <RomanizeButton isSmall />
            </Show>
            <Button
              onClick={toggleShowLyrics}
              title={isOpen() ? "Close Lyrics" : "Open Lyrics"}
              variant="ghost"
              size="icon-sm"
            >
              <ChevronDown classList={{ "rotate-icon": isOpen() }} />
            </Button>
          </div>
        </section>
        <Show when={isOpen()}>
          <section
            class="npv-lyrics-root"
            style={{
              "--is-npv": 1,
              "--npv-height-percent": npvState().cardHeightPercent / 100,
              "min-height": `${npvState().cardMinHeight ?? 400}px`,
            }}
          >
            <Lyrics widgetHidden showCredits={pageState().showCredits} />
          </section>
        </Show>
      </LyricsRendererProvider>
    </div>
  );
};

export default NPVCard;
