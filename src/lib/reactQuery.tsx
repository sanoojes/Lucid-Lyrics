import { createIdbStorage, getDb } from '@/lib/idbStorage.ts';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type AsyncStorage,
  type PersistedClient,
  persistQueryClient,
} from '@tanstack/react-query-persist-client';
import { compress, decompress } from 'lz-string';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

(() => {
  let isLocalStorage = false;

  try {
    getDb();
  } catch (e) {
    console.warn('[Lucid-Lyrics-Cache] IndexedDB not available, falling back to localStorage.', e);

    isLocalStorage = true;
  }

  const localStorageAsyncStorage: AsyncStorage<PersistedClient> = {
    getItem: async (key) => {
      const item = window.localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(decompress(item));
    },
    setItem: async (key, value) => {
      window.localStorage.setItem(key, compress(JSON.stringify(value)));
    },
    removeItem: async (key) => {
      window.localStorage.removeItem(key);
    },
  };

  const persister = createAsyncStoragePersister({
    storage: isLocalStorage ? localStorageAsyncStorage : (createIdbStorage() as any),
    key: 'lucid-lyrics-data-store',
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24 * (isLocalStorage ? 1 : 14), // 1 or 14 days
  });
})();

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
