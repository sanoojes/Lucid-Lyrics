import { Select } from "~/component/ui/Select";
import { SettingsRow } from "~/component/settings/Row";
import { SettingsSection } from "~/component/settings/Section";
import { LANGUAGE_OPTIONS, type Locale, setLocale, t, useLocale } from "~/i18n";

function LanguageSettings() {
  const locale = useLocale();

  return (
    <SettingsSection title={t("settings.language")}>
      <SettingsRow label={t("settings.language")} description={t("settings.languageDesc")}>
        <Select
          value={locale()}
          onChange={(v) => setLocale(v as Locale)}
          options={LANGUAGE_OPTIONS}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

export default LanguageSettings;
