import {
  getAnimationStyles,
  getStatus,
  seekTo,
} from "@/components/lyrics/helper/common.ts";
import { useScrollContainer } from "@/components/lyrics/Lyrics.tsx";
import Interlude from "@/components/lyrics/ui/Interlude.tsx";
import { useProgress } from "@/context/ProgressContext.tsx";
import type { LineStatus, SyllableData, WordProps } from "@/types/lyrics.ts";
import { Fragment, memo, useCallback, useEffect, useMemo, useRef } from "react";

const INTERLUDE_GAP_MS = 300;

const Word: React.FC<WordProps> = ({
  StartTime,
  EndTime,
  Text,
  lineStatus,
  IsPartOfWord,
  showTrailingSpace = true,
}) => {
  const { progress } = useProgress();
  const duration = EndTime - StartTime;
  const isLong = duration > 0.7;

  const effectiveEndTime = useMemo(() => {
    if (!isLong) return EndTime;

    const lastLetterDelay = (Text.length - 1) * 80;
    const extendedEnd = EndTime * 1000 + lastLetterDelay;
    return extendedEnd / 1000;
  }, [isLong, EndTime, Text.length]);

  const status = useMemo(() => {
    if (progress < StartTime * 1000) return "future";
    if (progress >= StartTime * 1000 && progress <= effectiveEndTime * 1000)
      return "active";
    return "past";
  }, [progress, StartTime, effectiveEndTime]);

  const spaceClassName =
    !IsPartOfWord && showTrailingSpace ? "add-space" : "no-space";

  const styles = useMemo(
    () =>
      getAnimationStyles({
        startTime: StartTime * 1000,
        endTime: EndTime * 1000,
        progress,
        status,
        lineStatus,
      }),
    [progress, status, lineStatus, StartTime, EndTime]
  );

  return (
    <>
      {isLong ? (
        <div
          className={`word letters motion ${status} ${spaceClassName}`}
          style={styles}
        >
          {Text.split("").map((letter, idx) => {
            const staggerDelay = idx * 80;

            const shrinkFactor = 0.9;

            const letterStartTime =
              StartTime * 1000 +
              (idx / Text.length) * duration * 1000 * shrinkFactor +
              staggerDelay;

            const letterEndTime =
              StartTime * 1000 +
              ((idx + 1) / Text.length) * duration * 1000 * shrinkFactor +
              staggerDelay;

            let wordStatus: LineStatus;

            if (progress < letterStartTime) {
              wordStatus = "future";
            } else if (progress <= letterEndTime) {
              wordStatus = "active";
            } else {
              wordStatus = "past";
            }

            const letterStyles = getAnimationStyles({
              startTime: letterStartTime,
              endTime: letterEndTime,
              progress,
              status: wordStatus,
              lineStatus,
              textShadowBlur: 6,
              maxTranslateY: 4,
              maxScale: 1.1,
              skipMask: true,
            });

            return (
              <span
                key={`${letterStartTime}-${letter}`}
                className="letter motion"
                style={letterStyles}
              >
                {letter}
              </span>
            );
          })}
        </div>
      ) : (
        <span
          className={`word full motion ${status} ${spaceClassName}`}
          style={getAnimationStyles({
            startTime: StartTime * 1000,
            endTime: EndTime * 1000,
            progress,
            status,
            lineStatus,
          })}
        >
          {Text}
        </span>
      )}
      {/* {!IsPartOfWord && showTrailingSpace && <span className="word-spacing" />} */}
    </>
  );
};

type LineWithWordProps = {
  data: SyllableData["Content"][0];
  isOppositeAligned: boolean;
  hasSyllables: boolean;
};

const LineWithWord: React.FC<LineWithWordProps> = ({
  data,
  hasSyllables,
  isOppositeAligned,
}) => {
  const { progress } = useProgress();
  const scrollRef = useScrollContainer();

  const leadRef = useRef<HTMLDivElement>(null);
  const backgroundRefs = useRef<(HTMLDivElement | null)[]>([]);

  const leadStart = data.Lead.Syllables[0].StartTime;
  const leadEnd = data.Lead.Syllables[data.Lead.Syllables.length - 1].EndTime;
  const leadStatus = getStatus(leadStart, leadEnd, progress);

  const bgStatuses = useMemo(
    () =>
      data.Background?.map((bgPart) => {
        return getStatus(bgPart.StartTime, bgPart.EndTime, progress);
      }) ?? [],
    [progress, data.Background]
  );

  useEffect(() => {
    if (!leadRef.current || !scrollRef?.current) return;

    const scrollEl = scrollRef.current;
    const leadEl = leadRef.current;

    let isUserScrolling = false;
    let scrollTimeout: number;
    const handleScroll = () => {
      isUserScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
      }, 1000);
    };

    scrollEl.addScrollListener(handleScroll);

    const toTop =
      leadEl.offsetTop -
      scrollEl.getOffsetTop() -
      scrollEl.getClientHeight() / 2 +
      leadEl.clientHeight / 2;

    if (
      !isUserScrolling &&
      (leadStatus === "active" ||
        backgroundRefs.current.some((_, idx) => bgStatuses[idx] === "active"))
    ) {
      scrollEl.scrollTo(toTop, "smooth");
    }

    return () => {
      scrollEl.removeScrollListener(handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [leadStatus, bgStatuses]);

  const lead = useMemo(() => data.Lead.Syllables, [data.Lead.Syllables]);

  const onClick = useCallback(() => {
    seekTo(data.Lead.StartTime * 1000);
  }, [data.Lead.StartTime]);

  return (
    <>
      {/* Lead line */}
      <div
        className={`line${hasSyllables ? " syllable" : ""}${
          isOppositeAligned ? " opposite" : ""
        }${data.Background ? " has-bg" : ""} ${leadStatus}`}
        ref={leadRef}
        onClick={onClick}
      >
        {lead.map((syllable, leadIdx) => (
          <Word
            key={`${syllable.Text}-${syllable.StartTime}`}
            StartTime={syllable.StartTime}
            EndTime={syllable.EndTime}
            IsPartOfWord={syllable.IsPartOfWord ?? false}
            Text={syllable.Text}
            lineStatus={leadStatus}
            showTrailingSpace={
              !syllable.IsPartOfWord && leadIdx < lead.length - 1
            }
          />
        ))}
      </div>

      {/* Background lines */}
      {data.Background?.map((bgPart, bgIdx) => (
        <div
          key={`${bgPart.StartTime}-${bgPart.EndTime}`}
          className={`line bg syllable${isOppositeAligned ? " opposite" : ""} ${
            bgStatuses[bgIdx]
          }`}
          ref={(el) => {
            backgroundRefs.current[bgIdx] = el;
          }}
        >
          {bgPart.Syllables.map((syllable, syllableIdx) => (
            <Word
              key={`${syllable.Text}-${syllable.StartTime}-${syllable.EndTime}`}
              StartTime={syllable.StartTime}
              EndTime={syllable.EndTime}
              IsPartOfWord={syllable.IsPartOfWord ?? false}
              Text={syllable.Text}
              lineStatus={bgStatuses[bgIdx]}
              showTrailingSpace={
                !syllable.IsPartOfWord &&
                syllableIdx < bgPart.Syllables.length - 1
              }
            />
          ))}
        </div>
      ))}
    </>
  );
};
type SyllableLyricsProps = { data: SyllableData };

const SyllableLyrics: React.FC<SyllableLyricsProps> = memo(({ data }) => {
  const { progress } = useProgress();
  const lines = data.Content;
  const scrollRef = useScrollContainer();
  const interludeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const hasOppositeAligned = useMemo(
    () => lines.some((line) => line.OppositeAligned),
    [lines]
  );

  useEffect(() => {
    if (!scrollRef?.current) return;

    const scrollEl = scrollRef.current;

    interludeRefs.current.forEach((ref) => {
      if (!ref) return;

      const idx = interludeRefs.current.indexOf(ref);
      const lineData = lines[idx];
      const nextLine = lines[idx + 1] ?? null;

      let interludeStart: number | null = null;
      let interludeEnd: number | null = null;

      if (nextLine) {
        const gap =
          nextLine.Lead.StartTime * 1000 - lineData.Lead.EndTime * 1000;
        if (gap > 1000) {
          interludeStart = lineData.Lead.EndTime * 1000 + 50;
          interludeEnd = nextLine.Lead.StartTime * 1000 - 50;
        }
      }

      const isActive =
        (interludeStart !== null &&
          interludeEnd !== null &&
          progress >= interludeStart &&
          progress <= interludeEnd) ||
        (idx === 0 &&
          data.StartTime * 1000 > 0 &&
          progress < data.StartTime * 1000);

      if (isActive) {
        const toTop =
          ref.offsetTop -
          scrollEl.getOffsetTop() -
          scrollEl.getClientHeight() / 2 +
          ref.clientHeight / 2;

        scrollEl.scrollTo(toTop, "smooth");
      }
    });
  }, [progress, lines, data.StartTime, scrollRef]);

  return (
    <>
      {lines.map((lineData, idx) => {
        const nextLine = lines[idx + 1] ?? null;

        let interludeStart: number | null = null;
        let interludeEnd: number | null = null;

        if (nextLine) {
          const gap =
            nextLine.Lead.StartTime * 1000 - lineData.Lead.EndTime * 1000;
          if (gap > 1000) {
            interludeStart = lineData.Lead.EndTime * 1000 + 50;
            interludeEnd = nextLine.Lead.StartTime * 1000 - 50;
          }
        }

        return (
          <Fragment
            key={`${lineData.Lead.StartTime}-${lineData.Background?.[0]?.StartTime}-${lineData.Lead.EndTime}`}
          >
            {/* Interlude before first line */}
            {idx === 0 && data.StartTime * 1000 > 0 && (
              <div
                ref={(el) => {
                  interludeRefs.current[idx] = el;
                }}
              >
                <Interlude
                  progress={progress}
                  startTime={0}
                  endTime={data.StartTime * 1000 - INTERLUDE_GAP_MS}
                />
              </div>
            )}

            {/* Main line */}
            <div
              className={`line-wrapper${
                hasOppositeAligned ? " has-opposite" : ""
              }`}
            >
              <LineWithWord
                data={lineData}
                isOppositeAligned={lineData.OppositeAligned ?? false}
                hasSyllables
              />
            </div>

            {/* Interlude after current line */}
            {interludeStart !== null && interludeEnd !== null && (
              <div
                ref={(el) => {
                  interludeRefs.current[idx] = el;
                }}
              >
                <Interlude
                  progress={progress}
                  startTime={interludeStart}
                  endTime={interludeEnd}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </>
  );
});

export default SyllableLyrics;
