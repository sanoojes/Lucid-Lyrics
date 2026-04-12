import type { ShuffleState } from "~/lib/spotify/player/types";

export function seekTo(progress: number) {
  try {
    Spicetify?.Player?.seek(progress);
    // Spicetify?.Player?.play();
  } catch {}
}

export function prev() {
  Spicetify.Player?.back();
}

export function next() {
  Spicetify.Player?.next();
}

export function play() {
  Spicetify.Player?.play();
}

export function pause() {
  Spicetify.Player.pause();
}

export type RepeatState = 0 | 1 | 2 | number;
export function getRepeat(): RepeatState {
  return (Spicetify.Player?.getRepeat() ?? 0) as RepeatState;
}
export const toggleRepeat = (state: RepeatState) => {
  Spicetify.Player?.setRepeat(state);
};

export function getShuffle(): ShuffleState {
  if (Spicetify.Player.origin?._state?.smartShuffle) return "smart";
  if (Spicetify.Player.origin?._state?.shuffle) return "normal";
  return "none";
}

// TODO: find internal smartshuffle toggle
const getShuffleBtn = () =>
  document.querySelector<HTMLButtonElement>(".player-controls__left button[aria-label*='Shuffle']");
let shuffleBtn: HTMLButtonElement | null = getShuffleBtn();
export function toggleShuffle(state: ShuffleState) {
  if (shuffleBtn) {
    shuffleBtn.click();
  } else {
    shuffleBtn = getShuffleBtn();
    shuffleBtn?.click();
    // Backup incase button fails
    if (!shuffleBtn) Spicetify.Player.setShuffle(state === "normal");
  }
}

export function getLiked() {
  return Spicetify.Player?.origin._state?.item?.metadata?.["collection.in_collection"] === "true";
}

export function setLiked(like: boolean) {
  Spicetify.Player.setHeart(like);
}

export function toggleLiked() {
  Spicetify.Player.toggleHeart();
}
