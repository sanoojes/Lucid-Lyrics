import { LyricsAPI } from "@/lib/api";
import { fetchUser } from "@/api/user";
import { fetchSpicy } from "@/api/spicy";
import { fetchSpotify } from "@/api/spotify";
import { logger } from "@/utils/logger";

const API = new LyricsAPI([
  {
    id: "user",
    fetch: fetchUser,
    cache: false,
  },
  {
    id: "spicy",
    fetch: fetchSpicy,
  },
  {
    id: "spotify",
    fetch: fetchSpotify,
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
