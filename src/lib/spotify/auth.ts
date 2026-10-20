import { wait } from "~/lib/dom/wait";

export const getAuthToken = (() => {
  let cache: { token: string; expires: number } | undefined;
  let inflight: Promise<string> | undefined;

  return async (): Promise<string> => {
    if (cache && cache.expires - Date.now() > 5000) {
      return cache.token;
    }

    if (inflight) return inflight;

    inflight = (async () => {
      try {
        const Platform = await wait(() => Spicetify.Platform);

        const auth = Platform?.AuthorizationAPI;
        if (auth) {
          let t = auth.getState?.()?.token;
          if (
            !t?.accessToken ||
            (t.accessTokenExpirationTimestampMs &&
              t.accessTokenExpirationTimestampMs - Date.now() < 5000)
          ) {
            t = await auth._tokenProvider?.getToken();
          }

          if (typeof t?.accessToken === "string" && t.accessToken) {
            cache = {
              token: t.accessToken,
              expires: t.accessTokenExpirationTimestampMs ?? Date.now() + 3600_000,
            };
          }
        }

        if (!cache) {
          const CosmosAsync = await wait(() => Spicetify.CosmosAsync);
          const res = await CosmosAsync.get("sp://oauth/v2/token").catch(() => Platform?.Session);
          const token = res?.accessToken;
          const expires = res?.expiresAtTime ?? res?.accessTokenExpirationTimestampMs;

          if (typeof token === "string" && token) {
            cache = {
              token,
              expires: typeof expires === "number" ? expires : Date.now() + 3600_000,
            };
          }
        }

        if (!cache?.token) {
          throw new Error("Could not retrieve Spotify Access Token");
        }

        return cache.token;
      } finally {
        inflight = undefined;
      }
    })();

    return inflight;
  };
})();
