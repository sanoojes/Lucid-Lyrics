import Background from '@/components/background/Background.tsx';
import LyricsCard from '@/components/lyrics/LyricsCard.tsx';
import tempStore from '@/store/tempStore.ts';
import { createRenderer, observeElement } from '@utils/dom';

export function addLyricsToNPV() {
  try {
    const backgroundParentSelectors =
      '#Desktop_PanelContainer_Id,.Root__right-sidebar aside.NowPlayingView,.Root__right-sidebar aside';
    const cardSelector = 'div[data-testid="NPV_Panel_OpenDiv"]';

    const root =
      document.querySelector('.Root__right-sidebar, .XOawmCGZcQx4cesyNfVO') ?? document.body;

    observeElement(
      backgroundParentSelectors,
      (parent, onRemove) => {
        const { mount, unmount } = createRenderer({
          children: <Background />,
          parent,
          rootId: 'lyrics-background-root',
          prepend: true,
        });

        mount();

        onRemove(unmount);
      },
      { root }
    );

    observeElement(
      cardSelector,
      (parent, onRemove) => {
        const { mount, unmount } = createRenderer({
          children: <LyricsCard />,
          parent,
          rootId: 'lyrics-card-root',
        });

        const handlePage = (show: boolean) => {
          if (!show) {
            mount();
          } else {
            unmount();
          }
        };

        handlePage(tempStore.getState().isLyricsOnPage);

        const unsub = tempStore.subscribe((s) => s.isLyricsOnPage, handlePage);

        onRemove(() => {
          unsub();
          unmount();
        });
      },
      { root }
    );
  } catch (e) {
    console.error(e);
  }
}
