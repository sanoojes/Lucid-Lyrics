import "@/styles/fullscreen.scss";
import { logger } from "@/utils/logger";
import { useStore } from "@nanostores/solid";
import { $page_mode, setPageMode } from "@/stores/page";
import { createEffect, on, onMount, onCleanup, Show } from "solid-js";
import FullscreenPage from "@/component/page/FullscreenPage";

function Fullscreen() {
  const pageMode = useStore($page_mode);

  createEffect(
    on(
      () => pageMode(),
      (mode) => {
        if (mode === "fullscreen") {
          if (document.documentElement) {
            document.documentElement.requestFullscreen().catch((err) => {
              logger.error("Fullscreen request denied:", err);
              setPageMode("cinema");
            });
          }
        } else if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      },
    ),
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const key = e.key.toLowerCase();

    if (pageMode() === "cinema") {
      if (e.key === "Escape") {
        e.preventDefault();
        setPageMode("page");
      } else if (key === "f") {
        e.preventDefault();
        if (document.documentElement && !document.fullscreenElement) {
          document.documentElement
            .requestFullscreen()
            .then(() => {
              setPageMode("fullscreen");
            })
            .catch((err) => console.warn(err));
        } else {
          setPageMode("fullscreen");
        }
      }
    } else if (pageMode() === "fullscreen") {
      if (key === "f") {
        e.preventDefault();
        if (document.fullscreenElement) {
          document
            .exitFullscreen()
            .then(() => {
              setPageMode("cinema");
            })
            .catch(() => {});
        } else {
          setPageMode("cinema");
        }
      }
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div class="LucidFullscreenPortal">
      <Show when={pageMode() !== "page"}>
        <div class="fullscreen-content">
          <FullscreenPage />
        </div>
      </Show>
    </div>
  );
}

export default Fullscreen;
