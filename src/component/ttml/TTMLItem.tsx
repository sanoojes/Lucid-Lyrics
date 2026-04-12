import { t } from "~/i18n";
import { Show } from "solid-js";
import { Check, Copy, Download, Music, Trash2 } from "lucide-solid";

import Marquee from "~/component/ui/Marquee";
import { Button } from "~/component/ui/Button";
import type { LocalTTML } from "~/stores/idb/ttml";

type TTMLItemProps = {
  ttml: LocalTTML;
  currentSongId: string | undefined;
  onApply: (ttml: LocalTTML) => void;
  onDownload: (ttml: LocalTTML) => void;
  onCopy: (rawTTML: string) => void;
  onDelete: (ttml: LocalTTML) => void;
};

export const TTMLItem = (props: TTMLItemProps) => {
  const isCurrentSong = () => props.ttml.songId === props.currentSongId;

  return (
    <div class="ttml-item" classList={{ "is-current": isCurrentSong() }}>
      <div class="ttml-info">
        <div class="ttml-song-name">
          <Music size={16} />
          <Marquee>{props.ttml.songName}</Marquee>
          <span class="type-pill">
            {props.ttml.type === "amll" ? t("ttml.modeAmll") : t("ttml.modeApple")}
          </span>
        </div>
        <div class="ttml-artist">
          <Marquee>{props.ttml.artistNames}</Marquee>
        </div>
        <div class="ttml-album">
          <Marquee>{props.ttml.albumName}</Marquee>
        </div>
      </div>
      <div class="ttml-actions">
        <Show when={isCurrentSong()}>
          <span class="current-badge">{t("ttml.current")}</span>
        </Show>
        <Show when={!isCurrentSong() && props.currentSongId}>
          <Button
            variant="default"
            size="icon"
            onClick={() => props.onApply(props.ttml)}
            title={t("ttml.applyTTML")}
          >
            <Check size={16} />
          </Button>
        </Show>
        <Button
          variant="default"
          size="icon"
          onClick={() => props.onDownload(props.ttml)}
          title={t("ttml.downloadTTML")}
        >
          <Download size={16} />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={() => props.onCopy(props.ttml.rawTTML)}
          title={t("ttml.copyTTML")}
        >
          <Copy size={16} />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => props.onDelete(props.ttml)}
          title={t("ttml.delete")}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};
