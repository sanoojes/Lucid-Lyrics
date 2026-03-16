import type { Syllable, SyllableData, VocalPart } from "@/lib/api/types";
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
import { $current_position, $is_active_visible, $jump_to_active, $romanize } from "@/stores";
import { SPACE_REGEX, splitGraphemes } from "@/lib/string";
import { seekTo } from "@/lib/spotify/player";
import { Interlude } from "@/component/lyrics/Interlude";
const BLUR_MAP = [0, 1, 2, 3, 4, 5];

export type SyllableLyricsProps = {
  lyrics: SyllableData;
  widgetHidden: boolean;
};

type LineEntry =
  | {
      type: "lyric";
      index: number;
      contentIndex: number;
      content: SyllableData["Content"][number];
    }
  | {
      type: "interlude";
      index: number;
      start: number;
      end: number;
      oppAligned: boolean;
      isIntro: boolean;
    };

type Word = { Syllables: Syllable[] };

const COMMON_STYLES_LINE_LEAD = (oppAligned: boolean = false, hasBg: boolean, isBg = false) =>
  ({
    position: "relative",
    display: "block",
    cursor: "pointer",
    "content-visibility": "auto",
    "text-align": oppAligned ? "right" : "left",
    "margin-bottom": hasBg && !isBg ? "4px" : undefined,
    ...(isBg
      ? {
          "font-size": "var(--bg-font-size)",
          "font-weight": "var(--bg-font-weight)",
        }
      : {}),
  }) as const;

const COMMON_STYLES_WORD = {
  display: "inline-block",
  position: "relative",
} as const;

function getVocalPartBounds(content: SyllableData["Content"][number]) {
  const lead = content.Lead.Syllables;
  let start = lead.length > 0 ? lead[0].StartTime * 1000 : Infinity;
  let end = lead.length > 0 ? lead[lead.length - 1].EndTime * 1000 : 0;

  content.Background?.forEach((bg) => {
    if (bg.Syllables.length > 0) {
      start = Math.min(start, bg.Syllables[0].StartTime * 1000);
      end = Math.max(end, bg.Syllables[bg.Syllables.length - 1].EndTime * 1000);
    }
  });

  return { start: start === Infinity ? 0 : start, end };
}

type LeadRendererProps = {
  vocalPart: VocalPart;
  background?: boolean;
  oppAligned?: boolean;
  hasBg?: boolean;
  romanize: boolean;
  currentPos: number;
};

function LeadRenderer(props: LeadRendererProps) {
  const words = createMemo(() => {
    const syllables = props.vocalPart.Syllables;
    const result: Word[] = [];
    let currentWord: Word | null = null;

    for (let i = 0; i < syllables.length; i++) {
      const syllable = syllables[i];
      const isFirstInWord = i === 0 || !syllables[i - 1].IsPartOfWord;

      if (isFirstInWord) {
        currentWord = { Syllables: [syllable] };
        result.push(currentWord);
      } else if (currentWord) {
        currentWord.Syllables.push(syllable);
      }
    }
    return result;
  });

  const handleClick = () => seekTo(props.vocalPart.StartTime * 1000);

  return (
    <span
      style={COMMON_STYLES_LINE_LEAD(props.oppAligned, !!props.hasBg, props.background)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <For each={words()}>
        {(word, wordIdx) => (
          <span class="word" style={COMMON_STYLES_WORD}>
            <For each={word.Syllables}>
              {(syllable) => {
                const displayText = createMemo(() =>
                  props.romanize ? (syllable.RomanizedText ?? syllable.Text) : syllable.Text,
                );
                const splitText = createMemo(() => splitGraphemes(displayText()));
                const isTrailing = !syllable.IsPartOfWord && wordIdx() !== words().length - 1;

                return (
                  <span
                    class={`syllable${isTrailing ? " trailing-whitespace" : ""}`}
                    style={{ display: "inline-block", position: "relative" }}
                  >
                    <For each={splitText()}>
                      {(char, index) => {
                        if (SPACE_REGEX.test(char)) return " ";

                        const charProgress = createMemo(() => {
                          const start = syllable.StartTime * 1000;
                          const end = syllable.EndTime * 1000;

                          if (props.currentPos < start) return 0;
                          if (props.currentPos >= end) return 100;

                          const charDuration = (end - start) / splitText().length;
                          const charStart = start + index() * charDuration;
                          const charEnd = charStart + charDuration;

                          if (props.currentPos < charStart) return 0;
                          if (props.currentPos >= charEnd) return 100;

                          return ((props.currentPos - charStart) / charDuration) * 100;
                        });

                        return (
                          <span
                            class="char"
                            style={{
                              "--char-progress": `${charProgress()}%`,
                              "--char-progress-2": `${
                                charProgress() > 0 ? charProgress() + 20 : 0
                              }%`,
                              "--shadow-blur": `${charProgress() * 0.06}px`,
                              "--shadow-alpha": (charProgress() / 200) * 0.85,
                              "text-shadow": `0px 0px var(--shadow-blur) rgba(255, 255, 255, var(--shadow-alpha))`,

                              position: "relative",
                              display: "inline-block",
                              "background-image": `linear-gradient(90deg, rgba(255, 255, 255, 0.85) var(--char-progress), rgba(255, 255, 255, 0.4) var(--char-progress-2))`,
                              "-webkit-background-clip": "text",
                              "-webkit-text-fill-color": "transparent",
                              "background-clip": "text",
                            }}
                          >
                            {char}
                          </span>
                        );
                      }}
                    </For>
                  </span>
                );
              }}
            </For>
          </span>
        )}
      </For>
    </span>
  );
}

function SyllableLyrics(props: SyllableLyricsProps) {
  let containerRef!: HTMLDivElement;
  const itemRefs = new Map<number, HTMLDivElement>();
  const elementToIndex = new WeakMap<Element, number>();

  const [isUserScroll, setIsUserScroll] = createSignal(false);
  const [isInteracting, setIsInteracting] = createSignal(false);
  const [visibleElements, setVisibleElements] = createSignal<Set<number>>(new Set());

  const currentPos = useStore($current_position);
  const romanize = useStore($romanize);
  const getLenis = useLenis();
  const getContentRef = useLenisContent();

  const lineEntries = createMemo((): LineEntry[] => {
    const content = props.lyrics.Content || [];
    const entries: LineEntry[] = [];
    let lineIdx = 0;

    for (let i = 0; i < content.length; i++) {
      const c = content[i];
      const { start, end } = getVocalPartBounds(c);

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

      entries.push({
        type: "lyric",
        index: lineIdx++,
        contentIndex: i,
        content: c,
      });

      if (i < content.length - 1) {
        const nextBounds = getVocalPartBounds(content[i + 1]);
        const gap = nextBounds.start - end;
        if (gap > 2000) {
          entries.push({
            type: "interlude",
            index: lineIdx++,
            start: end - 100,
            end: nextBounds.start - 100,
            oppAligned: c.OppositeAligned,
            isIntro: false,
          });
        }
      }
    }

    return entries;
  });

  const allBounds = createMemo(() => {
    return lineEntries().map((entry) => {
      if (entry.type === "interlude") {
        return { start: entry.start, end: entry.end };
      }
      return getVocalPartBounds(entry.content);
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

  const firstActiveIndex = createMemo(() => activeIndices()[0] ?? 0);

  const [scrollOffset, setScrollOffset] = createSignal(0);

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

  const performScroll = (immediate: boolean, forceScroll = false) => {
    const lenis = getLenis();
    const idx = firstActiveIndex();
    const targetRef = itemRefs.get(idx);

    if (idx !== -1 && targetRef && lenis && (forceScroll || !isUserScroll())) {
      lenis.scrollTo(targetRef, {
        offset: scrollOffset(),
        immediate,
        userData: { autoScroll: true },
      });
    }
  };

  createEffect(
    on(
      () => props.widgetHidden,
      (widgetHidden) => {
        updateOffset(widgetHidden);
        performScroll(true, true);
      },
    ),
  );

  createEffect(() => {
    const idx = firstActiveIndex();
    if (idx !== -1 && itemRefs.has(idx)) {
      performScroll(false);
    }
  });

  createEffect(
    on(
      romanize,
      () => {
        const lenis = getLenis();
        lenis?.resize();
        requestAnimationFrame(() => performScroll(true, true));
      },
      { defer: true },
    ),
  );

  let scrollTimeout: ReturnType<typeof setTimeout>;

  const handleUserInteraction = () => {
    setIsInteracting(true);
    setIsUserScroll(true);
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => setIsInteracting(false), 3000);
  };

  createEffect(() => {
    const activeVisible = visibleElements().has(firstActiveIndex());
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
      updateOffset();
      performScroll(true, true);
    };

    const ro = new ResizeObserver(onResize);
    if (contentRef) ro.observe(contentRef);

    updateOffset();
    lenis?.resize();

    performScroll(true, true);
    const iId = setInterval(() => performScroll(true, true), 50);
    const tId = setTimeout(() => clearInterval(iId), 1200);

    const handleFocusChange = () => {
      lenis.resize();
      performScroll(false, true);
    };
    window.addEventListener("focus", handleFocusChange);
    // window.addEventListener("blur", handleFocusChange);

    onCleanup(() => {
      ro.disconnect();
      clearInterval(iId);
      clearTimeout(tId);
      clearTimeout(scrollTimeout);
      $is_active_visible.set(true);
      $jump_to_active.set(null);
      window.removeEventListener("focus", handleFocusChange);
      // window.removeEventListener("blur", handleFocusChange);
    });
  });

  const hasOppAligned = createMemo(() => props.lyrics.Content.some((v) => v.OppositeAligned));

  const getBlurAmount = (index: number, reset = false): string => {
    if (reset) return "0px";

    const active = activeIndices();
    let distance = Math.abs(index - firstActiveIndex());

    for (const a of active) {
      const d = Math.abs(index - a);
      if (d < distance) distance = d;
    }

    const blur = distance >= BLUR_MAP.length ? BLUR_MAP[BLUR_MAP.length - 1] : BLUR_MAP[distance];
    return `${blur}px`;
  };
  return (
    <div
      class={`syllable-lyrics${props.widgetHidden ? " widget-hidden" : ""}`}
      ref={containerRef}
      onWheel={handleUserInteraction}
      onTouchMove={handleUserInteraction}
    >
      <For each={lineEntries()}>
        {(entry) => {
          const padding = () => (hasOppAligned() ? "5rem" : 0);
          const blur = createMemo(() => getBlurAmount(entry.index, isUserScroll()));
          const isActive = createMemo(() => {
            const isTarget = activeIndices().includes(entry.index);

            if (isTarget && entry.index === lineEntries().length - 1) {
              const endTime =
                entry.type === "interlude" ? entry.end : getVocalPartBounds(entry.content).end;

              return currentPos() <= endTime;
            }

            return isTarget;
          });

          return (
            <div
              class="line-wrapper"
              ref={(el) => {
                if (!el) return;
                elementToIndex.set(el, entry.index);
                itemRefs.set(entry.index, el);
              }}
              style={{
                "--blur": blur(),
                "--scale": isActive() ? 1.01 : 1,
                "--opacity": isActive() ? 1 : 0.6,
                "margin-bottom": entry.type === "interlude" ? 0 : "12px",
                "padding-right":
                  entry.type === "interlude" ? 0 : entry.content.OppositeAligned ? 0 : padding(),
                "padding-left":
                  entry.type === "interlude" ? 0 : entry.content.OppositeAligned ? padding() : 0,
              }}
            >
              {entry.type === "interlude" ? (
                <Interlude
                  start={entry.start}
                  end={entry.end}
                  currentPos={currentPos()}
                  oppAligned={entry.oppAligned}
                />
              ) : (
                <>
                  <LeadRenderer
                    vocalPart={entry.content.Lead}
                    oppAligned={entry.content.OppositeAligned}
                    hasBg={!!entry.content.Background}
                    romanize={romanize()}
                    currentPos={currentPos()}
                  />
                  <Show when={entry.content.Background}>
                    {(bg) => (
                      <For each={bg()}>
                        {(item) => (
                          <LeadRenderer
                            background
                            vocalPart={item}
                            oppAligned={entry.content.OppositeAligned}
                            romanize={romanize()}
                            currentPos={currentPos()}
                          />
                        )}
                      </For>
                    )}
                  </Show>
                </>
              )}
            </div>
          );
        }}
      </For>
    </div>
  );
}

export default SyllableLyrics;
