interface SyncedPosition {
  startedAt: number;
  position: number;
}

const DRIFT_TOLERANCE = 650;
const SYNC_TIMINGS = [50, 100, 150, 750];

let syncedPosition: SyncedPosition | null = null;
let syncTimer: any = null;
let burstIndex = 0;

let currentTrack: string | null = null;
let lastLocalPos: number | null = null;
let lastLocalTime = 0;

export function requestPositionSync() {
  if (syncTimer) clearTimeout(syncTimer);

  const getUri = () =>
    Spicetify.Player.data?.item?.uri ?? Spicetify.Platform?.PlayerAPI?._state?.item?.uri ?? null;
  const setSync = (pos: number) => {
    syncedPosition = { position: pos, startedAt: performance.now() };
  };

  const handleSongChange = () => {
    currentTrack = getUri();
    burstIndex = 0;
    lastLocalPos = null;
    lastLocalTime = performance.now();
    setSync(0);
  };

  const handlePlayPause = () => {
    const state = Spicetify.Platform?.PlayerAPI?._state;
    setSync(state?.positionAsOfTimestamp ?? Spicetify.Player.getProgress() ?? 0);
  };

  Spicetify.Player.addEventListener("songchange", handleSongChange);
  Spicetify.Player.addEventListener("onplaypause", handlePlayPause);

  currentTrack = getUri();

  const performSync = async () => {
    const Platform = Spicetify.Platform;
    const isLocal = Boolean(Platform?.PlaybackAPI?._isLocal);
    const isPlaying = Spicetify.Player.isPlaying();
    const trackAtStart = currentTrack;

    try {
      let pos: number;

      if (isLocal) {
        const { position } = await Platform.PlayerAPI._contextPlayer.getPositionState({});
        const sampled = Number(position);
        const now = performance.now();

        if (sampled !== lastLocalPos) {
          lastLocalPos = sampled;
          lastLocalTime = now;
        }

        if (isPlaying && lastLocalPos !== null && now - lastLocalTime > 500) {
          const state = Platform.PlayerAPI._state;
          pos = state.positionAsOfTimestamp + (Date.now() - state.timestamp);
        } else {
          pos = sampled;
        }
      } else {
        if (burstIndex < SYNC_TIMINGS.length) {
          await Platform.PlayerAPI._contextPlayer.resume({}).catch(() => {});
        }
        const state = Platform.PlayerAPI._state;
        pos = isPlaying
          ? state.positionAsOfTimestamp + (Date.now() - state.timestamp)
          : state.positionAsOfTimestamp;
      }

      if (trackAtStart === currentTrack) {
        if (!isPlaying || !syncedPosition || Math.abs(pos - getProgress()) > DRIFT_TOLERANCE) {
          setSync(pos);
        }
      }
    } catch {}

    const delay = isLocal ? 250 : (SYNC_TIMINGS[burstIndex++] ?? 500);
    syncTimer = setTimeout(performSync, delay);
  };

  performSync();

  return () => {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = null;
    syncedPosition = null;
    Spicetify.Player.removeEventListener("songchange", handleSongChange);
    Spicetify.Player.removeEventListener("onplaypause", handlePlayPause);
  };
}

export function getProgress(): number {
  try {
    if (!syncedPosition) return Spicetify.Player?.getProgress?.() || 0;

    if (!Spicetify.Player.isPlaying()) {
      return (
        Spicetify.Platform?.PlayerAPI?._state?.positionAsOfTimestamp ?? syncedPosition.position
      );
    }

    return Math.round(syncedPosition.position + (performance.now() - syncedPosition.startedAt));
  } catch {
    return 0;
  }
}
