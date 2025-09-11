import getProgress from '@/utils/player/getProgress.ts';
import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import appStore from '@/store/appStore.ts';

export default function useTrackProgress() {
  const progress = useRef(-1);
  const timeOffset = useStore(appStore, (s) => s.lyrics.timeOffset);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const newProgress = getProgress() + timeOffset;
      if (progress.current !== newProgress) progress.current = newProgress;
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [timeOffset]);

  return progress;
}
