import { Pause, Play } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { play, pause } from "@/lib/spotify/player";
import { useStore } from "@nanostores/solid";
import { $playing } from "@/stores";
import { Match, Switch } from "solid-js";
import { t } from "@/i18n";

const ControlButton = () => {
  const isPlaying = useStore($playing);

  const togglePlayback = () => (isPlaying() ? pause() : play());

  return (
    <Button
      variant="glass"
      size="icon"
      class="l-btn"
      onClick={togglePlayback}
      aria-label={isPlaying() ? t("player.pause") : t("player.play")}
    >
      <Switch fallback={<Play size={24} fill="currentColor" />}>
        <Match when={isPlaying()}>
          <Pause size={24} fill="currentColor" />
        </Match>
      </Switch>
    </Button>
  );
};

export default ControlButton;
