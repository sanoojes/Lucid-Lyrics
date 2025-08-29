export * from '@/utils/dom/createRenderer.ts';
export * from '@/utils/dom/element/getOrCreateElement.ts';
export * from '@/utils/dom/element/observeElement.ts';
export * from '@/utils/dom/element/onElement.ts';
export * from '@/utils/dom/element/waitForElement.ts';
export * from '@/utils/dom/serializeFilters.ts';
export * from '@/utils/dom/waitForGlobal.ts';
export * from '@/utils/dom/watchSize.ts';

export const toPx = (px: number, decimals = 2) => `${px.toFixed(decimals)}px`;
export const toPercent = (percent: number, decimals = 2) => `${percent.toFixed(decimals)}%`;
export const toFixed = (num: number, decimals = 2) => num.toFixed(decimals);
