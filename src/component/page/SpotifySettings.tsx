import { CogwheelHTML } from "~/component/icon/Cogwheel";
import { showSettingsModal } from "~/component/settings/SettingsModal";
import { Button } from "~/component/ui/Button";
import { t } from "~/i18n";

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
        >
          {/* eslint-disable-next-line solid/no-innerhtml */}
          <span aria-hidden="true" innerHTML={CogwheelHTML} style={{ display: "contents" }} />
          <span>{t("settings.landing.configure")}</span>
        </Button>
      </div>
    </label>
  );
};

export default SpotifySettings;
