import { join } from "path";
import { defineConfig } from "@spicemod/creator";
import { solidPlugin } from "esbuild-plugin-solid";
import { glsl } from "esbuild-plugin-glsl";
import { name, version } from "./package.json";
import { localePlugin } from "./esbuild/locale-plugin";
import { saveMetafilePlugin } from "./esbuild/save-metafile";
import { copyPackagesPlugin } from "./esbuild/copy-packages-plugin";

const localesDir = join(__dirname, "src/i18n/locales");
const packagesInputDir = join(__dirname, "packages/");

export default defineConfig({
  cssId: "lucid-lyrics-styles",
  devModeVarName: "__LUCID_DEV_MODE__",
  esbuildOptions: {
    alias: {
      "~": join(__dirname, "src"),
    },
    define: {
      __APP_NAME__: JSON.stringify(name),
      __APP_VERSION__: JSON.stringify(version),
    },
    legalComments: "none",
    metafile: true,
    plugins: [
      copyPackagesPlugin({
        build: [
          "arabic-transliteration",
          "armenian-transliteration",
          "hebrew-transliteration",
          "gothic-transliteration",
          "persian-transliteration",
          "urdu-transliteration",
        ],
        ignore: ["**/node_modules/**", ".DS_Store"],
        inputDir: packagesInputDir,
      }),
      localePlugin({
        localesDir,
      }),
      saveMetafilePlugin(),
      glsl({
        minify: true,
      }),
      solidPlugin({
        solid: {
          generate: "dom",
        },
      }),
    ],
  },
  framework: "react",
  linter: "oxlint",
  name,
  packageManager: "bun",
  template: "extension",
  version,
});
