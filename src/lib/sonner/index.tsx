import "@/lib/sonner/styles.css";
import { toast as sonnerToast, Toaster } from "solid-sonner";
import { logger } from "@/utils/logger";
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
          duration={5000}
          visibleToasts={6}
          richColors={true}
          closeButton={true}
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
