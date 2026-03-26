import "@/styles/component/lyrics-status.scss";
import { Show } from "solid-js";
import { WifiOff, RefreshCw, SearchX, CircleAlert } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { t } from "@/i18n";

interface StatusProps {
  type: "offline" | "error" | "missing" | "local_song";
  message: string;
  desc?: string;
  onRetry?: () => void;
}

const ICONS = {
  offline: WifiOff,
  error: CircleAlert,
  missing: SearchX,
  local_song: SearchX,
};

function LyricsStatus(props: StatusProps) {
  const Icon = ICONS[props.type];

  return (
    <div class={`lyrics-status-container is-${props.type}`}>
      <div>
        <div aria-hidden="true">
          <Icon size={48} strokeWidth={1.5} class="status-icon" />
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
