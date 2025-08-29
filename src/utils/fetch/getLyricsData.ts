import type { BestAvailableLyrics } from "@/types/lyrics.ts";
import { getSpotifyTokenHeader } from "@/utils/fetch/getSpotifyToken.ts";

export const getLyricsData = async (id: string | null) => {
  if (!id) throw new Error("Missing track ID");

  const isDev = true;

  const tokenHeader = await getSpotifyTokenHeader();
  if (!tokenHeader) {
    throw new Error("Missing or invalid Spotify token");
  }

  let res: Response;
  try {
    res = await fetch(
      `${
        isDev
          ? "http://localhost:8787"
          : "https://api.lucidlyrics.dploy-769795339266794283.dp.spikerko.org"
      }/lyrics/${id}`,
      {
        method: "GET",
        headers: {
          "Spotify-Token": tokenHeader,
        },
      }
    );
  } catch {
    throw new Error("Cannot connect to lyrics server");
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Lyrics not found");
    }

    let errMsg: string;
    try {
      const errJson = await res.json();
      errMsg = errJson.error || res.statusText;
    } catch {
      errMsg = res.statusText;
    }
    throw new Error(`Request failed: ${res.status} ${errMsg}`);
  }

  const data = await res.json();
  console.log("Lyrics data:", data);
  if (!data?.lyrics) throw new Error("Lyrics not found");
  return data.lyrics as BestAvailableLyrics;
};
