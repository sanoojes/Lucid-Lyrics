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
