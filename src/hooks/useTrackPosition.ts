import { useEffect, useRef } from 'react';

const useTrackPosition = (setPosition: (pos: number) => void) => {
  const lastTimeRef = useRef(0);

  useEffect(() => {
    let frameId: number;

    const tick = (now: number) => {
      if (now - lastTimeRef.current >= 50) {
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

export default useTrackPosition;
