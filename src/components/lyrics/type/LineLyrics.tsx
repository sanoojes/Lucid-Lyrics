import { useEffect, useRef, useCallback, useMemo } from 'react';
import type { LineData } from '@/types/lyrics.ts';
import useTrackPosition from '@/hooks/useTrackPosition.ts';
import seekTo from '@/utils/player/seekTo.ts';
import appStore from '@/store/appStore.ts';
import Interlude from '@/components/lyrics/ui/Interlude.tsx';
import { useStore } from 'zustand';

type LineLyricsProps = { data: LineData };

const INTERLUDE_MIN_GAP_MS = 2000;

const LineLyrics: React.FC<LineLyricsProps> = ({ data }) => {
  const l = useStore(appStore, (s) => s.lyrics);

  const progressRef = useTrackPosition();
  const lyricsWrapperRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const activeLineIdxRef = useRef<number>(0);

  const inLineRefs = useRef<HTMLElement[]>([]);
  const registerLine = useCallback((el: HTMLElement | null) => {
    if (el) {
      inLineRefs.current.push(el);
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
  }, []);

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

      inLineRefs.current.forEach((el) => {
        const start = Number(el.dataset.start);
        const end = Number(el.dataset.end);

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
          el.style.setProperty('--bg-size-y', `${pct}%`);
          el.classList.remove('past');
        } else {
          el.style.transition = 'transform .5s ease-in-out, opacity .3s cubic-bezier(.61,1,.88,1)';
          el.style.removeProperty('--bg-size-y');

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
      const firstStart = firstContent.StartTime * 1000;
      if (firstStart && firstStart > INTERLUDE_MIN_GAP_MS) {
        result.push({ interlude: true, start: 0, end: firstStart });
      }
    }

    data.Content.forEach((content, idx) => {
      result.push(content);

      const lastEnd = content.EndTime * 1000;

      const nextContent = data.Content[idx + 1];
      if (nextContent) {
        const nextStart = nextContent.StartTime * 1000;
        if (nextStart && lastEnd && nextStart - lastEnd > INTERLUDE_MIN_GAP_MS) {
          result.push({ interlude: true, start: lastEnd, end: nextStart });
        }
      }
    });

    return result;
  }, [data.Content]);

  return (
    <div className="lyrics-wrapper" ref={lyricsWrapperRef}>
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

        const end = content.EndTime * 1000;

        return (
          <div
            key={`line-${content.StartTime}-${idx}`}
            className="line-wrapper left-align"
            data-end-time={end}
            ref={(el) => (lineRefs.current[idx] = el)}
          >
            <span
              ref={registerLine}
              key={`${content.Text}-${idx}`}
              onClick={() => seekTo(content.StartTime)}
              className="line animating-line"
              data-start={content.StartTime * 1000}
              data-end={content.EndTime * 1000}
            >
              {content.RomanizedText && l.forceRomanized
                ? content.RomanizedText
                : content.Text}{' '}
            </span>
          </div>
        );
      })}

      {data?.SongWriters?.length > 0 && (
        <div
          className="line-wrapper left-align credits-line"
          data-end-time={Number.MAX_SAFE_INTEGER}
          ref={(el) => lineRefs.current.push(el)}
        >
          <div className="credits">Credits: {data.SongWriters.join(', ')}</div>
        </div>
      )}
      <div className="bottom-spacing" />
    </div>
  );
};

export default LineLyrics;
