import Logger from '@builder/logger.ts';
import { reloadWSClients } from '@builder/wsServer.ts';
import type { BuildResult, Plugin } from 'esbuild';

export function notifyClientPlugin(): Plugin {
  return {
    name: 'notify-client-plugin',
    setup(build) {
      build.onEnd((result: BuildResult) => {
        if (result.errors.length > 0) {
          Logger.warn('[NotifyClientPlugin] Build failed, skipping client notification.');
          return;
        }

        try {
          const { outfile } = build.initialOptions;

          if (!outfile) {
            Logger.warn(
              "[NotifyClientPlugin] No 'outfile' configured in esbuild options, cannot notify."
            );
            return;
          }

          reloadWSClients('reload');
          Logger.info(`[NotifyClientPlugin] Notified clients for a full page reload.`);
        } catch (e) {
          Logger.error(
            '[NotifyClientPlugin] Error during client notification:',
            e instanceof Error ? e.stack || e.message : String(e)
          );
        }
      });
    },
  };
}
