import { useCallback, useEffect, useRef, useState } from 'react';
import '@/styles/ui/slider.css';

interface SliderProps {
  maximumValue?: number;
  minimumValue?: number;
  value?: number;
  userValueChangeStep?: number;
  onProgressChange?: (progress: number, changedByUser?: boolean) => void;
  onActiveChange?: (isActive: boolean) => void;
}

const Slider: React.FC<SliderProps> = ({
  maximumValue = 1,
  minimumValue = 0,
  value,
  userValueChangeStep,
  onProgressChange,
  onActiveChange,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [internalProgress, setInternalProgress] = useState(minimumValue);
  const [dragging, setDragging] = useState(false);

  const progress = value !== undefined ? value : internalProgress;

  const calculateProgressFromMouse = (e: MouseEvent | React.MouseEvent) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  };

  const updateProgress = useCallback(
    (e: MouseEvent | React.MouseEvent, userInitiated?: boolean) => {
      const rawProgress =
        minimumValue + calculateProgressFromMouse(e) * (maximumValue - minimumValue);
      const newProgress = userValueChangeStep
        ? Math.floor(rawProgress / userValueChangeStep) * userValueChangeStep
        : rawProgress;

      if (value === undefined) setInternalProgress(newProgress);
      onProgressChange?.(newProgress, userInitiated);
    },
    [maximumValue, minimumValue, userValueChangeStep, onProgressChange, value]
  );

  const startDrag = (initialEvent: React.MouseEvent) => {
    initialEvent.preventDefault();
    setDragging(true);
    onActiveChange?.(true);
    updateProgress(initialEvent, true);

    const handleMouseMove = (event: MouseEvent) => updateProgress(event, true);
    const handleMouseUp = () => {
      setDragging(false);
      onActiveChange?.(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const progressPercentage = (
    ((progress - minimumValue) / (maximumValue - minimumValue)) *
    100
  ).toFixed(3);

  return (
    <div
      ref={barRef}
      className={`slider-bar ${dragging ? 'dragging' : ''}`}
      onMouseDown={startDrag}
      style={{ '--progress': `${progressPercentage}%` } as React.CSSProperties}
    >
      <div className="slider-progress" />
      <div className="slider-handle" />
    </div>
  );
};

export default Slider;
