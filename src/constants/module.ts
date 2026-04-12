const JSDELIVR = "https://lucid-lyrics.sanooj.uk";
const JSDELIVR_TO_REPO = __LUCID_DEV_MODE__ ? "http://localhost:54321/files" : `${JSDELIVR}/spice`;
const JSDELIVR_PACKAGE_REPO = `${JSDELIVR_TO_REPO}/packages`;

const PINYIN = "pinyin";
const CYRILLIC_ROMANIZATION = "cyrillic-romanization";
const GREEK_TRANSLITERATION = "greek-transliteration";
const KUROSHIRO = "kuroshiro";
const KUROMOJI = "kuromoji";
const ARABIC_TRANSLITERATION = "arabic-transliteration";
const ARMENIAN_TRANSLITERATION = "armenian-transliteration";
const HEBREW_TRANSLITERATION = "hebrew-transliteration";
const GOTHIC_TRANSLITERATION = "gothic-transliteration";
const PERSIAN_TRANSLITERATION = "persian-transliteration";
const URDU_TRANSLITERATION = "urdu-transliteration";
const LOCALE = "locale";
const LOCALE_VERSION = __APP_VERSION__; // using the app version so that we dont need to manage this separately

const KUROMOJI_PATH = `${JSDELIVR_PACKAGE_REPO}/${KUROMOJI}`;
export const KUROMOJI_DICT_PATH = `${KUROMOJI_PATH}/dict`;

export const MODULE_METADATA = {
  [PINYIN]: {
    name: PINYIN,
    url: `${JSDELIVR_PACKAGE_REPO}/${PINYIN}.mjs`,
    version: "4.0.0",
  },
  [CYRILLIC_ROMANIZATION]: {
    name: CYRILLIC_ROMANIZATION,
    url: `${JSDELIVR_PACKAGE_REPO}/${CYRILLIC_ROMANIZATION}.mjs`,
    version: "1.1.8",
  },
  [GREEK_TRANSLITERATION]: {
    name: GREEK_TRANSLITERATION,
    url: `${JSDELIVR_PACKAGE_REPO}/${GREEK_TRANSLITERATION}.mjs`,
    version: "2.0.0",
  },
  [KUROSHIRO]: {
    name: KUROSHIRO,
    url: `${JSDELIVR_PACKAGE_REPO}/${KUROSHIRO}.mjs`,
    version: "1.2.0",
  },
  [KUROMOJI]: {
    name: KUROMOJI,
    url: `${KUROMOJI_PATH}/index.mjs`,
    version: "0.1.2",
  },
  [ARMENIAN_TRANSLITERATION]: {
    name: ARMENIAN_TRANSLITERATION,
    url: `${JSDELIVR_PACKAGE_REPO}/${ARMENIAN_TRANSLITERATION}/index.js`,
    version: "0.0.1",
  },
  [ARABIC_TRANSLITERATION]: {
    name: ARABIC_TRANSLITERATION,
    url: `${JSDELIVR_PACKAGE_REPO}/${ARABIC_TRANSLITERATION}/index.js`,
    version: "0.0.1",
  },
  [HEBREW_TRANSLITERATION]: {
    name: HEBREW_TRANSLITERATION,
    url: `${JSDELIVR_PACKAGE_REPO}/${HEBREW_TRANSLITERATION}/index.js`,
    version: "0.0.1",
  },
  [GOTHIC_TRANSLITERATION]: {
    name: GOTHIC_TRANSLITERATION,
    url: `${JSDELIVR_PACKAGE_REPO}/${GOTHIC_TRANSLITERATION}/index.js`,
    version: "0.0.1",
  },
  [PERSIAN_TRANSLITERATION]: {
    name: PERSIAN_TRANSLITERATION,
    url: `${JSDELIVR_PACKAGE_REPO}/${PERSIAN_TRANSLITERATION}/index.js`,
    version: "0.0.1",
  },
  [URDU_TRANSLITERATION]: {
    name: URDU_TRANSLITERATION,
    url: `${JSDELIVR_PACKAGE_REPO}/${URDU_TRANSLITERATION}/index.js`,
    version: "0.0.3",
  },
  [LOCALE]: {
    baseUrl: `${JSDELIVR_TO_REPO}/locales/`,
    localeVersions: {
      es: LOCALE_VERSION,
      ru: LOCALE_VERSION,
      sk: LOCALE_VERSION,
    },
    name: LOCALE,
    version: LOCALE_VERSION,
  },
} as const;
