import { safeParse } from "valibot";
import { ConfigFileSchema, type Config } from "~/lib/config/schemas";
import { APP_NAME, APP_VERSION } from "~/constants/versions";
import { $widget } from "~/stores/widget";
import { $npb_state } from "~/stores/npb";
import { $npv_state } from "~/stores/npv";
import { $page_state, $fullscreen_state } from "~/stores/page";
import { $background } from "~/stores/background";
import { $pip_state } from "~/stores/picture-in-picture";
import { $blurmap_mode, $custom_blurmap, $providers } from "~/stores/lyrics";
import { $cache_settings, $developer_mode, $ttml_maker_mode } from "~/stores/dev";
import { $ttml_mode } from "~/stores/ttml";
import { $locale } from "~/i18n";
import { logger } from "~/utils/logger";

function readConfig(): Config {
  return {
    widget: $widget.get(),
    npb: $npb_state.get(),
    npvSettings: $npv_state.get(),
    page: $page_state.get(),
    fullscreen: $fullscreen_state.get(),
    background: $background.get(),
    pictureInPicture: $pip_state.get(),
    blurmapMode: $blurmap_mode.get(),
    customBlurmap: $custom_blurmap.get(),
    providers: $providers.get(),
    cacheSettings: $cache_settings.get(),
    developerMode: $developer_mode.get(),
    ttmlMakerMode: $ttml_maker_mode.get(),
    ttmlMode: $ttml_mode.get(),
    locale: $locale.get(),
  };
}

function applyConfig(config: Config) {
  $widget.set(config.widget);
  $npb_state.set(config.npb);
  $npv_state.set(config.npvSettings);
  $page_state.set(config.page);
  $fullscreen_state.set(config.fullscreen);
  $background.set(config.background);
  $pip_state.set(config.pictureInPicture);
  $blurmap_mode.set(config.blurmapMode);
  $custom_blurmap.set(config.customBlurmap);
  $providers.set(config.providers);
  $cache_settings.set(config.cacheSettings);
  $developer_mode.set(config.developerMode);
  $ttml_maker_mode.set(config.ttmlMakerMode);
  $ttml_mode.set(config.ttmlMode);
  $locale.set(config.locale);
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getConfigFileString(): string {
  const config = readConfig();
  const file = {
    app: APP_NAME as "Lucid Lyrics",
    config,
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
  };
  return JSON.stringify(file, null, 2);
}

export function exportConfig(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `lucid-lyrics-${APP_VERSION}-${timestamp}.json`;
  downloadFile(getConfigFileString(), filename);
  return filename;
}

export function validateConfig(fileContent: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent);
  } catch {
    return { success: false, type: "invalid_json" } as const;
  }

  const result = safeParse(ConfigFileSchema, parsed);

  if (!result.success) {
    const issues = result.issues.map((issue) => {
      const path = issue.path
        ? issue.path
            .map((p) => (typeof p.key === "number" ? `[${p.key}]` : p.key))
            .join(".")
            .replace(/\.\[/g, "[")
        : "root";

      return `${path}: ${issue.message}`;
    });

    return { success: false, type: "schema_error", issues } as const;
  }

  return { success: true, data: result.output } as const;
}

export function importConfig(fileContent: string): {
  success: boolean;
  error?: string;
} {
  const validation = validateConfig(fileContent);

  if (!validation.success) {
    const errorMsg =
      validation.type === "schema_error"
        ? validation.issues.join("\n")
        : "Failed to parse JSON file.";

    logger.error(`Config import validation failed:\n${errorMsg}`);
    return { error: errorMsg, success: false };
  }

  try {
    applyConfig(validation.data.config);
    return { success: true };
  } catch (error) {
    logger.error("Failed to apply imported config:", error);
    return { error: "Failed to apply configuration.", success: false };
  }
}
