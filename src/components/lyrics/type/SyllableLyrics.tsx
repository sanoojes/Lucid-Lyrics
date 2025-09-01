import {
  getAnimationStyles,
  getStatus,
  seekTo,
} from "@/components/lyrics/helper/common.ts";
import { useScrollContainer } from "@/components/lyrics/LyricsRenderer.tsx";
import Interlude from "@/components/lyrics/ui/Interlude.tsx";
import { useProgress } from "@/context/ProgressContext.tsx";
import type { LineStatus, SyllableData, WordProps } from "@/types/lyrics.ts";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  const isLong = duration > 0.8;

  const effectiveEndTime = useMemo(() => {
    if (!isLong) return EndTime;

    const lastLetterDelay = (Text.length - 1) * 80;
    const extendedEnd = EndTime * 1000 + lastLetterDelay;
    return extendedEnd / 1000;
  }, [EndTime, Text.length]);

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
        maxTranslateY: isLong ? 1 : 4,
        maxScale: isLong ? 1 : 1.05,
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
              maxTranslateY: 2,
              maxScale: 1.05,
              skipMask: true, // in ms
              index: idx,
            });

            return (
              <span
                key={`${letterStartTime}-${letter}`}
                className="letter"
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

  const leadRef = useRef<HTMLDivElement>(null);
  const backgroundRefs = useRef<(HTMLDivElement | null)[]>([]);

  const leadStart = data.Lead.Syllables[0].StartTime;
  const leadEnd = data.Lead.Syllables[data.Lead.Syllables.length - 1].EndTime;
  const leadStatus = getStatus(leadStart, leadEnd, progress);

  const scrollRef = useScrollContainer();

  const bgStatuses = useMemo(
    () =>
      data.Background?.map((bgPart) =>
        getStatus(bgPart.StartTime, bgPart.EndTime, progress)
      ) ?? [],
    [progress, data.Background]
  );

  const lead = useMemo(() => data.Lead.Syllables, [data.Lead.Syllables]);

  const onClick = useCallback(() => {
    seekTo(data.Lead.StartTime * 1000);
  }, [data.Lead.StartTime]);

  useEffect(() => {
    const root = scrollRef?.current?.getContainer();
    const activeLineEl = leadRef.current;
    if (!root || !activeLineEl) return;

    if (leadStatus === "active")
      activeLineEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [leadStatus, scrollRef]);

  useEffect(() => {
    if (leadStatus === "active")
      leadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <>
      <div
        className={`line ${hasSyllables ? " syllable" : ""}${
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

  return (
    <>
      {data.StartTime > 0 && (
        <Interlude
          progress={progress}
          startTime={0}
          endTime={data.StartTime * 1000 - INTERLUDE_GAP_MS}
        />
      )}

      {lines.map((line, idx) => {
        const nextLine = lines[idx + 1] ?? null;

        const interlude =
          nextLine &&
          nextLine.Lead.StartTime * 1000 - line.Lead.EndTime * 1000 > 1000
            ? {
                start: line.Lead.EndTime * 1000 + INTERLUDE_GAP_MS,
                end: nextLine.Lead.StartTime * 1000 - INTERLUDE_GAP_MS,
              }
            : null;

        return (
          <Fragment key={`${line.Lead.StartTime}-${line.Lead.EndTime}`}>
            <div
              className={`line-wrapper ${
                nextLine?.OppositeAligned && !line.OppositeAligned
                  ? "next-opposite"
                  : ""
              }`}
            >
              <LineWithWord
                data={line}
                isOppositeAligned={line.OppositeAligned ?? false}
                hasSyllables
              />
            </div>

            {interlude && (
              <Interlude
                progress={progress}
                startTime={interlude.start}
                endTime={interlude.end}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
});

export default SyllableLyrics;
