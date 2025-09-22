import '@/styles/index.css';
import '@/styles/settings.css';
import '@/styles/theme-specific.css';

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
import { createRenderer, waitForElement } from '@utils/dom';
import { initNotificationSystem } from '@utils/notification';
import Fullscreen from './components/Fullscreen.tsx';

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

  // setup page
  tempStore.getState().setMainPageInstance(
    createPage({
      pathname: 'lucid-lyrics',
      children: <Page />,
      onChange: (active) => {
        tempStore.getState().playerButtonInstance?.update({ active });
        tempStore.getState().setIsLyricsOnPage(active);
      },
    })
  );

  // setup player button
  const playerButton = await createButton({
    icon: Icons.Brand16,
    label: 'Lucid Lyrics',
    className: 'lucid-lyrics-btn',
    active: tempStore.getState().mainPageInstance?.isActive,
    onClick: tempStore.getState().mainPageInstance?.togglePage,
  });
  playerButton?.register();
  tempStore.getState().setPlayerButtonInstance(playerButton);

  // setup fullscreen renderer
  tempStore.getState().setFullscreenRendererInstance(
    createRenderer({
      children: <Fullscreen />,
      parent: document.body,
      rootId: 'lucid-fullscreen-root',
    })
  );
  tempStore.getState().fullscreenRendererInstance?.mount();

  addLyricsToNPV();

  setupAnalytics();

  addThemeSpecificStyles();
};

main();

async function addThemeSpecificStyles() {
  const timeout = 20000;
  const isGlassifyTheme = await waitForElement('.glassify-bg', { timeout });
  const isLucidTheme = await waitForElement('.lucid-bg,#lucid-bg', { timeout });
  if (isGlassifyTheme) document.documentElement.classList.add('glassify-theme-present');
  if (isLucidTheme) document.documentElement.classList.add('lucid-theme-present');
}
