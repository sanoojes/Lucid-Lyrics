import { LyricsAPI } from "@/lib/api";
import { fetchAMLL } from "@/api/amll";
import { fetchUser } from "@/api/user";
import { fetchSpicy } from "@/api/spicy";
import { fetchLRCLIB } from "@/api/lrclib";
import { fetchSpotify } from "@/api/spotify";
import { logger } from "@/utils/logger";

const API = new LyricsAPI([
  {
    id: "user",
    fetch: fetchUser,
    cache: false,
    supports: ["local", "audio"],
  },
  {
    id: "spicy",
    fetch: fetchSpicy,
    supports: ["audio"],
  },
  {
    id: "amll",
    fetch: fetchAMLL,
    supports: ["audio"],
  },
  {
    id: "spotify",
    fetch: fetchSpotify,
    supports: ["audio"],
  },
  {
    id: "lrclib",
    fetch: fetchLRCLIB,
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
