import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin, PluginBuild, BuildResult } from "esbuild";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
};

export interface SaveMetafileOptions {
  filepath?: string;
}

export const saveMetafilePlugin = (options: SaveMetafileOptions = {}): Plugin => ({
  name: "save-metafile",
  setup(build: PluginBuild) {
    build.initialOptions.metafile = true;

    build.onEnd(async (result: BuildResult) => {
      if (result.errors.length > 0) return;

      if (result.metafile) {
        let targetDir = "dist";
        if (build.initialOptions.outfile) {
          targetDir = path.dirname(build.initialOptions.outfile);
        } else if (build.initialOptions.outdir) {
          targetDir = build.initialOptions.outdir;
        }

        const filepath = options.filepath || path.resolve(process.cwd(), targetDir, "meta.json");

        try {
          await fs.mkdir(path.dirname(filepath), { recursive: true });

          await fs.writeFile(filepath, JSON.stringify(result.metafile, null, 2));

          console.log(`${colors.green}Metafile saved to: ${filepath}`);
        } catch (error) {
          console.error("Failed to save metafile:", error);
        }
      }
    });
  },
});
