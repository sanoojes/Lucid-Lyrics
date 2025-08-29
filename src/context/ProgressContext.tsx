import useTrackPosition from '@/hooks/useTrackPosition.ts';
import { type ReactNode, createContext, useContext, useState } from 'react';

const ProgressContext = createContext<{ progress: number }>({ progress: 0 });

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState(0);
  useTrackPosition(setProgress);

  return <ProgressContext.Provider value={{ progress }}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
