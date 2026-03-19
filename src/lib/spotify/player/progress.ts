interface SyncedPosition {
  startedAt: number;
  position: number;
}

let syncedPosition: SyncedPosition | null = null;
const syncTimings = [0.05, 0.1, 0.15, 0.75];
let canSyncNonLocal = 0;
let syncTimer: number | null = null;

export function requestPositionSync() {
  if (syncTimer) clearTimeout(syncTimer);

  const performSync = () => {
    try {
      const Platform = Spicetify.Platform;
      const startedAt = Date.now();
      const isLocal = Platform.PlaybackAPI._isLocal;

      const sync: Promise<SyncedPosition> = isLocal
        ? Platform.PlayerAPI._contextPlayer
            .getPositionState({})
            .then(({ position }: { position: number }) => ({
              startedAt,
              position: Number(position),
            }))
        : (canSyncNonLocal > 0
            ? Platform.PlayerAPI._contextPlayer.resume({})
            : Promise.resolve()
          ).then(() => {
            canSyncNonLocal = Math.max(0, canSyncNonLocal - 1);
            return {
              startedAt,
              position:
                Platform.PlayerAPI._state.positionAsOfTimestamp +
                (Date.now() - Platform.PlayerAPI._state.timestamp),
            };
          });

      sync.then((pos) => {
        syncedPosition = pos;

        const delay = isLocal
          ? 1 / 60
          : canSyncNonLocal === 0
            ? 1 / 60
            : syncTimings[syncTimings.length - canSyncNonLocal];

        syncTimer = setTimeout(performSync, delay * 1000);
      });
    } catch {
      syncTimer = setTimeout(performSync, 1000);
    }
  };

  performSync();

  return () => {
    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }
    syncedPosition = null;
  };
}

export function getProgress(): number {
  if (!syncedPosition) return Spicetify.Player?.getProgress?.() || 0;

  const Platform = Spicetify.Platform;

  if (!Spicetify.Player.isPlaying()) {
    return Platform.PlayerAPI._state.positionAsOfTimestamp;
  }

  return syncedPosition.position + (Date.now() - syncedPosition.startedAt);
}
