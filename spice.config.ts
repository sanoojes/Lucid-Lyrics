import { defineConfig } from "@spicetify/creator";
import { solidPlugin } from "esbuild-plugin-solid";
import { glsl } from "esbuild-plugin-glsl";
import { name, version } from "./package.json";
import { localePlugin } from "./esbuild.locale-plugin";
import { join } from "path";
import { saveMetafilePlugin } from "./esbuild.save-metafile";
import { copyPackagesPlugin } from "./esbuild.copy-packages-plugin";

const localesDir = join(__dirname, "src/i18n/locales");
const packagesInputDir = join(__dirname, "packages/");

export default defineConfig({
  name,
  version,
  framework: "react",
  linter: "oxlint",
  template: "extension",
  packageManager: "bun",
  devModeVarName: "__LUCID_DEV_MODE__",
  esbuildOptions: {
    define: {
      __APP_VERSION__: JSON.stringify(version),
      __APP_NAME__: JSON.stringify(name),
    },
    legalComments: "none",
    metafile: true,
    alias: {
      "@": join(__dirname, "src"),
    },
    plugins: [
      copyPackagesPlugin({
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
});
