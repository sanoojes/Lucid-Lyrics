import { clear } from "idb-keyval";
import { imageStore, lyricsStore, moduleStore, ttmlStore } from "@/stores/idb";
import {
  resetBackground,
  resetWidget,
  resetPageState,
  resetProviders,
  resetNPBState,
  resetNpvSettings,
} from "@/stores";
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
    resetNPBState();
    resetNpvSettings();
    resetPageState();
    resetProviders();
    resetLocale();

    await Promise.all([
      API.clearAllCache(),
      clear(lyricsStore),
      clear(moduleStore),
      clear(imageStore),
      clear(ttmlStore),
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
