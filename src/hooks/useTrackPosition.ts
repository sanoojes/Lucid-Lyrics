import getProgress from '@/utils/player/getProgress.ts';
import { useEffect, useRef } from 'react';

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
