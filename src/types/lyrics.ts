/* Component Props */
export type LineStatus = 'future' | 'active' | 'past';

export type WordProps = Omit<Syllable, 'RomanizedText'> & {
  lineStatus: LineStatus;
  showTrailingSpace: boolean;
};
export type AnimationProps = {
  startTime: number;
  endTime: number;
  progress: number;
  lineStatus: LineStatus;
  status?: LineStatus;
  gradientPos?: 'right' | 'bottom';
  maxScale?: number;
  maxTranslateY?: number;
  skipMask?: boolean;
  staggerDelay?: number;
  index?: number;
  setAnimating?: React.Dispatch<React.SetStateAction<boolean>>;
};

/* Data */
export type Syllable = {
  Text: string;
  RomanizedText: string;
  IsPartOfWord: boolean;
  StartTime: number;
  EndTime: number;
};

export type VocalPart = {
  Syllables: Syllable[];
  StartTime: number;
  EndTime: number;
};

export type SyllableData = {
  Type: 'Syllable';
  SongWriters: string[];
  StartTime: number;
  Content: {
    Type: string;
    OppositeAligned: boolean;
    Lead: VocalPart;
    Background?: VocalPart[];
  }[];
  EndTime: number;
  id: string;
};

export type LineData = {
  Type: 'Line';
  SongWriters: string[];
  StartTime: number;
  Content: {
    Type: string;
    OppositeAligned: boolean;
    Text: string;
    RomanizedText: string;
    StartTime: number;
    EndTime: number;
  }[];
  EndTime: number;
  id: string;
};

export type StaticData = {
  Type: 'Static';
  SongWriters: string[];
  Lines: {
    Text: string;
    RomanizedText: string;
  }[];
  id: string;
};

export type BestAvailableLyrics = (SyllableData | LineData | StaticData) & {
  hasRomanizedText: boolean;
};
