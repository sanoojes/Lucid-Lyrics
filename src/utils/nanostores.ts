import { persistentAtom } from "@nanostores/persistent";
import type { WritableAtom } from "nanostores";
import deepmerge from "@/utils/deepmerge";

interface PersistentSimpleOptions {
  /**
   * Does not synchronize changes from other browser tabs
   */
  listen?: boolean;
}

/**
 * Store a JSON in localStorage.
 *
 * ```ts
 * import { persistentJSON } from '@nanostores/persistent'
 *
 * export const settings = persistentJSON<Record<string, string>>('settings', {})
 * ```
 *
 * @param name Key name in localStorage.
 * @param initial Value on missed data in localStorage. `null` by default.
 * @param opts Store options.
 * @return The store.
 */
export function persistentJSON<T>(
  name: string,
  initial: T,
  opts?: PersistentSimpleOptions,
): WritableAtom<T>;
export function persistentJSON<T>(
  name: string,
  initial?: null,
  opts?: PersistentSimpleOptions,
): WritableAtom<null | T>;

export function persistentJSON(key: string, initial = null, opts = {}) {
  return persistentAtom(key, initial, {
    ...opts,
    decode(value) {
      try {
        const curr = JSON.parse(value);
        const merged = deepmerge(initial, curr);
        return merged;
      } catch {
        return initial;
      }
    },
    encode: JSON.stringify,
  });
}
