import {
  getAnimationStyles,
  getStatus,
  seekTo,
} from "@/components/lyrics/helper/common.ts";
import Interlude from "@/components/lyrics/ui/Interlude.tsx";
import { useProgress } from "@/context/ProgressContext.tsx";
import type { LineStatus, SyllableData, WordProps } from "@/types/lyrics.ts";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

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

  return (
    <>
      {isLong ? (
        <div
          className={`word letters ${status} ${spaceClassName}`}
          style={getAnimationStyles({
            startTime: StartTime * 1000,
            endTime: EndTime * 1000,
            progress,
            lineStatus,
            skipMask: true,
          })}
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

            let wordStatus: LineStatus = "past";
            if (progress < letterStartTime) wordStatus = "future";
            if (progress >= letterStartTime && progress <= letterEndTime)
              wordStatus = "active";

            const styles = getAnimationStyles({
              startTime: letterStartTime,
              endTime: letterEndTime,
              progress,
              status: wordStatus,
              lineStatus,
            });

            return (
              <span
                key={`${letterStartTime}-${letter}`}
                className="letter"
                style={styles}
              >
                {letter}
              </span>
            );
          })}
        </div>
      ) : (
        <span
          className={`word full ${status} ${spaceClassName}`}
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
  const leadStatus = useMemo(
    () => getStatus(leadStart, leadEnd, progress),
    [progress, leadStart, leadEnd]
  );

  const bgStatuses = useMemo(
    () =>
      data.Background?.map((bgPart) => {
        return getStatus(bgPart.StartTime, bgPart.EndTime, progress);
      }) ?? [],
    [progress, data.Background]
  );

  useEffect(() => {
    if (leadRef.current)
      leadRef.current.scrollIntoView({ behavior: "instant", block: "center" });
  }, []);

  useEffect(() => {
    if (leadStatus === "active" && leadRef.current) {
      leadRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [leadStatus]);

  const onClick = useCallback(() => {
    seekTo(data.Lead.StartTime * 1000);
  }, [data.Lead.StartTime]);

  useEffect(() => {
    backgroundRefs.current.forEach((ref, idx) => {
      if (bgStatuses[idx] === "active" && ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }, [bgStatuses]);

  const lead = useMemo(() => data.Lead.Syllables, [data.Lead.Syllables]);

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
  const lines = useMemo(() => data.Content, [data.Content]);

  const hasOppositeAligned = useMemo(
    () => data.Content.some((content) => content.OppositeAligned),
    [data.Content]
  );

  return lines.map((contentData, idx) => {
    let interludeStart: number | null = null;
    let interludeEnd: number | null = null;

    if (idx < data.Content.length - 1) {
      const nextLine = data.Content[idx + 1];
      const gap =
        nextLine.Lead.StartTime * 1000 - contentData.Lead.EndTime * 1000;

      console.log(gap);

      if (gap > 1000) {
        const buffer = 50;
        interludeStart = contentData.Lead.EndTime * 1000 + buffer;
        interludeEnd = nextLine.Lead.StartTime * 1000 - buffer;

        if (interludeEnd <= interludeStart) {
          interludeStart = null;
          interludeEnd = null;
        }
      }
    }

    const isPrevActive =
      idx > 0 &&
      progress >= lines[idx - 1].Lead.StartTime * 1000 &&
      progress <= lines[idx - 1].Lead.EndTime * 1000;

    const isCurrentActive =
      progress >= contentData.Lead.StartTime * 1000 &&
      progress <= contentData.Lead.EndTime * 1000;

    const isNextActive =
      idx < lines.length - 1 &&
      progress >= lines[idx + 1].Lead.StartTime * 1000 &&
      progress <= lines[idx + 1].Lead.EndTime * 1000;

    const addWillChange =
      (interludeStart !== null && interludeEnd !== null) ||
      isPrevActive ||
      isCurrentActive ||
      isNextActive;

    return (
      <div
        key={`line-${contentData.Lead.StartTime}-${contentData.Lead.EndTime}-${idx}`}
        className={`line-wrapper${hasOppositeAligned ? " has-opposite" : ""}${
          addWillChange ? " will-change" : ""
        }`}
      >
        {idx === 0 && (data.StartTime ?? 0) * 1000 > 0 && (
          <Interlude
            progress={progress}
            startTime={0}
            endTime={(data.StartTime ?? 0) * 1000}
          />
        )}
        <LineWithWord
          data={contentData}
          isOppositeAligned={contentData.OppositeAligned ?? false}
          hasSyllables
        />
        {interludeStart !== null && interludeEnd !== null && (
          <Interlude
            key={`interlude-${contentData.Lead.EndTime}-${idx}`}
            progress={progress}
            startTime={interludeStart}
            endTime={interludeEnd}
          />
        )}
      </div>
    );
  });
});
export default SyllableLyrics;
