import LineLyrics from "@/components/lyrics/type/LineLyrics.tsx";
import StaticLyrics from "@/components/lyrics/type/StaticLyrics.tsx";
import SyllableLyrics from "@/components/lyrics/type/SyllableLyrics.tsx";
import appStore from "@/store/appStore.ts";
import type { BestAvailableLyrics } from "@/types/lyrics.ts";
import { memo, useEffect, useState } from "react";
import { useStore } from "zustand";

type FetchStatus = "success" | "pending" | "error";

type StatusTextProps = { title: string; desc?: string | null };

const StatusText: React.FC<StatusTextProps> = ({ title, desc }) => {
  return (
    <div className="status-wrapper">
      <div className="top-spacing" />
      <h2 className="title">{title}</h2>
      {desc ? <p className="desc">{desc}</p> : null}
      <div className="bottom-spacing" />
    </div>
  );
};

const LyricsLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
      <span className="ml-3 text-sm text-gray-500">Loading lyrics...</span>
    </div>
  );
};

const Lyrics: React.FC<{
  data?: BestAvailableLyrics;
  status: FetchStatus;
  error: Error | null;
  isOnline: boolean;
}> = memo(({ data, status, error, isOnline }) => {
  const [showLoader, setShowLoader] = useState(false);
  const isDevMode = useStore(appStore, (s) => s.isDevMode);

  useEffect(() => {
    let timer: number | undefined;
    if (status === "pending") {
      timer = setTimeout(() => setShowLoader(true), 400);
    } else {
      setShowLoader(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status]);

  let lyricRenderer: React.ReactNode = showLoader ? <LyricsLoader /> : null;

  if (status === "success") {
    if (data?.Type === "Syllable") {
      lyricRenderer = <SyllableLyrics data={data} />;
    } else if (data?.Type === "Line") {
      lyricRenderer = <LineLyrics data={data} />;
    } else if (data?.Type === "Static") {
      lyricRenderer = <StaticLyrics data={data} />;
    }
  } else if (!isOnline) {
    lyricRenderer = (
      <div className="lyrics-offline">You are offline. Please reconnect.</div>
    );
  } else if (status === "error") {
    lyricRenderer = (
      <StatusText
        title="No Lyrics Found"
        desc={isDevMode ? error?.stack ?? error?.message : null}
      />
    );
  }

  return (
    <div className="lyrics-wrapper">
      <div className="top-spacing" />

      {lyricRenderer}
      {data?.SongWriters ? (
        <div className="line-wrapper credits-wrapper">
          <span className="credits">
            Credits: {data.SongWriters?.join?.(", ")}
          </span>
        </div>
      ) : null}
      <div className="bottom-spacing" />
    </div>
  );
});

export default Lyrics;
