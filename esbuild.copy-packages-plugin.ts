import type { Plugin } from "esbuild";
import { existsSync, cpSync, statSync, readdirSync } from "fs";
import { join } from "path";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function getDirSize(dir: string): number {
  let size = 0;
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    size += stat.isDirectory() ? getDirSize(fullPath) : stat.size;
  }

  return size;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface CopyPackagesPluginOptions {
  inputDir: string;
}

export function copyPackagesPlugin(options: CopyPackagesPluginOptions): Plugin {
  const { inputDir } = options;

  return {
    name: "copy-packages-plugin",
    setup(build) {
      build.onEnd(() => {
        const outDir = build.initialOptions.outdir;
        if (!outDir) {
          console.warn(
            `${colors.yellow} copy-packages: No outdir specified in esbuild options${colors.reset}`,
          );
          return;
        }

        const outputPath = join(outDir, "packages");

        if (!existsSync(inputDir)) {
          console.warn(
            `${colors.yellow} copy-packages: Input directory not found (${inputDir})${colors.reset}`,
          );
          return;
        }

        console.log(`${colors.cyan}${colors.bold}Copying packages...${colors.reset}`);

        let totalSize = 0;
        const packages = readdirSync(inputDir);

        const rows = packages.map((pkg) => {
          const pkgPath = join(inputDir, pkg);
          const stat = statSync(pkgPath);

          const size = stat.isDirectory() ? getDirSize(pkgPath) : stat.size;
          totalSize += size;

          return { name: pkg, size, sizeLabel: formatSize(size) };
        });

        rows.sort((a, b) => b.size - a.size);

        const nameWidth = Math.max(...rows.map((r) => r.name.length));
        const sizeWidth = Math.max(...rows.map((r) => r.sizeLabel.length));
        for (const row of rows) {
          console.log(
            `  ${colors.green}${row.name.padEnd(nameWidth)}${colors.reset}  ${colors.gray}${row.sizeLabel.padStart(sizeWidth)}${colors.reset}`,
          );
        }

        cpSync(inputDir, outputPath, { recursive: true });

        console.log(`${colors.green}Packages copied successfully${colors.reset}`);
        console.log(`  ${colors.bold}Output:${colors.reset}     ${outputPath}`);
        console.log(`  ${colors.bold}Packages:${colors.reset}   ${packages.length}`);
        console.log(`  ${colors.bold}Total Size:${colors.reset} ${formatSize(totalSize)}`);
      });
    },
  };
}
