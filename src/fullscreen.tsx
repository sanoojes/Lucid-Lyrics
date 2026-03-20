import { render } from "solid-js/web";
import Fullscreen from "@/component/fullscreen/Fullscreen";
import { logger } from "@/utils/logger";
import { toast } from "@/lib/sonner";
import { GITHUB_ISSUES_LINK } from "@/constants";

export function setupFullscreen() {
  try {
    render(() => <Fullscreen />, document.body);
  } catch (error) {
    toast.error("Cinema mode failed to load", {
      description:
        "We encountered an error rendering the fullscreen interface. Please report this to help us fix it.",
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: "Report Issue",
        onClick: () => window.open(GITHUB_ISSUES_LINK, "_blank"),
      },
    });
    logger.error("fullscreen_render_fatal", error);
  }
}
