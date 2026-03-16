import type { Plugin } from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { transform } from "esbuild";

interface LocalePluginOptions {
  localesDir: string;
}

export function localePlugin(options: LocalePluginOptions): Plugin {
  const { localesDir } = options;

  return {
    name: "locale-plugin",
    setup(build) {
      const _outdir = build.initialOptions.outdir;
      if (!_outdir) {
        console.error("Locale plugin requires outdir option to be set");
        return;
      }
      const outDir = path.join(_outdir, "locales");
      build.onEnd(async () => {
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }

        const files = fs
          .readdirSync(localesDir)
          .filter((f) => f.endsWith(".ts") && !f.endsWith(".d.ts"));

        console.log("Building locales...");

        let totalSize = 0;

        for (const file of files) {
          const localeName = path.basename(file, ".ts");
          const inputPath = path.join(localesDir, file);
          const outputPath = path.join(outDir, `${localeName}.js`);

          const code = fs.readFileSync(inputPath, "utf-8");

          const result = await transform(code, {
            format: "esm",
            platform: "browser",
            target: "es2020",
            loader: "ts",
            minify: true,
            sourcemap: false,
          });

          fs.writeFileSync(outputPath, result.code);

          const stats = fs.statSync(outputPath);
          totalSize += stats.size;
          const sizeKB = (stats.size / 1024).toFixed(2);
          console.log(`  ${localeName}.js (${sizeKB} KB)`);
        }

        console.log(`Total Locale Size: ${(totalSize / 1024).toFixed(2)} KB`);
      });
    },
  };
}
