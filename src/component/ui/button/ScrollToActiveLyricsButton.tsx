import { useRenderer } from "@/context/LyricsRenderer";
import { Button } from "@/component/ui/Button";
import { AudioLines } from "lucide-solid";
import { t } from "@/i18n";
import { createMemo, createSignal, onCleanup } from "solid-js";
import debounce from "@/utils/debounce";
type ScrollToActiveLyricsButtonProps = {
  isSmall?: boolean;
};
const ScrollToActiveLyricsButton = (props: ScrollToActiveLyricsButtonProps) => {
  const { isActiveVisible, jumpToActive } = useRenderer();
  const [debouncedVisible, setDebouncedVisible] = createSignal(true);

  const updateVisibility = debounce((visible: boolean) => {
    setDebouncedVisible(visible);
  }, 200);

  createMemo(() => {
    updateVisibility(isActiveVisible());
  });

  onCleanup(() => {
    updateVisibility.clear();
  });

  const handleClick = () => {
    jumpToActive()?.();
  };

  return (
    <Button
      aria-label={t("player.scrollToActive")}
      title={t("player.scrollToActive")}
      onClick={handleClick}
      class="jump-to-active-btn"
      size={props.isSmall ? "icon-sm" : "icon"}
      variant="ghost"
      disabled={debouncedVisible()}
      classList={{ "hide-btn": debouncedVisible() || !jumpToActive() }}
    >
      <AudioLines />
    </Button>
  );
};

export default ScrollToActiveLyricsButton;
