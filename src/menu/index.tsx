import { setupMenu } from "~/lib/spotify";
import { CogwheelHTML } from "~/component/icon/Cogwheel";
import { SettingsModal } from "~/component/settings/SettingsModal";
import { toast } from "~/lib/sonner";
import { logger } from "~/utils/logger";
import { t } from "~/i18n";

export async function setupSettingsMenu() {
  try {
    return setupMenu(t("menu.appName"), CogwheelHTML, () => <SettingsModal />);
  } catch (err) {
    logger.error("register_failed", err);
    toast.error(t("menu.settingsMenuError"));
    return () => {};
  }
}
