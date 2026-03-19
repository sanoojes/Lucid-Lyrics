import "@/styles/npv.scss";
import { observeElement } from "@/lib/dom/observe";
import { render } from "solid-js/web";
import { ErrorBoundary } from "solid-js";
import { toast } from "solid-sonner";
import NPVBackground from "@/component/ui/NPVBackground";
import NPVCard from "@/component/ui/NPVCard";
import { createLogger } from "@/utils/logger";
import { t } from "@/i18n";

const log = createLogger("npv");

const NPV_BG_SELECTORS =
  ".Root__right-sidebar .oXO9_yYs6JyOwkBn8E4a, #Desktop_PanelContainer_Id,.Root__right-sidebar aside.NowPlayingView,.Root__right-sidebar aside";
const NPV_CARD_PARENT_SELECTORS =
  '#Desktop_PanelContainer_Id div[data-testid="NPV_Panel_OpenDiv"], .Root__right-sidebar div[data-testid="NPV_Panel_OpenDiv"]';

export function setupNPV() {
  observeElement(NPV_BG_SELECTORS, (el, onRemove) => {
    const dispose = render(
      () => (
        <ErrorBoundary
          fallback={(err) => {
            log.error("NPVBackground:", err);
            toast.error(t("npv.backgroundError"));
            return null;
          }}
        >
          <NPVBackground />
        </ErrorBoundary>
      ),
      el,
    );
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) {
          const { width, height } = entry.contentRect;
          (el as HTMLElement).style.setProperty("--npv-width", `${width ?? window.innerWidth}px`);
          (el as HTMLElement).style.setProperty(
            "--npv-height",
            `${height ?? window.innerHeight}px`,
          );
        }
      }
    });
    observer.observe(el);
    const cleanup = () => {
      dispose();
      observer.disconnect();
    };
    onRemove(cleanup);
  });

  observeElement(NPV_CARD_PARENT_SELECTORS, (el, onRemove) => {
    const dispose = render(
      () => (
        <ErrorBoundary
          fallback={(err) => {
            log.error("NPVCard:", err);
            toast.error(t("npv.cardError"));
            return null;
          }}
        >
          <NPVCard />
        </ErrorBoundary>
      ),
      el,
    );
    const cleanup = () => {
      dispose();
    };
    onRemove(cleanup);
  });
}
