import { createStore } from "idb-keyval";

export const moduleStore = createStore("lucid-modules", "modules");
export const lyricsStore = createStore("lucid-lyrics", "lyrics_cache");
export const imageStore = createStore("lucid-lyrics-images", "images");
export const ttmlStore = createStore("lucid-ttml", "ttml");
