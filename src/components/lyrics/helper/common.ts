import type { AnimationProps, LineStatus } from "@/types/lyrics.ts";

export const ACTIVE_TEXT_OPACITY = 1;
export const FADE_DURATION = 1000;
// const INTERLUDE_DELAY_MS = 100;

export function seekTo(progress: number) {
  try {
    Spicetify?.Player?.seek(progress);
    // Spicetify?.Player?.play();
  } catch {}
}

export function fadeToZero(progress: number, endTime: number) {
  const passedTime = progress - endTime;
  if (passedTime >= FADE_DURATION) return 0;
  return 100 * (1 - passedTime / FADE_DURATION);
}

export function getStatus(
  start: number,
  end: number,
  progress: number
): LineStatus {
  if (progress < start * 1000) return "future";
  if (progress >= start * 1000 && progress <= end * 1000) return "active";
  return "past";
}

const willChange = "text-shadow, transform, scale, mask-image";
let prevProgress = -1;

export function getAnimationStyles({
  startTime,
  endTime,
  progress,
  status,
  lineStatus,
  gradientPos = "right",
  textShadowBlur = 6,
  maxTranslateY = 3,
  maxScale = 1.05,
  skipMask = false,
  setAnimating,
}: AnimationProps) {
  let fillPercentage = 0;
  let isFading = 0;
  if (progress < startTime) {
    fillPercentage = 0;
  } else if (progress > endTime) {
    fillPercentage = fadeToZero(progress, endTime);
    isFading = 1;
  } else {
    fillPercentage = ((progress - startTime) / (endTime - startTime)) * 100;
  }

  const isAnimating =
    fillPercentage !== prevProgress &&
    status !== "future" &&
    lineStatus !== "future";

  if (setAnimating) {
    setAnimating((prev) => (prev !== isAnimating ? isAnimating : prev));
  }

  prevProgress = fillPercentage;

  const baseTextOpacity =
    isAnimating || lineStatus !== "future" ? ACTIVE_TEXT_OPACITY : 0.3;

  let maskStartOpacity = baseTextOpacity;
  let maskEndOpacity = baseTextOpacity;

  if (status === "active") {
    maskStartOpacity = ACTIVE_TEXT_OPACITY;
    maskEndOpacity = 0.4;
  } else if (progress >= startTime && progress <= endTime) {
    maskStartOpacity = ACTIVE_TEXT_OPACITY;
    maskEndOpacity = 0.4;
  } else if (progress < endTime && !isAnimating) {
    maskStartOpacity = 0.4;
    maskEndOpacity = 0.4;
  }

  const scaleValue = fillPercentage <= 25 ? 1 : maxScale;
  const translateY = Math.min(0, -(fillPercentage / 100) * maxTranslateY);
  const textShadowOpacity = fillPercentage <= 25 ? 0.05 : 0.75;

  if (skipMask) {
    return {
      "--scale": scaleValue,
      "--translateY": `-${translateY}px`,
      textShadow: `0 0 ${textShadowBlur}px rgba(255,255,255,${textShadowOpacity})`,
      willChange,
    } as React.CSSProperties;
  }

  const maskImage =
    !isFading || !isAnimating
      ? `linear-gradient(to ${gradientPos}, rgba(var(--text-color), ${maskStartOpacity}) ${fillPercentage}%, rgba(var(--text-color), ${maskEndOpacity}) 100%)`
      : `linear-gradient(to ${gradientPos}, rgb(var(--text-color)) 0%, rgb(var(--text-color)) 100%)`;

  return {
    "--is-anim": isAnimating ? 1 : 0,
    "--status": `"${status}"`,
    "--l-status": `"${lineStatus}"`,
    "--scale": scaleValue,
    "--translateY": `${translateY}px`,
    textShadow: `0 0 ${textShadowBlur}px rgba(255,255,255,${textShadowOpacity})`,
    maskImage,
    willChange,
  } as React.CSSProperties;
}
