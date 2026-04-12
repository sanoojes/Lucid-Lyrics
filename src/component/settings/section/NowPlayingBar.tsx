import { useStore } from "@nanostores/solid";
import { Toggle } from "@/component/ui/Toggle";
import { SettingsRow } from "@/component/settings/Row";
import { $npb_state, setHideFullscreenBtn, setHideSpotifyFullscreenBtn } from "@/stores";
import { SettingsSection } from "@/component/settings/Section";
import { t } from "@/i18n";

function NowPlayingBarSettings() {
  const nowPlayingBarSettings = useStore($npb_state);

  return (
    <SettingsSection title={t("nowPlayingBar.title")}>
      <SettingsRow
        label={t("nowPlayingBar.hideSpotifyFullscreen")}
        description={t("nowPlayingBar.hideSpotifyFullscreenDesc")}
      >
        <Toggle
          checked={nowPlayingBarSettings().hideSpotifyFullscreen}
          onChange={setHideSpotifyFullscreenBtn}
        />
      </SettingsRow>
      <SettingsRow
        label={t("nowPlayingBar.hideFullscreen")}
        description={t("nowPlayingBar.hideFullscreenDesc")}
      >
        <Toggle
          checked={nowPlayingBarSettings().hideFullscreen}
          onChange={setHideFullscreenBtn}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

export default NowPlayingBarSettings;
