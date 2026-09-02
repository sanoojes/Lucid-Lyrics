import solid from "eslint-plugin-solid/configs/typescript";
import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: ["eslint-plugin-solid"],
  plugins: ["eslint", "typescript", "unicorn", "oxc"],
  categories: {},
  rules: {
    ...solid.rules,
    "no-unassigned-vars": "off",
    "unicorn/no-new-array": "off",
    "no-await-in-loop": "warn",
    "unicorn/prefer-array-find": "error",
    "unicorn/prefer-array-flat-map": "error",
    "unicorn/prefer-set-has": "error",
  },
  overrides: [
    {
      files: ["src/i18n/locales/**/*.ts"],
      rules: {
        "eslint/sort-keys": "error",
      },
    },
  ],
  settings: {
    "jsx-a11y": {
      components: {},
      attributes: {},
    },
    jsdoc: {
      ignorePrivate: false,
      ignoreInternal: false,
      ignoreReplacesDocs: true,
      overrideReplacesDocs: true,
      augmentsExtendsReplacesDocs: false,
      implementsReplacesDocs: false,
      exemptDestructuredRootsFromChecks: false,
      tagNamePreference: {},
    },
  },
  globals: {},
  ignorePatterns: [
    "dist/**",
    "packages/pinyin.mjs",
    "packages/kuromoji/**",
    "packages/kuroshiro.mjs",
    "packages/greek-transliteration.mjs",
    "packages/cyrillic-romanization.mjs",
  ],
});
