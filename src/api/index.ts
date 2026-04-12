import { LyricsAPI } from "~/lib/api";
import { fetchAMLL } from "~/api/amll";
import { fetchUser } from "~/api/user";
import { fetchSpicy } from "~/api/spicy";
import { fetchLRCLIB } from "~/api/lrclib";
import { fetchSpotify } from "~/api/spotify";
import { logger } from "~/utils/logger";

const API = new LyricsAPI([
  {
    cache: false,
    fetch: fetchUser,
    id: "user",
    supports: ["local", "audio"],
  },
  {
    fetch: fetchSpicy,
    id: "spicy",
    supports: ["audio"],
  },
  {
    fetch: fetchAMLL,
    id: "amll",
    supports: ["audio"],
  },
  {
    fetch: fetchSpotify,
    id: "spotify",
    supports: ["audio"],
  },
  {
    fetch: fetchLRCLIB,
    id: "lrclib",
    supports: ["local", "audio"],
  },
]);

(() => {
  try {
    API.clearExpiredCache();
  } catch (e) {
    logger.error("api_clear_cache_failed:", e);
  }
})();

export default API;
