interface SyncedPosition {
  startedAt: number;
  position: number;
}

const DRIFT_TOLERANCE = 650;

let syncedPosition: SyncedPosition | null = null;
const syncTimings = [0.05, 0.1, 0.15, 0.75];
let canSyncNonLocal = 0;
let syncTimer: number | null = null;

export function requestPositionSync() {
  if (syncTimer) clearTimeout(syncTimer);

  const handleSongChange = () => {
    syncedPosition = {
      position: 0,
      startedAt: performance.now(),
    };
  };

  Spicetify.Player.addEventListener("songchange", handleSongChange);

  const performSync = () => {
    try {
      const Platform = Spicetify.Platform;
      const isLocal = Platform.PlaybackAPI._isLocal;

      const sync: Promise<SyncedPosition> = isLocal
        ? Platform.PlayerAPI._contextPlayer
            .getPositionState({})
            .then(({ position }: { position: number }) => ({
              position: Number(position),
              startedAt: performance.now(),
            }))
        : (canSyncNonLocal > 0
            ? Platform.PlayerAPI._contextPlayer.resume({})
            : Promise.resolve()
          ).then(() => {
            canSyncNonLocal = Math.max(0, canSyncNonLocal - 1);
            return {
              position:
                Platform.PlayerAPI._state.positionAsOfTimestamp +
                (Date.now() - Platform.PlayerAPI._state.timestamp),
              startedAt: performance.now(),
            };
          });

      sync.then((pos) => {
        const predicted = getProgress();
        const drift = Math.abs(pos.position - predicted);

        if (!syncedPosition || drift > DRIFT_TOLERANCE) {
          syncedPosition = pos;
        } else {
          syncedPosition = {
            position: predicted,
            startedAt: performance.now(),
          };
        }

        const delay = isLocal
          ? 0.5
          : canSyncNonLocal === 0
            ? 0.5
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
    Spicetify.Player.removeEventListener("songchange", handleSongChange);
  };
}

export function getProgress(): number {
  try {
    if (!syncedPosition) return Spicetify.Player?.getProgress?.() || 0;

    if (!Spicetify.Player.isPlaying()) {
      return Spicetify.Platform.PlayerAPI._state.positionAsOfTimestamp || 0;
    }

    return Math.round(syncedPosition.position + (performance.now() - syncedPosition.startedAt));
  } catch {
    return 0;
  }
}
