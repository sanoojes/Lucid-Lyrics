import { Show, type JSXElement } from "solid-js";
import Marquee from "@/component/ui/Marquee";

type SongInfoProps = {
  icon: JSXElement;
  label: string;
  songName: string;
  artistNames: string;
  albumName: string;
  buttons: JSXElement;
  providerLabel?: string;
  animationDelay?: string;
  isLoading?: boolean;
};
export const SongInfo = (props: SongInfoProps) => {
  const isEmpty = (str: string) => !str || str.trim() === "";
  return (
    <div class="current-song-ttml" style={{ "animation-delay": props.animationDelay }}>
      <div class="current-song-header">
        {props.icon}
        <span class="label">{props.label}</span>
        <Show when={props.providerLabel}>
          <span class="provider-badge">{props.providerLabel}</span>
        </Show>
      </div>
      <div class="song-info">
        <div class="song-name">
          <Show
            when={!props.isLoading && !isEmpty(props.songName)}
            fallback={<div class="skeleton skeleton-name" />}
          >
            <Marquee>{props.songName}</Marquee>
          </Show>
        </div>
        <div class="song-artist">
          <Show
            when={!props.isLoading && !isEmpty(props.artistNames)}
            fallback={<div class="skeleton skeleton-artist" />}
          >
            <Marquee>{props.artistNames}</Marquee>
          </Show>
        </div>
        <div class="song-album">
          <Show
            when={!props.isLoading && !isEmpty(props.albumName)}
            fallback={<div class="skeleton skeleton-album" />}
          >
            <Marquee>{props.albumName}</Marquee>
          </Show>
        </div>
      </div>
      <div class="song-buttons">{props.buttons}</div>
    </div>
  );
};
