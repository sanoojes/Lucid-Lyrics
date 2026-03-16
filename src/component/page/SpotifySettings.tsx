import { Button } from "@/component/ui/Button";
import { showSettingsModal } from "@/component/settings/SettingsModal";
import { CogwheelHTML } from "@/component/icon/Cogwheel";
import { t } from "@/i18n";

const SpotifySettings = () => {
  return (
    <label for="lyrics.settings.open">
      <div class="ll-ss-box">
        <div class="card">
          <h2>{t("settings.landing.title")}</h2>
          <p>{t("settings.landing.description")}</p>
        </div>
        <Button
          id="lyrics.settings.open"
          variant="glass"
          onClick={showSettingsModal}
          shape="rounded"
          innerHTML={CogwheelHTML + `<span>${t("settings.landing.configure")}</span>`}
        />
      </div>
    </label>
  );
};

export default SpotifySettings;
