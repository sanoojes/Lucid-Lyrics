import type { CSSFilter } from '@/types/styles.ts';

export function serializeFilters(
  filters: CSSFilter,
  options: {
    skipBlur?: boolean;
    skipOpacity?: boolean;
    skipBrightness?: boolean;
    skipSaturation?: boolean;
    skipContrast?: boolean;
  } = {}
): string {
  const { skipBlur, skipOpacity, skipBrightness, skipContrast, skipSaturation } = options;
  return [
    !skipBlur && filters?.blur ? `blur(${filters.blur}px)` : '',
    !skipBrightness && filters?.brightness ? `brightness(${filters.brightness}%)` : '',
    !skipContrast && filters?.contrast ? `contrast(${filters.contrast}%)` : '',
    !skipSaturation && filters?.saturation ? `saturate(${filters.saturation}%)` : '',
    !skipOpacity && filters?.opacity ? `opacity(${filters.opacity}%)` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
