import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { PanelBottomClose, PanelBottomOpen } from "lucide-solid";
import { Button } from "~/component/ui/Button";
import { t } from "~/i18n";
import { $page_state, toggleWidget } from "~/stores/page";

type ToggleWidgetButtonProps = {
  isSmall?: boolean;
};

const ToggleWidgetButton = (props: ToggleWidgetButtonProps) => {
  const pageState = useStore($page_state);

  const isHidden = () => pageState().widget === "hidden";

  return (
    <Button
      variant="ghost"
      size={props.isSmall ? "icon-sm" : "icon"}
      onClick={toggleWidget}
      title={isHidden() ? t("lyricsPage.showWidget") : t("lyricsPage.hideWidget")}
    >
      <Show when={isHidden()} fallback={<PanelBottomOpen size={20} />}>
        <PanelBottomClose size={20} />
      </Show>
    </Button>
  );
};

export default ToggleWidgetButton;
