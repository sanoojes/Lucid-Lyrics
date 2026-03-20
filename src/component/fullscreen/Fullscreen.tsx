import "@/styles/fullscreen.scss";
import { createEffect, on, onMount, onCleanup, Show } from "solid-js";
import { useStore } from "@nanostores/solid";
import { $page_mode, setPageMode } from "@/stores/page";
import FullscreenPage from "@/component/page/FullscreenPage";

function Fullscreen() {
  const pageMode = useStore($page_mode);
  let portalRef: HTMLDivElement | undefined;

  createEffect(
    on(
      () => pageMode(),
      async (mode) => {
       if (mode === "fullscreen") {
          try {
            if (portalRef && document.fullscreenElement !== portalRef) {
              await portalRef.requestFullscreen();
            }
          } catch (err) {
            console.warn("Fullscreen request denied:", err);
          }
        } 
        else if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }
      },
    ),
  );

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && pageMode() === "fullscreen") {
      setPageMode("page");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const key = e.key.toLowerCase();

    if (pageMode() === "cinema") {
      if (e.key === "Escape") {
        setPageMode("page");
      } else if (key === "f") {
        setPageMode("fullscreen");
      }
    } else if (pageMode() === "fullscreen") {
      if (key === "f") {
        setPageMode("cinema");
      }
    }
  };

  onMount(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div ref={portalRef} class="LucidFullscreenPortal">
      <Show when={pageMode() !== "page"}>
        <div class="fullscreen-content">
          <FullscreenPage />
        </div>
      </Show>
    </div>
  );
}

export default Fullscreen;