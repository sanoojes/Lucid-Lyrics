import { Match, Switch } from "solid-js";
import { useStore } from "@nanostores/solid";
import { Button } from "~/component/ui/Button";
import { PictureInPicture, PictureInPicture2 } from "lucide-solid";
import { $pip_window_state, togglePIP } from "~/stores";
import { t } from "~/i18n";

type PictureInPictureToggleButtonProps = {
  isSmall?: boolean;
  glass?: boolean;
};

const PIPToggleButton = (props: PictureInPictureToggleButtonProps) => {
  const pipState = useStore($pip_window_state);

  const title = () => (pipState().isOpen ? t("pip.disable") : t("pip.enable"));

  return (
    <Button
      variant={props.glass ? "glass" : "ghost"}
      size={props.isSmall ? "icon-sm" : "icon"}
      onClick={togglePIP}
      class="pip-btn"
      aria-label={title()}
      title={title()}
    >
      <Switch fallback={<PictureInPicture />}>
        <Match when={pipState().isOpen}>
          <PictureInPicture2 />
        </Match>
      </Switch>
    </Button>
  );
};

export default PIPToggleButton;
