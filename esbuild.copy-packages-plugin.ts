import type { Plugin } from "esbuild";
import { existsSync, cpSync, statSync, readdirSync } from "fs";
import { join } from "path";

function getDirSize(dir: string): number {
  let size = 0;
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += stat.size;
    }
  }
  return size;
}

function formatSize(bytes: number): string {
  return (bytes / 1024).toFixed(2) + " KB";
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
          console.warn("copy-packages-plugin: no outdir specified");
          return;
        }

        const outputPath = join(outDir, "packages");

        if (existsSync(inputDir)) {
          const originalSize = getDirSize(inputDir);
          console.log("Copying packages...");

          cpSync(inputDir, outputPath, { recursive: true });
          console.log(`  Copied packages\n  Total Size: ${formatSize(originalSize)}`);
        } else {
          console.warn(`Packages input not found: ${inputDir}`);
        }
      });
    },
  };
}
