import '@/styles/index.css';
import '@/styles/settings.css';

import Page from '@/components/Page.tsx';
import { setupAnalytics } from '@/setupAnalytics.ts';
import { updateStates } from '@/state/updateStates.ts';
import appStore from '@/store/appStore.ts';
import tempStore from '@/store/tempStore.ts';
import { addLyricsToNPV } from '@/utils/nowPlayingView/addLyricsToNPV.tsx';
import { createButton } from '@/utils/playbar/createButton.ts';
import createPage from '@/utils/routes/createPage.ts';
import addSettings from '@/utils/settings/addSettings.tsx';
import { Icons } from '@constants';
import { initNotificationSystem } from '@utils/notification';

const main = async () => {
  // Expose Lucid Methods
  window.__lucid_lyrics = {
    Reset: () => {
      appStore.getState().resetStore();
      location.reload();
    },
    Config: () => appStore.getState(),
    SetDevMode: (isDevMode = true) => appStore.getState().setIsDevMode(isDevMode),
    _appStore: appStore,
    _tempStore: tempStore,
  };

  initNotificationSystem();
  updateStates();
  addSettings();

  let playerButton: Awaited<ReturnType<typeof createButton>> = null;

  const lyricsPage = createPage({
    pathname: 'lucid-lyrics',
    children: <Page />,
    onChange: (active) => {
      playerButton?.update({ active });
      tempStore.getState().setIsLyricsOnPage(active);
    },
  });

  playerButton = await createButton({
    icon: Icons.Mic16,
    label: 'Lucid Lyrics',
    className: 'lucid-lyrics-btn',
    active: lyricsPage.isActive,
    onClick: lyricsPage.togglePage,
  });
  playerButton?.register();

  addLyricsToNPV();

  setupAnalytics();
};

main();
