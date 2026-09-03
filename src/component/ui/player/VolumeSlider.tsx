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

  let barRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  createEffect(() => {
    setLocalVolume(Math.round((volumeData().volume ?? 1) * 100));
  });

  const displayVolume = () => (volumeData().muted ? 0 : localVolume());

  const volumeIcon = () => {
    if (volumeData().muted || displayVolume() === 0) {
      return VolumeX;
    }
    const vol = displayVolume();
    if (vol < 33) return Volume;
    if (vol < 66) return Volume1;
    return Volume2;
  };

  const toggleMute = () => {
    setMute(!volumeData().muted);
  };

  const handleBarInteraction = (clientY: number) => {
    if (!barRef) return;
    const rect = barRef.getBoundingClientRect();
    const y = clientY - rect.top;
    const percent = 1 - y / rect.height;
    const clamped = Math.max(0, Math.min(1, percent));

    setLocalVolume(Math.round(clamped * 100));
    setVolume(clamped);

    if (volumeData().muted) {
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

    e.preventDefault();
    setIsDragging(true);
    handleBarInteraction(e.clientY);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    handleBarInteraction(e.clientY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!barRef) return;
    setIsDragging(true);
    handleBarInteraction(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging() || !barRef) return;
    handleBarInteraction(e.touches[0].clientY);
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
      ref={containerRef}
      class="volume-slider"
      classList={{
        "volume-slider--hidden": props.hidden,
        "volume-slider--dragging": isDragging(),
      }}
      onAuxClick={handleAuxClick}
      onMouseDown={(e) => {
        if (e.button === 1) e.preventDefault();
      }}
    >
      <div class="volume-slider__label">{displayVolume()}</div>
      <div
        ref={barRef}
        class="volume-slider__bar"
        classList={{
          "volume-slider__bar--dragging": isDragging(),
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
      >
        <div class="volume-slider__fill" style={{ height: `${displayVolume()}%` }}>
          <div
            class="volume-slider__thumb"
            classList={{
              "volume-slider__thumb--visible": isDragging(),
              "volume-slider__thumb--dragging": isDragging(),
            }}
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="volume-slider__icon"
        onClick={toggleMute}
        title={volumeData().muted ? t("player.volumeUnmute") : t("player.volumeMute")}
      >
        <Dynamic component={volumeIcon()} />
      </Button>
    </div>
  );
};

export default VolumeSlider;
