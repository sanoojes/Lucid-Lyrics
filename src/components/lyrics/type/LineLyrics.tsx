import { getAnimationStyles, getStatus, seekTo } from '@/components/lyrics/helper/common.ts';
import Interlude from '@/components/lyrics/ui/Interlude.tsx';
import { useProgress } from '@/context/ProgressContext.tsx';
import type { LineData, LineStatus } from '@/types/lyrics.ts';
import { useCallback, useEffect, useMemo, useRef } from 'react';

type LineLyricsProps = { data: LineData };

const LineLyrics: React.FC<LineLyricsProps> = ({ data }) => {
  const { progress } = useProgress();
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const lines = useMemo(
    () =>
      data.Content.map((line) => ({
        ...line,
        status: getStatus(line.StartTime, line.EndTime, progress),
      })),
    [data.Content, progress]
  );

  useEffect(() => {
    const activeIdx = lines.findIndex((l) => l.status === 'active');

    if (activeIdx >= 0) {
      refs.current[activeIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [lines]);

  useEffect(() => {
    console.log(progress);
  }, [progress]);

  const handleClick = useCallback((t: number) => seekTo(t * 1000), []);

  const hasOppositeAligned = useMemo(
    () => data.Content.map((content) => content.OppositeAligned),
    [data.Content]
  );

  return (
    <>
      {lines.map(({ StartTime = 0, EndTime, Text, OppositeAligned, status }, idx) => {
        let lineStatus: LineStatus = 'past';
        if (progress < StartTime * 1000) lineStatus = 'future';
        if (progress >= StartTime * 1000 && progress <= EndTime * 1000) lineStatus = 'active';

        const styles = getAnimationStyles({
          startTime: StartTime * 1000,
          endTime: EndTime * 1000,
          progress,
          lineStatus,
          gradientPos: 'bottom',
          skipScale: true,
        });

        return (
          <div
            key={`${StartTime}-${EndTime}-${Text}`}
            className={`line-wrapper will-change static${
              hasOppositeAligned ? ' has-opposite' : ''
            }`}
          >
            {idx === 0 && StartTime > 0 && (
              <Interlude progress={progress} startTime={0} endTime={StartTime * 1000} />
            )}
            <div
              ref={(el) => {
                refs.current[idx] = el;
              }}
              className={`line${OppositeAligned ? ' opposite' : ''} ${status}`}
              onClick={() => handleClick(StartTime)}
              style={styles}
            >
              {Text}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default LineLyrics;
