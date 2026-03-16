const JSDELIVR = "https://cdn.jsdelivr.net";
const JSDELIVR_TO_REPO = __LUCID_DEV_MODE__
  ? "http://localhost:54321/files"
  : `${JSDELIVR}/gh/sanoojes/Lucid-Lyrics@refs/heads/releases/latest`;
const JSDELIVR_PACKAGE_REPO = `${JSDELIVR_TO_REPO}/packages`;
const KUROMOJI_PATH = `${JSDELIVR_PACKAGE_REPO}/kuromoji`;
export const KUROMOJI_DICT_PATH = `${KUROMOJI_PATH}/dict`;

export const MODULE_METADATA = {
  pinyin: {
    name: "pinyin",
    version: "4.0.0",
    url: `${JSDELIVR_PACKAGE_REPO}/pinyin.mjs`,
  },
  "cyrillic-romanization": {
    name: "cyrillic-romanization",
    version: "1.1.8",
    url: `${JSDELIVR_PACKAGE_REPO}/cyrillic-romanization.mjs`,
  },
  "greek-transliteration": {
    name: "greek-transliteration",
    version: "2.0.0",
    url: `${JSDELIVR_PACKAGE_REPO}/greek-transliteration.mjs`,
  },
  franc: {
    name: "franc",
    version: "6.2.0",
    url: `${JSDELIVR_PACKAGE_REPO}/franc.mjs`,
  },
  kuroshiro: {
    name: "kuroshiro",
    version: "1.2.0",
    url: `${JSDELIVR_PACKAGE_REPO}/kuroshiro.mjs`,
  },
  kuromoji: {
    name: "kuromoji",
    version: "0.1.2",
    url: `${KUROMOJI_PATH}/index.mjs`,
  },
  locale: {
    name: "locale",
    version: "1.0.0",
    baseUrl: `${JSDELIVR_TO_REPO}/locales/`,
    localeVersions: {
      es: "1.0.0",
      ru: "1.0.0",
    },
  },
} as const;
