import { useStore } from "@nanostores/solid";
import { Toggle } from "@/component/ui/Toggle";
import { Select } from "@/component/ui/Select";
import { SettingsRow } from "@/component/settings/Row";
import {
  $widget,
  setVariant,
  setCenterText,
  setHideTitle,
  setHideAlbum,
  setHideArtist,
} from "@/stores/widget";
import type { PlayerWidgetVariants } from "@/component/ui/PlayingWidget";
import { SettingsSection } from "@/component/settings/Section";
import { t } from "@/i18n";

function WidgetSettings() {
  const widget = useStore($widget);

  const OPTIONS = (): { label: string; value: PlayerWidgetVariants }[] => [
    { label: t("widget.variant.glass"), value: "glass" },
    { label: t("widget.variant.light"), value: "light" },
    { label: t("widget.variant.simple"), value: "simple" },
    { label: t("widget.variant.dark"), value: "dark" },
    { label: t("widget.variant.overlay"), value: "overlay" },
  ];

  return (
    <SettingsSection title={t("widget.title")}>
      <SettingsRow label={t("widget.variant")} description={t("widget.chooseStyle")}>
        <Select
          value={widget().variant}
          onChange={(v) => setVariant(v as PlayerWidgetVariants)}
          options={OPTIONS()}
        />
      </SettingsRow>
      <SettingsRow label={t("widget.centerText")} description={t("widget.centerTextDesc")}>
        <Toggle checked={widget().centerText} onChange={setCenterText} />
      </SettingsRow>
      <SettingsRow label={t("widget.hideTitle")} description={t("widget.hideTitleDesc")}>
        <Toggle checked={widget().hideTitle} onChange={setHideTitle} />
      </SettingsRow>
      <SettingsRow label={t("widget.hideArtist")} description={t("widget.hideArtistDesc")}>
        <Toggle checked={widget().hideArtist} onChange={setHideArtist} />
      </SettingsRow>
      <SettingsRow label={t("widget.hideAlbum")} description={t("widget.hideAlbumDesc")}>
        <Toggle checked={widget().hideAlbum} onChange={setHideAlbum} />
      </SettingsRow>
    </SettingsSection>
  );
}

export default WidgetSettings;
