import "~/styles/component/progress-bar.scss";
import { $current_position, $player_data } from "~/stores";
import { useStore } from "@nanostores/solid";
import { createSignal, createEffect } from "solid-js";
import { seekTo } from "~/lib/spotify/player";

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const sStr = seconds.toString().padStart(2, "0");
  if (hours > 0) {
    const mStr = minutes.toString().padStart(2, "0");
    return `${hours}:${mStr}:${sStr}`;
  }
  return `${minutes}:${sStr}`;
};

const ProgressBar = () => {
  const currentPosition = useStore($current_position);
  const playerData = useStore($player_data);

  const [internalPosition, setInternalPosition] = createSignal(0);
  const [dragPercent, setDragPercent] = createSignal<number | null>(null);
  const [showRemaining, setShowRemaining] = createSignal(false);
  const [isSeeking, setIsSeeking] = createSignal(false);

  let barRef: HTMLDivElement | undefined;
  let lastSeekTimestamp = 0;

  const duration = () => playerData()?.duration?.milliseconds ?? 0;
  const remaining = () => Math.max(0, duration() - internalPosition());

  createEffect(() => {
    const pos = currentPosition() ?? 0;

    if (!isSeeking() && Date.now() - lastSeekTimestamp > 1500) {
      const currentSec = Math.floor(internalPosition() / 1000);
      const newSec = Math.floor(pos / 1000);

      if (currentSec !== newSec) {
        setInternalPosition(pos);
      }
    }
  });

  const displayProgress = () => {
    const drag = dragPercent();
    if (drag !== null) return drag;
    const dur = duration();
    return dur ? (internalPosition() / dur) * 100 : 0;
  };

  const getPercentFromEvent = (e: PointerEvent) => {
    if (!barRef) return 0;
    const rect = barRef.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  };

  const updateProgress = (e: PointerEvent) => {
    const percent = getPercentFromEvent(e);
    setDragPercent(percent);

    const dur = duration();
    if (dur) {
      setInternalPosition((percent / 100) * dur);
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;

    const target = e.currentTarget as HTMLDivElement;
    target.setPointerCapture(e.pointerId);

    setIsSeeking(true);
    updateProgress(e);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isSeeking()) return;
    updateProgress(e);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isSeeking()) return;

    const target = e.currentTarget as HTMLDivElement;
    target.releasePointerCapture(e.pointerId);

    const finalPercent = getPercentFromEvent(e);
    const dur = duration();
    const targetTime = (finalPercent / 100) * dur;

    if (dur) {
      seekTo(targetTime);
      setInternalPosition(targetTime);
    }

    lastSeekTimestamp = Date.now();
    setIsSeeking(false);
    setDragPercent(null);
  };

  const handleTimeClick = () => {
    setShowRemaining((prev) => !prev);
  };

  return (
    <div
      class="player-progress"
      style={{
        "--dur": isSeeking() ? "0s" : "1s",
      }}
    >
      <span class="player-progress__time player-progress__time--right">
        {formatTime(internalPosition())}
      </span>

      <div
        ref={barRef}
        class="player-progress__interactive-area"
        style={{ "--_p": `${displayProgress()}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div class="player-progress__track">
          <div class="player-progress__fill" />
        </div>

        <div class="player-progress__thumb-wrapper">
          <div class="player-progress__thumb" />
        </div>
      </div>

      <span class="player-progress__time player-progress__time--left" onClick={handleTimeClick}>
        {showRemaining() ? `-${formatTime(remaining())}` : formatTime(duration())}
      </span>
    </div>
  );
};

export default ProgressBar;
