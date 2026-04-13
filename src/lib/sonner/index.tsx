import "~/lib/sonner/styles.css";
import { Toaster, toast as sonnerToast } from "~/lib/sonner/solid-sonner";
import { logger } from "~/utils/logger";
import { render } from "solid-js/web";
export async function setupSonner() {
  try {
    const root = document.createElement("div");
    root.id = "sonner-root";
    document.body.appendChild(root);

    const unmount = render(
      () => (
        <Toaster
          theme="dark"
          duration={50000}
          visibleToasts={6}
          richColors={true}
          closeButton={true}
          position="bottom-center"
          offset={(document.querySelector(".Root__now-playing-bar")?.clientHeight || 88) + 8}
        />
      ),
      root,
    );
    return unmount;
  } catch (err) {
    logger.error(err);
    return () => {};
  }
}

export const toast = sonnerToast;
