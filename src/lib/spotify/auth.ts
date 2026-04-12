import { wait } from "~/lib/dom/wait";

type TokenProviderResponse = {
  accessToken: string;
  expiresAtTime: number;
  tokenType: "Bearer";
};

export const getAuthToken = (() => {
  let cache: TokenProviderResponse | undefined;
  let inflight: Promise<string> | undefined;

  return async (): Promise<string> => {
    if (cache && cache.expiresAtTime - Date.now() > 2000) {
      return cache.accessToken;
    }

    if (inflight) return inflight;

    inflight = (async () => {
      const CosmosAsync = await wait(() => Spicetify.CosmosAsync);
      const Platform = await wait(() => Spicetify.Platform);

      try {
        cache = await CosmosAsync.get("sp://oauth/v2/token");
      } catch (e: any) {
        if (e.message?.includes("Resolver not found") && Platform.Session) {
          cache = {
            accessToken: Platform.Session.accessToken,
            expiresAtTime: Platform.Session.accessTokenExpirationTimestampMs,
            tokenType: "Bearer",
          };
        }
      } finally {
        inflight = undefined;
      }

      if (!cache) throw new Error("Could not retrieve Spotify Access Token");
      return cache.accessToken;
    })();

    return inflight;
  };
})();
