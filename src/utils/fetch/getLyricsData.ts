import { logger } from '@/lib/logger.ts';
import appStore from '@/store/appStore.ts';
import type { BestAvailableLyrics } from '@/types/lyrics.ts';
import { getSpotifyTokenHeader } from '@/utils/fetch/getSpotifyToken.ts';
import { processLyrics } from '@/utils/lyrics/processLyrics.ts';

// List of APIs
const API_CONSUMERS = appStore.getState().isDevMode
  ? ['http://localhost:8787']
  : [
      'https://lyrics.lucid.sanooj.is-a.dev',
      'https://lucid-lyrics.cloudns.pro',
      'https://api.lucidlyrics.dploy-769795339266794283.dp.spikerko.org',
    ];

let availableApi: string | null = null;

export const getLyricsData = async (id: string | null) => {
  if (!id) throw new Error('Missing track ID');

  const tokenHeader = await getSpotifyTokenHeader();
  if (!tokenHeader) {
    throw new Error('Missing or invalid Spotify token');
  }

  const endpointsToTry = availableApi
    ? [availableApi, ...API_CONSUMERS.filter((url) => url !== availableApi)]
    : API_CONSUMERS;

  let lastError: Error | null = null;

  for (const baseUrl of endpointsToTry) {
    try {
      const res = await fetch(`${baseUrl}/api/lyrics/${id}`, {
        method: 'GET',
        headers: {
          'Spotify-Token': tokenHeader,
        },
        credentials: 'omit',
        priority: 'high',
      });

      if (!res.ok) {
        if (res.status === 404) {
          lastError = new Error('Lyrics not found');
          continue;
        }

        let errMsg: string;
        try {
          const errJson = await res.json();
          errMsg = errJson.error || res.statusText;
        } catch {
          errMsg = res.statusText;
        }
        lastError = new Error(`Request failed: ${res.status} ${errMsg}`);
        continue;
      }

      const data = await res.json();
      if (!data?.lyrics) {
        lastError = new Error('Lyrics not found');
        continue;
      }

      availableApi = baseUrl;
      logger.debug('Lyrics data:', data);
      return (await processLyrics(data.lyrics)) ?? (data.lyrics as BestAvailableLyrics);
    } catch (e) {
      logger.error(e);
      lastError = new Error('Cannot connect to lyrics server');
    }
  }

  throw lastError || new Error('Lyrics not found from all sources');
};
