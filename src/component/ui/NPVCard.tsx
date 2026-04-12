import { $npv_state, $page_mode, $page_state, setShowLyrics, toggleShowLyrics } from "~/stores";
import { useStore } from "@nanostores/solid";
import { ChevronDown, SquareArrowOutUpLeft } from "lucide-solid";
import { Show } from "solid-js";
import { t } from "~/i18n";
import { Button } from "~/component/ui/Button";
import Lyrics from "~/component/lyrics/Lyrics";
import ScrollToActiveLyricsButton from "~/component/ui/button/ScrollToActiveLyricsButton";
import { LyricsRendererProvider } from "~/context/LyricsRenderer";
import RomanizeButton from "~/component/ui/button/RomanizeButton";
import router, { $in_lyrics_page } from "~/router";
import CinemaButton from "~/component/ui/button/CinemaButton";

const NPVCard = () => {
  const npvState = useStore($npv_state);
  const pageState = useStore($page_state);
  const isAtLyricsPage = useStore($in_lyrics_page);
  const pageMode = useStore($page_mode);
  const isOpen = () => npvState().showLyrics;
  const handleGoToPage = async () => {
    await router.navigate("/");
    setShowLyrics(false);
  };

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
            "auto-hide": npvState().autoHideCardHeader && isOpen(),
          }}
        >
          <h2
            class="encore-text-body-medium-bold encore-internal-color-text-base"
            data-encore-id="text"
          >
            <div class="main-nowPlayingView-sectionHeaderText">{t("npv.lyrics")}</div>
          </h2>
          <div class="section-btn-wrapper">
            <CinemaButton />
            <Show when={isOpen()}>
              <ScrollToActiveLyricsButton isSmall />
              <RomanizeButton isSmall />
            </Show>
            <Show when={!isAtLyricsPage()}>
              <Button
                onClick={handleGoToPage}
                title={t("npv.goToLyricsPage")}
                variant="ghost"
                size="icon-sm"
                shape="rounded"
              >
                <SquareArrowOutUpLeft />
              </Button>
            </Show>

            <Button
              onClick={toggleShowLyrics}
              title={isOpen() ? t("npv.closeLyrics") : t("npv.openLyrics")}
              variant="ghost"
              size="icon-sm"
              shape="rounded"
            >
              <ChevronDown classList={{ "rotate-icon": isOpen() }} />
            </Button>
          </div>
        </section>
        <Show when={isOpen() && pageMode() === "page"}>
          <section
            class="npv-lyrics-root"
            style={{
              "--is-npv": 1,
              "--npv-height-percent": npvState().cardHeightPercent / 100,
              "min-height": `${npvState().cardMinHeight ?? 400}px`,
            }}
          >
            <Lyrics widgetHidden showCredits={pageState().showCredits} hideStatus={false} />
          </section>
        </Show>
      </LyricsRendererProvider>
    </div>
  );
};

export default NPVCard;
