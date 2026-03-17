import { atom } from "nanostores";

export interface StorageStats {
  totalOriginal: number;
  totalCompressed: number;
  entryCount: number;
}

export const $storageStats = atom<StorageStats>({
  totalOriginal: 0,
  totalCompressed: 0,
  entryCount: 0,
});

export function setStorageStats(stats: StorageStats) {
  $storageStats.set(stats);
}
