import { useStore } from "@nanostores/solid";
import {
  $fullscreen_state,
  setFullscreenHideScrollbar,
  setFullscreenShowCredits,
  setFullscreenShowControls,
  setFullscreenFloatingPosition,
  type Positions,
} from "@/stores/page";
import { SettingsSection } from "@/component/settings/Section";
import { SettingsRow } from "@/component/settings/Row";
import { Toggle } from "@/component/ui/Toggle";
import { Select } from "@/component/ui/Select";
import { t } from "@/i18n";

function FullscreenSettings() {
  const fullscreenState = useStore($fullscreen_state);

  return (
    <SettingsSection title={t("fullscreen.title")}>
      <SettingsRow
        label={t("fullscreen.showCredits")}
        description={t("fullscreen.showCreditsDesc")}
      >
        <Toggle checked={fullscreenState().showCredits} onChange={setFullscreenShowCredits} />
      </SettingsRow>
      <SettingsRow
        label={t("fullscreen.hideScrollbar")}
        description={t("fullscreen.hideScrollbarDesc")}
      >
        <Toggle checked={fullscreenState().hideScrollbar} onChange={setFullscreenHideScrollbar} />
      </SettingsRow>
      <SettingsRow
        label={t("fullscreen.showControls")}
        description={t("fullscreen.showControlsDesc")}
      >
        <Toggle checked={fullscreenState().showControls} onChange={setFullscreenShowControls} />
      </SettingsRow>
      <SettingsRow
        label={t("fullscreen.floatingPosition")}
        description={t("fullscreen.floatingPositionDesc")}
      >
        <Select
          value={fullscreenState().floatingPosition}
          onChange={(v) => setFullscreenFloatingPosition(v as Positions)}
          options={[
            { label: t("position.bottom"), value: "bottom" },
            { label: t("position.top"), value: "top" },
            { label: t("position.left"), value: "left" },
            { label: t("position.right"), value: "right" },
          ]}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

export default FullscreenSettings;
