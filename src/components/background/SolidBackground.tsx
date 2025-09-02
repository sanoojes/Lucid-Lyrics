import appStore from '@/store/appStore.ts';
import { useStore } from 'zustand';

const SolidBackground = () => {
  const color = useStore(appStore, (state) => state.bg.options.color);

  return <div className="lucid-lyrics-bg solid" style={{ backgroundColor: color }}></div>;
};

export default SolidBackground;
