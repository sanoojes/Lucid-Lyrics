import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { resolve, join, extname } from "node:path";

const REPO = "sanoojes/Lucid-Lyrics";
const DIST_DIR = resolve(import.meta.dir, "../dist");

const IGNORE_PATTERNS = ["kuromoji/dict/", "jsdelivr.txt", ".DS_Store", "meta.json", "README.md"];

async function build() {
  console.log("Building...");
  execSync("bun run build", { stdio: "inherit" });

  const { Glob } = Bun;
  const glob = new Glob("**/*");

  const groups: Record<string, string[]> = {};

  for (const file of glob.scanSync({ cwd: DIST_DIR, onlyFiles: true })) {
    const normalizedFile = file.replace(/\\/g, "/");

    const isIgnored = IGNORE_PATTERNS.some(
      (pattern) => normalizedFile.includes(pattern) || normalizedFile === pattern,
    );

    if (isIgnored) continue;

    const ext = extname(normalizedFile) || "no-extension";
    if (!groups[ext]) groups[ext] = [];

    groups[ext].push(
      `https://cdn.jsdelivr.net/gh/${REPO}@refs/heads/releases/latest/${normalizedFile}`,
    );
  }

  let output = "";
  let totalCount = 0;

  for (const [ext, urls] of Object.entries(groups)) {
    totalCount += urls.length;
    output += `// --- ${ext.toUpperCase()} FILES ---\n`;

    for (let i = 0; i < urls.length; i++) {
      output += urls[i] + "\n";
      if ((i + 1) % 10 === 0 && i !== urls.length - 1) {
        output += "\n";
      }
    }
    output += "\n";
  }

  const outputPath = join("jsdelivr.txt");
  await writeFile(outputPath, output.trim() + "\n", "utf-8");

  console.log(`Written ${totalCount} URLs to ${outputPath}`);
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
