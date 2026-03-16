import { readdir } from "node:fs/promises";

async function generateReadme(): Promise<void> {
  const targetDir = process.argv[2] || ".";
  const entries = await readdir(targetDir, { withFileTypes: true });

  const versions = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("v"))
    .map((entry) => entry.name);

  versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }));

  let readmeContent = `# Project Releases

> **Note:** This branch (\`releases\`) is automatically generated and maintained by GitHub Actions. It contains the final, compiled extension files. Do not commit changes directly to this branch.
 
## Latest Version
- **[latest](./latest)**

## All Versions
`;

  if (versions.length === 0) {
    readmeContent += `- No v* releases found yet.\n`;
  } else {
    for (const version of versions) {
      readmeContent += `- [${version}](./${version})\n`;
    }
  }

  const outputPath = `${targetDir}/README.md`;
  await Bun.write(outputPath, readmeContent);

  console.log(`Successfully generated ${outputPath}`);
}

generateReadme().catch((err) => {
  console.error("Failed to generate README:", err);
  process.exit(1);
});
