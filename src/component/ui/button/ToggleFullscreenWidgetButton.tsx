import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { PanelBottomClose, PanelBottomOpen } from "lucide-solid";
import { Button } from "~/component/ui/Button";
import { t } from "~/i18n";
import { $fullscreen_state, toggleFullscreenWidget } from "~/stores/page";

type ToggleWidgetButtonProps = {
  isSmall?: boolean;
};

const ToggleFullscreenWidgetButton = (props: ToggleWidgetButtonProps) => {
  const pageState = useStore($fullscreen_state);

  const isHidden = () => pageState().widget === "hidden";

  return (
    <Button
      variant="ghost"
      size={props.isSmall ? "icon-sm" : "icon"}
      onClick={toggleFullscreenWidget}
      title={isHidden() ? t("fullscreenPage.showWidget") : t("fullscreenPage.hideWidget")}
    >
      <Show when={isHidden()} fallback={<PanelBottomOpen size={20} />}>
        <PanelBottomClose size={20} />
      </Show>
    </Button>
  );
};

export default ToggleFullscreenWidgetButton;
