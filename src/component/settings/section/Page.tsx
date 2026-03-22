import { useStore } from "@nanostores/solid";
import {
  $page_state,
  setHideScrollbar,
  setHideStatus,
  setShowCredits,
  setShowControls,
  setFloatingPosition,
  type Positions,
} from "@/stores/page";
import { SettingsSection } from "@/component/settings/Section";
import { SettingsRow } from "@/component/settings/Row";
import { Toggle } from "@/component/ui/Toggle";
import { Select } from "@/component/ui/Select";
import { t } from "@/i18n";

function PageSettings() {
  const pageState = useStore($page_state);

  return (
    <SettingsSection title={t("page.title")}>
      <SettingsRow label={t("page.showCredits")} description={t("page.showCreditsDesc")}>
        <Toggle checked={pageState().showCredits} onChange={setShowCredits} />
      </SettingsRow>
      <SettingsRow label={t("page.hideScrollbar")} description={t("page.hideScrollbarDesc")}>
        <Toggle checked={pageState().hideScrollbar} onChange={setHideScrollbar} />
      </SettingsRow>
      <SettingsRow label={t("page.hideStatus")} description={t("page.hideStatusDesc")}>
        <Toggle checked={pageState().hideStatus} onChange={setHideStatus} />
      </SettingsRow>
      <SettingsRow label={t("page.showControls")} description={t("page.showControlsDesc")}>
        <Toggle checked={pageState().showControls} onChange={setShowControls} />
      </SettingsRow>
      <SettingsRow label={t("page.floatingPosition")} description={t("page.floatingPositionDesc")}>
        <Select
          value={pageState().floatingPosition}
          onChange={(v) => setFloatingPosition(v as Positions)}
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

export default PageSettings;
