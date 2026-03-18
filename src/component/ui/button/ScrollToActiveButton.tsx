import { useRenderer } from "@/context/LyricsRenderer";
import { Button } from "@/component/ui/Button";
import { LocateFixed } from "lucide-solid";
import { Show, type Component } from "solid-js";
import { t } from "@/i18n";

type Props = {
  onlyIcon: boolean;
};

const ScrollToActiveButton: Component<Props> = (props) => {
  const renderer = useRenderer();

  const title = t("player.scrollToActive");

  return (
    <Button
      onClick={() => {
        const jump = renderer.jumpToActive();
        if (jump) jump();
      }}
      class="jump-to-active-btn"
      classList={{
        "hide-btn": renderer.isActiveVisible(),
      }}
      variant="ghost"
      disabled={renderer.isActiveVisible()}
      title={title}
      aria-label={title}
    >
      <LocateFixed aria-hidden="true" />
      <Show when={!props.onlyIcon}>{t("player.scrollIntoView")}</Show>
    </Button>
  );
};

export default ScrollToActiveButton;
