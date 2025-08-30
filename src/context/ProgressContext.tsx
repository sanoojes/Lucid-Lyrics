import { createContext, useContext, useEffect, useRef, useState } from 'react';

const useTrackPosition = (setPosition: (pos: number) => void, interval: number = 75) => {
  const lastTimeRef = useRef(0);

  useEffect(() => {
    let frameId: number;

    const tick = (now: number) => {
      if (now - lastTimeRef.current >= interval) {
        const newPos = Spicetify.Player.getProgress();
        setPosition(newPos);
        lastTimeRef.current = now;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [setPosition]);
};

type ProgressContextValue = {
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgress] = useState(0);

  useTrackPosition(setProgress, 100);

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
