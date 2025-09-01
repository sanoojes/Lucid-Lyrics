import appStore from '@/store/appStore.ts';

export const createLogger = (prefix: string = '') => ({
  log: (...args: any[]) => console.log('[Lucid-Lyrics]', prefix, ...args),
  debug: (...args: any[]) =>
    appStore.getState().isDevMode ? console.debug('[Lucid-Lyrics]', prefix, ...args) : null,
  warn: (...args: any[]) => console.trace('[Lucid-Lyrics]', prefix, ...args),
  trace: (...args: any[]) => console.trace('[Lucid-Lyrics]', prefix, ...args),
  error: (...args: any[]) => console.error('[Lucid-Lyrics]', prefix, ...args),
});

export const logger = createLogger();
