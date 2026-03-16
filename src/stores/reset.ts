import { clear } from "idb-keyval";
import { imageStore, lyricsStore, moduleStore } from "@/stores/idb";

import { resetBackground } from "@/stores/background";
import { resetWidget } from "@/stores/widget";
import { resetPageState } from "@/stores/page";
import { resetProviders } from "@/stores/lyrics";
import { resetLocale, t } from "@/i18n";
import { toast } from "@/lib/sonner";
import { closeAllModals } from "@/lib/modal";

export async function resetAllConfig() {
  resetBackground();
  resetWidget();
  resetPageState();
  resetProviders();
  resetLocale();

  await clear(lyricsStore);
  await clear(moduleStore);
  await clear(imageStore);

  closeAllModals();

  toast.success(t("settings.resetComplete"), {
    description: t("settings.resetCompleteDesc"),
    action: {
      label: t("common.forceReload"),
      onClick: () => location.reload(),
    },
  });
}
