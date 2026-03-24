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
import { $current_position, $romanize, $romanize_position, getBlurmap } from "@/stores";
import { useRenderer } from "@/context/LyricsRenderer";
import { SPACE_REGEX, splitGraphemes } from "@/lib/string";
import { seekTo } from "@/lib/spotify/player";
import { Interlude } from "@/component/lyrics/Interlude";

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
      isRTL: boolean;
    };

type Word = { Syllables: Syllable[] };

const COMMON_STYLES_LINE_LEAD = (
  oppAligned: boolean = false,
  hasBg: boolean,
  isBg = false,
  paddingLeft?: string,
  paddingRight?: string,
) =>
  ({
    position: "relative",
    display: "block",
    cursor: "pointer",
    "content-visibility": "auto",
    "backface-visibility": "hidden",
    "text-align": oppAligned ? "end" : "start",
    "margin-bottom": hasBg && !isBg ? "4px" : undefined,
    "padding-left": paddingLeft !== undefined ? paddingLeft : undefined,
    "padding-right": paddingRight !== undefined ? paddingRight : undefined,
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
  romanize_position: "top" | "bottom" | "replace";
  currentPos: number;
  isRTL?: boolean;
  globalPadding: string;
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

  const paddingRight = () => (props.isRTL === props.oppAligned ? props.globalPadding : "0");
  const paddingLeft = () => (props.isRTL !== props.oppAligned ? props.globalPadding : "0");

  const showTop = () => props.romanize && props.romanize_position === "top";
  const showBottom = () => props.romanize && props.romanize_position === "bottom";
  const useReplace = () => props.romanize && props.romanize_position === "replace";

  const fullText = createMemo(() => {
    return props.vocalPart.Syllables.map((syllable) =>
      useReplace() ? (syllable.RomanizedText ?? syllable.Text) : syllable.Text,
    ).join("");
  });

  return (
    <span
      style={COMMON_STYLES_LINE_LEAD(
        props.oppAligned,
        !!props.hasBg,
        props.background,
        paddingLeft(),
        paddingRight(),
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={fullText()}
    >
      <For each={words()}>
        {(word, wordIdx) => {
          const wordSyllables = word.Syllables;
          const isTrailing = !wordSyllables[wordSyllables.length - 1].IsPartOfWord &&
            wordIdx() !== words().length - 1;

          const hasRomanizedInWord = createMemo(() =>
            wordSyllables.some((s) => !!s.RomanizedText && props.romanize && !useReplace()),
          );

          return (
            <span
              class="word"
              classList={{
                "trailing-whitespace": isTrailing,
                "has-romanized-top": showTop() && hasRomanizedInWord(),
                "has-romanized-bottom": showBottom() && hasRomanizedInWord(),
              }}
              style={COMMON_STYLES_WORD}
            >
              <For each={wordSyllables}>
                {(syllable) => {
                  const displayText = createMemo(() =>
                    useReplace() ? (syllable.RomanizedText ?? syllable.Text) : syllable.Text,
                  );
                  const splitText = createMemo(() => splitGraphemes(displayText()));
                  const hasRomanizedForSyllable = createMemo(() =>
                    !!syllable.RomanizedText && props.romanize && !useReplace(),
                  );
                  const romanizedSplit = createMemo(() =>
                    hasRomanizedForSyllable() ? splitGraphemes(syllable.RomanizedText ?? "") : [],
                  );

                  return (
                    <span
                      class="syllable"
                      classList={{
                        "has-romanized-top": showTop() && hasRomanizedForSyllable(),
                        "has-romanized-bottom": showBottom() && hasRomanizedForSyllable(),
                      }}
                      style={{ 
                        display: "inline-block", 
                        position: "relative",
                        "min-width": (showTop() || showBottom()) && hasRomanizedForSyllable() ? "1ch" : undefined,
                      }}
                    >
                      <Show when={showTop() && hasRomanizedForSyllable()}>
                        <span
                          class="romanized-text romanized-top"
                          style={{
                            display: "block",
                            "font-size": "var(--romanized-font-size, 0.6em)",
                            "line-height": "1.1",
                            "margin-bottom": "0.5px",
                            direction: "ltr",
                            "unicode-bidi": "embed",
                          }}
                        >
                          <For each={romanizedSplit()}>
                            {(char, charIdx) => {
                              const charDuration = (syllable.EndTime * 1000 - syllable.StartTime * 1000) / romanizedSplit().length;
                              const charStart = syllable.StartTime * 1000 + charIdx() * charDuration;
                              const charEnd = charStart + charDuration;
                              const progress = createMemo(() => {
                                if (props.currentPos < syllable.StartTime * 1000) return 0;
                                if (props.currentPos >= syllable.EndTime * 1000) return 100;
                                if (props.currentPos < charStart) return 0;
                                if (props.currentPos >= charEnd) return 100;
                                return ((props.currentPos - charStart) / charDuration) * 100;
                              });
                              return (
                                <span
                                  class="char romanized"
                                  style={{
                                    "--char-progress": `${progress()}%`,
                                    "--char-progress-2": `${progress() > 0 ? progress() + 20 : 0}%`,
                                    display: "inline-block",
                                    "background-image": `linear-gradient(90deg, rgba(255, 255, 255, 0.7) var(--char-progress), rgba(255, 255, 255, 0.3) var(--char-progress-2))`,
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
                      </Show>
                      <Show when={showBottom() && hasRomanizedForSyllable()}>
                        <span
                          class="romanized-text romanized-bottom"
                          style={{
                            display: "block",
                            "font-size": "var(--romanized-font-size, 0.6em)",
                            "line-height": "1.1",
                            "margin-top": "0.5px",
                            direction: "ltr",
                            "unicode-bidi": "embed",
                          }}
                        >
                          <For each={romanizedSplit()}>
                            {(char, charIdx) => {
                              const charDuration = (syllable.EndTime * 1000 - syllable.StartTime * 1000) / romanizedSplit().length;
                              const charStart = syllable.StartTime * 1000 + charIdx() * charDuration;
                              const charEnd = charStart + charDuration;
                              const progress = createMemo(() => {
                                if (props.currentPos < syllable.StartTime * 1000) return 0;
                                if (props.currentPos >= syllable.EndTime * 1000) return 100;
                                if (props.currentPos < charStart) return 0;
                                if (props.currentPos >= charEnd) return 100;
                                return ((props.currentPos - charStart) / charDuration) * 100;
                              });
                              return (
                                <span
                                  class="char romanized"
                                  style={{
                                    "--char-progress": `${progress()}%`,
                                    "--char-progress-2": `${progress() > 0 ? progress() + 20 : 0}%`,
                                    display: "inline-block",
                                    "background-image": `linear-gradient(90deg, rgba(255, 255, 255, 0.7) var(--char-progress), rgba(255, 255, 255, 0.3) var(--char-progress-2))`,
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
                      </Show>
                      <For each={splitText()}>
                        {(char, charIdx) => {
                          if (SPACE_REGEX.test(char)) return " ";

                          const charProgress = createMemo(() => {
                            const start = syllable.StartTime * 1000;
                            const end = syllable.EndTime * 1000;

                            if (props.currentPos < start) return 0;
                            if (props.currentPos >= end) return 100;

                            const charDuration = (end - start) / splitText().length;
                            const charStart = start + charIdx() * charDuration;
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
                                "--char-progress-2": `${charProgress() > 0 ? charProgress() + 20 : 0}%`,
                                "--shadow-blur": `${charProgress() * 0.06}px`,
                                "--shadow-alpha": (charProgress() / 200) * 0.85,
                                "text-shadow": `0px 0px var(--shadow-blur) rgba(255, 255, 255, var(--shadow-alpha))`,
                                position: "relative",
                                display: "inline-block",
                                "background-image": `linear-gradient(${props.isRTL ? 270 : 90}deg, rgba(255, 255, 255, 0.85) var(--char-progress), rgba(255, 255, 255, 0.4) var(--char-progress-2))`,
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
          );
        }}
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

  const cachedLayout = {
    isMobile: 0,
    isNPV: 0,
  };

  const currentPos = useStore($current_position);
  const romanize = useStore($romanize);
  const romanize_position = useStore($romanize_position);
  const { setIsActiveVisible, setJumpToActive } = useRenderer();
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
          isRTL: c.IsRTL,
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
            start: Math.max(0, end - 100),
            end: Math.max(0, nextBounds.start - 100),
            oppAligned: c.OppositeAligned,
            isIntro: false,
            isRTL: c.IsRTL,
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

  function updateCachedLayout() {
    if (!containerRef) return;
    const style = getComputedStyle(containerRef);
    cachedLayout.isMobile = Number.parseInt(style.getPropertyValue("--is-mobile") || "0");
    cachedLayout.isNPV = Number.parseInt(style.getPropertyValue("--is-npv") || "0");
  }

  function updateOffset(isWidgetHidden = props.widgetHidden ?? false) {
    if (cachedLayout.isMobile === 0 && cachedLayout.isNPV === 0) {
      updateCachedLayout();
    }
    const lenis = getLenis();
    if (!lenis?.rootElement) return;

    const height = lenis.rootElement.clientHeight;
    const isMobile = cachedLayout.isMobile;
    const isNPV = cachedLayout.isNPV;
    const baseOffset = isNPV ? 16 : isMobile && !isWidgetHidden ? 48 : height / 2.7;
    const activeCount = activeIndices().length;
    const lineOffset = activeCount > 1 ? (activeCount - 1) * 20 : 0;
    const off = -(baseOffset + lineOffset);
    setScrollOffset(off);
  }

  const performScroll = (immediate: boolean, forceScroll = false) => {
    const lenis = getLenis();
    const idx = firstActiveIndex();
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
    const idx = firstActiveIndex();

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
    const activeVisible = visibleElements().has(firstActiveIndex());
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
          updateCachedLayout();
          updateOffset();
          setVisibleElements(new Set<number>());
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
        updateCachedLayout();
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

  const hasOppAligned = createMemo(() => props.lyrics.Content.some((v) => v.OppositeAligned));

  const getBlurAmount = (index: number, reset = false): string => {
    if (reset) return "0px";

    const blurmap = getBlurmap();
    const active = activeIndices();
    let distance = Math.abs(index - firstActiveIndex());

    for (const a of active) {
      const d = Math.abs(index - a);
      if (d < distance) distance = d;
    }

    const blur = distance >= blurmap.length ? blurmap[blurmap.length - 1] : blurmap[distance];
    return `${blur}px`;
  };

  return (
    <div class="syllable-lyrics" ref={containerRef}>
      <For each={lineEntries()}>
        {(entry) => {
          const padding = () => (hasOppAligned() ? "var(--lyrics-line-default-padding)" : "0");
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

          const isLineRTL = () => {
            if (entry.type === "interlude") return entry.isRTL && !romanize();
            const shouldUseRomanizedReplace = romanize() && romanize_position() === "replace";
            return entry.content.IsRTL && !shouldUseRomanizedReplace;
          };

          const hasRomanizedText = createMemo(() => {
            if (entry.type === "interlude") return false;
            const syllables = entry.content.Lead.Syllables;
            return syllables.some((s) => s.RomanizedText && romanize());
          });
          const needsExtraSpace = () =>
            hasRomanizedText() && (romanize_position() === "top" || romanize_position() === "bottom");

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
                "--l-blur": blur(),
                "--l-scale": isActive() ? 1.01 : 1,
                "--l-opacity": isActive() ? 1 : 0.6,
                "margin-bottom": entry.type === "interlude" ? 0 : needsExtraSpace() ? "24px" : "12px",
              }}
            >
              {entry.type === "interlude" ? (
                <Interlude
                  start={entry.start}
                  end={entry.end}
                  currentPos={currentPos()}
                  oppAligned={isLineRTL() ? !entry.oppAligned : entry.oppAligned}
                  rtl={isLineRTL()}
                />
              ) : (
                <>
                  <LeadRenderer
                    vocalPart={entry.content.Lead}
                    oppAligned={entry.content.OppositeAligned}
                    hasBg={!!entry.content.Background}
                    romanize={romanize()}
                    romanize_position={romanize_position()}
                    currentPos={currentPos()}
                    isRTL={isLineRTL()}
                    globalPadding={padding()}
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
                            romanize_position={romanize_position()}
                            currentPos={currentPos()}
                            isRTL={isLineRTL()}
                            globalPadding={padding()}
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
