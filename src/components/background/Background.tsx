import AnimatedBackground from '@/components/background/AnimatedBackground.tsx';
import SolidBackground from '@/components/background/SolidBackground.tsx';
import StaticBackground from '@/components/background/StaticBackground.tsx';
import appStore from '@/store/appStore.ts';
import { useStore } from 'zustand';

const Background: React.FC = () => {
  const mode = useStore(appStore, (state) => state.bg.mode);

  return (
    <>
      {mode === 'animated' ? (
        <AnimatedBackground />
      ) : mode === 'solid' ? (
        <SolidBackground />
      ) : (
        <StaticBackground />
      )}
    </>
  );
};

export default Background;
