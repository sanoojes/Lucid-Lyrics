import { persistentJSON } from "@/utils/nanostores";
import { getName } from "@/stores/persist";

export type TTMLMode = "apple" | "amll";
export const $ttml_mode = persistentJSON<TTMLMode>(getName("ttml-mode"), "apple");
