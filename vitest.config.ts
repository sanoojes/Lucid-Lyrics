import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
      "@root": resolve(__dirname, "."),
    },
  },

  test: {
    environment: "happy-dom",
    include: [
      "**/test/**/*.{test,spec}.{ts,js,tsx,jsx}",
      "**/tests/**/*.{test,spec}.{ts,js,tsx,jsx}",
    ],
    projects: ["packages/*/vitest.config.ts"],
  },
});
