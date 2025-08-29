import type { AnimationProps, LineStatus } from '@/types/lyrics.ts';
import { toFixed, toPercent, toPx } from '@utils/dom';

export const ACTIVE_TEXT_OPACITY = 1;
export const FADE_DURATION = 1000;
// const INTERLUDE_DELAY_MS = 100;

export function seekTo(progress: number) {
  try {
    Spicetify?.Player?.seek(progress);
    Spicetify?.Player?.play();
  } catch {}
}

export function fadeToZero(progress: number, endTime: number) {
  const passedTime = progress - endTime;
  if (passedTime >= FADE_DURATION) return 0;
  return 100 * (1 - passedTime / FADE_DURATION);
}

export function getStatus(start: number, end: number, progress: number): LineStatus {
  if (progress < start * 1000) return 'future';
  if (progress >= start * 1000 && progress <= end * 1000) return 'active';
  return 'past';
}
export function getAnimationStyles({
  startTime,
  endTime,
  progress,
  status,
  lineStatus,
  gradientPos = 'right',
  skipMask = false,
  skipScale = false,
}: AnimationProps) {
  // --- Fill percentage ---
  let fillPercentage = 0;
  if (progress < startTime) {
    fillPercentage = 0;
  } else if (progress > endTime) {
    fillPercentage = fadeToZero(progress, endTime);
  } else {
    fillPercentage = ((progress - startTime) / (endTime - startTime)) * 100;
  }

  fillPercentage = Math.max(0, Math.min(100, fillPercentage));

  const baseTextOpacity =
    lineStatus === 'active' && (status === 'past' || status === 'active')
      ? ACTIVE_TEXT_OPACITY
      : 0.3;

  let maskStartOpacity = baseTextOpacity;
  let maskEndOpacity = baseTextOpacity;

  if (lineStatus === 'active' && status === 'past') {
    maskStartOpacity = ACTIVE_TEXT_OPACITY;
    maskEndOpacity = ACTIVE_TEXT_OPACITY;
  }
  if (status === 'active') {
    maskStartOpacity = ACTIVE_TEXT_OPACITY;
    maskEndOpacity = 0.4;
  } else if (progress >= startTime && progress <= endTime) {
    maskStartOpacity = ACTIVE_TEXT_OPACITY;
    maskEndOpacity = 0.4;
  } else if (progress < endTime) {
    maskStartOpacity = 0.4;
    maskEndOpacity = 0.4;
  }

  const scale = skipScale ? '' : `scale(${toPercent(100 + fillPercentage / 20)}) `;

  if (skipMask) {
    return {
      transform: `${scale}translate3d(0, -${toPx(fillPercentage / 50)}, 0)`,
      opacity: 1,
      textShadow: `0 0 6px rgba(255,255,255,${toFixed(fillPercentage / 100)})`,
    } satisfies React.CSSProperties;
  }

  const maskImage =
    fillPercentage < 100
      ? `linear-gradient(to ${gradientPos}, rgba(var(--text-color),${maskStartOpacity}) ${fillPercentage}%, rgba(var(--text-color),${maskEndOpacity}) 100%)`
      : `linear-gradient(to ${gradientPos}, rgb(var(--text-color)) 0%, rgb(var(--text-color)) 100%)`;

  return {
    transform: `${scale}translate3d(0, -${toPx(fillPercentage / 50)}, 0)`,
    maskImage,
    textShadow: `0 0 6px rgba(255,255,255,${toFixed(fillPercentage / 100)})`,
  } satisfies React.CSSProperties;
}
