import Background from '@/components/background/Background.tsx';
import LyricsRenderer from '@/components/lyrics/LyricsRenderer.tsx';
import tempStore from '@/store/tempStore.ts';
import { useStore } from 'zustand';

const Page = () => {
  const mainViewSize = useStore(tempStore, (state) => state.viewSize.main);

  return (
    <main style={mainViewSize}>
      <LyricsRenderer />
      <Background />
    </main>
  );
};

export default Page;
