import type { LineData } from "@/lib/api/types";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { useLenis, useLenisContent } from "@/component/ui/Lenis";
import { useStore } from "@nanostores/solid";
import { $current_position, $romanize, $romanize_position, getBlurmap } from "@/stores";
import { useRenderer } from "@/context/LyricsRenderer";
import { seekTo } from "@/lib/spotify/player";
import { Interlude } from "@/component/lyrics/Interlude";

export type LineLyricsProps = {
  lyrics: LineData;
  widgetHidden: boolean;
};

type LineEntry =
  | {
      type: "lyric";
      index: number;
      contentIndex: number;
      content: LineData["Content"][number];
    }
  | {
      type: "interlude";
      index: number;
      start: number;
      end: number;
      oppAligned: boolean;
      isIntro: boolean;
      isRTL?: boolean;
    };

function buildLineEntries(lyrics: LineData): LineEntry[] {
  const content = lyrics.Content ?? [];
  const entries: LineEntry[] = [];
  let lineIdx = 0;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const start = c.StartTime * 1000;

    if (i === 0 && start > 2000) {
      entries.push({
        type: "interlude",
        index: lineIdx++,
        start: 0,
        end: start,
        oppAligned: c.OppositeAligned,
        isIntro: true,
        isRTL: c.IsRTL,
      });
    }

    entries.push({ type: "lyric", index: lineIdx++, contentIndex: i, content: c });

    if (i < content.length - 1) {
      const next = content[i + 1];
      const gap = next.StartTime * 1000 - c.EndTime * 1000;
      if (gap > 2000) {
        entries.push({
          type: "interlude",
          index: lineIdx++,
          start: c.EndTime * 1000 - 100,
          end: next.StartTime * 1000 - 100,
          oppAligned: c.OppositeAligned,
          isIntro: false,
          isRTL: c.IsRTL,
        });
      }
    }
  }

  return entries;
}

export default function LineLyrics(props: LineLyricsProps) {
  let containerRef!: HTMLDivElement;

  const itemRefs = new Map<number, HTMLDivElement>();
  const elementToIndex = new WeakMap<Element, number>();

  let highestActiveIndex = 0;
  let lastSeenPos = 0;

  const [isUserScroll, setIsUserScroll] = createSignal(false);
  const [isInteracting, setIsInteracting] = createSignal(false);
  const [visibleElements, setVisibleElements] = createSignal<Set<number>>(new Set());
  const [scrollOffset, setScrollOffset] = createSignal(0);

  const currentPos = useStore($current_position);
  const romanize = useStore($romanize);
  const romanize_position = useStore($romanize_position);
  const { setJumpToActive, setIsActiveVisible } = useRenderer();
  const getLenis = useLenis();
  const getContentRef = useLenisContent();

  const lineEntries = createMemo(() => buildLineEntries(props.lyrics));

  const allBounds = createMemo(() => {
    return lineEntries().map((entry) => {
      if (entry.type === "interlude") {
        return { start: entry.start, end: entry.end };
      }
      return { start: entry.content.StartTime * 1000, end: entry.content.EndTime * 1000 };
    });
  });

  const activeIndices = createMemo(
    () => {
      const pos = currentPos();
      const bounds = allBounds();
      if (bounds.length === 0) return [0];

      const indices: number[] = [];
      for (let i = 0; i < bounds.length; i++) {
        if (pos >= bounds[i].start && pos <= bounds[i].end) {
          indices.push(i);
        }
      }

      if (indices.length === 0 && pos > 0) {
        const nextIdx = bounds.findIndex((b) => b.start > pos);
        return [nextIdx === -1 ? bounds.length - 1 : Math.max(0, nextIdx - 1)];
      }

      return indices.length > 0 ? indices : [0];
    },
    [],
    {
      equals: (a, b) => a.length === b.length && a.every((val, i) => val === b[i]),
    },
  );

  const scrollToIndex = createMemo((prevIdx: number) => {
    const pos = currentPos();
    const isSeek = Math.abs(pos - lastSeenPos) > 1200;
    lastSeenPos = pos;

    const indices = activeIndices();
    if (indices.length === 0) return prevIdx || 0;

    let targetIdx = indices[0] ?? 0;

    if (indices.length > 1) {
      const entries = lineEntries();
      const currentEntry = entries[indices[indices.length - 1]];
      const isRTL = currentEntry?.type === "lyric"
        ? (romanize() && romanize_position() === "replace" ? false : currentEntry.content.IsRTL)
        : currentEntry?.type === "interlude"
          ? !(romanize() && romanize_position() === "replace") && currentEntry.isRTL
          : false;

      targetIdx = isRTL ? indices[0] : indices[indices.length - 1];
    }

    if (isSeek || pos === 0) {
      highestActiveIndex = targetIdx;
      return targetIdx;
    }

    if (targetIdx > highestActiveIndex) {
      highestActiveIndex = targetIdx;
    }

    return Math.max(targetIdx, highestActiveIndex);
  }, 0);

  function updateOffset(isWidgetHidden = props.widgetHidden ?? false) {
    if (!containerRef) return;
    const style = getComputedStyle(containerRef);
    const isMobile = Number.parseInt(style.getPropertyValue("--is-mobile") || "0");
    const isNPV = Number.parseInt(style.getPropertyValue("--is-npv") || "0");
    const lenis = getLenis();
    if (!lenis?.rootElement) return;

    const height = lenis.rootElement.clientHeight;
    const baseOffset = isNPV ? 16 : isMobile && !isWidgetHidden ? 48 : height / 2.7;
    const activeCount = activeIndices().length;
    const lineOffset = activeCount > 1 ? (activeCount - 1) * 20 : 0;
    const off = -(baseOffset + lineOffset);
    setScrollOffset(off);
  }

  const performScroll = (immediate: boolean, forceScroll = false) => {
    const lenis = getLenis();
    const idx = scrollToIndex();
    const targetRef = itemRefs.get(idx);

    if (!lenis || !targetRef) return;
    if (!forceScroll && isUserScroll()) return;

    const wrapper = lenis.rootElement;
    if (!wrapper) return;

    const targetRect = targetRef.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const absoluteY = targetRect.top - wrapperRect.top + lenis.scroll + scrollOffset();

    lenis.scrollTo(absoluteY, {
      immediate,
      userData: { autoScroll: true },
    });
  };

  createEffect(
    on(
      () => props.widgetHidden,
      (widgetHidden) => {
        requestAnimationFrame(() => {
          updateOffset(widgetHidden);
          performScroll(true, true);
        });
      },
    ),
  );

  createEffect(() => {
    const idx = scrollToIndex();

    if (!isUserScroll() && idx !== -1 && itemRefs.has(idx)) {
      requestAnimationFrame(() => {
        performScroll(false);
      });
    }
  });

  createEffect(
    on(
      [romanize, romanize_position],
      () => {
        const lenis = getLenis();

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            lenis?.resize();
            performScroll(true, true);
          });
        });
      },
      { defer: true },
    ),
  );

  let scrollTimeout: ReturnType<typeof setTimeout>;

  const handleUserInteraction = () => {
    setIsInteracting(true);
    setIsUserScroll(true);
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => setIsInteracting(false), 5000);
  };

  createEffect(() => {
    const activeVisible = visibleElements().has(scrollToIndex());
    setIsActiveVisible(activeVisible);

    if (!isInteracting() && isUserScroll()) {
      if (activeVisible) {
        setIsUserScroll(false);
        performScroll(false);
      }
    }
  });

  createEffect((prevPos: number) => {
    const pos = currentPos();
    if (prevPos !== undefined && Math.abs(pos - prevPos) > 1200) {
      performScroll(true, true);
    }
    return pos;
  }, currentPos());

  let observer: IntersectionObserver | undefined;

  createEffect(() => {
    lineEntries();

    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          setVisibleElements((prev) => {
            const nextSet = new Set(prev);
            let hasChanges = false;

            for (const entry of entries) {
              const idx = elementToIndex.get(entry.target);
              if (idx === undefined) continue;

              if (entry.isIntersecting) {
                if (!nextSet.has(idx)) {
                  nextSet.add(idx);
                  hasChanges = true;
                }
              } else {
                if (nextSet.has(idx)) {
                  nextSet.delete(idx);
                  hasChanges = true;
                }
              }
            }

            return hasChanges ? nextSet : prev;
          });
        },
        { threshold: 0.01 },
      );
    }
    observer.disconnect();

    queueMicrotask(() => {
      itemRefs.forEach((el) => observer!.observe(el));
    });

    onCleanup(() => observer?.disconnect());
  });

  onMount(() => {
    setJumpToActive(() => () => {
      getLenis().resize();
      performScroll(false, true);
    });

    const contentRef = getContentRef();
    const lenis = getLenis();

    const onResize = () => {
      lenis.resize();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateOffset();
          performScroll(true, true);
        });
      });
    };

    const ro = new ResizeObserver(onResize);

    if (contentRef) {
      ro.observe(contentRef);
      contentRef.addEventListener("wheel", handleUserInteraction, { passive: true });
      contentRef.addEventListener("touchmove", handleUserInteraction, { passive: true });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateOffset();
        lenis?.resize();
        performScroll(true, true);
      });
    });

    onCleanup(() => {
      if (contentRef) {
        contentRef.removeEventListener("wheel", handleUserInteraction);
        contentRef.removeEventListener("touchmove", handleUserInteraction);
      }
      ro.disconnect();
      clearTimeout(scrollTimeout);
      setIsActiveVisible(true);
      setJumpToActive(null);
    });
  });

  return (
    <div class="line-lyrics" ref={containerRef}>
      <For each={lineEntries()}>
        {(entry) => {
          const isActive = createMemo(() => {
            const isTarget = activeIndices().includes(entry.index) || scrollToIndex() === entry.index;

            if (isTarget && entry.index === lineEntries().length - 1) {
              const endTime = entry.type === "interlude" ? entry.end : entry.content.EndTime * 1000;

              return currentPos() <= endTime;
            }

            return isTarget;
          });

          const lineStatus = createMemo(() => {
            const active = activeIndices();
            if (active.includes(entry.index)) return "active";

            const endTime =
              entry.type === "interlude"
                ? entry.end
                : entry.content.EndTime * 1000;

            if (currentPos() >= endTime) return "past";
            if (active.length > 0 && active[0] > entry.index) return "past";

            return "upcoming";
          });

          const blurStyle = createMemo(() => {
            if (isUserScroll()) return "0px";
            const blurmap = getBlurmap();
            const active = activeIndices();
            let distance = Math.abs(entry.index - scrollToIndex());

            for (const a of active) {
              const d = Math.abs(entry.index - a);
              if (d < distance) distance = d;
            }

            const blur =
              distance >= blurmap.length ? blurmap[blurmap.length - 1] : blurmap[distance];
            return `${blur}px`;
          });

          const isLineRTL = () => {
            if (entry.type === "interlude") return entry.isRTL && !romanize();
            const shouldUseRomanizedReplace = romanize() && romanize_position() === "replace";
            return entry.content.IsRTL && !shouldUseRomanizedReplace;
          };

          if (entry.type === "interlude") {
            return (
              <div
                class="line-wrapper interlude-wrapper"
                classList={{
                  rtl: isLineRTL(),
                }}
                ref={(el) => {
                  if (!el) return;
                  elementToIndex.set(el, entry.index);
                  itemRefs.set(entry.index, el);
                }}
                style={{
                  "--l-blur": blurStyle(),
                  "--l-scale": isActive() ? 1.01 : 1,
                  "--l-opacity": isActive() ? 1 : 0.6,
                }}
              >
                <Interlude
                  start={entry.start}
                  end={entry.end}
                  currentPos={currentPos()}
                  oppAligned={isLineRTL() ? !entry.oppAligned : entry.oppAligned}
                  rtl={isLineRTL()}
                />
              </div>
            );
          }

          const showTop = () => romanize() && romanize_position() === "top";
          const showBottom = () => romanize() && romanize_position() === "bottom";
          const useReplace = () => romanize() && romanize_position() === "replace";

          const displayText = createMemo(() =>
            useReplace() ? entry.content.RomanizedText || entry.content.Text : entry.content.Text,
          );

          const hasRomanized = createMemo(() => !!entry.content.RomanizedText && romanize());

          const progress = createMemo(() => {
            const status = lineStatus();
            if (status === "past") return 100;
            if (status === "upcoming") return 0;

            const start = entry.content.StartTime * 1000;
            const end = entry.content.EndTime * 1000;
            const pos = currentPos();
            if (pos <= start) return 0;
            if (pos >= end) return 100;
            return ((pos - start) / (end - start)) * 100;
          });

          return (
            <div
              class="line-wrapper"
              classList={{
                rtl: isLineRTL(),
              }}
              ref={(el) => {
                if (!el) return;
                elementToIndex.set(el, entry.index);
                itemRefs.set(entry.index, el);
              }}
              style={{
                "--l-blur": blurStyle(),
                "--l-scale": isActive() ? 1.01 : 1,
                "--l-opacity": isActive() ? 1 : 0.6,
              }}
            >
              <div
                class="line"
                classList={{
                  "has-romanized-top": showTop() && hasRomanized(),
                  "has-romanized-bottom": showBottom() && hasRomanized(),
                }}
                onClick={() => seekTo(entry.content.StartTime * 1000)}
                role="button"
                tabIndex={0}
                style={{
                  "--line-progress": `${progress()}%`,
                  "--line-progress-2": `${progress() > 0 ? progress() + 20 : 0}%`,
                  "--shadow-blur": `${progress() * 0.06}px`,
                  "--shadow-alpha": (progress() / 200) * 0.85,
                  "text-align": entry.content.OppositeAligned ? "end" : "start",
                }}
              >
                <Show when={showTop() && hasRomanized()}>
                  <span class="romanized-text romanized-top">{entry.content.RomanizedText}</span>
                </Show>
                {displayText()}
                <Show when={showBottom() && hasRomanized()}>
                  <span class="romanized-text romanized-bottom">{entry.content.RomanizedText}</span>
                </Show>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
