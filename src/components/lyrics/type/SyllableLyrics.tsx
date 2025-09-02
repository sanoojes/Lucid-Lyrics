import { getAnimationStyles, getStatus, seekTo } from '@/components/lyrics/helper/common.ts';
import { useScroll } from '@/components/lyrics/LyricsRenderer.tsx';
import Interlude from '@/components/lyrics/ui/Interlude.tsx';
import { useProgress } from '@/context/ProgressContext.tsx';
import appStore from '@/store/appStore.ts';
import type { LineStatus, SyllableData, WordProps } from '@/types/lyrics.ts';
import { Fragment, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';

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
    if (progress < StartTime * 1000) return 'future';
    if (progress >= StartTime * 1000 && progress <= effectiveEndTime * 1000) return 'active';
    return 'past';
  }, [progress, StartTime, effectiveEndTime]);

  const spaceClassName = !IsPartOfWord && showTrailingSpace ? 'add-space' : 'no-space';

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
        <div className={`word letters motion ${status} ${spaceClassName}`} style={styles}>
          {Text.split('').map((letter, idx) => {
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
              wordStatus = 'future';
            } else if (progress <= letterEndTime) {
              wordStatus = 'active';
            } else {
              wordStatus = 'past';
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
              <span key={`${letterStartTime}-${letter}`} className="letter" style={letterStyles}>
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
  data: SyllableData['Content'][0];
  isOppositeAligned: boolean;
  hasSyllables: boolean;
};
const LineWithWord: React.FC<LineWithWordProps> = ({ data, hasSyllables, isOppositeAligned }) => {
  const { progress } = useProgress();
  const forceRomanized = useStore(appStore, (s) => s.forceRomanized);

  const leadRef = useRef<HTMLDivElement>(null);
  const backgroundRefs = useRef<(HTMLDivElement | null)[]>([]);

  const leadStart = data.Lead.Syllables[0].StartTime;
  const leadEnd = data.Lead.Syllables[data.Lead.Syllables.length - 1].EndTime;
  const leadStatus = getStatus(leadStart, leadEnd, progress);

  const bgStatuses = useMemo(
    () =>
      data.Background?.map((bgPart) => getStatus(bgPart.StartTime, bgPart.EndTime, progress)) ?? [],
    [progress, data.Background]
  );

  const lead = useMemo(() => data.Lead.Syllables, [data.Lead.Syllables]);

  const onClick = useCallback(() => {
    seekTo(data.Lead.StartTime * 1000);
  }, [data.Lead.StartTime]);

  const scrollRef = useScroll();
  const scrollTo = useCallback(
    (element: HTMLElement, instant = false) => {
      const instance = scrollRef?.osInstance();
      if (!instance) return;

      const scrollContainer = instance.elements().scrollOffsetElement;
      if (!scrollContainer) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      let top =
        scrollContainer.scrollTop +
        (elementRect.top - containerRect.top) -
        scrollContainer.clientHeight / 2 +
        element.offsetHeight / 2;

      top += 100;

      scrollContainer.scrollTo({
        top: Math.max(0, top),
        behavior: instant ? 'auto' : 'smooth',
      });
    },
    [scrollRef]
  );

  useEffect(() => {
    if (leadStatus === 'active' && leadRef.current) {
      scrollTo(leadRef.current);
    }
  }, [leadStatus, scrollTo]);

  useEffect(() => {
    if (!leadRef.current) return;
    const hasActive = bgStatuses.some((status) => status === 'active');
    if (hasActive) scrollTo(leadRef.current);
  }, [bgStatuses, scrollTo]);

  return (
    <>
      <div
        className={`line ${hasSyllables ? ' syllable' : ''}${
          isOppositeAligned ? ' opposite' : ''
        }${data.Background ? ' has-bg' : ''} ${leadStatus}`}
        ref={leadRef}
        onClick={onClick}
      >
        {lead.map((syllable, leadIdx) => (
          <Word
            key={`${syllable.Text}-${syllable.StartTime}`}
            StartTime={syllable.StartTime}
            EndTime={syllable.EndTime}
            IsPartOfWord={syllable.IsPartOfWord ?? false}
            Text={(forceRomanized ? syllable.RomanizedText : null) ?? syllable.Text}
            lineStatus={leadStatus}
            showTrailingSpace={!syllable.IsPartOfWord && leadIdx < lead.length - 1}
          />
        ))}
      </div>

      {data.Background?.map((bgPart, bgIdx) => (
        <div
          key={`${bgPart.StartTime}-${bgPart.EndTime}`}
          className={`line bg syllable${isOppositeAligned ? ' opposite' : ''} ${bgStatuses[bgIdx]}`}
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
              Text={(forceRomanized ? syllable.RomanizedText : null) ?? syllable.Text}
              lineStatus={bgStatuses[bgIdx]}
              showTrailingSpace={
                !syllable.IsPartOfWord && syllableIdx < bgPart.Syllables.length - 1
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
      {data.StartTime > 1.5 && (
        <Interlude
          progress={progress}
          startTime={0}
          endTime={data.StartTime * 1000 - INTERLUDE_GAP_MS}
        />
      )}

      {lines.map((line, idx) => {
        const nextLine = lines[idx + 1] ?? null;

        const interlude =
          nextLine && nextLine.Lead.StartTime * 1000 - line.Lead.EndTime * 1000 > 1000
            ? {
                start: line.Lead.EndTime * 1000 + INTERLUDE_GAP_MS,
                end: nextLine.Lead.StartTime * 1000 - INTERLUDE_GAP_MS,
              }
            : null;

        return (
          <Fragment key={`${line.Lead.StartTime}-${line.Lead.EndTime}`}>
            <div
              className={`line-wrapper ${
                nextLine?.OppositeAligned && !line.OppositeAligned ? 'next-opposite' : ''
              }`}
            >
              <LineWithWord
                data={line}
                isOppositeAligned={line.OppositeAligned ?? false}
                hasSyllables
              />
            </div>

            {interlude && (
              <Interlude progress={progress} startTime={interlude.start} endTime={interlude.end} />
            )}
          </Fragment>
        );
      })}

      {data?.SongWriters ? (
        <div className="line-wrapper credits-wrapper">
          <span className="credits">Credits: {data.SongWriters?.join?.(', ')}</span>
        </div>
      ) : null}
    </>
  );
});

export default SyllableLyrics;
