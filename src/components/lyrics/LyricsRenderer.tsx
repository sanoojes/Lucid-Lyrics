import { Loader } from '@/components/ui/index.ts';
import { ReactQueryProvider } from '@/lib/reactQuery.tsx';
import tempStore from '@/store/tempStore.ts';
import { getLyricsData } from '@/utils/fetch/getLyricsData.ts';
import { useQuery } from '@tanstack/react-query';
import { memo, useEffect, useState } from 'react';
import { useStore } from 'zustand';
import Lyrics from './Lyrics.tsx';

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

const LyricsContainer: React.MemoExoticComponent<React.FC> = memo(() => {
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

  useEffect(() => {
    if (status === 'success') {
      console.log('Lyrics fetched:', data);
    }
  }, [status, data]);

  let content: React.ReactNode = null;
  if (!isOnline) {
    content = <div className="lyrics-offline">📡 You are offline. Please reconnect.</div>;
  } else if (!id) {
    content = (
      <StatusText>
        <h2 className="lyrics-empty">🎵 No song is playing</h2>
      </StatusText>
    );
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

const LyricsRenderer = () => {
  return (
    <ReactQueryProvider>
      <LyricsContainer />
    </ReactQueryProvider>
  );
};

export default LyricsRenderer;
