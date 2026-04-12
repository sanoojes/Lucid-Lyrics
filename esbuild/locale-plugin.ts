import type { Plugin } from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { transform } from "esbuild";

const colors = {
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
  yellow: "\x1b[33m",
};

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
        console.error(
          `${colors.red}locale-plugin: Requires "outdir" option to be set in esbuild${colors.reset}`,
        );
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

        if (files.length === 0) {
          console.warn(
            `${colors.yellow}locale-plugin: No TypeScript files found in ${localesDir}${colors.reset}`,
          );
          return;
        }

        console.log(`${colors.cyan}${colors.bold}Compiling locales...${colors.reset}`);

        let totalSize = 0;
        const results: { name: string; size: number; sizeLabel: string }[] = [];

        for (const file of files) {
          const localeName = path.basename(file, ".ts");
          const inputPath = path.join(localesDir, file);
          const outputPath = path.join(outDir, `${localeName}.js`);

          const code = fs.readFileSync(inputPath, "utf-8");

          const result = await transform(code, {
            format: "esm",
            loader: "ts",
            minify: true,
            platform: "browser",
            sourcemap: false,
            target: "es2020",
          });

          fs.writeFileSync(outputPath, result.code);

          const stats = fs.statSync(outputPath);
          totalSize += stats.size;

          results.push({
            name: `${localeName}.js`,
            size: stats.size,
            sizeLabel: `${(stats.size / 1024).toFixed(2)} KB`,
          });
        }

        results.sort((a, b) => a.name.localeCompare(b.name));

        const nameWidth = Math.max(...results.map((r) => r.name.length));
        const sizeWidth = Math.max(...results.map((r) => r.sizeLabel.length));

        for (const row of results) {
          console.log(
            `  ${colors.green}${row.name.padEnd(nameWidth)}${colors.reset}  ${colors.gray}${row.sizeLabel.padStart(sizeWidth)}${colors.reset}`,
          );
        }

        console.log(`${colors.green}Locales compiled successfully${colors.reset}`);
        console.log(`  ${colors.bold}Output:${colors.reset}     ${outDir}`);
        console.log(`  ${colors.bold}Files:${colors.reset}      ${files.length}`);
        console.log(
          `  ${colors.bold}Total Size:${colors.reset} ${(totalSize / 1024).toFixed(2)} KB`,
        );
      });
    },
  };
}
