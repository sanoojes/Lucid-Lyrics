import { useEffect, useRef, useState } from 'react';

function getProgress() {
  try {
    const state = Spicetify.Platform?.PlayerAPI?._state;
    if (!state) return 0;

    const { positionAsOfTimestamp, timestamp } = state;

    if (positionAsOfTimestamp == null || timestamp == null) {
      return 0;
    }

    if (!Spicetify.Player.isPlaying()) {
      return positionAsOfTimestamp;
    }

    const now = Date.now();
    return positionAsOfTimestamp + (now - timestamp);
  } catch (error) {
    console.error('Failed to get progress:', error);
    return 0;
  }
}

export default function useTrackProgress() {
  const progress = useRef(-1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const newProgress = getProgress();
      if (progress.current !== newProgress) progress.current = newProgress;
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return progress;
}
