import { SettingsRow } from "~/component/settings/Row";
import { SettingsSection } from "~/component/settings/Section";
import { t } from "~/i18n";
import { Button } from "~/component/ui/Button";
import { Download, Upload, Copy } from "lucide-solid";
import { logger } from "~/utils/logger";
import { toast } from "~/lib/sonner";
import { showAlert } from "~/lib/modal";
import { exportConfig, getConfigFileString } from "~/lib/config";
import { showConfigImportModal } from "~/component/settings/ConfigImportModal";

function BackupSettings() {
  const handleExport = () => {
    try {
      const filename = exportConfig();
      toast.success(t("backup.exportSuccess"), {
        description: t("backup.exportPath", { filename }),
      });
    } catch (error) {
      logger.error("Failed to export config: ", error);
      toast.error(t("backup.importFailed"));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getConfigFileString());
      toast.success(t("backup.copySuccess"));
    } catch (error) {
      logger.error("Failed to copy config: ", error);
      toast.error(t("backup.copyFailed"));
    }
  };

  const handleExportConfirm = () => {
    showAlert({
      confirmLabel: t("common.confirm"),
      description: t("backup.exportConfigDesc"),
      onConfirm: () => handleExport(),
      title: t("backup.exportConfig"),
    });
  };

  return (
    <SettingsSection title={t("backup.title")}>
      <SettingsRow label={t("backup.exportConfig")} description={t("backup.exportConfigDesc")}>
        <div class="adv-settings__cache-row">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy size={16} />
            {t("backup.copyConfig")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportConfirm}>
            <Download size={16} />
            {t("backup.exportConfig")}
          </Button>
        </div>
      </SettingsRow>
      <SettingsRow label={t("backup.importConfig")} description={t("backup.importConfigDesc")}>
        <div class="adv-settings__cache-row">
          <Button variant="outline" size="sm" onClick={showConfigImportModal}>
            <Upload size={16} />
            {t("backup.importConfig")}
          </Button>
        </div>
      </SettingsRow>
    </SettingsSection>
  );
}

export default BackupSettings;
