import { type Flatten, flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import { persistentAtom } from "@nanostores/persistent";
import { useStore } from "@nanostores/solid";
import { type ParentComponent, Suspense, createResource, createRoot } from "solid-js";
import { toast } from "~/lib/sonner";
import { getName } from "~/stores/persist";
import { getModule } from "~/lib/dom/load";
import type { Dict } from "~/i18n/types";
import { dict as enDict } from "~/i18n/locales/en";
import { createLogger } from "~/utils/logger";

const log = createLogger("i18n");

export type Locale = "en" | "es" | "ru" | "sk";

export type RawDictionary = Dict;
export type Dictionary = Flatten<RawDictionary>;

const DEFAULT_DICT = flatten(enDict);
export { DEFAULT_DICT };
export const SUPPORTED_LOCALES: Locale[] = ["en", "es", "ru", "sk"] as const;
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
    const loadedDict = flatten(mod.dict as RawDictionary);
    return { ...DEFAULT_DICT, ...loadedDict };
  } catch (error) {
    log.error(`error_loading '${locale}':`, error);
    toast.error(
      `Failed loading translations for '${locale}' are currently unavailable. Using English instead.`,
    );

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

export function useLocale() {
  return useStore($locale);
}

export const { dict: dictResource, actions: dictActions } = createRoot(() => {
  const locale = useStore($locale);

  const [dict, actions] = createResource(locale, fetchDictionary, {
    initialValue: DEFAULT_DICT,
  });

  return { actions, dict };
});

export const t = translator(dictResource, resolveTemplate);

export const I18nProvider: ParentComponent = (props) => {
  return <Suspense fallback={null}>{dictResource() ? props.children : null}</Suspense>;
};
