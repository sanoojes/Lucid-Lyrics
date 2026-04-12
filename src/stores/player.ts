import { atom, computed, onMount, task } from "nanostores";
import {
  type RepeatState,
  getLiked,
  getProgress,
  getRepeat,
  getShuffle,
  requestPositionSync,
} from "~/lib/spotify/player";
import Tempus from "@darkroom.engineering/tempus";
import { wait } from "~/lib/dom/wait";

type PlayerTrack = typeof Spicetify.Player.data.item;

export const $player_data = atom<Partial<PlayerTrack> | null>(Spicetify.Player?.data?.item ?? null);

onMount($player_data, () => {
  task(async () => {
    const data = await wait(() => Spicetify?.Player?.data);
    if (data?.item) {
      $player_data.set(data.item);
    }
  });

  const handleSongChange = (e: any) => {
    const trackItem = e?.data?.item ?? Spicetify.Player.data.item;
    $player_data.set(trackItem);
  };

  Spicetify.Player?.addEventListener("songchange", handleSongChange);

  return () => {
    Spicetify.Player?.removeEventListener("songchange", handleSongChange);
  };
});

export const $current_track_image = computed($player_data, (d) => {
  if (!d) return undefined;
  return (
    d?.metadata?.image_xlarge_url ||
    d?.metadata?.image_large_url ||
    d?.metadata?.image_url ||
    d?.images?.[0]?.url ||
    d?.metadata?.image_small_url ||
    undefined
  );
});

export const $current_position = atom<number>(0);

onMount($current_position, () => {
  const dispose = requestPositionSync();
  const unsubscribe = Tempus.add(() => {
    $current_position.set(getProgress());
  }, 0);

  return () => {
    dispose();
    unsubscribe();
  };
});

export const $playing = atom<boolean>(Spicetify.Player?.isPlaying());

onMount($playing, () => {
  const listener = () => {
    $playing.set(Spicetify.Player?.isPlaying());
  };

  Spicetify.Player.addEventListener("onplaypause", listener);

  return () => {
    Spicetify.Player.removeEventListener("onplaypause", listener);
  };
});

export const $player_states = atom({
  liked: getLiked(),
  repeat: getRepeat(),
  shuffle: getShuffle() !== "none",
  smartShuffle: getShuffle() === "smart",
});

interface PlayerUpdateData {
  repeat?: RepeatState;
  shuffle?: boolean;
  smartShuffle?: boolean;
  item: typeof Spicetify.Player.data.item;
  isPaused?: boolean;
}

interface PlayerEvent {
  data: PlayerUpdateData;
}

interface PlayerOrigin {
  _events: {
    addListener(event: "update", cb: (e: PlayerEvent) => void): void;
    removeListener(event: "update", cb: (e: PlayerEvent) => void): void;
  };
}
onMount($player_states, () => {
  let _events: PlayerOrigin["_events"];

  const listener = ({ data }: PlayerEvent) => {
    if (data.repeat !== undefined || data.shuffle !== undefined) {
      $player_states.set({
        liked: data?.item?.metadata["collection.in_collection"]
          ? data.item?.metadata["collection.in_collection"] === "true"
          : getLiked(),
        repeat: data.repeat ?? $player_states.get().repeat,
        shuffle: data.shuffle ?? $player_states.get().shuffle,
        smartShuffle: data.smartShuffle ?? $player_states.get().smartShuffle,
      });
    }
  };

  const setup = async () => {
    _events = await wait(() => Spicetify.Player?.origin?._events);
    _events.addListener("update", listener);
  };

  setup();

  return () => {
    _events?.removeListener("update", listener);
  };
});

export const $repeat_state = computed($player_states, (s) => s.repeat);

export const $shuffle_state = computed($player_states, (raw) => {
  if (raw.smartShuffle) return "smart";
  if (raw.shuffle) return "normal";
  return "none";
});

export const $liked_state = computed($player_states, (e) => e.liked);
