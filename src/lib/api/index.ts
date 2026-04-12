import { del, get, set, update } from "idb-keyval";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import { createLogger } from "~/utils/logger";
import type { APIResponse, FetchOptions, Lyrics, LyricsHandler } from "~/lib/api/types";
import { processLyrics } from "~/language/processor";
import { $providers } from "~/stores";
import { lyricsStore } from "~/stores/idb";
import { setStorageStats } from "~/stores/storage";
import { $cache_settings } from "~/stores/dev";
import type { LyricsProviders } from "~/constants";

const log = createLogger("api:main");
const STATS_KEY = "__cache_stats__";

interface StorageStats {
  totalOriginal: number;
  totalCompressed: number;
  entryCount: number;
}

interface CachedLyrics {
  data: string | Lyrics;
  expiry: number;
  isCompressed: boolean;
  stats?: {
    originalSize: number;
    compressedSize: number;
    ratio: string;
  };
}

const getByteSize = (str: string): number => str.length * 2;

export class LyricsAPI {
  private _handlers: Map<string, LyricsHandler>;
  private _inFlight = new Map<string, Promise<APIResponse<Lyrics>>>();

  constructor(handlers: LyricsHandler[] = []) {
    this._handlers = new Map<string, LyricsHandler>(
      handlers.map((handler) => [handler.id, handler]),
    );
    this._initStorageStats();
  }

  private async _initStorageStats() {
    try {
      const stats = await get<StorageStats>(STATS_KEY, lyricsStore);
      setStorageStats(stats || { entryCount: 0, totalCompressed: 0, totalOriginal: 0 });
    } catch (err) {
      log.error("stats_init_failed", err);
    }
  }

  private async _updateStats(diff: Partial<StorageStats>): Promise<void> {
    try {
      await update<StorageStats>(
        STATS_KEY,
        (old) => ({
          entryCount: Math.max(0, (old?.entryCount || 0) + (diff.entryCount || 0)),
          totalCompressed: Math.max(0, (old?.totalCompressed || 0) + (diff.totalCompressed || 0)),
          totalOriginal: Math.max(0, (old?.totalOriginal || 0) + (diff.totalOriginal || 0)),
        }),
        lyricsStore,
      );
      const newStats = await get<StorageStats>(STATS_KEY, lyricsStore);
      setStorageStats(newStats || { entryCount: 0, totalCompressed: 0, totalOriginal: 0 });
    } catch (err) {
      log.error("stats_sync_failed", err);
    }
  }

  private _getKey(provider: string, options: FetchOptions): string {
    return `cache_${provider.toLowerCase()}_${options.id
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")}`;
  }

  private async _tryFetchWithProviders(options: FetchOptions): Promise<APIResponse<Lyrics>> {
    const order = $providers.get();
    const isLocalSong = options.type === "local";
    const source = options.type ?? "audio";

    for (let i = 0; i < order.length; i++) {
      const providerId = order[i];
      const handler = this._handlers.get(providerId);

      if (handler?.supports && !handler.supports.includes(source)) {
        if (i === order.length - 1 && !isLocalSong) {
          return { message: "This Content is Unsupported", status: "unsupported" };
        }
        log.debug(`skipping_unsupported`, { providerId, source });
        continue;
      }

      const cacheKey = this._getKey(providerId, options);
      log.debug(`trying_provider`, { options, providerId });
      const response = await this._fetch(providerId, options, cacheKey);

      if (response.status === "success" || response.status === "parse_error") {
        return response;
      }
    }

    if (!navigator.onLine) {
      return {
        message: "You're offline right now. We'll grab the lyrics once you're back online.",
        status: "error",
      };
    }

    if (isLocalSong) {
      return {
        message: "We couldn't find lyrics for this local file",
        status: "local_song",
      };
    }

    return {
      data: null,
      status: "missing_lyrics",
    };
  }

  private async _fetch<P extends LyricsProviders>(
    provider: P,
    options: FetchOptions,
    cacheKey: string,
  ): Promise<APIResponse<Lyrics>> {
    const isOffline = !navigator.onLine;
    const handler = this._handlers.get(provider);
    const shouldCache = handler?.cache !== false;

    if (shouldCache || isOffline) {
      try {
        const cached = await get<CachedLyrics>(cacheKey, lyricsStore);
        if (cached) {
          const isExpired = Date.now() > cached.expiry;

          if (!isExpired || isOffline) {
            let lyricsData: Lyrics | null = null;
            try {
              if (cached.isCompressed && typeof cached.data === "string") {
                const decompressed = decompressFromUTF16(cached.data);
                if (!decompressed) throw new Error("Decompression failed");
                lyricsData = JSON.parse(decompressed);
              } else {
                lyricsData = cached.data as Lyrics;
              }
            } catch (err) {
              log.error("cache_corrupt", err);
              if (!isOffline) await this._removeItemWithStats(cacheKey, cached);
            }

            if (lyricsData) {
              const needsRomanization =
                lyricsData.NeedsRomanization && !lyricsData.HasRomanizedText;

              if (!isOffline && needsRomanization) {
                try {
                  const reProcessed = await processLyrics(lyricsData);
                  await this._saveToCache(cacheKey, reProcessed);
                  return { data: reProcessed, status: "success" };
                } catch (err) {
                  log.error("reprocess_err", err);
                }
              }
              return { data: lyricsData, status: "success" };
            }
          } else {
            await this._removeItemWithStats(cacheKey, cached);
          }
        }
      } catch (err) {
        log.error("cache_read_err", err);
      }
    }

    if (isOffline) {
      return {
        message: "You're offline right now. We'll grab these lyrics once you're back online.",

        status: "error",
      };
    }

    if (!handler) {
      return {
        message: "We couldn't find the lyrics for this song.",
        status: "error",
      };
    }

    try {
      const response = await handler.fetch(options);
      if (response.status === "success" && response.data) {
        const processed = await processLyrics(response.data);
        if (shouldCache) {
          await this._saveToCache(cacheKey, processed);
        }
        return { ...response, data: processed };
      }
      return response;
    } catch {
      return {
        message: "Couldn't get Lyrics !",
        status: "error",
      };
    }
  }

  private async _saveToCache(cacheKey: string, data: Lyrics): Promise<void> {
    const ttlDays = $cache_settings.get().ttlDays;
    const expiry = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
    try {
      const existing = await get<CachedLyrics>(cacheKey, lyricsStore);
      const jsonString = JSON.stringify(data);
      const originalSize = getByteSize(jsonString);
      const compressedData = compressToUTF16(jsonString);

      if (compressedData) {
        const compressedSize = getByteSize(compressedData);
        const stats = {
          compressedSize,
          originalSize,
          ratio: ((compressedSize / originalSize) * 100).toFixed(2) + "%",
        };

        await set(
          cacheKey,
          { data: compressedData, expiry, isCompressed: true, stats },
          lyricsStore,
        );
        await this._updateStats({
          entryCount: existing ? 0 : 1,
          totalCompressed: compressedSize - (existing?.stats?.compressedSize || 0),
          totalOriginal: originalSize - (existing?.stats?.originalSize || 0),
        });
      }
    } catch (err) {
      log.error("save_fail", err);
    }
  }

  private async _removeItemWithStats(key: string, cachedEntry: CachedLyrics) {
    await del(key, lyricsStore);
    await this._updateStats({
      entryCount: -1,
      totalCompressed: -(cachedEntry.stats?.compressedSize || 0),
      totalOriginal: -(cachedEntry.stats?.originalSize || 0),
    });
  }

  async fetch(options: FetchOptions): Promise<APIResponse<Lyrics>> {
    const trackKey = `request_${(options.id || options.uri).toString().toLowerCase()}`;
    const existingRequest = this._inFlight.get(trackKey);

    if (existingRequest) {
      log.debug("request_collapsed", { trackKey });
      return existingRequest;
    }

    const requestPromise = this._tryFetchWithProviders(options);
    this._inFlight.set(trackKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this._inFlight.delete(trackKey);
    }
  }

  async clearExpiredCache(): Promise<void> {
    if (!navigator.onLine) return;
    try {
      let deletedOriginal = 0;
      let deletedCompressed = 0;
      let deletedCount = 0;

      await lyricsStore("readwrite", (store) => {
        return new Promise<void>((resolve, reject) => {
          const request = store.openCursor();
          const now = Date.now();

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

            if (cursor) {
              if (cursor.key !== STATS_KEY) {
                const entry = cursor.value as CachedLyrics;
                if (entry.expiry < now) {
                  deletedOriginal += entry.stats?.originalSize || 0;
                  deletedCompressed += entry.stats?.compressedSize || 0;
                  deletedCount++;
                  cursor.delete();
                }
              }
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => reject(request.error);
        });
      });

      if (deletedCount > 0) {
        await this._updateStats({
          entryCount: -deletedCount,
          totalCompressed: -deletedCompressed,
          totalOriginal: -deletedOriginal,
        });
      }
    } catch (err) {
      log.error("cleanup_err", err);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      await lyricsStore("readwrite", (store) => {
        return new Promise<void>((resolve, reject) => {
          const request = store.openCursor();

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

            if (cursor) {
              if (cursor.key !== STATS_KEY) {
                cursor.delete();
              }
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => reject(request.error);
        });
      });

      await update<StorageStats>(
        STATS_KEY,
        () => ({
          entryCount: 0,
          totalCompressed: 0,
          totalOriginal: 0,
        }),
        lyricsStore,
      );
    } catch (err) {
      log.error("clear_all_cache_err", err);
    }
  }

  async getStorageStats(): Promise<StorageStats> {
    const stats = await get<StorageStats>(STATS_KEY, lyricsStore);
    return stats || { entryCount: 0, totalCompressed: 0, totalOriginal: 0 };
  }

  register(handler: LyricsHandler) {
    this._handlers.set(handler.id, handler);
  }
}
