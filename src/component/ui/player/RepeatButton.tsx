import { Repeat, Repeat1 } from "lucide-solid";
import { Button } from "~/component/ui/Button";
import { useStore } from "@nanostores/solid";
import { $repeat_state } from "~/stores";
import { Match, Switch } from "solid-js";
import { t } from "~/i18n";

const RepeatButton = () => {
  const size = 16;

  const repeatState = useStore($repeat_state);

  const handleClick = () => {
    const nextState = (repeatState() + 1) % 3;
    Spicetify.Player.setRepeat(nextState);
  };

  const label = () => {
    switch (repeatState()) {
      case 1:
        return t("player.repeatOne");
      case 2:
        return t("player.repeatOff");
      default:
        return t("player.repeatAll");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      class="btn--repeat"
      onClick={handleClick}
      aria-label={label()}
      active={repeatState() !== 0}
    >
      <Switch>
        <Match when={repeatState() !== 2}>
          <Repeat size={size} />
        </Match>
        <Match when={repeatState() === 2}>
          <Repeat1 size={size} />
        </Match>
      </Switch>
    </Button>
  );
};

export default RepeatButton;
