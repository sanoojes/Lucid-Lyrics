import { readdir } from "node:fs/promises";

async function generateReadme(): Promise<void> {
  const targetDir = process.argv[2] || ".";
  const entries = await readdir(targetDir, { withFileTypes: true });

  const versions = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("v"))
    .map((entry) => entry.name);

  // Sorts versions descending (e.g., v10.0.0, v2.0.0, v1.0.0)
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

  const readmePath = `${targetDir}/README.md`;
  await Bun.write(readmePath, readmeContent);

  if (versions.length > 0) {
    const latestVersion = versions[0];
    const versionJsonPath = `${targetDir}/version.json`;
    const versionJsonPath2 = `${targetDir}/latest/version.json`;

    const versionData = JSON.stringify({
      version: latestVersion,
      latest: latestVersion,
    });

    await Bun.write(versionJsonPath, versionData);
    await Bun.write(versionJsonPath2, versionData);
    console.log(`Successfully generated ${versionJsonPath} (${latestVersion})`);
  }

  console.log(`Successfully generated ${readmePath}`);
}

generateReadme().catch((err) => {
  console.error("Failed to generate files:", err);
  process.exit(1);
});
