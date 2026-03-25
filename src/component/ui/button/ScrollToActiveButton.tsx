import { useRenderer } from "@/context/LyricsRenderer";
import { Button } from "@/component/ui/Button";
import { LocateFixed } from "lucide-solid";
import { type Component, Show } from "solid-js";
import { t } from "@/i18n";

type Props = {
  onlyIcon: boolean;
};

const ScrollToActiveButton: Component<Props> = (props) => {
  const { isActiveVisible, jumpToActive } = useRenderer();

  const title = t("player.scrollToActive");

  return (
    <Show when={isActiveVisible()}>
      <Button
        onClick={() => {
          const jump = jumpToActive();
          if (jump) jump();
        }}
        class="jump-to-active-btn"
        variant="ghost"
        disabled={isActiveVisible()}
        title={title}
        aria-label={title}
      >
        <LocateFixed aria-hidden="true" />
        <Show when={!props.onlyIcon}>{t("player.scrollIntoView")}</Show>
      </Button>
    </Show>
  );
};

export default ScrollToActiveButton;
