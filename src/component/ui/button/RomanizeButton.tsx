import { Show, Switch, Match } from "solid-js";
import { useStore } from "@nanostores/solid";
import { Button } from "@/component/ui/Button";
import { Languages } from "lucide-solid";
import LetterA from "@/component/icon/LetterA";
import { toggleRomanize, $romanize } from "@/stores";
import { $has_romanized } from "@/stores";
import { t } from "@/i18n";

const RomanizeButton = () => {
  const hasRomanized = useStore($has_romanized);
  const romanize = useStore($romanize);

  const title = () => (romanize() ? t("romanize.disable") : t("romanize.enable"));

  return (
    <Show when={hasRomanized()}>
      <Button
        variant="ghost"
        size="icon"
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
