import { dirname, resolve } from 'jsr:@std/path';
import Logger from '@builder/logger.ts';
import type { Plugin } from 'esbuild';

export type CopyTarget = {
  from: string;
  to: string;
};

export function copyFilesPlugin(copyTargets: CopyTarget[]): Plugin {
  return {
    name: 'copy-files-plugin',
    setup(build) {
      build.onEnd(async (res) => {
        if (res.errors.length > 0) return;

        for (const { from, to } of copyTargets) {
          const fromPath = resolve(from);
          const toPath = resolve(to);
          const targetDir = dirname(toPath);

          try {
            await Deno.mkdir(targetDir, { recursive: true });
            await Deno.copyFile(fromPath, toPath);
            Logger.debug(`Copied: ${fromPath} → ${toPath}`);
          } catch (error) {
            Logger.error(`Failed to copy ${fromPath} to ${toPath}:`, error);
          }
        }
      });
    },
  };
}
