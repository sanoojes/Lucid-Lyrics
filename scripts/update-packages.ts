import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { Buffer } from "node:buffer";
import { $ } from "bun";

type ModuleMeta = {
  name: string;
  version: string;
  url: string;
};

const JSDELIVR = "https://cdn.jsdelivr.net";

const DOWNLOAD_MODULES: ModuleMeta[] = [
  { name: "pinyin", version: "4.0.0", url: `${JSDELIVR}/npm/pinyin@4.0.0/+esm` },
  {
    name: "cyrillic-romanization",
    version: "1.1.8",
    url: `${JSDELIVR}/npm/cyrillic-romanization@1.1.8/+esm`,
  },
  {
    name: "greek-transliteration",
    version: "2.0.0",
    url: `${JSDELIVR}/npm/greek-transliteration@2.0.0/+esm`,
  },
  { name: "kuroshiro", version: "1.2.0", url: `${JSDELIVR}/npm/kuroshiro@1.2.0/+esm` },
];

const NPM_BASE_URL = "https://www.npmjs.com/package/";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function downloadModule(name: string, url: string): Promise<void> {
  process.stdout.write(`\x1b[36mFetching\x1b[0m ${name.padEnd(25)}`);

  const response = await fetch(url);
  if (!response.ok) {
    console.log(`\n\x1b[31mFailed to download ${name}: ${response.statusText}\x1b[0m`);
    throw new Error(`Failed to download ${name}: ${response.statusText}`);
  }

  const content = await response.text();
  const sizeBytes = Buffer.byteLength(content, "utf8");
  const formattedSize = formatBytes(sizeBytes);

  const packageDir = `packages`;
  if (!existsSync(packageDir)) {
    await mkdir(packageDir, { recursive: true });
  }

  const filePath = `${packageDir}/${name}.mjs`;
  await writeFile(filePath, content);

  console.log(`\x1b[90m${formattedSize.padStart(10)}\x1b[0m \x1b[32mDone\x1b[0m`);
}

function generateReadme(modules: ModuleMeta[]): string {
  const tableRows = modules
    .map((meta) => {
      const npmLink = `[npm](${NPM_BASE_URL}${meta.name})`;
      return `| ${meta.name} | ${meta.version} | ${npmLink} |`;
    })
    .join("\n");

  return `# Packages

This directory contains third-party modules used by this project.

## Modules

| Module | Version | npm |
|--------|---------|-----|
${tableRows}

## License & Copyright

All modules in this directory are **not created or owned** by this project.

- The original authors and maintainers of each respective module hold all rights, including copyright and intellectual property.
- Each module is subject to its own license as specified by its respective repository/authors.
- For license information, please refer to the original sources of each module.

**This project does not claim any ownership, rights, or authorship over these modules.**

For inquiries regarding specific modules, please contact their respective maintainers or consult their original repositories.
`;
}

async function main() {
  console.log(`\x1b[34mFound ${DOWNLOAD_MODULES.length} modules to download...\x1b[0m`);

  for (const mod of DOWNLOAD_MODULES) {
    await downloadModule(mod.name, mod.url);
  }

  console.log(`\n\x1b[36mGenerating README.md...\x1b[0m`);
  const readmeContent = generateReadme(DOWNLOAD_MODULES);
  const path = "packages/README.md";
  await writeFile(path, readmeContent);

  await $`bunx oxfmt ${path}`.quiet();

  console.log(`\x1b[32mGenerated and formatted README.md\x1b[0m`);
  console.log(`\x1b[32mAll tasks completed successfully!\x1b[0m`);
}

main().catch((err) => {
  console.error(`\n\x1b[31mError encountered:\x1b[0m`, err);
});
