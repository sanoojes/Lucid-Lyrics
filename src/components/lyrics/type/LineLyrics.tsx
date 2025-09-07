import useTrackPosition from '@/hooks/useTrackPosition.ts';
import type { LineData } from '@/types/lyrics.ts';
import seekTo from '@/utils/player/seekTo.ts';
import cx from '@cx';
import { useEffect, useRef, useMemo } from 'react';
import Interlude from '@/components/lyrics/ui/Interlude.tsx';

const INTERLUDE_MIN_GAP_MS = 2000;

const SPLIT_THRESHOLD_MS = 750;
const MAX_TRANSLATE_UP_WORD = 2;
const MAX_TRANSLATE_UP_LETTER = 3;
const MAX_TEXT_SHADOW_BLUR = 4;
const SCALE_COEFFICENT = 4000;

const LineLyrics: React.FC<{ data: LineData }> = ({ data }) => {
  const progressRef = useTrackPosition();
  const lineRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let lastActiveIndex: number | null = null;

    const scroll = () => {
      const progress = progressRef.current;

      for (let i = 0; i < lineRefs.current.length; i++) {
        const ref = lineRefs.current[i];
        if (!ref) continue;

        const endTime = Number(ref.dataset.endTime);
        if (progress <= endTime) {
          if (lastActiveIndex !== i) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
            lastActiveIndex = i;
          }
          break;
        }
      }

      requestAnimationFrame(scroll);
    };

    requestAnimationFrame(scroll);
  }, [progressRef]);

  useEffect(() => {
    const animate = () => {
      const progress = progressRef.current;

      lineRefs.current.forEach((el) => {
        const start = Number(el.dataset.start);
        const end = Number(el.dataset.end);
        const duration = end - start;

        let pct = 0;
        let isPast = false;

        if (progress < start) pct = 0;
        else if (progress <= end) pct = ((progress - start) / duration) * 100;
        else {
          pct = 100;
          isPast = true;
        }

        el.style.setProperty('--translate-y', `${-(pct / 100) * MAX_TRANSLATE_UP_WORD}px`);
        el.style.setProperty('--text-shadow-blur', `${(pct / 100) * MAX_TEXT_SHADOW_BLUR}px`);
        el.style.setProperty('--scale', `${1 + pct / SCALE_COEFFICENT}`);
        el.style.setProperty('--bg-size-x', `${pct * 2}%`);

        if (isPast) el.classList.add('past');
        else el.classList.remove('past');
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [progressRef]);

  const contentWithInterludes = useMemo(() => {
    const result: (
      | (typeof data.Content)[number]
      | { interlude: true; start: number; end: number }
    )[] = [];

    const firstContent = data.Content[0];
    if (firstContent) {
      const firstStart = firstContent.StartTime * 1000;
      if (firstStart > INTERLUDE_MIN_GAP_MS) {
        result.push({ interlude: true, start: 0, end: firstStart });
      }
    }

    data.Content.forEach((content, idx) => {
      result.push(content);

      const lastEnd = content.EndTime * 1000;

      const nextContent = data.Content[idx + 1];
      if (nextContent) {
        const nextStart = nextContent.StartTime * 1000;
        if (nextStart - lastEnd > INTERLUDE_MIN_GAP_MS) {
          result.push({ interlude: true, start: lastEnd, end: nextStart });
        }
      }
    });

    return result;
  }, [data.Content]);

  return (
    <div className="lyrics-wrapper">
      <div className="top-spacing" />
      {contentWithInterludes.map((content, idx) => {
        if ('interlude' in content) {
          return (
            <Interlude
              key={`interlude-${idx}`}
              progressRef={progressRef}
              startTime={content.start}
              endTime={content.end}
              isOppositeAligned={false}
            />
          );
        }

        const lastEnd = content.EndTime * 1000;

        return (
          <div
            key={`line-${content.StartTime}`}
            className={cx('line-wrapper', { 'opp-align': content.OppositeAligned })}
            data-end-time={lastEnd}
            ref={(el) => (lineRefs.current[idx] = el)}
            onClick={() => seekTo(content.StartTime)}
          >
            <div className={cx('line', 'lead')}>{content.Text}</div>
          </div>
        );
      })}

      {data?.SongWriters?.length > 0 && (
        <div className="credits-wrapper">
          <span className="credits">Credits: {data.SongWriters.join(', ')}</span>
        </div>
      )}
      <div className="bottom-spacing" />
    </div>
  );
};

export default LineLyrics;
