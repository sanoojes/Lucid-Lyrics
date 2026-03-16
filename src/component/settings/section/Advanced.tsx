import { useStore } from "@nanostores/solid";
import { Toggle } from "@/component/ui/Toggle";
import { SettingsRow } from "@/component/settings/Row";
import { $developer_mode, $ttml_maker_mode, setDevMode, setTTMLMakerMode } from "@/stores/dev";
import { SettingsSection } from "@/component/settings/Section";
import { t } from "@/i18n";

function AdvancedSettings() {
  const devMode = useStore($developer_mode);
  const ttmlMakerMode = useStore($ttml_maker_mode);

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
    </SettingsSection>
  );
}

export default AdvancedSettings;
