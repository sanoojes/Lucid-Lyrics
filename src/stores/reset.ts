import { clear } from "idb-keyval";
import { imageStore, lyricsStore, moduleStore } from "@/stores/idb";

import { resetBackground } from "@/stores/background";
import { resetWidget } from "@/stores/widget";
import { resetPageState } from "@/stores/page";
import { resetProviders } from "@/stores/lyrics";
import { resetLocale, t } from "@/i18n";
import { toast } from "@/lib/sonner";
import { closeAllModals } from "@/lib/modal";
import API from "@/api";
import { lyricsResourceAction } from "@/api/solid";

export async function resetAllConfig() {
  closeAllModals();

  const loadingToast = toast.loading(t("settings.resetting"), {
    description: t("settings.resettingDesc"),
  });

  try {
    resetBackground();
    resetWidget();
    resetPageState();
    resetProviders();
    resetLocale();

    await Promise.all([
      API.clearAllCache(),
      clear(lyricsStore),
      clear(moduleStore),
      clear(imageStore),
      lyricsResourceAction.refetch(),
    ]);

    toast.dismiss(loadingToast);

    toast.success(t("settings.resetComplete"), {
      description: t("settings.resetCompleteDesc"),
      action: {
        label: t("common.forceReload"),
        onClick: () => location.reload(),
      },
    });
  } catch {
    toast.dismiss(loadingToast);
    toast.error(t("settings.resetFailed"), {
      description: t("settings.resetFailedDesc"),
    });
  }
}
