import { clear, get, set } from "idb-keyval";
import { MODULE_METADATA } from "~/constants";
import { createLogger } from "~/utils/logger";
import { moduleStore } from "~/stores/idb";

type ModuleName = keyof typeof MODULE_METADATA;
type ModuleRegistry = {
  "arabic-transliteration": typeof import("arabic-transliteration");
  "armenian-transliteration": typeof import("armenian-transliteration");
  "cyrillic-romanization": typeof import("cyrillic-romanization");
  "greek-transliteration": typeof import("greek-transliteration");
  "hebrew-transliteration": typeof import("hebrew-transliteration");
  "gothic-transliteration": typeof import("gothic-transliteration");
  "persian-transliteration": typeof import("persian-transliteration");
  "urdu-transliteration": typeof import("urdu-transliteration");
  kuromoji: any;
  kuroshiro: { default: any };
  locale: { dict: Record<string, string> };
  pinyin: typeof import("pinyin");
};

type CachedModule = {
  version: string;
  url: string;
  code: string;
};

const log = createLogger("module:loader");

if (__LUCID_DEV_MODE__) {
  try {
    await clear(moduleStore);
  } catch (error) {
    log.error("dev_module_store_clear_failed", error);
  }
}

const memoryCache: Record<string, Promise<any>> = {};
const pendingRetries = new Set<string>();

type ModuleMeta =
  | { name: string; version: string; url: string; baseUrl?: never }
  | {
      name: string;
      version: string;
      baseUrl: string;
      localeVersions?: Record<string, string>;
      url?: never;
    };

const loadedBlobUrls: Map<string, string> = new Map();

function getModuleMeta(name: ModuleName): ModuleMeta {
  const meta = MODULE_METADATA[name];
  if ("baseUrl" in meta) {
    return {
      baseUrl: meta.baseUrl,
      localeVersions: meta.localeVersions,
      name: meta.name,
      version: meta.version,
    };
  }
  return { name: meta.name, url: meta.url, version: meta.version };
}

function getModuleUrl(name: ModuleName, suffix?: string): { url: string; version: string } {
  const meta = getModuleMeta(name);

  if ("baseUrl" in meta && meta.baseUrl) {
    if (!suffix) {
      throw new Error(
        `Module "${name}" requires a suffix (e.g., a locale code) but none was provided.`,
      );
    }
    const version = meta.localeVersions?.[suffix] ?? meta.version;
    return { url: `${meta.baseUrl}${suffix}.js`, version };
  }

  if (meta.url) {
    return { url: meta.url, version: meta.version };
  }
  throw new Error(`Invalid metadata for module "${name}": missing both url and baseUrl.`);
}
export async function getModule<K extends ModuleName>(
  name: K,
  suffix?: string,
): Promise<ModuleRegistry[K]> {
  const cacheKey = suffix ? `${name}:${suffix}` : name;

  const cached = memoryCache[cacheKey];
  if (cached) {
    return cached as Promise<ModuleRegistry[K]>;
  }

  const { url, version } = getModuleUrl(name, suffix);

  const loadPromise = fetchAndEvalModule<ModuleRegistry[K]>(cacheKey, url, version)
    .then((mod) => {
      log.debug(`${cacheKey}_loaded_successfully`);
      pendingRetries.delete(cacheKey);
      return mod;
    })
    .catch((err) => {
      delete memoryCache[cacheKey];
      log.error(`${cacheKey}_load_failed`, { error: err });

      handleOfflineRetry(name, suffix);
      throw err;
    });

  memoryCache[cacheKey] = loadPromise;
  return loadPromise;
}

export function preloadModules(names: ModuleName[]): void {
  for (const name of names) {
    log.debug(`preloading_${name}`);
    getModule(name).catch(() => {});
  }
}

export function preloadLocale(locale: string): void {
  const cacheKey = `locale:${locale}`;
  if (!memoryCache[cacheKey]) {
    log.debug(`preloading_locale_${locale}`);
    getModule("locale", locale).catch(() => {});
  }
}

async function fetchAndEvalModule<T>(name: string, url: string, version: string): Promise<T> {
  let scriptContent: string | null = null;

  const cachedData = await get<CachedModule>(name, moduleStore).catch(() => undefined);

  if (cachedData && cachedData.version === version && cachedData.url === url) {
    log.debug(`${name}_idb_cache_hit`);
    scriptContent = cachedData.code;
  } else {
    const oldBlobUrl = loadedBlobUrls.get(name);
    if (oldBlobUrl) {
      URL.revokeObjectURL(oldBlobUrl);
      loadedBlobUrls.delete(name);
      delete memoryCache[name];
      log.debug(`${name}_cleaned_up_old_version`);
    }

    const fetchUrl = new URL(url, window.location.href);
    fetchUrl.searchParams.set("v", version);

    const response = await fetch(fetchUrl.toString());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    scriptContent = await response.text();

    set(name, { code: scriptContent, url, version }, moduleStore).catch(() =>
      log.warn(`${name}_idb_save_failed`),
    );
  }

  const blob = new Blob([scriptContent], { type: "application/javascript" });
  const blobUrl = URL.createObjectURL(blob);
  loadedBlobUrls.set(name, blobUrl);

  return await import(blobUrl);
}

function handleOfflineRetry(name: ModuleName, suffix?: string): void {
  const cacheKey = suffix ? `${name}:${suffix}` : name;
  if (pendingRetries.has(cacheKey)) return;

  pendingRetries.add(cacheKey);

  const retry = () => {
    if (navigator.onLine) {
      log.debug(`network_restored_retrying_${cacheKey}`);
      window.removeEventListener("online", retry);
      getModule(name, suffix).catch(() => {});
    }
  };

  window.addEventListener("online", retry);
}
