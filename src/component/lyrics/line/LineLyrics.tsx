import type { LineData } from "@/lib/api/types";
import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount } from "solid-js";
import { useLenis, useLenisContent } from "@/component/ui/Lenis";
import { useStore } from "@nanostores/solid";
import { $current_position, $is_active_visible, $jump_to_active, $romanize } from "@/stores";
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
      isRTL: boolean;
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

  // Use the exact tracking map approach from SyllableLyrics
  const itemRefs = new Map<number, HTMLDivElement>();
  const elementToIndex = new WeakMap<Element, number>();

  const [isUserScroll, setIsUserScroll] = createSignal(false);
  const [isInteracting, setIsInteracting] = createSignal(false);
  const [visibleElements, setVisibleElements] = createSignal<Set<number>>(new Set());
  const [scrollOffset, setScrollOffset] = createSignal(0);

  const currentPos = useStore($current_position);
  const romanize = useStore($romanize);
  const getLenis = useLenis();
  const getContentRef = useLenisContent();

  const lineEntries = createMemo(() => buildLineEntries(props.lyrics));

  const activeIndex = createMemo(() => {
    const pos = currentPos();
    const entries = lineEntries();
    if (entries.length === 0) return 0;

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const start = e.type === "interlude" ? e.start : e.content.StartTime * 1000;
      const end = e.type === "interlude" ? e.end : e.content.EndTime * 1000;
      if (pos >= start && pos <= end) return e.index;
    }

    if (pos > 0) {
      const nextIdx = entries.findIndex((e) => {
        const start = e.type === "interlude" ? e.start : e.content.StartTime * 1000;
        return start > pos;
      });
      return nextIdx === -1 ? entries[entries.length - 1].index : Math.max(0, nextIdx - 1);
    }

    return 0;
  });

  const hasOppAligned = createMemo(() => props.lyrics.Content.some((v) => v.OppositeAligned));

  function updateOffset(isWidgetHidden = props.widgetHidden ?? false) {
    if (!containerRef) return;
    const style = getComputedStyle(containerRef);
    const isMobile = Number.parseInt(style.getPropertyValue("--is-mobile") || "0", 10);
    const lenis = getLenis();
    if (!lenis?.rootElement) return;

    const height = lenis.rootElement.clientHeight;
    const off = -(isMobile && !isWidgetHidden ? 48 : height / 2.7);
    setScrollOffset(off);
  }

  // Matching absolute math scroll mechanism
  const performScroll = (immediate: boolean, forceScroll = false) => {
    const lenis = getLenis();
    const idx = activeIndex();
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
    const idx = activeIndex();

    if (!isUserScroll() && idx !== -1 && itemRefs.has(idx)) {
      requestAnimationFrame(() => {
        performScroll(false);
      });
    }
  });

  createEffect(
    on(
      romanize,
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
    const activeVisible = visibleElements().has(activeIndex());
    $is_active_visible.set(activeVisible);

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
        { threshold: 0.1 },
      );
    }

    observer.disconnect();

    queueMicrotask(() => {
      itemRefs.forEach((el) => observer!.observe(el));
    });

    onCleanup(() => observer?.disconnect());
  });

  onMount(() => {
    $jump_to_active.set(() => performScroll(false, true));

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
      $is_active_visible.set(true);
      $jump_to_active.set(null);
    });
  });

  return (
    <div class="line-lyrics" ref={containerRef}>
      <For each={lineEntries()}>
        {(entry) => {
          const isActive = createMemo(() => {
            const isTargetIndex = entry.index === activeIndex();

            if (isTargetIndex && entry.index === lineEntries().length - 1) {
              const endTime = entry.type === "interlude" ? entry.end : entry.content.EndTime * 1000;
              return currentPos() <= endTime;
            }

            return isTargetIndex;
          });

          const blurStyle = createMemo(() => {
            if (isUserScroll()) return "0px";
            const d = Math.abs(entry.index - activeIndex());
            return d >= 5 ? "5px" : `${d}px`;
          });

          const isLineRTL = () => {
            if (entry.type === "interlude") return entry.isRTL;
            return entry.content.IsRTL;
          };

          if (entry.type === "interlude") {
            return (
              <div
                class={"line-wrapper"}
                classList={{
                  rtl: isLineRTL(),
                }}
                ref={(el) => {
                  if (!el) return;
                  elementToIndex.set(el, entry.index);
                  itemRefs.set(entry.index, el);
                }}
                style={{
                  "--blur": blurStyle(),
                  "--scale": isActive() ? 1.01 : 1,
                  "--opacity": isActive() ? 1 : 0.6,
                  "margin-bottom": 0,
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

          const padding = hasOppAligned() ? "5rem" : undefined;

          const paddingRight = () => {
            if (!padding) return undefined;
            const isRtl = isLineRTL();
            const isOpposite = entry.content.OppositeAligned;
            return isRtl === isOpposite ? padding : undefined;
          };

          const paddingLeft = () => {
            if (!padding) return undefined;
            const isRtl = isLineRTL();
            const isOpposite = entry.content.OppositeAligned;
            return isRtl !== isOpposite ? padding : undefined;
          };

          const displayText = createMemo(() =>
            romanize() ? entry.content.RomanizedText || entry.content.Text : entry.content.Text,
          );

          const progress = createMemo(() => {
            if (!isActive()) return 0;
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
                "--blur": blurStyle(),
                "--scale": isActive() ? 1.01 : 1,
                "--opacity": isActive() ? 1 : 0.6,
                "margin-bottom": "12px",
                "padding-right": paddingRight(),
                "padding-left": paddingLeft(),
              }}
            >
              <span
                onClick={() => seekTo(entry.content.StartTime * 1000)}
                role="button"
                tabIndex={0}
                style={{
                  "--line-progress": `${progress()}%`,
                  "--line-progress-2": `${progress() > 0 ? progress() + 20 : 0}%`,
                  "--shadow-blur": `${progress() * 0.06}px`,
                  "--shadow-alpha": (progress() / 200) * 0.85,
                  position: "relative",
                  display: "inline-block",
                  "text-align": isLineRTL()
                    ? entry.content.OppositeAligned
                      ? "left"
                      : "right"
                    : entry.content.OppositeAligned
                      ? "right"
                      : "left",
                  "text-shadow": "0px 0px var(--shadow-blur) rgba(255,255,255,var(--shadow-alpha))",
                  "background-image": `linear-gradient(180deg,rgba(255,255,255,0.9) var(--line-progress),rgba(255,255,255,0.4) var(--line-progress-2))`,
                  "-webkit-background-clip": "text",
                  "-webkit-text-fill-color": "transparent",
                  "background-clip": "text",
                }}
              >
                {displayText()}
              </span>
            </div>
          );
        }}
      </For>
    </div>
  );
}
