import { logger } from '@/lib/logger.ts';
import type { AsyncStorage, PersistedClient } from '@tanstack/react-query-persist-client';

const DB_NAME = 'lyrics-db';
const STORE_NAME = 'data-store';
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDb(): Promise<IDBDatabase> {
  //   throw Error("no-idb"); // for testing
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);

    req.onupgradeneeded = () => {
      const upgradeDb = req.result;
      if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
        upgradeDb.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = () => {
      const conn = req.result;
      conn.onversionchange = () => {
        logger.trace('[IDB] version change - closing connection');
        conn.close();
        dbPromise = null;
      };
      resolve(conn);
    };

    req.onblocked = () => {
      logger.debug('[IDB] open blocked: another connection is holding the DB');
    };

    req.onerror = () => {
      const err = req.error;
      reject(err instanceof Error ? err : new Error(`IndexedDB open failed: ${String(err)}`));
      dbPromise = null;
    };
  });

  return dbPromise;
}

export const createIdbStorage = (): AsyncStorage<PersistedClient> => ({
  async getItem(key: string) {
    const db = await getDb();
    return new Promise<PersistedClient | undefined>((res, rej) => {
      const r = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      r.onsuccess = () => {
        logger.debug('Query Cache hit (IDB)');
        res(r.result as PersistedClient);
      };
      r.onerror = () => rej(r.error ?? new Error('getItem failed'));
    });
  },

  async setItem(key: string, value: PersistedClient) {
    return getDb()
      .then((db) => {
        if (!db) return;
        return new Promise<void>((resolve, reject) => {
          const req = db
            .transaction(STORE_NAME, 'readwrite')
            .objectStore(STORE_NAME)
            .put(value, key);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error ?? new Error('setItem failed'));
        });
      })
      .catch((err) => {
        logger.trace('[IDB] skipping setItem:', err);
      });
  },

  async removeItem(key: string) {
    return getDb()
      .then((db) => {
        if (!db) return;
        return new Promise<void>((resolve, reject) => {
          const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error ?? new Error('removeItem failed'));
        });
      })
      .catch((err) => {
        logger.trace('[IDB] skipping removeItem:', err);
      });
  },
});
