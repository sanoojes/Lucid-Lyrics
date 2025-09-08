import Logger from '@builder/logger.ts';
import type { Plugin } from 'esbuild';

export function wrapWithLoader(app_name: string): Plugin {
  app_name = app_name.replace(/-/g, '_');

  return {
    name: 'wrap-with-loader',
    setup(build) {
      const outfile = build.initialOptions.outfile;

      if (!outfile) {
        Logger.warn('No outfile specified, skipping js wrapping.');
        return;
      }

      build.onEnd(async (res) => {
        try {
          if (res.errors.length > 0) return;

          const path = outfile;
          const code = await Deno.readTextFile(path);

          const wrappedCode = `(async function(){if(window.__${app_name}_is_loaded)return;window.__${app_name}_is_loaded=1;(function ${app_name}Main(){if(!Spicetify.React||!Spicetify.ReactDOM||!Spicetify.Platform||!Spicetify.Player){setTimeout(${app_name}Main,100);return;}${code}})();})();`;

          await Deno.writeTextFile(path, wrappedCode);
        } catch (e) {
          Logger.error('Error during wrap-with-loader:', e);
        }
      });
    },
  };
}
