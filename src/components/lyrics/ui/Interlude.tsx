import { memo, useEffect, useRef } from 'react';

interface InterludeProps {
  progressRef: React.RefObject<number>;
  startTime: number;
  endTime: number;
  isOppositeAligned?: boolean;
}

const dots = ['one', 'two', 'three'] as const;
const totalDots = dots.length;
const showDelay = 0.3;
const amplitude = 12;

const Interlude: React.FC<InterludeProps> = memo(
  ({ progressRef, startTime, endTime, isOppositeAligned = false }) => {
    const interludeRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const dotRefs = useRef<HTMLSpanElement[]>([]);
    dotRefs.current = dots.map((_, idx) => dotRefs.current[idx] || null);

    const isOpposite = isOppositeAligned ? ' opposite' : '';

    useEffect(() => {
      let hideTimeout: number | null = null;

      const animate = () => {
        const progress = progressRef.current ?? 0;
        const nearStart = progress < startTime + showDelay;
        const nearEnd = progress > endTime - showDelay;

        const wrapper = interludeRef.current;
        if (!wrapper) {
          requestAnimationFrame(animate);
          return;
        }

        const isHiding = nearEnd || nearStart;
        wrapper.className = `line interlude ${isHiding ? 'hide' : 'show'}${isOpposite}`;

        dotRefs.current.forEach((span, idx) => {
          if (!span) return;

          const perDotDuration = (endTime - startTime) / totalDots;
          const dotStart = startTime + idx * perDotDuration;
          const dotProgress = Math.max(0, Math.min(1, (progress - dotStart) / perDotDuration));

          const translateY =
            dotProgress <= 0.5
              ? amplitude * (dotProgress / 0.5)
              : amplitude * (1 - (dotProgress - 0.5) / 0.5);

          const scale = Math.min(0.75 + dotProgress / 2, 1);
          const shadowOpacity = dotProgress * 2;

          span.style.setProperty('--translate-y', `${-translateY}px`);
          span.style.setProperty('--scale', `${scale}`);
          span.style.boxShadow = `0px 0px 16px 0px rgba(255,255,255,${shadowOpacity})`;
        });

        const wrapperEl = wrapperRef.current;
        if (wrapperEl) {
          if (isHiding) {
            hideTimeout = setTimeout(() => {
              wrapperEl.classList.add('hide');
            }, 200);
          } else {
            if (hideTimeout) clearTimeout(hideTimeout);
            wrapperEl.classList.remove('hide');
          }
        }

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);

      return () => clearTimeout(hideTimeout);
    }, [progressRef, startTime, endTime, isOpposite]);

    return (
      <div ref={wrapperRef} className="line-wrapper interlude-wrapper hide">
        <div
          ref={interludeRef}
          className={`line interlude hide${isOpposite}`}
          style={{ height: 64 }}
        >
          {dots.map((word, idx) => (
            <span key={word} className="word-dot" ref={(el) => (dotRefs.current[idx] = el!)} />
          ))}
        </div>
      </div>
    );
  }
);

export default Interlude;
