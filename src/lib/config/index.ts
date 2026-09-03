import { safeParse, type BaseIssue } from "valibot";
import { ConfigFileSchema, ConfigSchema, type Config } from "~/lib/config/schemas";
import deepmerge from "~/utils/deepmerge";
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

export function applyConfig(config: Config) {
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

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na < nb ? -1 : 1;
  }
  return 0;
}

export type ConfigImportResult =
  | {
      success: true;
      needsVersionConfirmation: boolean;
      migratedMissing: boolean;
      config: Config;
    }
  | { success: false; error: string };

function formatIssues(issues: readonly BaseIssue<unknown>[]): string {
  return issues
    .map((issue) => {
      const path = issue.path
        ? issue.path
            .map((p) => (typeof p.key === "number" ? `[${p.key}]` : p.key))
            .join(".")
            .replace(/\.\[/g, "[")
        : "root";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
}

export function prepareImport(fileContent: string): ConfigImportResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(fileContent);
  } catch {
    return { success: false, error: "Failed to parse JSON file." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { success: false, error: "Invalid config file." };
  }

  const fileVersion = typeof parsed.version === "string" ? parsed.version : "";
  const versionTooOld = fileVersion !== "" && compareVersions(fileVersion, APP_VERSION) < 0;

  const asIs = safeParse(ConfigFileSchema, parsed);

  if (asIs.success) {
    return {
      success: true,
      config: asIs.output.config,
      needsVersionConfirmation: versionTooOld,
      migratedMissing: false,
    };
  }

  const rawConfig =
    typeof parsed.config === "object" && parsed.config !== null && !Array.isArray(parsed.config)
      ? parsed.config
      : {};
  const merged = deepmerge(readConfig(), rawConfig);
  const validated = safeParse(ConfigSchema, merged);

  if (!validated.success) {
    return { success: false, error: formatIssues(validated.issues) };
  }

  return {
    success: true,
    config: validated.output,
    needsVersionConfirmation: versionTooOld,
    migratedMissing: true,
  };
}
