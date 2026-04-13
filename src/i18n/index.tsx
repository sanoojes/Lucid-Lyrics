import { type Flatten, flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import { persistentAtom } from "@nanostores/persistent";
import { useStore } from "@nanostores/solid";
import { createResource, createRoot } from "solid-js";
import { toast } from "~/lib/sonner";
import { getName } from "~/stores/persist";
import { getModule } from "~/lib/dom/load";
import type { Dict } from "~/i18n/types";
import { dict as enDict } from "~/i18n/locales/en";
import { createLogger } from "~/utils/logger";

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Dictionary = Flatten<Dict>;

const log = createLogger("i18n");
const DEFAULT_DICT = flatten(enDict);
const SUPPORTED_LOCALES = ["en", "es", "ru", "sk"] as const;

export const LANGUAGE_OPTIONS = [
  { label: "English (English)", value: "en" },
  { label: "Русский (Russian)", value: "ru" },
  { label: "Español (Spanish)", value: "es" },
  { label: "Slovenčina (Slovak)", value: "sk" },
] as const;

async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === "en") {
    return DEFAULT_DICT;
  }

  try {
    const mod = await getModule("locale", locale);
    const loadedDict = flatten(mod.dict as Dict);
    return { ...DEFAULT_DICT, ...loadedDict };
  } catch (error) {
    log.error(`error_loading '${locale}':`, error);
    toast.error(`Translations for '${locale}' are currently unavailable. Falling back to English.`);
    return DEFAULT_DICT;
  }
}

function getInitialLocale(): Locale {
  const baseLang = (navigator.language || navigator.languages[0]).split("-")[0] as Locale;
  if (SUPPORTED_LOCALES.includes(baseLang)) {
    return baseLang;
  }
  return "en";
}

export const $locale = persistentAtom<Locale>(getName("locale"), getInitialLocale());

export function setLocale(locale: Locale): void {
  $locale.set(locale);
}

export function resetLocale() {
  setLocale(getInitialLocale());
}

export const { dict: dictResource, actions: dictActions } = createRoot(() => {
  const locale = useStore($locale);

  const [dict, actions] = createResource(locale, fetchDictionary, {
    initialValue: DEFAULT_DICT,
  });

  return { actions, dict };
});

export const t = translator(dictResource, resolveTemplate);
