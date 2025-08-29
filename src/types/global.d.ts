import type appStore from '@/store/appStore.ts';
import type tempStore from '@/store/tempStore.ts';

declare global {
  interface Window {
    __lucid_lyrics: {
      Reset: () => void;
      Config: () => ReturnType<typeof appStore.getState>;
      SetDevMode: (isDevMode: boolean) => void;
      _appStore: typeof appStore;
      _tempStore: typeof tempStore;
    };
  }
}
