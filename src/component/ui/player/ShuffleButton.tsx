import { Shuffle } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { useStore } from "@nanostores/solid";
import { $shuffle_state } from "@/stores";
import { Match, Switch } from "solid-js";
import { toggleShuffle } from "@/lib/spotify/player";
import SmartShuffle from "@/component/icon/SmartShuffle";
import { t } from "@/i18n";

const ShuffleButton = () => {
  const size = 16;

  const shuffleState = useStore($shuffle_state);

  const handleClick = () => {
    const nextState =
      shuffleState() === "none" ? "normal" : shuffleState() === "normal" ? "smart" : "none";
    toggleShuffle(nextState);
  };
  const label = () =>
    shuffleState() === "none"
      ? t("player.shuffleOff")
      : shuffleState() === "normal"
        ? t("player.shuffleOn")
        : t("player.smartShuffle");

  return (
    <Button
      variant="ghost"
      size="icon"
      class="btn--shuffle"
      onClick={handleClick}
      aria-label={label()}
      active={shuffleState() !== "none"}
    >
      <Switch fallback={<Shuffle size={size} />}>
        <Match when={shuffleState() === "normal"}>
          <Shuffle size={size} />
        </Match>
        <Match when={shuffleState() === "smart"}>
          <SmartShuffle size={size} />
        </Match>
      </Switch>
    </Button>
  );
};

export default ShuffleButton;
