import useTrackPosition from '@/hooks/useTrackPosition.ts';
import type { SyllableData, VocalPart as VocalPartType } from '@/types/lyrics.ts';
import seekTo from '@/utils/player/seekTo.ts';
import cx from '@cx';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import Interlude from '@/components/lyrics/ui/Interlude.tsx';
import appStore from '@/store/appStore.ts';
import { useStore } from 'zustand';

type VocalPartProps = {
  part: VocalPartType;
  isLead?: boolean;
  registerSyllable?: (el: HTMLElement | null) => void;
};

type SyllableLyricsProps = { data: SyllableData };

const VocalPart: React.FC<VocalPartProps> = ({ part, isLead = true, registerSyllable }) => {
  const l = useStore(appStore, (s) => s.lyrics);
  return (
    <div className={cx('line', isLead ? 'lead' : 'background')}>
      {part.Syllables.map((s, idx) => {
        const key = `${s.StartTime}-${s.EndTime}-${s.Text}-${idx}`;
        const start = s.StartTime * 1000;
        const end = s.EndTime * 1000;
        const word = l.forceRomanized && s.RomanizedText ? s.RomanizedText : s.Text;

        if (end - start < l.splitThresholdMs) {
          return (
            <span
              key={key}
              onClick={() => seekTo(s.StartTime)}
              className="syllable-wrapper animating-syllable"
              data-start={start}
              data-max-x={l.maxTranslateUpWord}
              data-scale-coefficient={l.scaleCoefficientWord}
              data-end={end}
              ref={registerSyllable}
            >
              {word}
              {!s.IsPartOfWord ? <span className="space"> </span> : null}
            </span>
          );
        }

        return (
          <span
            key={key}
            className="syllable-wrapper animating-syllable"
            data-start={start}
            data-max-x={l.maxTranslateUpWord}
            data-scale-coefficient={l.scaleCoefficientWord}
            data-end={end}
            data-skip-bg="true"
            ref={registerSyllable}
          >
            {word.split('').map((letter, lIdx) => {
              const letterKey = `${key}-letter-${lIdx}`;
              const fractionStart = lIdx / word.length;
              const fractionEnd = (lIdx + 1) / word.length;

              return (
                <span
                  key={letterKey}
                  onClick={() => seekTo(s.StartTime)}
                  className="animating-syllable"
                  data-start={start + fractionStart * (end - start)}
                  data-max-x={l.maxTranslateUpLetter}
                  data-scale-coefficient={l.scaleCoefficientLetter}
                  data-end={start + fractionEnd * (end - start)}
                  ref={registerSyllable}
                >
                  {letter}
                </span>
              );
            })}
            {!s.IsPartOfWord && '  '}
          </span>
        );
      })}
    </div>
  );
};

const INTERLUDE_MIN_GAP_MS = 2000;

const SyllableLyrics: React.FC<SyllableLyricsProps> = ({ data }) => {
  const progressRef = useTrackPosition();

  const l = useStore(appStore, (s) => s.lyrics);

  const lyricsWrapperRef = useRef<HTMLDivElement>(null);

  const isScrollingRef = useRef(false);

  const lineRefs = useRef<HTMLDivElement[]>([]);
  const activeLineIdxRef = useRef<number>(0);

  const syllableRefs = useRef<HTMLElement[]>([]);
  const registerSyllable = useCallback((el: HTMLElement | null) => {
    if (el) {
      syllableRefs.current.push(el);
    }
  }, []);

  useEffect(() => {
    if (!lyricsWrapperRef.current) return;
    let timeoutRef: number | null = null;

    const handleScroll = () => {
      isScrollingRef.current = true;

      if (timeoutRef) clearTimeout(timeoutRef);
      timeoutRef = setTimeout(() => {
        isScrollingRef.current = false;
      }, l.scrollTimeout);
    };

    lyricsWrapperRef.current.addEventListener('scroll', handleScroll);

    return () => {
      if (timeoutRef) clearTimeout(timeoutRef);
      lyricsWrapperRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [lyricsWrapperRef]);

  const scrollToCurrentLine = useCallback(
    (behavior: ScrollBehavior = 'auto', overrideIdx?: number) => {
      if (isScrollingRef.current && !overrideIdx) return;

      const ref = lineRefs.current[overrideIdx ?? activeLineIdxRef.current];
      const wrapper = lyricsWrapperRef.current;
      if (!ref || !wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const lineRect = ref.getBoundingClientRect();
      const scrollTop = wrapper.scrollTop;
      const offset = lineRect.top - wrapperRect.top + scrollTop;

      const targetScroll = offset - wrapperRect.height / 2 + lineRect.height / 2;

      wrapper.scrollTo({
        top: targetScroll + l.scrollOffset,
        behavior,
      });
    },
    []
  );

  useEffect(() => {
    lyricsWrapperRef.current?.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, [data.Content]);

  useEffect(() => {
    const scrollInstantly = () => scrollToCurrentLine('auto');
    const scrollSmoothly = () => scrollToCurrentLine('smooth');

    const id = requestAnimationFrame(scrollInstantly);

    const resizeObserver = new ResizeObserver(scrollInstantly);
    if (lyricsWrapperRef.current) resizeObserver.observe(lyricsWrapperRef.current);

    const remove = Spicetify?.Player?.origin?._events?.addListener('update', scrollInstantly);

    return () => {
      cancelAnimationFrame(id);
      resizeObserver.disconnect();
      if (remove) remove?.();
      else Spicetify?.Player?.origin?._events?.removeListener('update', scrollSmoothly);
    };
  }, [progressRef]);

  useEffect(() => {
    let id: number | null = null;
    let currentActiveLine = 0;

    const animate = () => {
      const progress = progressRef.current;

      for (let i = 0; i < lineRefs.current.length; i++) {
        const ref = lineRefs.current[i];
        if (!ref) continue;
        const endTime = Number(ref.dataset.endTime);
        if (progress <= endTime) {
          currentActiveLine = i;
          ref.classList.remove('past');
          break;
        } else {
          ref.classList.add('past');
        }
      }

      for (let i = 0; i < lineRefs.current.length; i++) {
        const ref = lineRefs.current[i];
        if (!ref) continue;

        // if (!isAutoScrollingRef.current) {
        //   ref.style.setProperty('--line-shadow-blur', '0px');
        //   continue;
        // }

        const distance = Math.abs(i - currentActiveLine);
        const distanceBlur = distance * 1.25;
        let blurValue = '0px';
        if (distanceBlur <= 6) {
          blurValue = `${distanceBlur}px`;
        } else {
          blurValue = '6px';
        }
        ref.style.setProperty('--line-shadow-blur', blurValue);
      }

      if (activeLineIdxRef.current !== currentActiveLine) {
        activeLineIdxRef.current = currentActiveLine;
        scrollToCurrentLine('smooth', currentActiveLine);
      }

      syllableRefs.current.forEach((el) => {
        const start = Number(el.dataset.start);
        const end = Number(el.dataset.end);
        const maxX = Number(el.dataset.maxX);
        const scaleCoefficient = Number(el.dataset.scaleCoefficient);
        const skipBg = Boolean(el.dataset.skipBg);

        const duration = end - start;
        let pct = 0;

        if (progress < start) {
          pct = 0;
        } else if (progress <= end) {
          pct = ((progress - start) / duration) * 100;
        } else {
          pct = 100;
        }

        if (progress >= start && progress <= end) {
          el.style.transition = '';
          el.style.setProperty('--translate-y', `${-(pct / 100) * maxX}px`);
          el.style.setProperty('--scale', `${1 + pct / (1000 * scaleCoefficient)}`);
          if (!skipBg) el.style.setProperty('--bg-size-x', `${pct}%`);
          el.classList.remove('past');
        } else {
          el.style.transition = 'transform .5s ease-in-out, opacity .3s cubic-bezier(.61,1,.88,1)';
          el.style.removeProperty('--translate-y');
          el.style.removeProperty('--scale');
          if (!skipBg) el.style.removeProperty('--bg-size-x');

          if (progress > end) {
            el.classList.add('past');
          } else {
            el.classList.remove('past');
          }
        }
      });

      id = requestAnimationFrame(animate);
    };

    id = requestAnimationFrame(animate);

    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, [progressRef]);

  const contentWithInterludes = useMemo(() => {
    const result: (
      | (typeof data.Content)[number]
      | { interlude: true; start: number; end: number }
    )[] = [];

    const firstContent = data.Content[0];
    if (firstContent) {
      const firstStart = firstContent.Lead?.Syllables[0]?.StartTime * 1000;
      if (firstStart && firstStart > INTERLUDE_MIN_GAP_MS) {
        result.push({ interlude: true, start: 0, end: firstStart });
      }
    }

    data.Content.forEach((content, idx) => {
      result.push(content);

      const allSyllables = [
        ...(content.Lead?.Syllables || []),
        ...(content.Background?.flatMap((bg) => bg.Syllables) || []),
      ];
      const lastEnd = allSyllables[allSyllables.length - 1]?.EndTime * 1000;

      const nextContent = data.Content[idx + 1];
      if (nextContent) {
        const nextStart = nextContent.Lead?.Syllables[0]?.StartTime * 1000;
        if (nextStart && lastEnd && nextStart - lastEnd > INTERLUDE_MIN_GAP_MS) {
          result.push({ interlude: true, start: lastEnd, end: nextStart });
        }
      }
    });

    return result;
  }, [data.Content]);

  const hasOppAligned = useMemo(() => {
    return data.Content.some((content) => content.OppositeAligned);
  }, [data.Content]);

  return (
    <div
      className={cx('lyrics-wrapper', { 'has-opp-aligned': hasOppAligned })}
      ref={lyricsWrapperRef}
    >
      <div className="top-spacing" />
      {contentWithInterludes.map((content, idx) => {
        if ('interlude' in content) {
          return (
            <Interlude
              key={`interlude-${content.end}-${content.start}-${idx}`}
              progressRef={progressRef}
              startTime={content.start}
              endTime={content.end}
              isOppositeAligned={false}
            />
          );
        }

        const lastEnd =
          (content.Background && content.Background.length > 0
            ? Math.max(...content.Background.map((value) => value.EndTime || 0))
            : content.Lead.EndTime) * 1000;

        return (
          <div
            key={`content-${content.Lead.StartTime ?? idx}-${content.Lead.EndTime}`}
            className={cx('line-wrapper', {
              'left-align': !content.OppositeAligned,
              'right-align': content.OppositeAligned,
            })}
            data-end-time={lastEnd}
            // @ts-ignore
            // biome-ignore lint/suspicious/noAssignInExpressions: cus its purrfect
            ref={(el) => (lineRefs.current[idx] = el)}
          >
            <VocalPart part={content.Lead} isLead registerSyllable={registerSyllable} />
            {content.Background?.map((bg, i) => (
              <VocalPart
                key={`bg-${bg.Syllables[0]?.StartTime ?? i}`}
                part={bg}
                isLead={false}
                registerSyllable={registerSyllable}
              />
            ))}
          </div>
        );
      })}
      {data?.SongWriters?.length > 0 && (
        <div
          className="line-wrapper left-align credits-line"
          data-end-time={Number.MAX_SAFE_INTEGER}
          ref={(el) => lineRefs.current.push(el)}
        >
          <div className="credits">
            <p>Credits: {data.SongWriters.join(', ')}</p>
          </div>
        </div>
      )}
      <div className="bottom-spacing" />
    </div>
  );
};

export default SyllableLyrics;
