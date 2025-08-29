import tempStore from '@/store/tempStore.ts';
import addPlayerData from '@/utils/player/addPlayerData.ts';
import { onElement, watchSize } from '@utils/dom';

export function updateStates() {
  addPlayerData(); // handles all state change of Spicetify.Player (lyrics, image, data) when the song/queue changes

  onElement('.Root__main-view', (main) =>
    watchSize(main, (main) => tempStore.getState().setViewSize({ main }))
  );
}
