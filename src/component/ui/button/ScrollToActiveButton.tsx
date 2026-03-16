import { $is_active_visible, $jump_to_active } from "@/stores";
import { Button } from "@/component/ui/Button";
import { useStore } from "@nanostores/solid";
import { LocateFixed } from "lucide-solid";
import { Show, type Component } from "solid-js";
import { t } from "@/i18n";

type Props = {
  onlyIcon: boolean;
};

const ScrollToActiveButton: Component<Props> = (props) => {
  const isActiveVisible = useStore($is_active_visible);

  const title = t("player.scrollToActive");

  return (
    <Button
      onClick={() => {
        const jump = $jump_to_active.get();
        if (jump) jump();
      }}
      class="jump-to-active-btn"
      classList={{
        "hide-btn": isActiveVisible(),
      }}
      variant="ghost"
      disabled={isActiveVisible()}
      title={title}
      aria-label={title}
    >
      <LocateFixed aria-hidden="true" />
      <Show when={!props.onlyIcon}>{t("player.scrollIntoView")}</Show>
    </Button>
  );
};

export default ScrollToActiveButton;
