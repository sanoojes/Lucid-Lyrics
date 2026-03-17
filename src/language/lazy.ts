import { getModule } from "@/lib/dom/load";

type ModuleName = Parameters<typeof getModule>[0];

interface LazyModule<T> {
  get: () => Promise<T>;
}

function createLazyModuleLoader<T>(
  name: ModuleName,
  initializer: (mod: Awaited<ReturnType<typeof getModule<typeof name>>>) => T | Promise<T>,
): LazyModule<T> {
  let cached: T | null = null;
  let initPromise: Promise<T> | null = null;

  const load = async (): Promise<T> => {
    const mod = await getModule(name);
    cached = await initializer(mod);
    return cached;
  };

  initPromise = load().catch((err) => {
    initPromise = null;
    throw err;
  });

  return {
    get: async (): Promise<T> => {
      if (!cached) {
        if (!initPromise) {
          initPromise = load().catch((err) => {
            initPromise = null;
            throw err;
          });
        }
        await initPromise;
      }
      return cached!;
    },
  };
}

export { createLazyModuleLoader };
export type { LazyModule, ModuleName };
