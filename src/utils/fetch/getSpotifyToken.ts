import tempStore from '@/store/tempStore.ts';
import type { SpotifyToken } from '@/types/store.ts';
import { createLogger } from '@logger';

const logger = createLogger('[SpotifyToken] ');
const EXPIRATION_BUFFER_MS = 5 * 60 * 1000;

export async function getSpotifyToken(): Promise<SpotifyToken | null> {
  const { spotifyToken, setSpotifyToken } = tempStore.getState();
  const currentTime = Date.now();

  if (spotifyToken?.accessToken && spotifyToken?.expiresAtTime) {
    if (currentTime < spotifyToken.expiresAtTime - EXPIRATION_BUFFER_MS) {
      return spotifyToken;
    }
  }

  try {
    const response = (await Spicetify?.CosmosAsync?.get('sp://oauth/v2/token')) as SpotifyToken;

    if (!response?.accessToken || !response?.expiresAtTime) {
      logger.error('Invalid response:', response);
      return null;
    }

    setSpotifyToken(response);

    return response;
  } catch (error) {
    logger.error('Error getting token:', error);
    return null;
  }
}

export async function getSpotifyTokenHeader(): Promise<string | null> {
  const token = await getSpotifyToken();
  return token ? `Bearer ${token.accessToken}` : null;
}
