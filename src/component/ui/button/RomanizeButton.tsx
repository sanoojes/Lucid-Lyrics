import { Match, Show, Switch } from "solid-js";
import { useStore } from "@nanostores/solid";
import { Button } from "~/component/ui/Button";
import { Languages } from "lucide-solid";
import LetterA from "~/component/icon/LetterA";
import { $romanize, toggleRomanize } from "~/stores";
import { $has_romanized } from "~/stores";
import { t } from "~/i18n";
type RomanizeButtonProps = {
  isSmall?: boolean;
  glass?: boolean;
};
const RomanizeButton = (props: RomanizeButtonProps) => {
  const hasRomanized = useStore($has_romanized);
  const romanize = useStore($romanize);

  const title = () => (romanize() ? t("romanize.disable") : t("romanize.enable"));

  return (
    <Show when={hasRomanized()}>
      <Button
        variant={props.glass ? "glass" : "ghost"}
        size={props.isSmall ? "icon-sm" : "icon"}
        onClick={toggleRomanize}
        class="romanize-btn"
        aria-label={title()}
        title={title()}
      >
        <Switch fallback={<Languages />}>
          <Match when={romanize()}>
            <LetterA />
          </Match>
        </Switch>
      </Button>
    </Show>
  );
};

export default RomanizeButton;
