import { $is_active_visible, $jump_to_active } from "@/stores";
import { Button } from "@/component/ui/Button";
import { useStore } from "@nanostores/solid";
import { AudioLines } from "lucide-solid";
import { t } from "@/i18n";
import { createMemo, createSignal, onCleanup } from "solid-js";
import debounce from "@/utils/debounce";

const ScrollToActiveLyricsButton = () => {
  const isActiveVisible = useStore($is_active_visible);
  const [debouncedVisible, setDebouncedVisible] = createSignal(true);

  const updateVisibility = debounce((visible: boolean) => {
    setDebouncedVisible(visible);
  }, 150);

  createMemo(() => {
    updateVisibility(isActiveVisible());
  });

  onCleanup(() => {
    updateVisibility.clear();
  });

  const handleClick = () => {
    const jumpFn = $jump_to_active.get();
    jumpFn?.();
  };

  return (
    <Button
      aria-label={t("player.scrollToActive")}
      title={t("player.scrollToActive")}
      onClick={handleClick}
      class="jump-to-active-btn"
      size="icon"
      variant="ghost"
      disabled={debouncedVisible()}
      classList={{ "hide-btn": debouncedVisible() }}
    >
      <AudioLines />
    </Button>
  );
};

export default ScrollToActiveLyricsButton;
