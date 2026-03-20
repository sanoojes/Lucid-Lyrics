import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { Button } from "@/component/ui/Button";
import { Maximize } from "lucide-solid";
import { $page_mode, setPageMode } from "@/stores/page";

const FullscreenButton = () => {
  const pageMode = useStore($page_mode);
  return (
    <Show when={pageMode() !== "fullscreen"}>
      <Button
        variant="ghost"
        size="icon"
        title="Fullscreen Lyrics"
        onClick={() => setPageMode("fullscreen")}
        class="l-btn"
      >
        <Maximize size={20} />
      </Button>
    </Show>
  );
};

export default FullscreenButton;
