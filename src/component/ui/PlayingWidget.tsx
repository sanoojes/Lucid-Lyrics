import "~/styles/component/widget.scss";
import { $current_track_image, $player_data, $widget } from "~/stores";
import { useStore } from "@nanostores/solid";
import { For, type JSXElement, Show, createEffect, createSignal, onCleanup } from "solid-js";
import Marquee from "~/component/ui/Marquee";
import LikeButton from "~/component/ui/player/LikeButton";
import Link from "~/component/ui/Link";

export type PlayerWidgetVariants = "simple" | "light" | "dark" | "glass" | "overlay";

type PlayerWidgetProps = {
  topControls?: JSXElement;
  controls?: JSXElement;
  showLikeBtn?: JSXElement;
};

const PlayerWidget = (props: PlayerWidgetProps) => {
  const widget = useStore($widget);
  const playerData = useStore($player_data);
  const currentTrackImage = useStore($current_track_image);

  const [isLoading, setIsLoading] = createSignal(!playerData()?.name);

  createEffect(() => {
    const handleSongChange = () => {
      setIsLoading(true);
    };

    Spicetify.Player?.addEventListener("songchange", handleSongChange);
    onCleanup(() => Spicetify.Player?.removeEventListener("songchange", handleSongChange));
  });

  createEffect(() => {
    const data = playerData();
    const image = currentTrackImage();
    const hasMetadata = !!(data?.name || data?.metadata?.title);

    if (hasMetadata && image) {
      const timer = setTimeout(() => setIsLoading(false), 50);
      onCleanup(() => clearTimeout(timer));
    }
  });

  const title = () => playerData()?.name || playerData()?.metadata?.title || "";
  const album = () => playerData()?.album?.name || playerData()?.metadata?.album_title || "";
  const albumLink = () => playerData()?.album?.uri ?? "";

  return (
    <div
      classList={{
        "player-widget": true,
        [`player-widget--${widget().variant || "glass"}`]: true,
        [`player-widget--text-center`]: widget().centerText,
        "player-widget--loading": isLoading(),
      }}
    >
      <div class="player-widget__image-wrapper">
        <Show
          when={!isLoading() && currentTrackImage()}
          fallback={
            <div class="player-widget__image-placeholder">
              <div class="player-widget__image-shimmer" />
            </div>
          }
        >
          <img class="player-widget__image" src={currentTrackImage()} alt="cover" />
        </Show>
        <Show when={props.topControls}>
          <div class="player-widget__top-controls">{props.topControls}</div>
        </Show>

        <Show when={props.showLikeBtn}>
          <div class="player-widget__like-btn">
            <LikeButton />
          </div>
        </Show>
        <div class="player-widget__controls">
          <Show when={props.controls}>{props.controls}</Show>
        </div>
      </div>

      <div class="player-widget__info">
        <Show when={!widget().hideTitle}>
          <Show when={!isLoading()} fallback={<div class="player-widget__title-placeholder" />}>
            <Link class="player-widget__title" href={albumLink()}>
              <Marquee>{title()}</Marquee>
            </Link>
          </Show>
        </Show>
        <Show
          when={
            !widget().hideArtist &&
            (playerData()?.artists?.length || playerData()?.metadata?.artist_name)
          }
        >
          <Show when={!isLoading()} fallback={<div class="player-widget__artist-placeholder" />}>
            <div class="player-widget__artist">
              <Marquee>
                <For
                  each={
                    playerData()?.artists || [
                      { name: playerData()?.metadata?.artist_name, uri: "" },
                    ]
                  }
                >
                  {(artist, index) => (
                    <>
                      <Link href={artist?.uri}>{artist?.name}</Link>
                      {index() < (playerData()?.artists?.length ?? 1) - 1 ? ", " : ""}
                    </>
                  )}
                </For>
              </Marquee>
            </div>
          </Show>
        </Show>
        <Show when={!widget().hideAlbum}>
          <Show when={!isLoading()} fallback={<div class="player-widget__album-placeholder" />}>
            <Link class="player-widget__album" href={albumLink()}>
              <Marquee>{album()}</Marquee>
            </Link>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default PlayerWidget;
