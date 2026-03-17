type SelectOptions = {
  urls: string[];
  path: string;
  healthEndpoint?: string;
  maxRetries?: number;
  backoffMs?: number;
};

const API_CACHE = new Map<string, string>();

function getUrlsHash(urls: string[]): string {
  return [...urls].sort().join("|");
}

export async function fetchWith(
  req: RequestInit,
  { urls, path, healthEndpoint = "/health", maxRetries = 3, backoffMs = 500 }: SelectOptions,
): Promise<Response> {
  const cacheKey = getUrlsHash(urls);
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      let baseUrl = API_CACHE.get(cacheKey);

      if (!baseUrl) {
        baseUrl = await selectApi(urls, healthEndpoint);
        API_CACHE.set(cacheKey, baseUrl);
      }

      const response = await fetch(baseUrl + path, req);

      if (!response.ok && response.status >= 500) {
        throw new Error(`Server Error: ${response.status}`);
      }

      return response;
    } catch (err) {
      API_CACHE.delete(cacheKey);

      attempt++;
      if (attempt > maxRetries) throw err;

      const delay = backoffMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Failed to fetch after retries");
}

async function selectApi(urls: string[], healthEndpoint: string): Promise<string> {
  if (!urls.length) throw new Error("No APIs provided");

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const cleanUrl = url.replace(/\/$/, "");
      const res = await fetch(`${cleanUrl}${healthEndpoint}`, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) return url;
    } catch {
      continue;
    }
  }

  throw new Error("None of the APIs are reachable");
}
