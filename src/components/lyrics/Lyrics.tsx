import LineLyrics from '@/components/lyrics/type/LineLyrics.tsx';
import StaticLyrics from '@/components/lyrics/type/StaticLyrics.tsx';
import SyllableLyrics from '@/components/lyrics/type/SyllableLyrics.tsx';
import LyricsLoader from '@/components/lyrics/ui/LyricsLoader.tsx';
import type { BestAvailableLyrics } from '@/types/lyrics.ts';
import { memo, useEffect, useState } from 'react';

type FetchStatus = 'success' | 'pending' | 'error';

type StatusTextProps = { title: string };

const StatusText: React.FC<StatusTextProps> = ({ title }) => {
  return (
    <div className="status-wrapper">
      <h2 className="title">{title}</h2>
    </div>
  );
};

const Lyrics: React.FC<{
  data?: BestAvailableLyrics;
  status: FetchStatus;
  error: Error | null;
  isOnline: boolean;
}> = memo(({ data, status, isOnline }) => {
  return (
    <div className="lyrics-wrapper">
      {status === 'pending' ? (
        <LyricsLoader />
      ) : status === 'success' ? (
        <>
          <div className="top-spacing" />
          {data?.Type === 'Syllable' ? (
            <SyllableLyrics data={data} />
          ) : data?.Type === 'Line' ? (
            <LineLyrics data={data} />
          ) : data?.Type === 'Static' ? (
            <StaticLyrics data={data} />
          ) : null}
          <div className="bottom-spacing" />
        </>
      ) : !isOnline ? (
        <StatusText title="You are offline. Please reconnect." />
      ) : status === 'error' ? (
        <StatusText title="This song doesn't have any Lyrics!" />
      ) : null}
    </div>
  );
});
export default Lyrics;
