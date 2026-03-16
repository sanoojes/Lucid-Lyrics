import { $is_active_visible, $jump_to_active } from "@/stores";
import { Button } from "@/component/ui/Button";
import { useStore } from "@nanostores/solid";
import { AudioLines } from "lucide-solid";
import { t } from "@/i18n";

const ScrollToActiveLyricsButton = () => {
  const isActiveVisible = useStore($is_active_visible);
  const title = t("player.scrollToActive");

  return (
    <Button
      aria-label={title}
      title={title}
      onClick={() => {
        $jump_to_active?.get()?.();
      }}
      class="jump-to-active-btn"
      size="icon"
      classList={{
        "hide-btn": isActiveVisible(),
      }}
      variant="ghost"
      disabled={isActiveVisible()}
    >
      <AudioLines />
    </Button>
  );
};

export default ScrollToActiveLyricsButton;
