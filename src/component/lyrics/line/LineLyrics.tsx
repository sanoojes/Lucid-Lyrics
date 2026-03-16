import type { LineData } from "@/lib/api/types";
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import { useLenis, useLenisContent } from "@/component/ui/Lenis";
import { useStore } from "@nanostores/solid";
import {
  $current_position,
  $is_active_visible,
  $jump_to_active,
  $romanize,
} from "@/stores";
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
        });
      }
    }
  }

  return entries;
}

export default function LineLyrics(props: LineLyricsProps) {
  let containerRef!: HTMLDivElement;

  const itemRefs = new Map<number, HTMLDivElement>();

  const [isUserScroll, setIsUserScroll] = createSignal(false);
  const [isInteracting, setIsInteracting] = createSignal(false);
  const [visibleElements, setVisibleElements] = createSignal<Set<number>>(
    new Set(),
    { equals: false }
  );
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
      return nextIdx === -1
        ? entries[entries.length - 1].index
        : Math.max(0, nextIdx - 1);
    }

    return 0;
  });

  const hasOppAligned = createMemo(() =>
    props.lyrics.Content.some((v) => v.OppositeAligned)
  );

  function updateOffset(isWidgetHidden = props.widgetHidden) {
    if (!containerRef) return;
    const style = getComputedStyle(containerRef);
    const isMobile = Number.parseInt(style.getPropertyValue("--is-mobile") || "0", 10);
    const lenis = getLenis();
    if (!lenis) return;
    const height = lenis.rootElement.clientHeight;
    setScrollOffset(-(isMobile && !isWidgetHidden ? 48 : height / 2.7));
  }

  const performScroll = (immediate: boolean, forceScroll = false) => {
    const lenis = getLenis();
    const idx = untrack(activeIndex); 
    const targetRef = itemRefs.get(idx);
    if (idx !== -1 && targetRef && lenis && (forceScroll || !untrack(isUserScroll))) {
      lenis.scrollTo(targetRef, {
        offset: untrack(scrollOffset),
        immediate,
        userData: { autoScroll: true },
      });
    }
  };

  let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  const handleUserInteraction = () => {
    batch(() => {
      setIsInteracting(true);
      setIsUserScroll(true);
    });
    if (scrollTimeout !== undefined) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => setIsInteracting(false), 1500);
  };

  createEffect(() => {
    const activeVisible = visibleElements().has(activeIndex());
    $is_active_visible.set(activeVisible);
    if (!isInteracting() && isUserScroll() && activeVisible) {
      batch(() => setIsUserScroll(false));
      performScroll(false);
    }
  });

  createEffect(
    on(
      () => props.widgetHidden,
      (w) => {
        updateOffset(w);
        performScroll(true, true);
      }
    )
  );

  createEffect(() => {
    const idx = activeIndex();
    if (idx !== -1 && itemRefs.has(idx)) performScroll(false);
  });

  createEffect(
    on(
      romanize,
      () => {
        getLenis()?.resize();
        requestAnimationFrame(() => performScroll(true, true));
      },
      { defer: true }
    )
  );

  let observer: IntersectionObserver | undefined;
  const observedRefs = new Set<Element>();

  function syncObserver() {
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          setVisibleElements((prev) => {
            let changed = false;
            for (const entry of entries) {
              const el = entry.target as HTMLDivElement;
              const idx = Number((el as any).__lyricsIndex);
              if (isNaN(idx)) continue;
              if (entry.isIntersecting) {
                if (!prev.has(idx)) { prev.add(idx); changed = true; }
              } else {
                if (prev.has(idx)) { prev.delete(idx); changed = true; }
              }
            }
            return changed ? prev : prev;
          });
        },
        { threshold: 0.1 }
      );
    }

    const current = new Set(itemRefs.values());

    for (const el of observedRefs) {
      if (!current.has(el as HTMLDivElement)) {
        observer.unobserve(el);
        observedRefs.delete(el);
      }
    }

    for (const el of current) {
      if (!observedRefs.has(el)) {
        observer.observe(el);
        observedRefs.add(el);
      }
    }
  }

  createEffect(on(lineEntries, syncObserver));

  onMount(() => {
    const lenis = getLenis();
    $jump_to_active.set(() => performScroll(false, true));

    const ro = new ResizeObserver(() => {
      updateOffset();
      performScroll(true, true);
    });
    const contentRef = getContentRef();
    if (contentRef) ro.observe(contentRef);

    updateOffset();
    lenis?.resize();

    let attempt = 0;
    const maxAttempts = 5;
    const tryScroll = () => {
      performScroll(true, true);
      if (++attempt < maxAttempts) {
        setTimeout(tryScroll, 50 * (1 << attempt));
      }
    };
    tryScroll();

    onCleanup(() => {
      ro.disconnect();
      observer?.disconnect();
      observedRefs.clear();
      if (scrollTimeout !== undefined) clearTimeout(scrollTimeout);
      $is_active_visible.set(true);
      $jump_to_active.set(null);
    });
  });

  return (
    <div
      class={`line-lyrics${props.widgetHidden ? " widget-hidden" : ""}`}
      ref={containerRef}
      onWheel={handleUserInteraction}
      onTouchMove={handleUserInteraction}
    >
      <div class="top-spacer" />
      <For each={lineEntries()}>
        {(entry) => {
          const isActive = createMemo(() => entry.index === activeIndex());

    
          const blurStyle = createMemo(() => {
            if (isUserScroll()) return "0px";
            const d = Math.abs(entry.index - activeIndex());
            return d >= 5 ? "5px" : `${d}px`;
          });

          const refCallback = (el: HTMLDivElement | null) => {
            if (!el) { itemRefs.delete(entry.index); return; }
            (el as any).__lyricsIndex = entry.index; 
            itemRefs.set(entry.index, el);
            if (observer && !observedRefs.has(el)) {
              observer.observe(el);
              observedRefs.add(el);
            }
          };

          if (entry.type === "interlude") {
            return (
              <div
                class="line-wrapper"
                ref={refCallback}
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
                  oppAligned={entry.oppAligned}
                />
              </div>
            );
          }

          const padding = hasOppAligned() ? "5rem" : undefined;

          const displayText = createMemo(() =>
            romanize()
              ? entry.content.RomanizedText || entry.content.Text
              : entry.content.Text
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
              ref={refCallback}
              style={{
                "--blur": blurStyle(),
                "--scale": isActive() ? 1.01 : 1,
                "--opacity": isActive() ? 1 : 0.6,
                "margin-bottom": "12px",
                "padding-right": entry.content.OppositeAligned ? undefined : padding,
                "padding-left": entry.content.OppositeAligned ? padding : undefined,
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
                  "text-align": entry.content.OppositeAligned ? "right" : "left",
                  "text-shadow":
                    "0px 0px var(--shadow-blur) rgba(255,255,255,var(--shadow-alpha))",
                  "background-image":
                    "linear-gradient(180deg,rgba(255,255,255,0.9) var(--line-progress),rgba(255,255,255,0.4) var(--line-progress-2))",
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
      <div class="bottom-spacer" />
    </div>
  );
}