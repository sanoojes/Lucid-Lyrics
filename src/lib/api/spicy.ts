import { SPICY_APP_VERSION } from "@/constants";

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
      "SpicyLyrics-Version": SPICY_APP_VERSION,
      ...(auth && { "SpicyLyrics-WebAuth": auth }),
    },
    body: JSON.stringify({
      queries,
      client: { version: SPICY_APP_VERSION },
    }),
  });

  if (!response.ok) throw new Error(`Node ${baseUrl} failed`);
  return response.json();
}
