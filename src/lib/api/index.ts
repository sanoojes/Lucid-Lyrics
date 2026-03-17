import { get, set, del, update } from "idb-keyval";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import { createLogger } from "@/utils/logger";
import type { FetchOptions, Lyrics, LyricsHandler, APIResponse } from "@/lib/api/types";
import { processLyrics } from "@/language/processor";
import { getModule } from "@/lib/dom/load";
import { $providers } from "@/stores";
import { lyricsStore } from "@/stores/idb";
import { setStorageStats } from "@/stores/storage";
import { $cache_settings } from "@/stores/dev";
import type { LyricsProviders } from "@/constants";

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
      setStorageStats(stats || { totalOriginal: 0, totalCompressed: 0, entryCount: 0 });
    } catch (err) {
      log.error("stats_init_failed", err);
    }
  }

  private async _updateStats(diff: Partial<StorageStats>): Promise<void> {
    try {
      await update<StorageStats>(
        STATS_KEY,
        (old) => ({
          totalOriginal: Math.max(0, (old?.totalOriginal || 0) + (diff.totalOriginal || 0)),
          totalCompressed: Math.max(0, (old?.totalCompressed || 0) + (diff.totalCompressed || 0)),
          entryCount: Math.max(0, (old?.entryCount || 0) + (diff.entryCount || 0)),
        }),
        lyricsStore,
      );
      const newStats = await get<StorageStats>(STATS_KEY, lyricsStore);
      setStorageStats(newStats || { totalOriginal: 0, totalCompressed: 0, entryCount: 0 });
    } catch (err) {
      log.error("stats_sync_failed", err);
    }
  }

  private _getKey(provider: string, options: FetchOptions): string {
    const { id } = options;
    return `cache_${provider.toLowerCase()}_${id
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")}`;
  }

  private async _tryFetchWithProviders(options: FetchOptions): Promise<APIResponse<Lyrics>> {
    const order = $providers.get();

    for (const providerId of order) {
      const cacheKey = this._getKey(providerId, options);

      log.debug(`trying_provider`, { providerId, id: options.id });

      const response = await this._fetch(providerId, options, cacheKey);

      if (
        response.status === "success" ||
        !navigator.onLine ||
        response.error?.code === "OFFLINE"
      ) {
        return response;
      }

      if (response.error?.code === "PARSE_ERROR") {
        return response;
      }
    }

    return {
      status: "missing_lyrics",
      data: null,
    };
  }

  private async _fetch<P extends LyricsProviders>(
    provider: P,
    options: FetchOptions,
    cacheKey: string,
  ): Promise<APIResponse<Lyrics>> {
    const { forceRefresh = false } = options;
    const isOffline = !navigator.onLine;
    const handler = this._handlers.get(provider);
    const shouldCache = handler?.cache !== false;

    if (!forceRefresh && shouldCache) {
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
              const missingLang = !lyricsData.UsedFranc;

              if (!isOffline && (needsRomanization || missingLang)) {
                try {
                  const franc = missingLang ? await getModule("franc").catch(() => null) : null;
                  if (needsRomanization || (missingLang && franc)) {
                    const reProcessed = await processLyrics(lyricsData);
                    await this._saveToCache(cacheKey, reProcessed);
                    return { status: "success", data: reProcessed };
                  }
                } catch (err) {
                  log.error("reprocess_err", err);
                }
              }
              return { status: "success", data: lyricsData };
            }
          } else {
            await this._removeItemWithStats(cacheKey, cached);
          }
        }
      } catch (err) {
        log.error("cache_read_err", err);
      }
    }

    if (isOffline)
      return {
        status: "error",
        data: null,
        error: {
          code: "OFFLINE",
          message: "You're offline right now. We'll grab these lyrics once you're back online.",
        },
      };

    if (!handler)
      return {
        status: "error",
        data: null,
        error: {
          code: "HANDLER_NOT_FOUND",
          message: "We couldn't find the lyrics for this song.",
        },
      };

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
        status: "error",
        data: null,
        error: {
          code: "FETCH_FAILED",
          message: "Couldn't get Lyrics !",
        },
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
          originalSize,
          compressedSize,
          ratio: ((compressedSize / originalSize) * 100).toFixed(2) + "%",
        };

        await set(
          cacheKey,
          { data: compressedData, expiry, isCompressed: true, stats },
          lyricsStore,
        );
        await this._updateStats({
          totalOriginal: originalSize - (existing?.stats?.originalSize || 0),
          totalCompressed: compressedSize - (existing?.stats?.compressedSize || 0),
          entryCount: existing ? 0 : 1,
        });
      }
    } catch (err) {
      log.error("save_fail", err);
    }
  }

  private async _removeItemWithStats(key: string, cachedEntry: CachedLyrics) {
    await del(key, lyricsStore);
    await this._updateStats({
      totalOriginal: -(cachedEntry.stats?.originalSize || 0),
      totalCompressed: -(cachedEntry.stats?.compressedSize || 0),
      entryCount: -1,
    });
  }

  async fetch(options: FetchOptions): Promise<APIResponse<Lyrics>> {
    const trackKey = `request_${options.id.toString().toLowerCase()}`;
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
          totalOriginal: -deletedOriginal,
          totalCompressed: -deletedCompressed,
          entryCount: -deletedCount,
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
          totalOriginal: 0,
          totalCompressed: 0,
          entryCount: 0,
        }),
        lyricsStore,
      );
    } catch (err) {
      log.error("clear_all_cache_err", err);
    }
  }

  async getStorageStats(): Promise<StorageStats> {
    const stats = await get<StorageStats>(STATS_KEY, lyricsStore);
    return stats || { totalOriginal: 0, totalCompressed: 0, entryCount: 0 };
  }

  register(handler: LyricsHandler) {
    this._handlers.set(handler.id, handler);
  }
}
