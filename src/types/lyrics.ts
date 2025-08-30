/* Component Props */
export type LineStatus = 'future' | 'active' | 'past';

export type WordProps = Syllable & {
  lineStatus: LineStatus;
  showTrailingSpace: boolean;
};

export type AnimationProps = {
  startTime: number;
  endTime: number;
  progress: number;
  lineStatus: LineStatus;
  textShadowBlur?: number;
  maxScale?: number;
  maxTranslateY?: number;
  timeMultiplier?: number;
  status?: LineStatus;
  gradientPos?: 'right' | 'bottom';
  skipMask?: boolean;
  setAnimating?: React.Dispatch<React.SetStateAction<boolean>>;
};

/* Data */
export type Syllable = {
  Text: string;
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
  }[];
  id: string;
};

export type BestAvailableLyrics = SyllableData | LineData | StaticData;
