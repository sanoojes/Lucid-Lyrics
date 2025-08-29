import { createRenderer, waitForElement } from '@utils/dom';
import type { ReactNode } from 'react';

const History: PlatformHistory | undefined = Spicetify?.Platform?.History;

export default function createPage({ pathname, children, onChange }: CreatePageProps) {
  const urlPathname = `/${pathname}/`;
  let lastPageLocation: string | null = null;
  let isActive = false;

  let mount: (() => void) | null = null;
  let unmount: (() => void) | null = null;

  const addToDom = async () => {
    const parent = await waitForElement('.Root__main-view');
    if (!parent) return;

    const renderer = createRenderer({
      children,
      parent,
      rootId: `root-${pathname.replace(/[^a-z0-9_-]/gi, '_')}`,
      prepend: true,
    });

    mount = renderer.mount;
    unmount = renderer.unmount;
  };

  const safeMount = async () => {
    if (!mount) {
      await addToDom();
    }
    mount?.();
  };

  const safeUnmount = () => {
    unmount?.();
  };

  const handlePageChange = (currentLocation: HistoryLocation | undefined) => {
    if (!History || !currentLocation) return;

    const lastEntry = History.entries.at(-2);
    lastPageLocation = lastEntry?.pathname ?? '/';

    isActive = currentLocation.pathname === urlPathname;

    document.body.classList.toggle(`page-${pathname.replace(/[^a-z0-9_-]/gi, '_')}`, isActive);

    if (isActive) {
      void safeMount();
      onChange?.(true);
    } else {
      safeUnmount();
      onChange?.(false);
    }
  };

  // run immediately + subscribe
  handlePageChange(History?.location);
  History?.listen(handlePageChange);

  const goToPage = () => History?.push(urlPathname);
  const goBack = () => History?.push(lastPageLocation ?? '/');

  const togglePage = () => {
    if (isActive) {
      goBack();
      return false;
    } else {
      goToPage();
      return true;
    }
  };

  return {
    goToPage,
    goBack,
    togglePage,
    get isActive() {
      return isActive;
    },
  };
}

export type HistoryLocation = {
  pathname: string;
};

export type PlatformHistory = {
  location: HistoryLocation;
  entries: HistoryLocation[];
  push: (location: string) => void;
  listen: (cb: (location: HistoryLocation | undefined) => void) => void;
};

export type CreatePageProps = {
  pathname: string;
  children: ReactNode;
  onChange?: (isOnPage: boolean) => void;
};
