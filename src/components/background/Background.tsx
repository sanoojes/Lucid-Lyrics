import AnimatedBackground from '@/components/background/AnimatedBackground.tsx';
import StaticBackground from '@/components/background/StaticBackground.tsx';
import appStore from '@/store/appStore.ts';
import { useStore } from 'zustand';
import SolidBackground from './SolidBackground.tsx';

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
