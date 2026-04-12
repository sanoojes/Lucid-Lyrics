import { rolldown } from "rolldown";
import isolatedDecl from "unplugin-isolated-decl/rolldown";

async function build() {
  const bundle = await rolldown({
    input: "src/index.ts",
    plugins: [isolatedDecl()],
    resolve: {
      alias: {
        "~": "./src",
      },
    },
  });

  await bundle.write({
    dir: "dist",
    format: "esm",
    minify: true,
    sourcemap: true,
  });
}

build();
