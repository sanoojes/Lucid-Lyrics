import { useStore } from "@nanostores/solid";
import {
  $pip_state,
  resetPictureInPicture,
  setPIPDepthEffects,
  setPIPHideScrollbar,
  setPIPHideStatus,
  setPIPShowControls,
  setPIPShowCredits,
  togglePIPVolumeControl,
} from "~/stores/picture-in-picture";
import { SettingsSection } from "~/component/settings/Section";
import { SettingsRow } from "~/component/settings/Row";
import { Toggle } from "~/component/ui/Toggle";
import { t } from "~/i18n";

function PictureInPictureSettings() {
  const pipState = useStore($pip_state);

  return (
    <SettingsSection
      title={t("pip.title")}
      onReset={() => {
        resetPictureInPicture();
      }}
      resetLabel={t("pip.title")}
    >
      <SettingsRow label={t("pip.showCredits")} description={t("pip.showCreditsDesc")}>
        <Toggle checked={pipState().showCredits} onChange={setPIPShowCredits} />
      </SettingsRow>
      <SettingsRow label={t("pip.hideScrollbar")} description={t("pip.hideScrollbarDesc")}>
        <Toggle checked={pipState().hideScrollbar} onChange={setPIPHideScrollbar} />
      </SettingsRow>
      <SettingsRow label={t("pip.hideStatus")} description={t("pip.hideStatusDesc")}>
        <Toggle checked={pipState().hideStatus} onChange={setPIPHideStatus} />
      </SettingsRow>
      <SettingsRow label={t("pip.showControls")} description={t("pip.showControlsDesc")}>
        <Toggle checked={pipState().showControls} onChange={setPIPShowControls} />
      </SettingsRow>
      <SettingsRow label={t("pip.volumeControl")} description={t("pip.volumeControlDesc")}>
        <Toggle
          checked={pipState().volumeControl === "show"}
          onChange={() => togglePIPVolumeControl()}
        />
      </SettingsRow>
      <SettingsRow label={t("pip.depthEffects")} description={t("pip.depthEffectsDesc")}>
        <Toggle checked={pipState().depthEffects} onChange={setPIPDepthEffects} />
      </SettingsRow>
    </SettingsSection>
  );
}

export default PictureInPictureSettings;
