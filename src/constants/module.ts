const JSDELIVR = "https://cdn.jsdelivr.net";
const JSDELIVR_TO_REPO = __LUCID_DEV_MODE__
  ? "http://localhost:54321/files"
  : `${JSDELIVR}/gh/sanoojes/Lucid-Lyrics@refs/heads/releases/latest`;
const JSDELIVR_PACKAGE_REPO = `${JSDELIVR_TO_REPO}/packages`;

const PINYIN = "pinyin";
const CYRILLIC_ROMANIZATION = "cyrillic-romanization";
const GREEK_TRANSLITERATION = "greek-transliteration";
const KUROSHIRO = "kuroshiro";
const KUROMOJI = "kuromoji";
const ARABIC_TRANSLITERATION = "arabic-transliteration";
const ARMENIAN_TRANSLITERATION = "armenian-transliteration";
const HEBREW_TRANSLITERATION = "hebrew-transliteration";
const LOCALE = "locale";

const KUROMOJI_PATH = `${JSDELIVR_PACKAGE_REPO}/${KUROMOJI}`;
export const KUROMOJI_DICT_PATH = `${KUROMOJI_PATH}/dict`;

export const MODULE_METADATA = {
  [PINYIN]: {
    name: PINYIN,
    version: "4.0.0",
    url: `${JSDELIVR_PACKAGE_REPO}/${PINYIN}.mjs`,
  },
  [CYRILLIC_ROMANIZATION]: {
    name: CYRILLIC_ROMANIZATION,
    version: "1.1.8",
    url: `${JSDELIVR_PACKAGE_REPO}/${CYRILLIC_ROMANIZATION}.mjs`,
  },
  [GREEK_TRANSLITERATION]: {
    name: GREEK_TRANSLITERATION,
    version: "2.0.0",
    url: `${JSDELIVR_PACKAGE_REPO}/${GREEK_TRANSLITERATION}.mjs`,
  },
  [KUROSHIRO]: {
    name: KUROSHIRO,
    version: "1.2.0",
    url: `${JSDELIVR_PACKAGE_REPO}/${KUROSHIRO}.mjs`,
  },
  [KUROMOJI]: {
    name: KUROMOJI,
    version: "0.1.2",
    url: `${KUROMOJI_PATH}/index.mjs`,
  },
  [ARMENIAN_TRANSLITERATION]: {
    name: ARMENIAN_TRANSLITERATION,
    version: "0.0.1",
    url: `${JSDELIVR_PACKAGE_REPO}/${ARMENIAN_TRANSLITERATION}/index.js`,
  },
  [ARABIC_TRANSLITERATION]: {
    name: ARABIC_TRANSLITERATION,
    version: "0.0.1",
    url: `${JSDELIVR_PACKAGE_REPO}/${ARABIC_TRANSLITERATION}/index.js`,
  },
  [HEBREW_TRANSLITERATION]: {
    name: HEBREW_TRANSLITERATION,
    version: "0.0.1",
    url: `${JSDELIVR_PACKAGE_REPO}/${HEBREW_TRANSLITERATION}/index.js`,
  },
  [LOCALE]: {
    name: LOCALE,
    version: "1.0.0",
    baseUrl: `${JSDELIVR_TO_REPO}/locales/`,
    localeVersions: {
      es: "1.0.0",
      ru: "1.0.0",
      sk: "1.0.0",
    },
  },
} as const;
