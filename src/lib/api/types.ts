import type { LyricsProviders } from "@/constants";

export type APIStatus = "success" | "error" | "missing_lyrics" | "malformed" | "offline";

export interface APIError {
  code:
    | "NO_PROVIDERS"
    | "PROVIDER_FAILED"
    | "FETCH_FAILED"
    | "OFFLINE"
    | "HANDLER_NOT_FOUND"
    | "MISSING_LYRICS"
    | "PARSE_ERROR";
  message: string;
}
export interface APIResponse<T> {
  status: APIStatus;
  data: T | null;
  error?: APIError;
}

export interface LyricsHandler {
  id: LyricsProviders;
  fetch(options: FetchOptions): Promise<APIResponse<Lyrics>>;
  cache?: boolean; // default = true
}

// type CurrItem = Partial<typeof Spicetify.Player.data.item>;

type FetchData = {
  uri: string;
  title?: string;
  album?: string;
  artist?: string;

  /**
   * Duration in ms
   */
  duration: number;
};

export type FetchOptions = {
  /**
   * Spotify track ID
   * Example: "3n3Ppam7vgaVa1iaRUc9Lp"
   */
  id: string;

  data: FetchData;
};

export type Lyrics = SyllableData | LineData | StaticData;
export type LyricsType = Lyrics["Type"];

type RomanizedText = {
  RomanizedText?: string | null;
};

/**
 * Is Subject to change
 */
type TTMLUser = {
  id: string;
  username: string;
  avatar: string;
  hasProfileBanner: boolean;
};

export type AmllData = {
  spotifyId: string[];
  appleMusicId: string[];
  isrc: string[];
  musicName: string[];
  artists: string[];
  album: string[];
  ttmlAuthorGithub?: string;
  ttmlAuthorGithubLogin?: string;
  ncmMusicId: string[];
  qqMusicId?: string;
};

type CommonStates = {
  HasRomanizedText: boolean;
  NeedsRomanization: boolean;
  IsRTL?: boolean;
  Provider: LyricsProviders;

  /**
   * Only for lyrics fetch from AMLL(Apple Music Like Lyrics)
   */
  Amll?: AmllData;
  AmllTTML?: string;

  /**
   * Is Subject to change, from Spicy Lyrics (only used to show credits)
   */
  TTMLUploadMetadata: Partial<{
    Uploader: Partial<TTMLUser>;
    Maker: Partial<TTMLUser>;
  }>;
};

export type TimeRange = {
  StartTime: number;
  EndTime: number;
};

/* Syllables */
export type Syllable = {
  Text: string;
  IsPartOfWord: boolean;
  EmptyBeat?: number;
} & TimeRange &
  RomanizedText;

/* Vocal parts */
export type VocalPart = {
  Syllables: Syllable[];

  /**
   * Only For AMLL
   */
  Translated?: Record<string, string>;

  /**
   * Only For AMLL
   */
  RomanText?: string;
} & TimeRange;

export type AlignedContent = {
  OppositeAligned: boolean;
  IsRTL?: boolean;
};

/* Syllable lyrics */
export type SyllableContent = {
  Type: "Vocal";
  Lead: VocalPart;
  Background?: VocalPart[];
} & AlignedContent;

export type SyllableData = {
  Id: string;
  Type: "Syllable";
  SongWriters: string[];
  Artists?: string[];
  Content: SyllableContent[];
} & TimeRange &
  Partial<CommonStates>;

/* Line lyrics */
export type LineContent = {
  Type: string;
  Text: string;
} & TimeRange &
  RomanizedText &
  AlignedContent;

export type InterludeContent = {
  Type: "Interlude";
  Text: string;
} & TimeRange &
  AlignedContent;

export type LineData = {
  Id: string;
  Type: "Line";
  SongWriters: string[];
  Artists?: string[];
  Content: (LineContent | InterludeContent)[];
} & TimeRange &
  Partial<CommonStates>;

/* Static lyrics */
export type StaticLine = {
  Text: string;
  IsRTL?: boolean;
} & RomanizedText;

export type StaticData = {
  Id: string;
  Type: "Static";
  SongWriters: string[];
  Artists?: string[];
  Lines: StaticLine[];
} & Partial<CommonStates>;
