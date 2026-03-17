import { $page_state, $player_states } from "@/stores";

interface SyncedPosition {
  startedAt: number;
  position: number;
}

let syncedPosition: SyncedPosition | null = null;
const syncTimings = [0.05, 0.1, 0.15, 0.75];
let canSyncNonLocal = 0;

export function requestPositionSync() {
  try {
    const Platform = Spicetify.Platform;
    const startedAt = Date.now();
    const isLocal = Platform.PlaybackAPI._isLocal && !$player_states.get().isVideo;

    // Removed the offset calculation from here so syncedPosition stays pristine

    const sync: Promise<SyncedPosition> = isLocal
      ? Platform.PlayerAPI._contextPlayer
          .getPositionState({})
          .then(({ position }: { position: number }) => ({
            startedAt,
            position: Number(position), // Raw position
          }))
      : (canSyncNonLocal > 0
          ? Platform.PlayerAPI._contextPlayer.resume({})
          : Promise.resolve()
        ).then(() => {
          canSyncNonLocal = Math.max(0, canSyncNonLocal - 1);
          return {
            startedAt,
            position:
              Date.now() -
              Platform.PlayerAPI._state.timestamp +
              Platform.PlayerAPI._state.positionAsOfTimestamp, // Raw position
          };
        });

    sync.then((pos) => {
      syncedPosition = pos;

      const delay = isLocal
        ? 1 / 60
        : canSyncNonLocal === 0
          ? 1 / 60
          : syncTimings[syncTimings.length - canSyncNonLocal];

      setTimeout(requestPositionSync, delay * 1000);
    });
  } catch {}
}

export function getProgress(): number {
  if (!syncedPosition) return 0;

  const Platform = Spicetify.Platform;

  const page_state = $page_state.get();
  const offset =
    page_state.guessForVideo && $player_states.get().isVideo
      ? page_state.videoProgressOffset || 0
      : 0;

  if (!Spicetify.Player.isPlaying()) {
    return Platform.PlayerAPI._state.positionAsOfTimestamp + offset;
  }
  return syncedPosition.position + (Date.now() - syncedPosition.startedAt) + offset;
}
