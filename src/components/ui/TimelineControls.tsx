import '@/styles/ui/widget.css';
import { Slider } from '@/components/ui';
import tempStore from '@/store/tempStore.ts';
import debounce from '@/utils/debounce.ts';
import getProgress from '@/utils/player/getProgress.ts';
import seekTo from '@/utils/player/seekTo.ts';
import { useCallback, useEffect, useState } from 'react';
import { useStore } from 'zustand';

const TimelineControls = () => {
  const duration = useStore(
    tempStore,
    (s) => s.player?.nowPlaying?.data?.duration?.milliseconds ?? 0
  );
  const [localProgress, setLocalProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) setLocalProgress(getProgress());
    }, 100);
    return () => clearInterval(interval);
  }, [isDragging]);

  const debouncedSeek = useCallback(
    debounce((val: number) => seekTo((val / 100) * duration)),
    [duration]
  );

  const progressRatio = duration ? (localProgress / duration) * 100 : 0;

  return (
    <div className="timeline-controls">
      <div className="time now">{formatTime(localProgress)}</div>
      <Slider
        maximumValue={100}
        minimumValue={0}
        userValueChangeStep={0.001}
        value={progressRatio}
        onProgressChange={(val) => {
          setLocalProgress((val / 100) * duration);
          debouncedSeek(val);
        }}
        onActiveChange={setIsDragging}
      />
      <div className="time end">{formatTime(duration)}</div>
    </div>
  );
};

export default TimelineControls;

const formatTime = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
