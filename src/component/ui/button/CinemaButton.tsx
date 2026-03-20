import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { Button } from "@/component/ui/Button";
import { TvMinimalPlay } from "lucide-solid";
import { $page_mode, setPageMode } from "@/stores/page";

const CinemaButton = () => {
  const pageMode = useStore($page_mode);
  return (
    <Show when={pageMode() !== "cinema"}>
      <Button
        variant="ghost"
        size="icon"
        title="Cinema Mode"
        onClick={() => setPageMode("cinema")}
        class="l-btn"
      >
        <TvMinimalPlay size={20} />
      </Button>
    </Show>
  );
};

export default CinemaButton;
