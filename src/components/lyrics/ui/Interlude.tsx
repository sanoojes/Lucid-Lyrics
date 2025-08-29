import { toPx } from '@utils/dom';
import { type CSSProperties, type FC, useEffect, useRef } from 'react';

interface InterludeProps {
  progress: number;
  startTime: number;
  endTime: number;
}

const dots: string[] = ['one', 'two', 'three'];
const totalDots = dots.length;

const Interlude: FC<InterludeProps> = ({ progress, startTime, endTime }) => {
  const amplitude = 16;
  const interludeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (interludeRef.current) {
      interludeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [interludeRef.current]);

  if (progress < startTime || progress >= endTime) return null;

  const duration = endTime - startTime;

  return (
    <div className="line">
      <div className="interlude" ref={interludeRef} style={{ height: 64 }}>
        {dots.map((word, index) => {
          const phaseOffset = (index / totalDots) * duration;
          const normalizedProgress = Math.max(
            0,
            Math.min(1, (progress - startTime - phaseOffset) / (duration / totalDots))
          );

          const translateY = toPx(
            normalizedProgress <= 0.5
              ? amplitude * (normalizedProgress / 0.5)
              : amplitude * (1 - (normalizedProgress - 0.5) / 0.5)
          );

          const scale = Math.min(0.8 + normalizedProgress / 5, 1).toFixed(2);
          const shadowOpacity = (normalizedProgress * 2).toFixed(2);

          return (
            <span
              key={word}
              className="word-dot"
              style={
                {
                  '--translate-y': `-${translateY}`,
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
