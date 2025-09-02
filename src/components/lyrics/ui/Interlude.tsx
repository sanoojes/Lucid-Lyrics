import { type CSSProperties, type FC, useEffect, useMemo, useRef } from 'react';

interface InterludeProps {
  progress: number;
  startTime: number;
  endTime: number;
}

const dots: string[] = ['one', 'two', 'three'];
const totalDots = dots.length;
const showDelay = 0.3;

const Interlude: FC<InterludeProps> = ({ progress, startTime, endTime }) => {
  const amplitude = 12;
  const interludeRef = useRef<HTMLDivElement>(null);

  const isActive = useMemo(
    () => progress >= startTime && progress < endTime,
    [progress, endTime, startTime]
  );

  useEffect(() => {
    if (!isActive) return;

    interludeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [isActive]);

  const nearStart = progress < startTime + showDelay;
  const nearEnd = progress > endTime - showDelay;

  return (
    <div className={`line-wrapper interlude-wrapper will-change ${isActive ? 'active' : 'hide'}`}>
      <div
        className={`interlude ${nearEnd || nearStart ? 'hide' : 'show'}`}
        ref={interludeRef}
        style={{ height: 64 }}
      >
        {dots.map((word, idx) => {
          const perDotDuration = (endTime - startTime) / totalDots;

          const dotStart = startTime + idx * perDotDuration;

          const dotProgress = Math.max(0, Math.min(1, (progress - dotStart) / perDotDuration));

          const translateY =
            dotProgress <= 0.5
              ? amplitude * (dotProgress / 0.5)
              : amplitude * (1 - (dotProgress - 0.5) / 0.5);

          const scale = Math.min(0.75 + dotProgress / 2, 1);

          const shadowOpacity = dotProgress * 2;

          return (
            <span
              key={word}
              className="word-dot"
              style={
                {
                  '--translate-y': `${-translateY}px`,
                  '--scale': scale,
                  boxShadow: `0px 0px 16px 0px rgba(255,255,255,${shadowOpacity})`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default Interlude;
