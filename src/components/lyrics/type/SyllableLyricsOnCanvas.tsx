import useTrackPosition from '@/hooks/useTrackPosition.ts';
import appStore from '@/store/appStore.ts';
import type { SyllableData, VocalPart as VocalPartType } from '@/types/lyrics.ts';
import seekTo from '@/utils/player/seekTo.ts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';

type LayoutElement = {
  text: string;
  x: number;
  width: number;
  height: number;
  start: number;
  end: number;
  maxX: number;
  isLead: boolean;
  isDot?: boolean;
  font: string;
  wordGroup: number;
  boundingBox: { x: number; y: number; width: number; height: number };
};

type LayoutLine = {
  elements: LayoutElement[];
  y: number;
  height: number;
  end: number;
  align: 'left' | 'right';
  totalWidth: number;
  isInterlude?: boolean;
  start: number;
  lineGroup: number;
  boundingBox: { x: number; y: number; width: number; height: number };
};

type CanvasLyricsProps = {
  data: SyllableData;
};

const CONFIG = {
  FONT_FAMILY: 'LucidLyrics',
  FONT_SIZE_LEAD_BASE: 36,
  FONT_SIZE_BG_BASE: 24,
  FONT_SIZE_INTERLUDE_DOT: 16,
  CREDITS_FONT_SIZE_RATIO: 0.75,

  LINE_HEIGHT_MULTIPLIER: 1.18,
  LINE_GAP_MULTIPLIER_WITHIN_GROUP: 0,
  LINE_GAP_MULTIPLIER_BETWEEN_GROUPS: 0.8,

  INTERLUDE_THRESHOLD_MS: 2000,
  INTERLUDE_DOT_COUNT: 3,
  INTERLUDE_DOT_GAP: 8,
  INTERLUDE_DOT_AMPLITUDE: 6,
  INTERLUDE_GLOW_MAX_BLUR: 16,
  INTERLUDE_ANIMATION_SHOW_DELAY: 300,

  SCROLL_RESET_TIMEOUT_MS: 1000,
  SCROLL_SMOOTHING_FACTOR: 0.1,

  HOVER_CARD_PADDING: { x: 16, y: 12 },
  HOVER_CARD_RADIUS: 16,

  ACTIVE_LINE_GLOW_BLUR: 12,
  ACTIVE_LINE_TARGET_SCALE: 1.02,

  COLORS: {
    BG_TEXT: 'rgba(255, 255, 255, 0.4)',
    PAST_LINE: 'rgba(255, 255, 255, 0.4)',
    ACTIVE_LINE_GLOW: 'rgba(255, 255, 255, 0.8)',
    HOVER_CARD: 'rgba(255, 255, 255, 0.1)',
    INTERLUDE_DOT: 'rgba(255, 255, 255, 1)',
  },
} as const;

const INTERLUDE_DOT_FONT_STRING = `normal ${CONFIG.FONT_SIZE_INTERLUDE_DOT}px ${CONFIG.FONT_FAMILY}`;

const offscreenTextCanvas = document.createElement('canvas');
const offscreenTextCtx = offscreenTextCanvas.getContext('2d');
if (!offscreenTextCtx) {
  console.error('Failed to get 2D context for offscreen text measurement canvas.');
}
const measureTextWidth = (text: string, font: string): number => {
  if (!offscreenTextCtx) return text.length * (CONFIG.FONT_SIZE_BG_BASE / 2);
  offscreenTextCtx.font = font;
  return offscreenTextCtx.measureText(text).width;
};

const SyllableLyricsOnCanvas: React.FC<CanvasLyricsProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const syncButtonRef = useRef<HTMLButtonElement>(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const layoutRef = useRef<LayoutLine[]>([]);
  const groupBoundingBoxesRef = useRef<
    Map<number, { x: number; y: number; width: number; height: number }>
  >(new Map());

  const progressRef = useTrackPosition();
  const { forceRomanized, maxTranslateUpLetter, maxTranslateUpWord, splitThresholdMs } = useStore(
    appStore,
    (s) => s.lyrics
  );
  const scrollOffset = useStore(appStore, (s) => s.lyrics.scrollOffset);

  const scrollY = useRef(0);
  const targetScrollY = useRef(0);
  const maxScrollY = useRef(0);
  const isAutoScrollDisabled = useRef(false);
  const scrollResetTimeoutId = useRef<number | null>(null);

  const hoveredLineIdxRef = useRef<number | null>(null);

  const hoverAnimState = useRef({
    groupId: null as number | null,
    progress: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const groupAlphasRef = useRef<Map<number, number>>(new Map());
  const groupScalesRef = useRef<Map<number, number>>(new Map());

  const recalculateLayout = useCallback(() => {
    const { width, height } = canvasSizeRef.current;
    if (width === 0 || !offscreenTextCtx) return;

    const dynamicPadding = {
      TOP: height * 0.25,
      BOTTOM: height * 0.45,
      HORIZONTAL: width * 0.05,
    };

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const minRem = 1.85;
    const preferredCqw = 7;
    const maxRem = 3.5;
    const minPx = minRem * rootFontSize;
    const maxPx = maxRem * rootFontSize;
    const preferredPx = (preferredCqw / 100) * width;
    const leadSize = Math.max(minPx, Math.min(preferredPx, maxPx));
    const bgSize = leadSize * (CONFIG.FONT_SIZE_BG_BASE / CONFIG.FONT_SIZE_LEAD_BASE);
    const fontSizes = {
      lead: leadSize,
      bg: bgSize,
      leadFontString: `700 ${leadSize}px ${CONFIG.FONT_FAMILY}`,
      bgFontString: `600 ${bgSize}px ${CONFIG.FONT_FAMILY}`,
    };

    const lines: LayoutLine[] = [];
    let currentY = dynamicPadding.TOP;
    const availableWidth = width - dynamicPadding.HORIZONTAL * 2;
    let lastEndTime = 0;
    let lineGroupCounter = 0;

    const createTextElement = (
      text: string,
      start: number,
      end: number,
      isLead: boolean,
      currentX: number,
      font: string,
      wordGroup: number
    ): LayoutElement => {
      const fontHeight = isLead ? fontSizes.lead : fontSizes.bg;
      const textWidth = measureTextWidth(text, font);
      return {
        text,
        x: currentX,
        width: textWidth,
        height: fontHeight,
        start,
        end,
        maxX: isLead ? maxTranslateUpWord : maxTranslateUpLetter,
        isLead,
        font,
        wordGroup,
        boundingBox: { x: currentX, y: 0, width: textWidth, height: fontHeight },
      };
    };

    data.Content.forEach((content) => {
      const allSyllables = [
        ...(content.Lead?.Syllables || []),
        ...(content.Background?.flatMap((p) => p.Syllables) || []),
      ];
      if (allSyllables.length === 0) return;

      let currentBlockStartTime = Infinity;
      let currentBlockEndTime = 0;
      allSyllables.forEach((s) => {
        currentBlockStartTime = Math.min(currentBlockStartTime, s.StartTime);
        currentBlockEndTime = Math.max(currentBlockEndTime, s.EndTime);
      });

      const blockGroup = lineGroupCounter++;
      if (lines.length > 0) {
        currentY += fontSizes.bg * CONFIG.LINE_GAP_MULTIPLIER_BETWEEN_GROUPS;
      }

      if (currentBlockStartTime * 1000 - lastEndTime > CONFIG.INTERLUDE_THRESHOLD_MS) {
        const interludeStart = lastEndTime;
        const interludeEnd = currentBlockStartTime * 1000;
        const totalInterludeDuration = interludeEnd - interludeStart;
        const dotElements: LayoutElement[] = [];
        const dotSize = fontSizes.bg / 1.5;
        const totalDotsWidth =
          CONFIG.INTERLUDE_DOT_COUNT * dotSize +
          (CONFIG.INTERLUDE_DOT_COUNT - 1) * CONFIG.INTERLUDE_DOT_GAP;
        const lineAlign = content.OppositeAligned ? 'right' : 'left';
        let startXOffset = dynamicPadding.HORIZONTAL;
        if (lineAlign === 'right') {
          startXOffset = width - totalDotsWidth - dynamicPadding.HORIZONTAL;
        }

        for (let i = 0; i < CONFIG.INTERLUDE_DOT_COUNT; i++) {
          const dotStartTime =
            interludeStart + i * (totalInterludeDuration / CONFIG.INTERLUDE_DOT_COUNT);
          const dotEndTime = dotStartTime + totalInterludeDuration / CONFIG.INTERLUDE_DOT_COUNT;
          const dotX = i * (dotSize + CONFIG.INTERLUDE_DOT_GAP);
          dotElements.push({
            text: '',
            x: dotX,
            width: dotSize,
            height: dotSize,
            start: dotStartTime,
            end: dotEndTime,
            maxX: CONFIG.INTERLUDE_DOT_AMPLITUDE,
            isLead: false,
            isDot: true,
            font: INTERLUDE_DOT_FONT_STRING,
            wordGroup: -1,
            boundingBox: { x: dotX, y: 0, width: dotSize, height: dotSize },
          });
        }
        const interludeLineHeight = dotSize * CONFIG.LINE_HEIGHT_MULTIPLIER;
        lines.push({
          elements: dotElements,
          y: currentY,
          height: interludeLineHeight,
          end: interludeEnd,
          align: lineAlign,
          totalWidth: totalDotsWidth,
          isInterlude: true,
          start: interludeStart,
          lineGroup: lineGroupCounter++,
          boundingBox: {
            x: startXOffset,
            y: currentY,
            width: totalDotsWidth,
            height: interludeLineHeight,
          },
        });
        currentY += interludeLineHeight * (1 + CONFIG.LINE_GAP_MULTIPLIER_BETWEEN_GROUPS);
      }

      const processPart = (part: VocalPartType, isLead: boolean, group: number) => {
        const words: { syllables: VocalPartType['Syllables']; text: string; width: number }[] = [];
        let currentWordSyllables: VocalPartType['Syllables'] = [];
        const fontToUse = isLead ? fontSizes.leadFontString : fontSizes.bgFontString;
        const fontHeightForLineCalc = isLead ? fontSizes.lead : fontSizes.bg;
        const lineHeight = fontHeightForLineCalc * CONFIG.LINE_HEIGHT_MULTIPLIER;
        const lineSpacingWithinGroup =
          lineHeight + fontHeightForLineCalc * CONFIG.LINE_GAP_MULTIPLIER_WITHIN_GROUP;

        part.Syllables.forEach((s) => {
          currentWordSyllables.push(s);
          if (!s.IsPartOfWord) {
            const text = currentWordSyllables
              .map((ws) => (forceRomanized && ws.RomanizedText ? ws.RomanizedText : ws.Text))
              .join('');
            words.push({
              syllables: currentWordSyllables,
              text,
              width: measureTextWidth(text, fontToUse),
            });
            currentWordSyllables = [];
          }
        });
        if (currentWordSyllables.length > 0) {
          const text = currentWordSyllables
            .map((ws) => (forceRomanized && ws.RomanizedText ? ws.RomanizedText : ws.Text))
            .join('');
          words.push({
            syllables: currentWordSyllables,
            text,
            width: measureTextWidth(text, fontToUse),
          });
        }

        let lineElements: LayoutElement[] = [];
        let currentX = 0;
        let maxLineHeight = 0;
        let wordGroup = 0;

        const pushLine = () => {
          if (lineElements.length > 0) {
            const lineStartX = content.OppositeAligned
              ? width - currentX - dynamicPadding.HORIZONTAL
              : dynamicPadding.HORIZONTAL;
            lines.push({
              elements: lineElements,
              y: currentY,
              height: maxLineHeight,
              end: lineElements[lineElements.length - 1].end,
              align: content.OppositeAligned ? 'right' : 'left',
              totalWidth: currentX,
              start: lineElements[0].start,
              lineGroup: group,
              boundingBox: { x: lineStartX, y: currentY, width: currentX, height: maxLineHeight },
            });
            currentY += lineSpacingWithinGroup;
            lineElements = [];
            currentX = 0;
            maxLineHeight = 0;
          }
        };

        words.forEach((word) => {
          const spaceWidth = measureTextWidth(' ', fontToUse);
          wordGroup++;
          if (word.width > availableWidth) {
            if (lineElements.length > 0) pushLine();
            word.syllables.forEach((s) => {
              const text = forceRomanized && s.RomanizedText ? s.RomanizedText : s.Text;
              const start = s.StartTime * 1000;
              const end = s.EndTime * 1000;
              const duration = end - start;
              const fontHeight = isLead ? fontSizes.lead : fontSizes.bg;
              maxLineHeight = Math.max(maxLineHeight, fontHeight);
              text.split('').forEach((letter, lIdx) => {
                const letterWidth = measureTextWidth(letter, fontToUse);
                if (currentX + letterWidth > availableWidth && currentX > 0) pushLine();
                const fractionStart = lIdx / text.length;
                const fractionEnd = (lIdx + 1) / text.length;
                const element = createTextElement(
                  letter,
                  start + fractionStart * duration,
                  start + fractionEnd * duration,
                  isLead,
                  currentX,
                  fontToUse,
                  wordGroup
                );
                element.maxX = maxTranslateUpLetter;
                lineElements.push(element);
                currentX += element.width;
              });
            });
          } else {
            if (currentX > 0 && currentX + spaceWidth + word.width > availableWidth) pushLine();
            if (currentX > 0) currentX += spaceWidth;
            word.syllables.forEach((s) => {
              const fontHeight = isLead ? fontSizes.lead : fontSizes.bg;
              maxLineHeight = Math.max(maxLineHeight, fontHeight);
              const start = s.StartTime * 1000;
              const end = s.EndTime * 1000;
              const duration = end - start;
              const text = forceRomanized && s.RomanizedText ? s.RomanizedText : s.Text;
              if (duration < splitThresholdMs || text.length === 1) {
                const element = createTextElement(
                  text,
                  start,
                  end,
                  isLead,
                  currentX,
                  fontToUse,
                  wordGroup
                );
                lineElements.push(element);
                currentX += element.width;
              } else {
                text.split('').forEach((letter, lIdx) => {
                  const fractionStart = lIdx / text.length;
                  const fractionEnd = (lIdx + 1) / text.length;
                  const element = createTextElement(
                    letter,
                    start + fractionStart * duration,
                    start + fractionEnd * duration,
                    isLead,
                    currentX,
                    fontToUse,
                    wordGroup
                  );
                  element.maxX = maxTranslateUpLetter;
                  lineElements.push(element);
                  currentX += element.width;
                });
              }
            });
          }
        });
        pushLine();
      };

      if (content.Lead) processPart(content.Lead, true, blockGroup);
      if (content.Background)
        content.Background.forEach((bgPart) => processPart(bgPart, false, blockGroup));
      lastEndTime = currentBlockEndTime * 1000;
    });

    if (data.SongWriters && data.SongWriters.length > 0) {
      currentY += fontSizes.bg * CONFIG.LINE_GAP_MULTIPLIER_BETWEEN_GROUPS * 2;
      const creditsText = `Credits: ${data.SongWriters.join(', ')}`;
      const creditsFontSize = fontSizes.bg * CONFIG.CREDITS_FONT_SIZE_RATIO;
      const creditsFontString = `600 ${creditsFontSize}px ${CONFIG.FONT_FAMILY}`;
      const spaceWidth = measureTextWidth(' ', creditsFontString);
      const words = creditsText.split(' ');
      let currentLineWords: string[] = [];
      let currentLineWidth = 0;
      const pushCreditsLine = () => {
        if (currentLineWords.length === 0) return;
        const lineText = currentLineWords.join(' ');
        const totalWidth = measureTextWidth(lineText, creditsFontString);
        const startX = (width - totalWidth) / 2;
        lines.push({
          elements: [
            {
              text: lineText,
              x: 0,
              width: totalWidth,
              height: creditsFontSize,
              start: Infinity,
              end: Infinity,
              maxX: 0,
              isLead: false,
              font: creditsFontString,
              wordGroup: -1,
              boundingBox: { x: 0, y: 0, width: totalWidth, height: creditsFontSize },
            },
          ],
          y: currentY,
          height: creditsFontSize * CONFIG.LINE_HEIGHT_MULTIPLIER,
          end: Infinity,
          align: 'left',
          totalWidth,
          isInterlude: false,
          start: Infinity,
          lineGroup: -1,
          boundingBox: {
            x: startX,
            y: currentY,
            width: totalWidth,
            height: creditsFontSize * CONFIG.LINE_HEIGHT_MULTIPLIER,
          },
        });
        currentY += creditsFontSize * CONFIG.LINE_HEIGHT_MULTIPLIER;
        currentLineWords = [];
        currentLineWidth = 0;
      };
      for (const word of words) {
        const wordWidth = measureTextWidth(word, creditsFontString);
        if (
          currentLineWords.length > 0 &&
          currentLineWidth + spaceWidth + wordWidth > availableWidth
        ) {
          pushCreditsLine();
        }
        currentLineWords.push(word);
        currentLineWidth += (currentLineWords.length > 1 ? spaceWidth : 0) + wordWidth;
      }
      pushCreditsLine();
    }

    maxScrollY.current =
      lines.length > 0 ? lines[lines.length - 1].y + dynamicPadding.BOTTOM - height : 0;
    maxScrollY.current = Math.max(0, maxScrollY.current);
    layoutRef.current = lines;

    const boxes = new Map<number, { x: number; y: number; width: number; height: number }>();
    if (lines.length === 0 || width === 0) {
      groupBoundingBoxesRef.current = boxes;
      return;
    }
    const groups = new Map<number, LayoutLine[]>();
    lines.forEach((line) => {
      if (!line.isInterlude && line.lineGroup !== -1) {
        if (!groups.has(line.lineGroup)) groups.set(line.lineGroup, []);
        groups.get(line.lineGroup)?.push(line);
      }
    });
    groups.forEach((linesInGroup, groupId) => {
      const minY = Math.min(...linesInGroup.map((l) => l.y));
      const maxY = Math.max(...linesInGroup.map((l) => l.y + l.height));
      const boxX = dynamicPadding.HORIZONTAL;
      const boxWidth = width - dynamicPadding.HORIZONTAL * 2;
      boxes.set(groupId, { x: boxX, y: minY, width: boxWidth, height: maxY - minY });
    });
    groupBoundingBoxesRef.current = boxes;
  }, [data, forceRomanized, maxTranslateUpLetter, maxTranslateUpWord, splitThresholdMs]);

  const enableAutoScroll = useCallback(() => {
    isAutoScrollDisabled.current = false;
  }, []);

  const handleSyncClick = useCallback(() => {
    enableAutoScroll();
  }, [enableAutoScroll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      isAutoScrollDisabled.current = true;
      if (scrollResetTimeoutId.current) clearTimeout(scrollResetTimeoutId.current);
      targetScrollY.current = Math.max(
        0,
        Math.min(targetScrollY.current + event.deltaY, maxScrollY.current)
      );
      scrollResetTimeoutId.current = setTimeout(() => {
        const currentProgress = progressRef.current;
        const { height } = canvas.getBoundingClientRect();
        const activeLines = layoutRef.current.filter(
          (line) => currentProgress >= line.start && currentProgress <= line.end
        );
        if (activeLines.length > 0) {
          const { TOP, BOTTOM } = { TOP: height * 0.25, BOTTOM: height * 0.45 };
          const isInView = activeLines.some((activeLine) => {
            const activeLineTop = activeLine.y - scrollY.current;
            const activeLineBottom = activeLineTop + activeLine.height;
            return activeLineTop < height - BOTTOM && activeLineBottom > TOP;
          });
          if (isInView) enableAutoScroll();
        }
        scrollResetTimeoutId.current = null;
      }, CONFIG.SCROLL_RESET_TIMEOUT_MS);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
      if (scrollResetTimeoutId.current) clearTimeout(scrollResetTimeoutId.current);
    };
  }, [enableAutoScroll, progressRef]);

  const handleCanvasInteraction = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>, type: 'click' | 'mousemove') => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const xInCanvas = event.clientX - rect.left;
      const yInCanvas = event.clientY - rect.top;
      const canvasY = yInCanvas + scrollY.current;
      let targetLineIdx: number | null = null;
      for (const [groupId, box] of groupBoundingBoxesRef.current.entries()) {
        if (
          canvasY >= box.y &&
          canvasY <= box.y + box.height &&
          xInCanvas >= box.x &&
          xInCanvas <= box.x + box.width
        ) {
          const firstLineIdx = layoutRef.current.findIndex((line) => line.lineGroup === groupId);
          if (firstLineIdx !== -1) {
            targetLineIdx = firstLineIdx;
          }
          break;
        }
      }
      if (type === 'click') {
        if (targetLineIdx !== null) {
          const targetLine = layoutRef.current[targetLineIdx];
          const firstVocalLine = layoutRef.current.find(
            (line) => line.lineGroup === targetLine.lineGroup && !line.isInterlude
          );
          if (firstVocalLine) {
            seekTo(firstVocalLine.start);
            handleSyncClick();
          }
        }
      } else if (type === 'mousemove') {
        hoveredLineIdxRef.current = targetLineIdx;
      }
    },
    [handleSyncClick]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      handleCanvasInteraction(event, 'mousemove');
    },
    [handleCanvasInteraction]
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      handleCanvasInteraction(event, 'click');
    },
    [handleCanvasInteraction]
  );

  const handleMouseOut = useCallback(() => {
    hoveredLineIdxRef.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const syncButton = syncButtonRef.current;
    if (!canvas || !syncButton) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let animationFrameId: number;

    const setupCanvas = () => {
      const { width, height } = canvasSizeRef.current;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }
      return { width, height };
    };

    const draw = () => {
      const { width, height } = setupCanvas();
      const progress = progressRef.current;
      const layout = layoutRef.current;
      const groupBoundingBoxes = groupBoundingBoxesRef.current;
      const dynamicPadding = {
        TOP: height * 0.25,
        BOTTOM: height * 0.45,
        HORIZONTAL: width * 0.05,
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let primaryActiveLine: LayoutLine | null = null;
      const activeGroups = new Set<number>();

      for (const line of layout) {
        const isActiveTime = progress >= line.start && progress <= line.end;
        const isRecentlyPast = progress > line.end && progress - line.end < 500;
        const isAboutToStart = progress < line.start && line.start - progress < 200;
        if (isActiveTime || isRecentlyPast || isAboutToStart) activeGroups.add(line.lineGroup);
        if (progress >= line.start && progress <= line.end) primaryActiveLine = line;
        else if (progress > line.end) primaryActiveLine = line;
      }

      if (!primaryActiveLine && layout.length > 0) {
        if (activeGroups.size > 0) {
          const firstActiveGroup = Math.min(...Array.from(activeGroups));
          const firstLineOfGroup = layout.find((l) => l.lineGroup === firstActiveGroup);
          if (firstLineOfGroup) primaryActiveLine = firstLineOfGroup;
        } else {
          primaryActiveLine = layout[0];
        }
      }

      if (!isAutoScrollDisabled.current && primaryActiveLine) {
        const activeGroup = primaryActiveLine.lineGroup;
        const groupLines = layout.filter((line) => line.lineGroup === activeGroup);
        if (groupLines.length > 0) {
          const groupTop = Math.min(...groupLines.map((line) => line.y));
          const groupBottom = Math.max(...groupLines.map((line) => line.y + line.height));
          targetScrollY.current = Math.max(
            0,
            Math.min(
              maxScrollY.current,
              groupTop - height / 2 + (groupBottom - groupTop) / 2 + scrollOffset
            )
          );
        }
      }

      scrollY.current += (targetScrollY.current - scrollY.current) * CONFIG.SCROLL_SMOOTHING_FACTOR;
      scrollY.current = Math.max(0, Math.min(maxScrollY.current, scrollY.current));

      if (primaryActiveLine) {
        const activeLineTop = primaryActiveLine.y - scrollY.current;
        const activeLineBottom = activeLineTop + primaryActiveLine.height;
        const isActiveLineInView =
          activeLineTop < height - dynamicPadding.BOTTOM && activeLineBottom > dynamicPadding.TOP;
        const shouldShowButton = isAutoScrollDisabled.current && !isActiveLineInView;
        syncButton.style.opacity = shouldShowButton ? '1' : '0';
        syncButton.style.pointerEvents = shouldShowButton ? 'auto' : 'none';

        if (isAutoScrollDisabled.current && isActiveLineInView) {
          if (!scrollResetTimeoutId.current) {
            scrollResetTimeoutId.current = setTimeout(() => {
              enableAutoScroll();
              scrollResetTimeoutId.current = null;
            }, CONFIG.SCROLL_RESET_TIMEOUT_MS);
          }
        } else if (!isActiveLineInView && scrollResetTimeoutId.current) {
          clearTimeout(scrollResetTimeoutId.current);
          scrollResetTimeoutId.current = null;
        }
      } else {
        syncButton.style.opacity = '0';
        syncButton.style.pointerEvents = 'none';
      }

      const allGroupIdsInLayout = new Set(layout.map((l) => l.lineGroup));
      allGroupIdsInLayout.forEach((groupId) => {
        if (groupId === -1) return;
        const isGroupActive = activeGroups.has(groupId);
        const groupLines = layout.filter((l) => l.lineGroup === groupId && !l.isInterlude);
        const groupEnd = groupLines.length > 0 ? Math.max(...groupLines.map((l) => l.end)) : 0;
        const isGroupFullyPast = progress > groupEnd + 500 && groupEnd > 0;
        const targetAlpha = isGroupActive ? 1.0 : isGroupFullyPast ? 0.4 : 0.5;
        const currentAlpha = groupAlphasRef.current.get(groupId) ?? targetAlpha;
        groupAlphasRef.current.set(groupId, currentAlpha + (targetAlpha - currentAlpha) * 0.2);
        const targetScale = isGroupActive ? CONFIG.ACTIVE_LINE_TARGET_SCALE : 1.0;
        const currentScale = groupScalesRef.current.get(groupId) ?? targetScale;
        groupScalesRef.current.set(groupId, currentScale + (targetScale - currentScale) * 0.15);
      });

      const hoveredGroupId =
        hoveredLineIdxRef.current !== null ? layout[hoveredLineIdxRef.current].lineGroup : null;
      const animState = hoverAnimState.current;
      if (animState.groupId !== hoveredGroupId) {
        animState.groupId = hoveredGroupId;
        if (hoveredGroupId !== null) {
          const groupBox = groupBoundingBoxes.get(hoveredGroupId);
          if (groupBox) {
            animState.x = groupBox.x - CONFIG.HOVER_CARD_PADDING.x;
            animState.width = groupBox.width + CONFIG.HOVER_CARD_PADDING.x * 2;
            animState.y = groupBox.y - CONFIG.HOVER_CARD_PADDING.y;
            animState.height = groupBox.height + CONFIG.HOVER_CARD_PADDING.y * 2;
          }
        }
      }
      const targetProgress = animState.groupId !== null ? 1 : 0;
      animState.progress += (targetProgress - animState.progress) * 0.15;

      if (animState.progress > 0.01) {
        ctx.save();
        const scale = 0.97 + animState.progress * 0.03;
        const centerX = animState.x + animState.width / 2;
        const centerY = animState.y - scrollY.current + animState.height / 2;
        ctx.globalAlpha = animState.progress;
        ctx.fillStyle = CONFIG.COLORS.HOVER_CARD;
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        const cardX = animState.x;
        const cardY = animState.y - scrollY.current;
        const cardWidth = animState.width;
        const cardHeight = animState.height;
        ctx.beginPath();
        ctx.moveTo(cardX + CONFIG.HOVER_CARD_RADIUS, cardY);
        ctx.lineTo(cardX + cardWidth - CONFIG.HOVER_CARD_RADIUS, cardY);
        ctx.quadraticCurveTo(
          cardX + cardWidth,
          cardY,
          cardX + cardWidth,
          cardY + CONFIG.HOVER_CARD_RADIUS
        );
        ctx.lineTo(cardX + cardWidth, cardY + cardHeight - CONFIG.HOVER_CARD_RADIUS);
        ctx.quadraticCurveTo(
          cardX + cardWidth,
          cardY + cardHeight,
          cardX + cardWidth - CONFIG.HOVER_CARD_RADIUS,
          cardY + cardHeight
        );
        ctx.lineTo(cardX + CONFIG.HOVER_CARD_RADIUS, cardY + cardHeight);
        ctx.quadraticCurveTo(
          cardX,
          cardY + cardHeight,
          cardX,
          cardY + cardHeight - CONFIG.HOVER_CARD_RADIUS
        );
        ctx.lineTo(cardX, cardY + CONFIG.HOVER_CARD_RADIUS);
        ctx.quadraticCurveTo(cardX, cardY, cardX + CONFIG.HOVER_CARD_RADIUS, cardY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      for (const line of layout) {
        const lineY = line.y - scrollY.current;
        if (lineY + line.height < 0 || lineY > height) continue;

        if (line.lineGroup === -1) {
          ctx.save();
          const creditsEl = line.elements[0];
          ctx.font = creditsEl.font;
          ctx.fillStyle = CONFIG.COLORS.PAST_LINE;
          ctx.globalAlpha = 0.8;
          ctx.fillText(creditsEl.text, dynamicPadding.HORIZONTAL, lineY);
          ctx.restore();
          continue;
        }

        if (line.isInterlude) {
          ctx.save();
          let overallInterludeOpacity = 0;
          const progressIntoInterlude = progress - line.start;
          const totalInterludeDuration = line.end - line.start;
          if (progressIntoInterlude >= 0 && progressIntoInterlude < totalInterludeDuration) {
            if (progressIntoInterlude < CONFIG.INTERLUDE_ANIMATION_SHOW_DELAY)
              overallInterludeOpacity =
                progressIntoInterlude / CONFIG.INTERLUDE_ANIMATION_SHOW_DELAY;
            else if (
              progressIntoInterlude >
              totalInterludeDuration - CONFIG.INTERLUDE_ANIMATION_SHOW_DELAY
            )
              overallInterludeOpacity =
                (totalInterludeDuration - progressIntoInterlude) /
                CONFIG.INTERLUDE_ANIMATION_SHOW_DELAY;
            else overallInterludeOpacity = 1;
          }
          overallInterludeOpacity = Math.max(0, Math.min(1, overallInterludeOpacity));
          const lineStartX = line.boundingBox.x;
          ctx.fillStyle = CONFIG.COLORS.INTERLUDE_DOT;
          ctx.shadowColor = CONFIG.COLORS.INTERLUDE_DOT;
          line.elements.forEach((el) => {
            const dotSize = el.width;
            const radius = dotSize / 2;
            const dotCenterX = el.x + radius;
            const dotCenterY = lineY + radius;
            const amplitude = el.maxX;
            const dotProgress = Math.max(
              0,
              Math.min(1, (progress - el.start) / (el.end - el.start))
            );
            let translateY = 0;
            let scale = 0.7;
            let shadowBlur = 0;
            if (dotProgress > 0 && dotProgress <= 0.5) {
              translateY = amplitude * (dotProgress / 0.5);
              scale = 0.75 + dotProgress / 2;
              shadowBlur = dotProgress * CONFIG.INTERLUDE_GLOW_MAX_BLUR * 2;
            } else if (dotProgress > 0.5 && dotProgress <= 1) {
              translateY = amplitude * (1 - (dotProgress - 0.5) / 0.5);
              scale = 1 - (dotProgress - 0.5) / 0.5 / 4;
              shadowBlur = (1 - (dotProgress - 0.5) / 0.5) * CONFIG.INTERLUDE_GLOW_MAX_BLUR * 2;
            }
            scale = Math.max(0, Math.min(1, scale));
            shadowBlur = Math.max(0, Math.min(CONFIG.INTERLUDE_GLOW_MAX_BLUR, shadowBlur));
            ctx.globalAlpha = overallInterludeOpacity * 0.8;
            ctx.shadowBlur = shadowBlur;
            ctx.beginPath();
            ctx.arc(
              lineStartX + dotCenterX,
              dotCenterY - translateY,
              radius * scale,
              0,
              Math.PI * 2
            );
            ctx.fill();
          });
          ctx.restore();
          continue;
        }

        ctx.save();
        const currentScale = groupScalesRef.current.get(line.lineGroup) ?? 1.0;
        if (Math.abs(currentScale - 1.0) > 0.001) {
          const centerX = width / 2;
          const centerY = line.y - scrollY.current + line.height / 2;
          ctx.translate(centerX, centerY);
          ctx.scale(currentScale, currentScale);
          ctx.translate(-centerX, -centerY);
        }

        const isGroupActive = activeGroups.has(line.lineGroup);
        const lineAlpha = groupAlphasRef.current.get(line.lineGroup) ?? 0.5;
        const isFullyPast = lineAlpha < 0.45;
        const lineStartX =
          line.align === 'left'
            ? dynamicPadding.HORIZONTAL
            : width - line.totalWidth - dynamicPadding.HORIZONTAL;

        const wordsToDraw = new Map<number, LayoutElement[]>();
        line.elements.forEach((el) => {
          if (!wordsToDraw.has(el.wordGroup)) wordsToDraw.set(el.wordGroup, []);
          wordsToDraw.get(el.wordGroup)?.push(el);
        });

        wordsToDraw.forEach((wordElements) => {
          const firstEl = wordElements[0];
          const lastEl = wordElements[wordElements.length - 1];
          const wordStart = firstEl.start;
          const wordEnd = lastEl.end;
          const wordIsPast = progress > wordEnd;
          const wordIsActive = progress >= wordStart && progress <= wordEnd;

          ctx.font = firstEl.font;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.globalAlpha = lineAlpha;
          ctx.fillStyle = isFullyPast ? CONFIG.COLORS.PAST_LINE : CONFIG.COLORS.BG_TEXT;
          ctx.shadowBlur = 0;
          wordElements.forEach((el) => {
            ctx.fillText(el.text, lineStartX + el.x, lineY);
          });

          if ((wordIsActive || wordIsPast) && isGroupActive) {
            ctx.save();
            const wordStartX = lineStartX + firstEl.x;
            const wordWidth = lastEl.x + lastEl.width - firstEl.x;
            const gradient = ctx.createLinearGradient(wordStartX, 0, wordStartX + wordWidth, 0);
            if (wordIsPast) {
              gradient.addColorStop(0, CONFIG.COLORS.ACTIVE_LINE_GLOW);
              gradient.addColorStop(1, CONFIG.COLORS.ACTIVE_LINE_GLOW);
            } else {
              const wordProgress = Math.max(
                0,
                Math.min(1, (progress - wordStart) / (wordEnd - wordStart))
              );
              const gradientEndColor = 'rgba(255, 255, 255, 0.1)';
              gradient.addColorStop(0, CONFIG.COLORS.ACTIVE_LINE_GLOW);
              gradient.addColorStop(
                Math.max(0, wordProgress - 0.1),
                CONFIG.COLORS.ACTIVE_LINE_GLOW
              );
              gradient.addColorStop(wordProgress, gradientEndColor);
              gradient.addColorStop(Math.min(1, wordProgress + 0.1), 'rgba(255,255,255,0)');
            }
            ctx.fillStyle = gradient;
            ctx.shadowColor = CONFIG.COLORS.ACTIVE_LINE_GLOW;
            ctx.shadowBlur = CONFIG.ACTIVE_LINE_GLOW_BLUR;
            ctx.globalAlpha = 1.0;
            wordElements.forEach((el) => {
              ctx.fillText(el.text, lineStartX + el.x, lineY);
            });
            ctx.restore();
          }
        });
        ctx.restore();
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    setupCanvas();
    animationFrameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollResetTimeoutId.current) clearTimeout(scrollResetTimeoutId.current);
    };
  }, [scrollOffset, enableAutoScroll]);

  useEffect(() => {
    recalculateLayout();
  }, [recalculateLayout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvasSizeRef.current = { width: rect.width, height: rect.height };
      recalculateLayout();
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [recalculateLayout]);

  return (
    <>
      <div className="lyrics-wrapper" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <canvas
          className="syllable-lyrics-canvas"
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseOut={handleMouseOut}
        />
      </div>
      <button
        type="button"
        ref={syncButtonRef}
        onClick={handleSyncClick}
        className="lucid-lyrics-btn sync-to-line-btn"
      >
        Sync Lyrics
      </button>
    </>
  );
};

export default SyllableLyricsOnCanvas;
