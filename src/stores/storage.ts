import { atom } from "nanostores";

export interface StorageStats {
  totalOriginal: number;
  totalCompressed: number;
  entryCount: number;
}

export const $storageStats = atom<StorageStats>({
  entryCount: 0,
  totalCompressed: 0,
  totalOriginal: 0,
});

export function setStorageStats(stats: StorageStats) {
  $storageStats.set(stats);
}
