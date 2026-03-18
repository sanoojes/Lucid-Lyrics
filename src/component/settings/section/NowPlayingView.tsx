import { useStore } from "@nanostores/solid";
import { Toggle } from "@/component/ui/Toggle";
import { Slider } from "@/component/ui/Slider";
import { SettingsRow } from "@/component/settings/Row";
import {
  $npv_state,
  setHideBackground,
  setUseStyles,
  setAutoHideCardHeader,
  setCardHeightPercent,
  setCardMinHeight,
} from "@/stores/npv";
import { SettingsSection } from "@/component/settings/Section";
import { t } from "@/i18n";

function NowPlayingViewSettings() {
  const npvSettings = useStore($npv_state);

  return (
    <SettingsSection title={t("npv.title")}>
      <SettingsRow label={t("npv.hideBackground")} description={t("npv.hideBackgroundDesc")}>
        <Toggle checked={npvSettings().hideBackground} onChange={setHideBackground} />
      </SettingsRow>
      <SettingsRow label={t("npv.useStyles")} description={t("npv.useStylesDesc")}>
        <Toggle checked={npvSettings().useStyles} onChange={setUseStyles} />
      </SettingsRow>
      <SettingsRow
        label={t("npv.autoHideCardHeader")}
        description={t("npv.autoHideCardHeaderDesc")}
      >
        <Toggle checked={npvSettings().autoHideCardHeader} onChange={setAutoHideCardHeader} />
      </SettingsRow>
      <SettingsRow label={t("npv.cardHeightPercent")} description={t("npv.cardHeightPercentDesc")}>
        <Slider
          value={npvSettings().cardHeightPercent}
          onChange={setCardHeightPercent}
          min={25}
          max={150}
          step={1}
          suffix="%"
        />
      </SettingsRow>
      <SettingsRow
        label={"Set Card Minimum Height"}
        description={"Minimum height needed for the card"}
      >
        <Slider
          value={npvSettings().cardMinHeight}
          onChange={setCardMinHeight}
          min={200}
          max={2000}
          step={5}
          suffix="px"
        />
      </SettingsRow>
    </SettingsSection>
  );
}

export default NowPlayingViewSettings;
