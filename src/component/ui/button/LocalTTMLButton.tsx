import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { Button } from "@/component/ui/Button";
import { FileText } from "lucide-solid";
import { showLocalTTMLModal } from "@/component/ttml/LocalTTMLModal";
import { $ttml_maker_mode } from "@/stores/dev";
import { t } from "@/i18n";

const LocalTTMLButton = () => {
  const ttmlMakerMode = useStore($ttml_maker_mode);

  return (
    <Show when={ttmlMakerMode() === "on"}>
      <Button
        variant="ghost"
        size="icon"
        title={t("ttml.upload")}
        onClick={showLocalTTMLModal}
        class="l-btn"
      >
        <FileText size={20} />
      </Button>
    </Show>
  );
};

export default LocalTTMLButton;
