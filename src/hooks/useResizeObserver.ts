import { useEffect, useRef, useState } from 'react';

type ObserverRect = Omit<DOMRectReadOnly, 'toJSON'>;

export default function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState<ObserverRect>();

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(() => {
      if (ref.current) {
        const boundingRect = ref.current.getBoundingClientRect();
        setRect(boundingRect);
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return [ref, rect] as const;
}
