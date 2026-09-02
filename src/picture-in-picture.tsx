import "~/styles/pip.scss";
import { render, delegateEvents } from "solid-js/web";
import PictureInPicture from "~/component/pip/PictureInPicture";
import { $pip_window_state } from "~/stores";
import { logger } from "~/utils/logger";
import { toast } from "~/lib/sonner";
import { GITHUB_ISSUES_LINK } from "~/constants";
import { waitForElement } from "~/lib/dom/wait";

const SOLID_EVENTS = [
  "beforeinput",
  "click",
  "dblclick",
  "contextmenu",
  "focusin",
  "focusout",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pointerdown",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "submit",
  "touchend",
  "touchmove",
  "touchstart",
];

export function setupPictureInPicture() {
  let dispose: (() => void) | null = null;

  $pip_window_state.listen(async ({ isOpen, window: pipWin }) => {
    if (!isOpen || !pipWin) {
      if (dispose) {
        dispose();
        dispose = null;
      }

      return;
    }

    try {
      const pipDocument = pipWin.document;
      delegateEvents(SOLID_EVENTS, pipDocument);

      const body = pipDocument.body;
      body.classList.add("pip-body");
      body.style.cssText = `margin: 0px; padding: 0px; overflow: hidden; height: 100%;`;

      const link = (href: string) => `<link rel="stylesheet" href="${href}">`;
      body.innerHTML = `${link("/vendor~pip-mini-player-snapshot.css")}${link("/pip-mini-player-snapshot.css")}<div id="lucid-pip-main"></div>`;

      const targetStyleEl = await waitForElement("#lucid-lyrics-styles");

      if (targetStyleEl) {
        const clonedStyle = targetStyleEl.cloneNode(true);
        pipDocument.head.appendChild(clonedStyle);
      }

      const rootElement = pipDocument.getElementById("lucid-pip-main")!;
      dispose = render(() => <PictureInPicture />, rootElement);
    } catch (error) {
      toast.error("Picture-in-Picture mode failed to load", {
        action: {
          label: "Report Issue",
          onClick: () => window.open(GITHUB_ISSUES_LINK, "_blank"),
        },
        description:
          "We encountered an error rendering the Picture-in-Picture interface. Please report this to help us fix it.",
        duration: Number.POSITIVE_INFINITY,
      });
      logger.error("pip_render_fatal", error);

      pipWin.close();
      $pip_window_state.set({ isOpen: false, window: null });
    }
  });
}
