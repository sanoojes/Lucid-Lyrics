import "@/styles/component/advanced-settings.scss";
import { useStore } from "@nanostores/solid";
import { Toggle } from "@/component/ui/Toggle";
import { Slider } from "@/component/ui/Slider";
import { SettingsRow } from "@/component/settings/Row";
import {
  $developer_mode,
  $ttml_maker_mode,
  $cache_settings,
  setDevMode,
  setTTMLMakerMode,
  setCacheTTL,
} from "@/stores/dev";
import { $storageStats } from "@/stores/storage";
import { SettingsSection } from "@/component/settings/Section";
import { t } from "@/i18n";
import { Button } from "@/component/ui/Button";
import API from "@/api";
import { lyricsResourceAction } from "@/api/solid";
import { RotateCcw } from "lucide-solid";
import { Show } from "solid-js";
import { logger } from "@/utils/logger";
import { toast } from "@/lib/sonner";

function AdvancedSettings() {
  const devMode = useStore($developer_mode);
  const ttmlMakerMode = useStore($ttml_maker_mode);
  const storageStats = useStore($storageStats);
  const cacheSettings = useStore($cache_settings);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleClearCache = async () => {
    try {
      await API.clearAllCache();
      lyricsResourceAction.refetch();
      toast.success(t("advanced.clearCacheSuccess"));
    } catch (error) {
      toast.error(t("advanced.clearCacheError"));
      logger.error("Failed to clear cache: ", error);
    }
  };

  return (
    <SettingsSection title={t("advanced.title")}>
      <SettingsRow label={t("advanced.devMode")} description={t("advanced.devModeDesc")}>
        <Toggle
          checked={devMode() === "on"}
          onChange={(checked) => setDevMode(checked ? "on" : "off")}
        />
      </SettingsRow>
      <SettingsRow
        label={t("advanced.ttmlMakerMode")}
        description={t("advanced.ttmlMakerModeDesc")}
      >
        <Toggle
          checked={ttmlMakerMode() === "on"}
          onChange={(checked) => setTTMLMakerMode(checked ? "on" : "off")}
        />
      </SettingsRow>
      <SettingsRow label={t("advanced.clearCache")} description={t("advanced.clearCacheDesc")}>
        <div class="adv-settings__cache-row">
          <Button variant="destructive" size="sm" onClick={handleClearCache}>
            <RotateCcw size={16} />
            {t("advanced.clearCacheButton")}
          </Button>
        </div>
      </SettingsRow>
      <SettingsRow label={t("advanced.cacheTTL")} description={t("advanced.cacheTTLDesc")}>
        <Slider
          value={cacheSettings().ttlDays}
          onChange={(days) => setCacheTTL(days)}
          min={1}
          max={365}
          step={1}
          suffix="d"
        />
      </SettingsRow>
      <Show when={devMode() === "on"}>
        <SettingsRow
          label={t("advanced.storageStats")}
          description={t("advanced.storageStatsDesc")}
        >
          <div class="adv-settings__storage-stats">
            <span class="adv-settings__stat">
              <span class="stat-label">{t("advanced.original")}</span>
              <span class="stat-value">{formatBytes(storageStats()?.totalOriginal || 0)}</span>
            </span>
            <span class="adv-settings__stat">
              <span class="stat-label">{t("advanced.compressed")}</span>
              <span class="stat-value">{formatBytes(storageStats()?.totalCompressed || 0)}</span>
            </span>
            <span class="adv-settings__stat">
              <span class="stat-label">{t("advanced.entries")}</span>
              <span class="stat-value">{storageStats()?.entryCount || 0}</span>
            </span>
          </div>
        </SettingsRow>
      </Show>
    </SettingsSection>
  );
}

export default AdvancedSettings;
