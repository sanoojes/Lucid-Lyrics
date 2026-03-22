import { SPICY_APP_VERSION } from "@/constants";
import { createLogger } from "@/utils/logger";

let version = SPICY_APP_VERSION;
const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
(async () => {
  const log = createLogger("spicy:get-version");
  try {
    const response = await fetch("https://api.spicylyrics.org/version");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const newVer = (await response.text()).trim();
    if (semverRegex.test(newVer)) {
      version = newVer;
      log.info("updated_to", newVer);
    } else {
      throw new Error(`Invalid SemVer: "${version}"`);
    }
  } catch (error) {
    version = SPICY_APP_VERSION;
    log.error(`failed_to_fetch`, error);
  }
})();

export type SpicyQuery = {
  operation: string;
  variables: Record<string, any>;
};

const NODES = [
  "https://api.spicylyrics.org",
  "https://coregateway.spicylyrics.org",
  "https://lcgateway.spikerko.org",
];

let activeUrl = NODES[0];

export async function sendSpicyRequest(queries: SpicyQuery[], authHeader?: string): Promise<any> {
  try {
    return await executeFetch(activeUrl, queries, authHeader);
  } catch {
    for (const url of NODES) {
      if (url === activeUrl) continue;

      try {
        const result = await executeFetch(url, queries, authHeader);
        activeUrl = url;
        return result;
      } catch {
        continue;
      }
    }
  }

  throw new Error("All nodes are currently unreachable");
}

async function executeFetch(baseUrl: string, queries: SpicyQuery[], auth: string | undefined) {
  const response = await fetch(`${baseUrl}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "SpicyLyrics-Version": version,
      ...(auth && { "SpicyLyrics-WebAuth": auth }),
    },
    body: JSON.stringify({
      queries,
      client: { version },
    }),
  });

  if (!response.ok) throw new Error(`Node ${baseUrl} failed`);
  return response.json();
}
