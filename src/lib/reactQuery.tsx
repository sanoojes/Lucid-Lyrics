// deno-lint-ignore-file require-await
import { createIdbStorage, getDb } from '@/lib/idbStorage.ts';
import { logger } from '@logger';
// import appStore from '@/store/appStore.ts';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type AsyncStorage,
  type PersistedClient,
  persistQueryClient,
} from '@tanstack/react-query-persist-client';
import { compress, decompress } from 'lz-string';

// const isDevMode = appStore.getState().isDevMode;
// const time = isDevMode ? 0 : Infinity;
const time = Infinity;
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: time, gcTime: time } },
});

(() => {
  let isLocalStorage = false;

  try {
    getDb();
  } catch (e) {
    logger.warn('[Lucid-Lyrics-Cache] IndexedDB not available, falling back to localStorage.', e);

    isLocalStorage = true;
  }

  const localStorageAsyncStorage: AsyncStorage<PersistedClient> = {
    getItem: async (key) => {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const parsedItem = JSON.parse(decompress(item));
      logger.debug('Query Cache hit (LS)');
      return parsedItem;
    },
    setItem: async (key, value) => {
      localStorage.setItem(key, compress(JSON.stringify(value)));
    },
    removeItem: async (key) => {
      localStorage.removeItem(key);
    },
  };

  const persister = createAsyncStoragePersister({
    storage: isLocalStorage ? localStorageAsyncStorage : (createIdbStorage() as any),
    key: 'lucid:lyrics-data',
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24 * (isLocalStorage ? 7 : 14), // 7 or 14 days
  });
})();

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
