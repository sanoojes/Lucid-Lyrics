import "~/styles/component/lyrics-status.scss";
import { CircleAlert, RefreshCw, SearchX, WifiOff } from "lucide-solid";
import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import { Button } from "~/component/ui/Button";
import { t } from "~/i18n";

interface StatusProps {
  type: "offline" | "error" | "missing" | "local_song";
  message: string;
  desc?: string;
  onRetry?: () => void;
}

const ICONS = {
  error: CircleAlert,
  local_song: SearchX,
  missing: SearchX,
  offline: WifiOff,
};

function LyricsStatus(props: StatusProps) {
  return (
    <div class={`lyrics-status-container is-${props.type}`}>
      <div>
        <div aria-hidden="true">
          <Dynamic component={ICONS[props.type]} size={48} strokeWidth={1.5} class="status-icon" />
        </div>
        <p class="status-message">{props.message}</p>
        <Show when={props.desc}>
          <p class="status-desc">{props.desc}</p>
        </Show>
      </div>

      <Show when={props.onRetry}>
        <Button variant="glass" onClick={() => props.onRetry?.()}>
          <RefreshCw size={16} />
          <span>{t("common.tryAgain")}</span>
        </Button>
      </Show>
    </div>
  );
}
export default LyricsStatus;
