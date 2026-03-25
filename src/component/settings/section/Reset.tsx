import { SettingsRow } from "@/component/settings/Row";
import { SettingsSection } from "@/component/settings/Section";
import { resetAllConfig } from "@/stores/reset";
import { Button } from "@/component/ui/Button";
import { t } from "@/i18n";
import { RotateCcw } from "lucide-solid";
import { showAlert } from "@/lib/modal";

function ResetSettings() {
  const handleReset = () => {
    showAlert({
      title: t("settings.resetConfirm"),
      description: t("settings.resetDescription"),
      onConfirm: () => resetAllConfig(),
      variant: "destructive",
    });
  };

  return (
    <SettingsSection title={t("settings.reset")}>
      <SettingsRow label={t("settings.resetDesc")}>
        <Button variant="destructive" size="sm" onClick={handleReset}>
          <RotateCcw size={16} />
          {t("settings.resetButton")}
        </Button>
      </SettingsRow>
    </SettingsSection>
  );
}

export default ResetSettings;
