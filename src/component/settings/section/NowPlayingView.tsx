import { useStore } from "@nanostores/solid";
import { Toggle } from "@/component/ui/Toggle";
import { SettingsRow } from "@/component/settings/Row";
import { $npv_settings, setHideBackground, setUseStyles } from "@/stores/npv_settings";
import { SettingsSection } from "@/component/settings/Section";
import { t } from "@/i18n";

function NowPlayingViewSettings() {
  const npvSettings = useStore($npv_settings);

  return (
    <SettingsSection title={t("npv.title")}>
      <SettingsRow label={t("npv.hideBackground")} description={t("npv.hideBackgroundDesc")}>
        <Toggle checked={npvSettings().hideBackground} onChange={setHideBackground} />
      </SettingsRow>
      <SettingsRow label={t("npv.useStyles")} description={t("npv.useStylesDesc")}>
        <Toggle checked={npvSettings().useStyles} onChange={setUseStyles} />
      </SettingsRow>
    </SettingsSection>
  );
}

export default NowPlayingViewSettings;
