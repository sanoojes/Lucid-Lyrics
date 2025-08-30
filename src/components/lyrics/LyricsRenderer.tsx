import Lyrics from '@/components/lyrics/Lyrics.tsx';
import { Loader } from '@/components/ui/index.ts';
import { ReactQueryProvider } from '@/lib/reactQuery.tsx';
import tempStore from '@/store/tempStore.ts';
import { getLyricsData } from '@/utils/fetch/getLyricsData.ts';
import { useQuery } from '@tanstack/react-query';
import { memo, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';

type StatusTextProps = { children: React.ReactNode };
const StatusText: React.FC<StatusTextProps> = ({ children }) => {
  return (
    <div className="status-wrapper">
      <div className="top-spacing" />
      {children}
      <div className="bottom-spacing" />
    </div>
  );
};

const LyricsContainer = memo(() => {
  const id = useStore(tempStore, (s) => s.player.nowPlaying.id);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data, status } = useQuery({
    queryKey: ['lyrics', id],
    queryFn: () => getLyricsData(id),
    enabled: !!id && isOnline,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  let content: React.ReactNode = null;
  if (!isOnline) {
    content = <div className="lyrics-offline">📡 You are offline. Please reconnect.</div>;
  } else {
    switch (status) {
      case 'pending':
        content = <Loader />;
        break;
      case 'error':
        content = (
          <StatusText>
            <h2 className="lyrics-error">No Lyrics Found ⚠️</h2>
          </StatusText>
        );
        break;
      case 'success':
        content = <Lyrics data={data} />;
        break;
    }
  }

  return <div className="lyrics-container">{content}</div>;
});

export const LyricsView = () => {
  const id = useStore(tempStore, (s) => s.player.nowPlaying.id);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data, status } = useQuery({
    queryKey: ['lyrics', id],
    queryFn: () => getLyricsData(id),
    enabled: !!id && isOnline,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const content: React.ReactNode = useMemo(() => {
    if (!isOnline) {
      return <div className="lyrics-offline">📡 You are offline. Please reconnect.</div>;
    } else {
      if (status === 'pending') {
        return <Loader />;
      } else if (status === 'success' && data) {
        return <Lyrics data={data} />;
      } else {
        return (
          <StatusText>
            <h2 className="lyrics-error">No Lyrics Found ⚠️</h2>
          </StatusText>
        );
      }
    }
  }, [data, status, isOnline]);

  return <div className="lyrics-container">{content}</div>;
};

const LyricsRenderer = memo(() => {
  return (
    <ReactQueryProvider>
      <LyricsContainer />
    </ReactQueryProvider>
  );
});

export default LyricsRenderer;
