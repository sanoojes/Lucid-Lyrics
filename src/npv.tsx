import "~/styles/npv.scss";

import { render } from "solid-js/web";
import { ErrorBoundary } from "solid-js";
import { toast } from "~/lib/sonner";

import { observeElement } from "~/lib/dom/observe";
import NPVBackground from "~/component/ui/NPVBackground";
import NPVCard from "~/component/ui/NPVCard";
import { createLogger } from "~/utils/logger";
import { t } from "~/i18n";
import { $npv_state, setShowLyrics } from "~/stores";

const log = createLogger("npv");

const SELECTORS = {
  BG_CONTAINER:
    ".Root__right-sidebar .oXO9_yYs6JyOwkBn8E4a, #Desktop_PanelContainer_Id, .Root__right-sidebar aside.NowPlayingView, .Root__right-sidebar aside",
  CARD_PARENT:
    '#Desktop_PanelContainer_Id div[data-testid="NPV_Panel_OpenDiv"], .Root__right-sidebar div[data-testid="NPV_Panel_OpenDiv"]',
  INERT_SENSORS: ".pP41asBpzic1bRlrsDcs[inert], .OwsIyGIUSADBO6hvtdEE.bVJH37qfz55VdpglJjHJ",
  SIDEBAR: ".Root__right-sidebar",
};

export function setupNPV() {
  observeElement(SELECTORS.SIDEBAR, (sidebarEl, onSidebarRemove) => {
    const lyricsTracker = handleLyricsAutoToggle(sidebarEl as HTMLElement);
    onSidebarRemove(() => lyricsTracker.disconnect());
  });

  observeElement(SELECTORS.BG_CONTAINER, (el, onRemove) => {
    const observer = createDimensionObserver(el as HTMLElement);
    const dispose = render(
      () => (
        <ErrorBoundary
          fallback={(err) => (log.error("bg:", err), toast.error(t("npv.backgroundError")), null)}
        >
          <NPVBackground />
        </ErrorBoundary>
      ),
      el,
    );

    onRemove(() => {
      dispose();
      observer.disconnect();
    });
  });

  observeElement(SELECTORS.CARD_PARENT, (el, onRemove) => {
    const dispose = render(
      () => (
        <ErrorBoundary
          fallback={(err) => (log.error("card:", err), toast.error(t("npv.cardError")), null)}
        >
          <NPVCard />
        </ErrorBoundary>
      ),
      el,
    );

    onRemove(dispose);
  });
}

let savedLyricsState = false;
function handleLyricsAutoToggle(sidebarEl: HTMLElement) {
  return observeElement(
    SELECTORS.INERT_SENSORS,
    (_, onInertRemove) => {
      const { showLyrics } = $npv_state.get();

      if (showLyrics) {
        savedLyricsState = true;
        setShowLyrics(false);
      }

      onInertRemove(() => {
        if (savedLyricsState) {
          setShowLyrics(true);
          savedLyricsState = false;
        }
      });
    },
    { root: sidebarEl },
  );
}

function createDimensionObserver(el: HTMLElement) {
  const ro = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    el.style.setProperty("--npv-width", `${width || window.innerWidth}px`);
    el.style.setProperty("--npv-height", `${height || window.innerHeight}px`);
  });

  ro.observe(el);
  return ro;
}
