import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  platform: "browser",
  minify: true,
  sourcemap: "hidden",
  dts: true,
  clean: true,
});
