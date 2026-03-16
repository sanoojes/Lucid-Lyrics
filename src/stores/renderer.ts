import { atom, onMount } from "nanostores";

export const $is_active_visible = atom<boolean>(true);
export const $jump_to_active = atom<(() => void) | null>(null);
