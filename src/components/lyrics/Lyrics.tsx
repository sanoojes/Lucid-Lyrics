import '@/styles/lyrics.css';

import LineLyrics from '@/components/lyrics/type/LineLyrics.tsx';
import StaticLyrics from '@/components/lyrics/type/StaticLyrics.tsx';
import SyllableLyrics from '@/components/lyrics/type/SyllableLyrics.tsx';
import { LyricsLoader } from '@/components/ui';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import { getLyricsData } from '@/utils/fetch/getLyricsData.ts';
import cx from '@cx';
import { useQuery } from '@tanstack/react-query';
import { memo, useEffect } from 'react';
import { useStore } from 'zustand';

type StatusProps = { title: string };

const Status: React.FC<StatusProps> = ({ title }) => {
  return (
    <div className="status-wrapper">
      <h2 className="title">{title}</h2>
    </div>
  );
};

const Lyrics: React.FC = memo(() => {
  const id = useStore(tempStore, (s) => s.player.nowPlaying.id);
  const isOnline = useStore(tempStore, (s) => s.isOnline);
  const isSpotifyFont = useStore(appStore, (s) => s.lyrics.isSpotifyFont);

  const { data, status } = useQuery({
    queryKey: ['lyrics', id],
    queryFn: () => getLyricsData(id),
    enabled: !!id && isOnline,
    retry: 1,
  });

  useEffect(() => {
    let lyricData = null;
    if (status === 'success') lyricData = data;
    tempStore.getState().setPlayer('nowPlaying', { lyricData });
  }, [data, status]);

  return (
    <div className={cx('lyrics-container', { 'use-encore-font': isSpotifyFont })}>
      {status === 'pending' ? (
        <LyricsLoader />
      ) : status === 'success' && data?.Type ? (
        data?.Type === 'Syllable' ? (
          <SyllableLyrics data={data} />
        ) : data?.Type === 'Line' ? (
          <LineLyrics data={data} />
        ) : (
          <StaticLyrics data={data} />
        )
      ) : !isOnline ? (
        <Status title="You are offline. Please reconnect." />
      ) : status === 'error' ? (
        <Status title="This song doesn't have any Lyrics!" />
      ) : null}
    </div>
  );
});
export default Lyrics;
