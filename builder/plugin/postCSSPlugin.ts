import { basename, extname } from '@std/path';
import type { OnLoadArgs, OnLoadResult, OnResolveArgs, OnResolveResult, Plugin } from 'esbuild';
import postcss, { type AcceptedPlugin } from 'postcss';

interface PostCSSPluginOptions {
  plugins?: AcceptedPlugin[];
  rootDir?: string;
  inject?: boolean;
}

export function postCSSPlugin(
  options: PostCSSPluginOptions = { plugins: [], inject: true }
): Plugin {
  return {
    name: 'postcss',
    setup(build) {
      build.onResolve(
        { filter: /\.css$/, namespace: 'file' },
        async (args: OnResolveArgs): Promise<OnResolveResult> => {
          const resolution = await build.resolve(args.path, {
            resolveDir: args.resolveDir,
            kind: args.kind,
          });

          if (resolution.errors.length > 0) {
            return { errors: resolution.errors };
          }

          return {
            path: resolution.path,
            namespace: 'postcss',
            watchFiles: [resolution.path],
          };
        }
      );

      build.onLoad(
        { filter: /\.css$/, namespace: 'postcss' },
        async (args: OnLoadArgs): Promise<OnLoadResult> => {
          const sourceFullPath = args.path;
          const sourceExt = extname(sourceFullPath);
          const sourceBaseName = basename(sourceFullPath, sourceExt);

          try {
            const css = await Deno.readTextFile(sourceFullPath);
            const result = await postcss(options.plugins || []).process(css, {
              from: sourceFullPath,
              to: `${sourceBaseName}.css`,
              map: build.initialOptions.sourcemap ? { inline: false, annotation: false } : false,
            });

            const escapedCSS = result.css
              .replace(/\\/g, '\\\\')
              .replace(/`/g, '\\`')
              .replace(/\$\{/g, '\\${');

            let contents: string;

            if (options.inject !== false) {
              contents = `if (typeof document !== "undefined") {
  const styleId = "lucid-lyrics-${sourceBaseName}";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = \`${escapedCSS}\`;
    document.head.appendChild(style);
  }
}`;
            } else {
              contents = `export default \`${escapedCSS}\`;`;
            }

            return {
              contents,
              loader: 'js',
              watchFiles: [sourceFullPath],
            };
          } catch (err: any) {
            return {
              errors: [
                {
                  text: err.message || String(err),
                  location:
                    err.line && err.column
                      ? {
                          file: sourceFullPath,
                          line: err.line,
                          column: err.column,
                        }
                      : undefined,
                },
              ],
            };
          }
        }
      );
    },
  };
}
