import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { Button } from "~/component/ui/Button";
import { TvMinimalPlay } from "lucide-solid";
import { $page_mode, setPageMode } from "~/stores/page";
import { t } from "~/i18n";

type CinemaButtonProps = {
  glass?: boolean;
};

const CinemaButton = (props: CinemaButtonProps) => {
  const pageMode = useStore($page_mode);
  return (
    <Show when={pageMode() !== "cinema"}>
      <Button
        variant={props.glass ? "glass" : "ghost"}
        size="icon"
        shape="rounded"
        title={t("cinema.enter")}
        onClick={() => setPageMode("cinema")}
        class="l-btn"
      >
        <TvMinimalPlay size={20} />
      </Button>
    </Show>
  );
};

export default CinemaButton;
