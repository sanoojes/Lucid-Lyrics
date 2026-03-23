import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { Button } from "@/component/ui/Button";
import { Maximize } from "lucide-solid";
import { $page_mode, setPageMode } from "@/stores/page";
import { t } from "@/i18n";

type FullscreenButtonProps = {
  glass?: boolean;
};

const FullscreenButton = (props: FullscreenButtonProps) => {
  const pageMode = useStore($page_mode);
  return (
    <Show when={pageMode() !== "fullscreen"}>
      <Button
        variant={props.glass ? "glass" : "ghost"}
        size="icon"
        shape="rounded"
        title={t("fullscreen.enter")}
        onClick={() => setPageMode("fullscreen")}
        class="l-btn"
      >
        <Maximize size={20} />
      </Button>
    </Show>
  );
};

export default FullscreenButton;
