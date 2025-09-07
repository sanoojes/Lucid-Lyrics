import Lyrics from '@/components/lyrics/Lyrics.tsx';
import { ReactQueryProvider } from '@/lib/reactQuery.tsx';
import { memo } from 'react';

const LyricsRenderer = memo(() => {
  return (
    <ReactQueryProvider>
      <Lyrics />
    </ReactQueryProvider>
  );
});

export default LyricsRenderer;
