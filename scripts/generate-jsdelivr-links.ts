import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const REPO = "sanoojes/Lucid-Lyrics";
const DIST_DIR = resolve(import.meta.dir, "../dist");

const IGNORE_PATTERNS = ["kuromoji/dict/", "jsdelivr.txt", ".DS_Store", "meta.json", "README.md"];

async function build() {
  console.log("Building...");
  execSync("bun run build", { stdio: "inherit" });

  const { Glob } = Bun;
  const glob = new Glob("**/*");
  const urls: string[] = [];

  for (const file of glob.scanSync({ cwd: DIST_DIR, onlyFiles: true })) {
    const normalizedFile = file.replace(/\\/g, "/");

    const isIgnored = IGNORE_PATTERNS.some(
      (pattern) => normalizedFile.includes(pattern) || normalizedFile === pattern,
    );

    if (isIgnored) continue;

    urls.push(`https://cdn.jsdelivr.net/gh/${REPO}@refs/heads/releases/latest/${normalizedFile}`);
  }

  const output = urls.join("\n") + "\n";
  const outputPath = join("jsdelivr.txt");

  await writeFile(outputPath, output, "utf-8");
  console.log(`Written ${urls.length} URLs to ${outputPath}`);
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
