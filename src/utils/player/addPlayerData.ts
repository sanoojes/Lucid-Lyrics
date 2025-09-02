import tempStore from '@/store/tempStore.ts';
import type { PlayerSlot } from '@/types/store.ts';
import { getColorsFromImage } from '@/utils/color.ts';
import { waitForGlobal } from '@utils/dom';

async function addPlayerData(playerData?: typeof Spicetify.Player.data) {
  const data = playerData ?? (await waitForGlobal(() => Spicetify?.Player?.data));

  setTempPlayerData('nowPlaying', data?.item);
}

async function setTempPlayerData(slot: PlayerSlot, item?: Spicetify.PlayerTrack) {
  const url = item?.images?.at(-1)?.url ?? null;

  if (slot === 'nowPlaying') {
    document.body.style.setProperty('--np-img-url', url ? `url("${url}")` : '');
  }

  if (!url) return;

  try {
    const colors = await getColorsFromImage(url);
    tempStore.getState().setPlayer(slot, { colors });
  } catch {
    console.log('Failed to set colors for current playing.');
  }

  tempStore.getState().setPlayer(slot, {
    imageUrl: url,
    data: item ?? null,
    id: item?.uri ? getSpotifyId(item.uri) : null,
  });
}

waitForGlobal(() => Spicetify?.Player).then((Player) => {
  Player.addEventListener('songchange', (e) => addPlayerData(e?.data));
});

// Listen if needed to track next songs
// waitForGlobal(() => Spicetify?.Platform?.PlayerAPI?._queue?._events).then(
//   (events: any) => events?.addListener("queue_update", () => addPlayerData())
// );

export default addPlayerData;

function getSpotifyId(uri: string): string | undefined {
  const match = /^spotify:track:([a-zA-Z0-9]+)$/.exec(uri);
  return match ? match[1] : undefined;
}
