import {
  getAnimationStyles,
  getStatus,
  seekTo,
} from "@/components/lyrics/helper/common.ts";
import Interlude from "@/components/lyrics/ui/Interlude.tsx";
import { useProgress } from "@/context/ProgressContext.tsx";
import type { LineData, LineStatus } from "@/types/lyrics.ts";
import { useCallback, useEffect, useMemo, useRef } from "react";

type LineLyricsProps = { data: LineData };

const LineLyrics: React.FC<LineLyricsProps> = ({ data }) => {
  const { progress } = useProgress();
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const interludeRef = useRef<HTMLDivElement | null>(null);

  const lines = useMemo(
    () =>
      data.Content.map((line) => ({
        ...line,
        status: getStatus(line.StartTime, line.EndTime, progress),
      })),
    [data.Content, progress]
  );

  useEffect(() => {
    const activeIdx = lines.findIndex((l) => l.status === "active");
    if (activeIdx >= 0) {
      refs.current[activeIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    const firstLineStart = data.Content[0]?.StartTime ?? 0;
    if (firstLineStart > 0 && progress < firstLineStart * 1000) {
      interludeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [lines, progress, data.Content]);

  const handleClick = useCallback((t: number) => seekTo(t * 1000), []);

  const hasOppositeAligned = useMemo(
    () => data.Content.map((content) => content.OppositeAligned),
    [data.Content]
  );

  return (
    <>
      {lines.map(
        ({ StartTime = 0, EndTime, Text, OppositeAligned, status }, idx) => {
          let lineStatus: LineStatus = "past";
          if (progress < StartTime * 1000) lineStatus = "future";
          if (progress >= StartTime * 1000 && progress <= EndTime * 1000)
            lineStatus = "active";

          const styles = getAnimationStyles({
            startTime: StartTime * 1000,
            endTime: EndTime * 1000,
            progress,
            lineStatus,
            gradientPos: "bottom",
          });

          return (
            <div
              key={`${StartTime}-${EndTime}-${Text}`}
              className={`line-wrapper static${
                hasOppositeAligned ? " has-opposite" : ""
              }`}
            >
              {/* Interlude */}
              {idx === 0 && StartTime > 0 && (
                <div ref={interludeRef}>
                  <Interlude
                    progress={progress}
                    startTime={0}
                    endTime={StartTime * 1000}
                  />
                </div>
              )}

              {/* Lyric line */}
              <div
                ref={(el) => {
                  refs.current[idx] = el;
                }}
                className={`line motion${
                  OppositeAligned ? " opposite" : ""
                } ${status}`}
                onClick={() => handleClick(StartTime)}
                style={styles}
              >
                {Text}
              </div>
            </div>
          );
        }
      )}
    </>
  );
};

export default LineLyrics;
