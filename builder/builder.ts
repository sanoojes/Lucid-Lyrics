import Logger from '@builder/logger.ts';
import { type CopyTarget, copyFilesPlugin } from '@builder/plugin/copyFilesPlugin.ts';
import { externalGlobalPlugin } from '@builder/plugin/externalGlobalPlugin.ts';
import { loggerPlugin } from '@builder/plugin/loggerPlugin.ts';
import { notifyClientPlugin } from '@builder/plugin/notifyClientPlugin.ts';
import { wrapWithLoader } from '@builder/plugin/wrapWithLoader.ts';
import { startWSServer } from '@builder/wsServer.ts';
import { parseArgs } from '@std/cli';
import { join } from '@std/path';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { type BuildOptions, build, context } from 'esbuild';
import { postCSSPlugin } from './plugin/postCSSPlugin.ts';

const EXTENSION_NAME = 'lucid-lyrics';
const EXTENSION_ENTRY_POINT = join(Deno.cwd(), 'src/index.tsx');
const JS_OUT_FILE_PATH = `dist/${EXTENSION_NAME}.js`;

const main = async () => {
  const { watch, minify, reload, copyToSpice } = parseArgs(Deno.args, {
    boolean: ['watch', 'minify', 'reload', 'copyToSpice'],
    default: { watch: false, minify: false, reload: false, copyToSpice: false },
    alias: { w: 'watch', m: 'minify', r: 'reload', cs: 'copyToSpice' },
  });

  let copyTargets: CopyTarget[] = [];

  if (watch) {
    startWSServer();
  }

  if ((watch || reload) && copyToSpice) {
    const isWindows = Deno.build.os === 'windows';
    const HOME_PATH = isWindows
      ? Deno.env.get('APPDATA')
      : join(Deno.env.get('HOME') ?? '/home/user', '.config');

    if (!HOME_PATH) {
      Logger.error('Home path could not be determined. Aborting.');
      Deno.exit(1);
    }

    const SPICETIFY_PATH = join(HOME_PATH, 'spicetify');
    const EXTENSION_PATH = join(SPICETIFY_PATH, 'Extensions');

    copyTargets = [
      {
        from: JS_OUT_FILE_PATH,
        to: join(EXTENSION_PATH, `${EXTENSION_NAME}.js`),
      },
    ];

    if (watch) {
      const spotifyAppsPath = isWindows ? join(HOME_PATH, 'Spotify', 'Apps') : '/opt/spotify/Apps';

      copyTargets.push({
        from: JS_OUT_FILE_PATH,
        to: join(spotifyAppsPath, `xpui/extensions/${EXTENSION_NAME}.js`),
      });
    }
  }

  const buildOptions: BuildOptions = {
    bundle: true,
    entryPoints: [EXTENSION_ENTRY_POINT],
    outfile: JS_OUT_FILE_PATH,
    treeShaking: true,
    minify,
    format: 'esm',
    legalComments: 'external',
    external: ['react', 'react-dom'],
    jsx: 'transform',
    plugins: [
      loggerPlugin(EXTENSION_NAME),
      postCSSPlugin({
        plugins: [
          autoprefixer(),
          cssnano({
            preset: 'default',
          }),
        ],
      }),
      wrapWithLoader(EXTENSION_NAME),
      externalGlobalPlugin({
        react: 'Spicetify.React',
        'react-dom': 'Spicetify.ReactDOM',
        'react/jsx-runtime': 'Spicetify.ReactJSX',
        'react-dom/client': 'Spicetify.ReactDOM',
        'react-dom/server': 'Spicetify.ReactDOMServer',
      }),

      copyFilesPlugin(copyTargets),
      ...(watch ? [notifyClientPlugin()] : []),
    ],
  };

  if (watch) {
    const ctx = await context(buildOptions);
    await ctx.watch();
    Logger.info('Watching for changes...');
  } else {
    await build(buildOptions);
  }

  if (reload || (watch && copyToSpice)) {
    const runSpicetifyCommand = async (args: string[]) => {
      const command = new Deno.Command('spicetify', { args });
      const { code, stderr } = await command.output();
      const err = new TextDecoder().decode(stderr).trim();
      const log = (msg: string) => Logger.info(`[Spicetify] ${msg}`);

      if (code === 0) {
        log(`✅ '${args.join(' ')}' succeeded.`);
      } else {
        log(`❌ '${args.join(' ')}' failed (code ${code})${err ? `:\n${err}` : ''}`);
      }
    };

    const LIVERELOAD_JS_PATH = join(Deno.cwd(), 'builder/client/liveReload.js');
    const SPICETIFY_EXTENSIONS_PATH = join(
      Deno.env.get('SPICETIFY_CONFIG') ??
        join(
          Deno.env.get(Deno.build.os === 'windows' ? 'APPDATA' : 'HOME') ?? Deno.cwd(), // fail safe
          '.config',
          'spicetify'
        ),
      'Extensions'
    );

    await runSpicetifyCommand([
      'config',
      'extensions',
      `${EXTENSION_NAME}.js`,
      `liveReload.js${!watch ? '-' : ''}`,
    ]);

    if (watch) {
      const liveReloadDest = join(SPICETIFY_EXTENSIONS_PATH, 'liveReload.js');
      await Deno.copyFile(LIVERELOAD_JS_PATH, liveReloadDest);
      Logger.debug(`Copied: ${LIVERELOAD_JS_PATH} → ${liveReloadDest}`);
    }

    await runSpicetifyCommand(['apply']);
  }
};

main().catch((e) => {
  Logger.error('A fatal error occurred during the build process:', e);
  Deno.exit(1);
});
