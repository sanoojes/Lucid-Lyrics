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
      isRTL?: boolean;
    };

type Word = { Syllables: Syllable[] };

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
  getCurrentPos: () => number;
  lineStatus: () => "past" | "active" | "upcoming";
  isRTL?: boolean;
  hasOppAligned?: boolean;
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

  const showTop = () => props.romanize && props.romanize_position === "top";
  const showBottom = () => props.romanize && props.romanize_position === "bottom";
  const useReplace = () => props.romanize && props.romanize_position === "replace";

  const paddingInline = () => {
    if (!props.hasOppAligned) return "0";

    return props.oppAligned
      ? "var(--lyrics-line-default-padding) 0"
      : "0 var(--lyrics-line-default-padding)";
  };

  return (
    <span
      class="syllable-line"
      classList={{
        "has-bg-line": props.hasBg,
        "background-line": props.background,
        "opp-aligned": props.oppAligned,
      }}
      style={{
        "text-align": props.oppAligned ? "end" : "start", // for some reason scss makes end => right and start => left
        "padding-inline": paddingInline(),
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <For each={words()}>
        {(word, wordIdx) => {
          const wordSyllables = word.Syllables;
          const isTrailing =
            !wordSyllables[wordSyllables.length - 1].IsPartOfWord &&
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
            >
              <For each={wordSyllables}>
                {(syllable) => {
                  const displayText = createMemo(() =>
                    useReplace() ? (syllable.RomanizedText ?? syllable.Text) : syllable.Text,
                  );
                  const splitText = createMemo(() => splitGraphemes(displayText()));
                  const hasRomanizedForSyllable = createMemo(
                    () => !!syllable.RomanizedText && props.romanize && !useReplace(),
                  );
                  const romanizedSplit = createMemo(() =>
                    hasRomanizedForSyllable() ? splitGraphemes(syllable.RomanizedText || "") : [],
                  );

                  type RomanizedProps = { position: "bottom" | "top" };
                  const RomanizedLyrics = (rProps: RomanizedProps) => (
                    <Show when={hasRomanizedForSyllable()}>
                      <span class={`romanized-text at-${rProps.position}`}>
                        <For each={romanizedSplit()}>
                          {(char, charIdx) => {
                            const charDuration =
                              (syllable.EndTime * 1000 - syllable.StartTime * 1000) /
                              romanizedSplit().length;
                            const charStart = syllable.StartTime * 1000 + charIdx() * charDuration;
                            const charEnd = charStart + charDuration;

                            const progress = createMemo(() => {
                              const status = props.lineStatus();
                              if (status === "past") return 100;
                              if (status === "upcoming") return 0;

                              const pos = props.getCurrentPos();
                              if (pos < charStart) return 0;
                              if (pos >= charEnd) return 100;
                              return ((pos - charStart) / charDuration) * 100;
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
                  );

                  return (
                    <span
                      class="syllable"
                      classList={{
                        "has-romanized-top": showTop() && hasRomanizedForSyllable(),
                        "has-romanized-bottom": showBottom() && hasRomanizedForSyllable(),
                      }}
                    >
                      <Show when={showTop()}>
                        <RomanizedLyrics position="top" />
                      </Show>
                      <span>
                        <For each={splitText()}>
                          {(char, charIdx) => {
                            if (SPACE_REGEX.test(char)) return " ";

                            const charProgress = createMemo(() => {
                              const status = props.lineStatus();
                              if (status === "past") return 100;
                              if (status === "upcoming") return 0;

                              const start = syllable.StartTime * 1000;
                              const end = syllable.EndTime * 1000;
                              const pos = props.getCurrentPos();

                              if (pos < start) return 0;
                              if (pos >= end) return 100;

                              const charDuration = (end - start) / splitText().length;
                              const charStart = start + charIdx() * charDuration;
                              const charEnd = charStart + charDuration;

                              if (pos < charStart) return 0;
                              if (pos >= charEnd) return 100;

                              return ((pos - charStart) / charDuration) * 100;
                            });

                            return (
                              <span
                                class="char"
                                style={{
                                  "--char-progress": `${charProgress()}%`,
                                  "--char-progress-2": `${charProgress() > 0 ? charProgress() + 20 : 0}%`,
                                  "--shadow-blur": `${charProgress() * 0.06}px`,
                                  "--shadow-alpha": (charProgress() / 200) * 0.85,
                                  "background-image": `linear-gradient(${props.isRTL ? 270 : 90}deg, rgba(255, 255, 255, 0.85) var(--char-progress), rgba(255, 255, 255, 0.4) var(--char-progress-2))`,
                                }}
                              >
                                {char}
                              </span>
                            );
                          }}
                        </For>
                      </span>

                      <Show when={showBottom()}>
                        <RomanizedLyrics position="bottom" />
                      </Show>
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

  let highestActiveIndex = 0;
  let lastSeenPos = 0;

  const [isUserScroll, setIsUserScroll] = createSignal(false);
  const [isInteracting, setIsInteracting] = createSignal(false);
  const [visibleElements, setVisibleElements] = createSignal<Set<number>>(new Set());

  const [isMobile, setIsMobile] = createSignal(false);
  const [isNPV, setIsNPV] = createSignal(false);

  const currentPos = useStore($current_position);
  const romanize = useStore($romanize);
  const romanize_position = useStore($romanize_position);
  const { setIsActiveVisible, setJumpToActive } = useRenderer();
  const getLenis = useLenis();
  const getContentRef = useLenisContent();

  const updateLayoutVars = () => {
    if (!containerRef) return;
    const style = getComputedStyle(containerRef);
    setIsMobile(style.getPropertyValue("--is-mobile") === "1");
    setIsNPV(style.getPropertyValue("--is-npv") === "1");
  };

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
        const nextLine = content[i + 1];
        const nextBounds = getVocalPartBounds(nextLine);
        const gap = nextBounds.start - end;

        if (gap > 2000) {
          entries.push({
            type: "interlude",
            index: lineIdx++,
            start: Math.max(0, end - 100),
            end: Math.max(0, nextBounds.start - 100),
            oppAligned: nextLine.OppositeAligned,
            isIntro: false,
            isRTL: nextLine.IsRTL,
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
      const isRTL =
        currentEntry?.type === "lyric"
          ? romanize() && romanize_position() === "replace"
            ? false
            : currentEntry.content.IsRTL
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

  const [scrollOffset, setScrollOffset] = createSignal(0);

  function updateOffset(isWidgetHidden = props.widgetHidden ?? false) {
    const lenis = getLenis();
    if (!lenis) return;

    const rootEl = lenis.rootElement as HTMLElement;
    const height =
      rootEl === document.documentElement || rootEl === document.body
        ? window.innerHeight
        : rootEl?.clientHeight || window.innerHeight;

    let baseOffset = height / 2.7;

    if (isNPV()) {
      baseOffset = 16;
    } else if (isMobile() && !isWidgetHidden) {
      baseOffset = 48;
    } else if (romanize() && romanize_position() !== "replace") {
      if (romanize_position() === "top") {
        baseOffset = height / 2.4;
      } else if (romanize_position() === "bottom") {
        baseOffset = height / 3.2;
      }
    }

    const activeCount = activeIndices().length;
    const lineOffset = activeCount > 1 ? (activeCount - 1) * 24 : 0;

    setScrollOffset(-(baseOffset + lineOffset));
  }

  const performScroll = (immediate: boolean, forceScroll = false) => {
    const lenis = getLenis();
    const idx = scrollToIndex();
    const targetRef = itemRefs.get(idx);

    if (!lenis || !targetRef || !targetRef.isConnected) return;
    if (!forceScroll && isUserScroll()) return;

    const wrapper = lenis.rootElement;
    if (!wrapper) return;

    const targetRect = targetRef.getBoundingClientRect();
    let targetY: number;

    const anchorOffset = isMobile() ? 0 : targetRect.height / 3;

    if (wrapper === document.documentElement || wrapper === document.body) {
      targetY = targetRect.top + anchorOffset + window.scrollY + scrollOffset();
    } else {
      const wrapperRect = wrapper.getBoundingClientRect();
      targetY = targetRect.top + anchorOffset - wrapperRect.top + lenis.scroll + scrollOffset();
    }

    lenis.scrollTo(targetY, {
      immediate,
      lock: false,
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
        const handleRomanize = () => {
          const lenis = getLenis();
          if (lenis) {
            lenis.resize();
            updateOffset();
            performScroll(true, true);
          }
        };
        requestAnimationFrame(handleRomanize);
        setTimeout(handleRomanize, 50);
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
      getLenis()?.resize();
      performScroll(false, true);
    });

    const contentRef = getContentRef();
    const lenis = getLenis();

    const onResize = () => {
      requestAnimationFrame(() => {
        updateLayoutVars();
        if (lenis) {
          lenis.resize();
          updateOffset();
          performScroll(true, true);
        }
      });
    };

    const ro = new ResizeObserver(onResize);

    onResize();
    requestAnimationFrame(onResize);
    requestAnimationFrame(() => requestAnimationFrame(onResize));

    if (contentRef) {
      ro.observe(contentRef);
      contentRef.addEventListener("wheel", handleUserInteraction, { passive: true });
      contentRef.addEventListener("touchmove", handleUserInteraction, { passive: true });
    }
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
    let distance = Math.abs(index - scrollToIndex());

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

          const lineStatus = createMemo(() => {
            const active = activeIndices();
            if (active.includes(entry.index)) return "active";

            const endTime =
              entry.type === "interlude" ? entry.end : getVocalPartBounds(entry.content).end;

            if (currentPos() >= endTime) return "past";
            if (active.length > 0 && active[0] > entry.index) return "past";
            return "upcoming";
          });

          const isLineRTL = () => {
            if (entry.type === "interlude")
              return entry.isRTL && !(romanize() && romanize_position() === "replace");
            const shouldUseRomanizedReplace = romanize() && romanize_position() === "replace";
            return entry.content.IsRTL && !shouldUseRomanizedReplace;
          };

          const hasRomanizedText = createMemo(() => {
            if (entry.type === "interlude") return false;
            const syllables = entry.content.Lead.Syllables;
            return syllables.some((s) => s.RomanizedText && romanize());
          });

          return (
            <div
              class="line-wrapper"
              classList={{
                rtl: isLineRTL(),
                "roman-top": romanize() && romanize_position() === "top",
                "roman-replace": romanize() && romanize_position() === "replace",
                "roman-bottom": romanize() && romanize_position() === "bottom",
                "has-romanized": hasRomanizedText(),
                "interlude-wrapper": entry.type === "interlude",
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
              }}
            >
              {entry.type === "interlude" ? (
                <Interlude
                  start={entry.start}
                  end={entry.end}
                  currentPos={currentPos()}
                  oppAligned={entry.oppAligned}
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
                    getCurrentPos={currentPos}
                    lineStatus={lineStatus}
                    isRTL={isLineRTL()}
                    hasOppAligned={hasOppAligned()}
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
                            getCurrentPos={currentPos}
                            lineStatus={lineStatus}
                            isRTL={isLineRTL()}
                            hasOppAligned={hasOppAligned()}
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
