import type { StaticData } from '@/types/lyrics.ts';

type StaticLyricsProps = { data: StaticData };
const StaticLyrics: React.FC<StaticLyricsProps> = ({ data }) => {
  return <div>StaticLyrics</div>;
};

export default StaticLyrics;
