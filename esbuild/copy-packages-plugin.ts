import type { Plugin } from "esbuild";
import { cpSync, existsSync, globSync, mkdirSync, rmSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

interface CopyPackagesPluginOptions {
  inputDir: string;
  ignore?: string[];
  build?: string[];
}

export function copyPackagesPlugin(options: CopyPackagesPluginOptions): Plugin {
  const { inputDir, ignore = [], build: packagesToBuild = [] } = options;

  return {
    name: "copy-packages-plugin",
    setup(build) {
      build.onEnd(async () => {
        const outDir = build.initialOptions.outdir;
        if (!outDir) return;

        const outputPath = join(outDir, "packages");
        const validItems = globSync("*", { cwd: inputDir, exclude: ignore });

        if (existsSync(outputPath)) {
          rmSync(outputPath, { recursive: true, force: true });
        }
        mkdirSync(outputPath, { recursive: true });

        let totalSize = 0;
        console.log(`${colors.cyan}${colors.bold}Syncing Packages to Output...${colors.reset}`);

        for (const name of validItems) {
          const pkgInputPath = join(inputDir, name);
          const pkgOutputPath = join(outputPath, name);
          const isBuildTarget = packagesToBuild.includes(name);

          const distPath = join(pkgInputPath, "dist");
          const sourcePath = isBuildTarget && existsSync(distPath) ? distPath : pkgInputPath;

          if (statSync(pkgInputPath).isDirectory()) {
            mkdirSync(pkgOutputPath, { recursive: true });
            cpSync(sourcePath, pkgOutputPath, { recursive: true });
          } else {
            cpSync(pkgInputPath, pkgOutputPath);
          }

          const size = getDirSize(pkgOutputPath);
          totalSize += size;

          console.log(
            `  ${colors.green}${name.padEnd(25)}${colors.reset} ${colors.gray}${formatSize(
              size,
            ).padStart(10)}${colors.reset}${
              isBuildTarget ? colors.yellow + " [built source]" : ""
            }`,
          );
        }

        console.log(
          `${colors.green}${colors.bold}Done! Total packages size: ${formatSize(totalSize)}${colors.reset}\n`,
        );
      });
    },
  };
}

function getDirSize(dir: string): number {
  const stats = statSync(dir);
  if (!stats.isDirectory()) return stats.size;

  return readdirSync(dir).reduce((acc, item) => {
    return acc + getDirSize(join(dir, item));
  }, 0);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
