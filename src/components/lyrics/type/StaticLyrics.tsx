import appStore from '@/store/appStore.ts';
import type { StaticData } from '@/types/lyrics.ts';
import { SIMPLEBAR_CLASSNAMES } from '@constants';
import SimpleBar from 'simplebar-react';
import { useStore } from 'zustand';

type StaticLyricsProps = { data: StaticData };
const StaticLyrics: React.FC<StaticLyricsProps> = ({ data }) => {
  const forceRomanized = useStore(appStore, (s) => s.lyrics.forceRomanized);

  return (
    <SimpleBar classNames={SIMPLEBAR_CLASSNAMES} className="lyrics-wrapper">
      <div className="top-spacing" />
      {data.Lines.map((line, idx) => (
        <div key={`${line.Text}-${idx}`} className={`line-wrapper static`}>
          {/* Lyric lines */}
          <div className={`line`}>{(forceRomanized ? line.RomanizedText : null) ?? line.Text}</div>
        </div>
      ))}
      {data?.SongWriters?.length > 0 ? (
        <div className="line-wrapper left-align credits-line">
          <div className="credits">Credits: {data.SongWriters.join(', ')}</div>
        </div>
      ) : null}
      <div className="bottom-spacing" />
    </SimpleBar>
  );
};

export default StaticLyrics;
