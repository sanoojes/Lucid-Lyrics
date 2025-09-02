import appStore from '@/store/appStore.ts';
import type { StaticData } from '@/types/lyrics.ts';
import { useStore } from 'zustand';

type StaticLyricsProps = { data: StaticData };
const StaticLyrics: React.FC<StaticLyricsProps> = ({ data }) => {
  const forceRomanized = useStore(appStore, (s) => s.forceRomanized);

  return data.Lines.map((line, idx) => (
    <div key={`${line.Text}-${idx}`} className={`line-wrapper static`}>
      {/* Lyric lines */}
      <div className={`line`}>{forceRomanized ? line.RomanizedText : line.Text}</div>
    </div>
  ));
};

export default StaticLyrics;
