import { join } from "node:path";

const REMOTE_URL =
  "https://raw.githubusercontent.com/Spikerko/spicy-lyrics/main/src/utils/objpack.ts";
const LOCAL_PATH = join(import.meta.dirname, "../src/lib/spicy/objpack.ts");

async function syncObjpack() {
  const response = await fetch(REMOTE_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch remote file: ${response.status} ${response.statusText}`);
  }

  const remoteContent = await response.text();
  const localFile = Bun.file(LOCAL_PATH);
  let localContent = "";

  if (await localFile.exists()) {
    localContent = await localFile.text();
  }

  if (localContent === remoteContent) {
    console.log("Up to date.");
    return;
  }

  await Bun.write(LOCAL_PATH, remoteContent);
  console.log("Updated.");
}

syncObjpack();
