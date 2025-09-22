import appStore from '@/store/appStore.ts';
import type { BestAvailableLyrics } from '@/types/lyrics.ts';
// import { getSpotifyTokenHeader } from '@/utils/fetch/getSpotifyToken.ts';
import { processLyrics } from '@/utils/lyrics/processLyrics.ts';
import { logger } from '@logger';

// List of APIs
const API_CONSUMERS = ['https://spicetify-projects.sanooj.uk'];
if (appStore.getState().isDevMode) API_CONSUMERS.unshift('http://localhost:8787');
console.log(API_CONSUMERS);

let availableApi: string | null = null;

export const getLyricsData = async (id: string | null) => {
  if (!id) throw new Error('Missing track ID');

  const endpointsToTry = availableApi
    ? [availableApi, ...API_CONSUMERS.filter((url) => url !== availableApi)]
    : API_CONSUMERS;

  let lastError: Error | null = null;

  for (const baseUrl of endpointsToTry) {
    try {
      const res = await fetch(`${baseUrl}/api/lyrics/${id}`, {
        method: 'GET',
        credentials: 'omit',
        priority: 'high',
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Lyrics not found');
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
      if ((e as Error).message !== 'Lyrics not found') {
        logger.error(e);
        lastError = new Error('Cannot connect to lyrics server');
      } else {
        throw e;
      }
    }
  }

  throw lastError || new Error('Lyrics not found from all sources');
};
