import "@/styles/npv.scss";
import { observeElement } from "@/lib/dom/observe";
import { render } from "solid-js/web";
import NowPlayingView from "@/component/ui/NowPlayingView";

const NPV_BG_SELECTORS =
  "#Desktop_PanelContainer_Id,.Root__right-sidebar aside.NowPlayingView,.Root__right-sidebar aside";

export function setupNPV() {
  observeElement(NPV_BG_SELECTORS, (el, onRemove) => {
    const dispose = render(() => <NowPlayingView />, el);
    const cleanup = () => {
      dispose();
    };
    onRemove(cleanup);
  });
}
