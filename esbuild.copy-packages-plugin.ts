import type { Plugin } from "esbuild";
import { existsSync, cpSync, statSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { transform } from "esbuild";

const JS_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

function isJsFile(filename: string): boolean {
  return JS_EXTENSIONS.some((ext) => filename.endsWith(ext));
}

async function copyAndMinify(srcDir: string, destDir: string): Promise<number> {
  let totalSize = 0;
  const items = readdirSync(srcDir);

  const promises: Promise<void>[] = [];
  const fileOps: { destPath: string; srcPath: string; size: number }[] = [];

  for (const item of items) {
    const srcPath = join(srcDir, item);
    const destPath = join(destDir, item);
    const stat = statSync(srcPath);

    if (!stat) continue;

    if (stat.isDirectory()) {
      if (!existsSync(destPath)) {
        cpSync(srcPath, destPath, { recursive: true });
      }
      promises.push(
        copyAndMinify(srcPath, destPath).then((size) => {
          totalSize += size;
        }),
      );
    } else {
      fileOps.push({ destPath, srcPath, size: Number(stat.size) });
    }
  }

  const fileResults = await Promise.all(
    fileOps.map(async ({ destPath, srcPath, size }) => {
      if (isJsFile(srcPath)) {
        const code = readFileSync(srcPath, "utf-8");
        const result = await transform(code, {
          minify: true,
          loader: srcPath.endsWith(".ts") || srcPath.endsWith(".tsx") ? "ts" : "js",
        });
        writeFileSync(destPath, result.code);
        return Buffer.byteLength(result.code, "utf-8");
      } else {
        cpSync(srcPath, destPath);
        return size;
      }
    }),
  );

  totalSize += fileResults.reduce((a, b) => a + b, 0);

  return totalSize;
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
      build.onEnd(async () => {
        const outDir = build.initialOptions.outdir;
        if (!outDir) {
          console.warn("copy-packages-plugin: no outdir specified");
          return;
        }

        const outputPath = join(outDir, "packages");

        if (existsSync(inputDir)) {
          console.log("Copying and minifying packages...");

          const packages = readdirSync(inputDir);

          for (const pkg of packages) {
            const pkgPath = join(inputDir, pkg);
            const stat = statSync(pkgPath);

            if (stat.isDirectory()) {
              const destPkgPath = join(outputPath, pkg);
              if (!existsSync(destPkgPath)) {
                const size = await copyAndMinify(pkgPath, destPkgPath);
                console.log(`  - ${pkg}: ${formatSize(size)}`);
              }
            } else {
              const destPkgPath = join(outputPath, pkg);
              if (isJsFile(pkg)) {
                const code = readFileSync(pkgPath, "utf-8");
                const result = await transform(code, {
                  minify: true,
                  loader: pkg.endsWith(".ts") || pkg.endsWith(".tsx") ? "ts" : "js",
                });
                writeFileSync(destPkgPath, result.code);
                console.log(`  - ${pkg}: ${formatSize(Buffer.byteLength(result.code, "utf-8"))}`);
              } else {
                cpSync(pkgPath, destPkgPath);
                console.log(`  - ${pkg}: ${formatSize(stat.size)}`);
              }
            }
          }

          console.log("  ! Copied and minified all packages");
        } else {
          console.warn(`Packages input not found: ${inputDir}`);
        }
      });
    },
  };
}
