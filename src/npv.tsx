import "@/styles/npv.scss"
import { observeElement } from "@/lib/dom/observe";
import { render } from "solid-js/web";
import { Background } from "@/component/ui/Background";

const NPV_BG_SELECTORS =
  "#Desktop_PanelContainer_Id,.Root__right-sidebar aside.NowPlayingView,.Root__right-sidebar aside";

export function setupNPV() {
  observeElement(NPV_BG_SELECTORS, (el, onRemove) => {
    const dispose = render(() => <Background class="npv-background" />, el);
    const cleanup = () => {
      dispose();
    };
    onRemove(cleanup);
  });
}
