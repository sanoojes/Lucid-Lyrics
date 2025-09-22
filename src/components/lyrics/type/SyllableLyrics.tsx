import '@/styles/simplebar.css';

import { Interlude } from '@/components/ui';
import useTrackPosition from '@/hooks/useTrackPosition.ts';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import type { SyllableData, VocalPart as VocalPartType } from '@/types/lyrics.ts';
import seekTo from '@/utils/player/seekTo.ts';
import { SIMPLEBAR_CLASSNAMES } from '@constants';
import cx from '@cx';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import SimpleBar from 'simplebar-react';
import { useStore } from 'zustand';

type VocalPartProps = {
  part: VocalPartType;
  isLead?: boolean;
  registerSyllable?: (
    el: HTMLElement | null,
    meta: { start: number; end: number; maxX: number; skipBg?: boolean }
  ) => void;
};

type SyllableLyricsProps = { data: SyllableData };

const SCROLL_TIMEOUT_MS = 1000;

const VocalPart: React.FC<VocalPartProps> = ({ part, isLead = true, registerSyllable }) => {
  const { forceRomanized, maxTranslateUpLetter, maxTranslateUpWord, splitThresholdMs } = useStore(
    appStore,
    (s) => s.lyrics
  );

  return (
    <div className={cx('line', isLead ? 'lead' : 'background')}>
      {part.Syllables.map((s, idx) => {
        const key = `${s.StartTime}-${s.EndTime}-${s.Text}-${idx}`;
        const start = s.StartTime * 1000;
        const end = s.EndTime * 1000;
        const word = forceRomanized && s.RomanizedText ? s.RomanizedText : s.Text;

        if (end - start < splitThresholdMs) {
          return (
            <span
              key={key}
              onClick={() => seekTo(start)}
              className="syllable-wrapper animating-syllable"
              ref={(el) =>
                registerSyllable?.(el, {
                  start,
                  end,
                  maxX: maxTranslateUpWord,
                })
              }
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
            ref={(el) =>
              registerSyllable?.(el, {
                start,
                end,
                maxX: maxTranslateUpWord,
                skipBg: true,
              })
            }
          >
            {word.split('').map((letter, lIdx) => {
              const letterKey = `${key}-letter-${lIdx}`;
              const fractionStart = lIdx / word.length;
              const fractionEnd = (lIdx + 1) / word.length;

              return (
                <span
                  key={letterKey}
                  onClick={() => seekTo(start)}
                  className="animating-syllable"
                  ref={(el) =>
                    registerSyllable?.(el, {
                      start: start + fractionStart * (end - start),
                      end: start + fractionEnd * (end - start),
                      maxX: maxTranslateUpLetter,
                    })
                  }
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

  const simpleBarRef = useRef<any>(null);
  const lyricsWrapperRef = useRef<HTMLDivElement>(null);

  const lineRefs = useRef<{ el: HTMLDivElement; end: number }[]>([]);
  const activeLineIdxRef = useRef<number>(0);

  const syllableRefs = useRef<HTMLElement[]>([]);
  const syllableMeta = useRef(
    new Map<HTMLElement, { start: number; end: number; maxX: number; skipBg?: boolean }>()
  );

  const scrollableNodeProps = useMemo(() => ({ ref: lyricsWrapperRef }), []);

  const registerSyllable = useCallback(
    (
      el: HTMLElement | null,
      meta?: { start: number; end: number; maxX: number; skipBg?: boolean }
    ) => {
      if (el && meta) {
        syllableRefs.current.push(el);
        syllableMeta.current.set(el, meta);
      }
    },
    []
  );

  const isScrolling = useRef(false);
  const isActiveLineVisible = useRef(true);

  useEffect(() => {
    const checkActiveLineVisibility = () => {
      const wrapper = lyricsWrapperRef.current;
      const activeLine = lineRefs.current[activeLineIdxRef.current]?.el;
      if (!wrapper || !activeLine) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const lineRect = activeLine.getBoundingClientRect();

      isActiveLineVisible.current =
        lineRect.top >= wrapperRect.top && lineRect.bottom <= wrapperRect.bottom;
    };

    checkActiveLineVisibility();
    const interval = setInterval(checkActiveLineVisibility, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const element = lyricsWrapperRef.current;
    if (!element) return;

    let checkTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const setNotScrolling = () => {
      isScrolling.current = false;
      simpleBarRef.current?.el?.classList.add('hide-scrollbar');
    };

    const handleWheel = () => {
      isScrolling.current = true;
      simpleBarRef.current?.el?.classList.remove('hide-scrollbar');

      if (checkTimeoutId !== null) clearTimeout(checkTimeoutId);

      checkTimeoutId = setTimeout(setNotScrolling, SCROLL_TIMEOUT_MS);
    };

    element.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      if (checkTimeoutId !== null) clearTimeout(checkTimeoutId);
      element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const scrollToCurrentLine = useCallback(
    (behavior: ScrollBehavior = 'smooth', overrideIdx?: number) => {
      if (isScrolling.current) return;
      if (behavior !== 'auto' && !isActiveLineVisible.current) return;

      const refObj = lineRefs.current[overrideIdx ?? activeLineIdxRef.current];
      const wrapper = lyricsWrapperRef.current;
      if (!refObj || !wrapper) return;

      const { el } = refObj;
      const wrapperRect = wrapper.getBoundingClientRect();
      const lineRect = el.getBoundingClientRect();
      const scrollTop = wrapper.scrollTop;
      const offset = lineRect.top - wrapperRect.top + scrollTop;

      const targetScroll = offset - wrapperRect.height / 2 + lineRect.height / 2;

      wrapper.scrollTo({
        top: targetScroll + l.scrollOffset + window.innerHeight / 20,
        behavior,
      });
    },
    [l.scrollOffset]
  );

  useEffect(() => {
    lyricsWrapperRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [data.Content]);

  useEffect(() => {
    const scrollInstantly = () => scrollToCurrentLine('auto');
    const scrollSmoothly = () => scrollToCurrentLine('smooth');

    const id = requestAnimationFrame(scrollInstantly);

    const resizeObserver = new ResizeObserver(scrollInstantly);
    if (lyricsWrapperRef.current) resizeObserver.observe(lyricsWrapperRef.current);

    const removeListener = Spicetify?.Player?.origin?._events?.addListener(
      'update',
      scrollInstantly
    );

    const unsubApp = appStore.subscribe((s) => s.lyrics.forceRomanized, scrollSmoothly);
    const unsubTemp = tempStore.subscribe((s) => s.fullscreenMode, scrollInstantly);

    return () => {
      unsubApp();
      unsubTemp();
      cancelAnimationFrame(id);
      resizeObserver.disconnect();
      if (removeListener) removeListener();
      else Spicetify?.Player?.origin?._events?.removeListener('update', scrollSmoothly);
    };
  }, [scrollToCurrentLine]);

  useEffect(() => {
    let id: number | null = null;
    let currentActiveLine = 0;

    const animate = () => {
      const progress = progressRef.current;

      for (let i = 0; i < lineRefs.current.length; i++) {
        const refObj = lineRefs.current[i];
        if (!refObj) continue;
        const { el, end } = refObj;

        if (progress <= end) {
          currentActiveLine = i;
          el.classList.remove('past');
          break;
        } else {
          el.classList.add('past');
        }
      }

      for (let i = 0; i < lineRefs.current.length; i++) {
        const refObj = lineRefs.current[i];
        if (!refObj) continue;

        const { el } = refObj;
        if (isScrolling.current || !isActiveLineVisible.current) {
          el.style.setProperty('--line-shadow-blur', '0px');
          continue;
        }

        const distance = Math.abs(i - currentActiveLine);
        const distanceBlur = distance * 1.25;
        el.style.setProperty('--line-shadow-blur', `${Math.min(distanceBlur, 6)}px`);
      }

      if (activeLineIdxRef.current !== currentActiveLine) {
        activeLineIdxRef.current = currentActiveLine;
        scrollToCurrentLine('smooth', currentActiveLine);
      }

      syllableRefs.current.forEach((el) => {
        const meta = syllableMeta.current.get(el);
        if (!meta) return;

        const { start, end, maxX, skipBg } = meta;
        const duration = end - start;
        let pct = 0;

        if (progress < start) pct = 0;
        else if (progress <= end) pct = ((progress - start) / duration) * 100;
        else pct = 100;

        if (progress >= start && progress <= end) {
          el.style.transition = '';
          el.style.setProperty('--translate-y', `${-(pct / 100) * maxX}px`);
          if (!skipBg) el.style.setProperty('--bg-size-x', `${pct}%`);
          el.classList.remove('past');
        } else {
          el.style.removeProperty('--translate-y');
          if (!skipBg) el.style.removeProperty('--bg-size-x');
          if (progress > end) el.classList.add('past');
          else el.classList.remove('past');
        }
      });

      id = requestAnimationFrame(animate);
    };

    id = requestAnimationFrame(animate);
    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, [progressRef, scrollToCurrentLine]);

  const contentWithInterludes = useMemo(() => {
    const result: (
      | (typeof data.Content)[number]
      | {
          interlude: true;
          start: number;
          end: number;
          OppositeAligned: boolean;
        }
    )[] = [];

    const firstContent = data.Content[0];
    if (firstContent) {
      const firstStart = firstContent.Lead?.Syllables[0]?.StartTime * 1000;
      const interludeAlignment = firstContent.OppositeAligned ?? false;
      if (firstStart && firstStart > INTERLUDE_MIN_GAP_MS) {
        result.push({
          interlude: true,
          start: 0,
          end: firstStart,
          OppositeAligned: interludeAlignment,
        });
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
          result.push({
            interlude: true,
            start: lastEnd,
            end: nextStart,
            OppositeAligned: nextContent.OppositeAligned ?? false,
          });
        }
      }
    });

    return result;
  }, [data.Content]);

  const hasOppAligned = useMemo(
    () => data.Content.some((content) => content.OppositeAligned),
    [data.Content]
  );

  return (
    <SimpleBar
      ref={simpleBarRef}
      className={cx('lyrics-wrapper hide-scrollbar', {
        'has-opp-aligned': hasOppAligned,
      })}
      classNames={SIMPLEBAR_CLASSNAMES}
      scrollableNodeProps={scrollableNodeProps}
    >
      <div className="top-spacing" />
      {contentWithInterludes.map((content, idx) => {
        const isOppAligned = content.OppositeAligned;
        const lastEnd =
          'interlude' in content
            ? content.end
            : (content.Background && content.Background.length > 0
                ? Math.max(...content.Background.map((v) => v.EndTime || 0))
                : content.Lead.EndTime) * 1000;

        return (
          <div
            key={`content-${
              'interlude' in content ? `interlude-${idx}` : (content.Lead.StartTime ?? idx)
            }`}
            className={cx('line-wrapper', {
              'left-align': !isOppAligned,
              'right-align': isOppAligned,
            })}
            ref={(el) => {
              if (el) lineRefs.current[idx] = { el, end: lastEnd };
            }}
          >
            {'interlude' in content ? (
              <Interlude
                progressRef={progressRef}
                startTime={content.start}
                endTime={content.end}
                isOppositeAligned={isOppAligned}
                onClose={scrollToCurrentLine}
              />
            ) : (
              <>
                <VocalPart part={content.Lead} isLead registerSyllable={registerSyllable} />
                {content.Background?.map((bg, i) => (
                  <VocalPart
                    key={`bg-${bg.Syllables[0]?.StartTime ?? i}`}
                    part={bg}
                    isLead={false}
                    registerSyllable={registerSyllable}
                  />
                ))}
              </>
            )}
          </div>
        );
      })}

      {data?.SongWriters?.length > 0 && (
        <div
          className="line-wrapper left-align credits-line"
          ref={(el) => el && lineRefs.current.push({ el, end: Number.MAX_SAFE_INTEGER })}
        >
          <div className="credits">
            <p>Credits: {data.SongWriters.join(', ')}</p>
          </div>
        </div>
      )}
      <div className="bottom-spacing" />
    </SimpleBar>
  );
};

export default SyllableLyrics;
