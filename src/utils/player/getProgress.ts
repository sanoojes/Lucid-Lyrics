import { logger } from '@logger';

export default function getProgress() {
  try {
    const state = Spicetify.Platform?.PlayerAPI?._state;
    if (!state) return 0;

    const { positionAsOfTimestamp, timestamp } = state;

    if (positionAsOfTimestamp === null || timestamp === null) {
      return 0;
    }

    if (!Spicetify.Player.isPlaying()) {
      return positionAsOfTimestamp;
    }

    const now = Date.now();
    return positionAsOfTimestamp + (now - timestamp);
  } catch (error) {
    logger.error('Failed to get progress:', error);
    return 0;
  }
}
