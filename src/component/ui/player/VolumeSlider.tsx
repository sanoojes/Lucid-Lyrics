import "~/styles/component/volume-slider.scss";
import { useStore } from "@nanostores/solid";
import { createSignal, createEffect, onMount, onCleanup, type Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-solid";
import { t } from "~/i18n";
import { $volume_data } from "~/stores/player";
import { setVolume, setMute } from "~/lib/spotify/player";
import { Button } from "~/component/ui/Button";

type VolumeSliderProps = {
  hidden?: boolean;
};

const VolumeSlider: Component<VolumeSliderProps> = (props) => {
  const volumeData = useStore($volume_data);

  const [isDragging, setIsDragging] = createSignal(false);
  const [localVolume, setLocalVolume] = createSignal(50);

  let containerRef: HTMLDivElement | undefined;

  createEffect(() => {
    setLocalVolume(Math.round((volumeData().volume ?? 1) * 100));
  });

  const displayVolume = () => (volumeData().muted ? 0 : localVolume());

  const statusIcon = () => {
    if (volumeData().muted || displayVolume() === 0) return VolumeX;
    const vol = displayVolume();
    if (vol < 33) return Volume;
    if (vol < 66) return Volume1;
    return Volume2;
  };

  const toggleButtonIcon = () => {
    return volumeData().muted || displayVolume() === 0 ? VolumeX : Volume2;
  };

  const toggleMute = () => {
    setMute(!volumeData().muted);
  };

  const handleInteraction = (clientY: number) => {
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const y = clientY - rect.top;
    const percent = 1 - y / rect.height;
    const clamped = Math.max(0, Math.min(1, percent));

    setLocalVolume(Math.round(clamped * 100));
    setVolume(clamped);

    if (volumeData().muted && clamped > 0) {
      setMute(false);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const step = e.deltaY < 0 ? 0.05 : -0.05;
    const currentVol = volumeData().volume ?? 1;
    const newVol = Math.max(0, Math.min(1, currentVol + step));

    setLocalVolume(Math.round(newVol * 100));
    setVolume(newVol);

    if (volumeData().muted && step > 0) {
      setMute(false);
    }
  };

  const handleAuxClick = (e: MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      toggleMute();
    }
  };

  const handleDragStart = (e: MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    handleInteraction(e.clientY);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    handleInteraction(e.clientY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    handleInteraction(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging()) return;
    handleInteraction(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  onMount(() => {
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    containerRef?.addEventListener("wheel", handleWheel, { passive: false });
  });

  onCleanup(() => {
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);

    containerRef?.removeEventListener("wheel", handleWheel);
  });

  return (
    <div
      class="volume-slider-wrapper"
      classList={{
        "volume-slider-wrapper--hidden": props.hidden,
      }}
    >
      <div
        ref={containerRef}
        class="volume-slider"
        classList={{
          "volume-slider--dragging": isDragging(),
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
        onAuxClick={handleAuxClick}
      >
        <div class="volume-slider__fill" style={{ height: `${displayVolume()}%` }} />

        <div class="volume-slider__label">{displayVolume()}</div>

        <div class="volume-slider__indicator" aria-hidden="true">
          <Dynamic component={statusIcon()} />
        </div>
      </div>

      <Button
        variant="glass"
        size="icon"
        shape="rounded"
        onClick={toggleMute}
        title={volumeData().muted ? t("player.volumeUnmute") : t("player.volumeMute")}
      >
        <Dynamic component={toggleButtonIcon()} />
      </Button>
    </div>
  );
};

export default VolumeSlider;
