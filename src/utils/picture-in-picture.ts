import { logger } from '@logger';
import { createPortal } from 'react-dom';

export type PiPRoot = {
  render: (children: React.ReactNode) => React.ReactPortal | null;
  renderHead: (render: (head: HTMLElement) => React.ReactNode) => React.ReactPortal | null;
  window: Window | null;
  parentWindow: Window;
  close: () => void;
  isOpen: () => boolean;
};

export type PiPOptions = Partial<{
  height: number;
  width: number;
  preferInitialWindowPlacement: boolean;
}>;

/**
 * Creates a Picture-in-Picture root for rendering React portals.
 *
 * @example
 * const pip = await createPiPRoot({ height: 300 });
 * pip.render(<MyComponent />);
 * pip.renderHead((head) => <style>{`body { background: black; }`}</style>);
 */
export async function createPiPRoot(userOptions: PiPOptions = {}): Promise<PiPRoot | null> {
  if (!('documentPictureInPicture' in window)) {
    logger.error('Picture-in-Picture API not supported in this browser.');
  }

  const RATIO = 10 / 16;
  const DEFAULT_SIZE = 600;
  const DEFAULT_WIDTH = Math.floor(DEFAULT_SIZE * RATIO);

  const defaultOptions = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_SIZE,
    preferInitialWindowPlacement: true,
  };

  const options = { ...defaultOptions, ...userOptions };

  let pipWindow: Window | null = null;

  try {
    pipWindow = (await (window as any).documentPictureInPicture.requestWindow(options)) as Window;
  } catch {
    return null;
  }
  const pipDoc = pipWindow.document;
  const pipHead = pipDoc.head;
  const pipBody = pipDoc.body;

  Object.assign(pipBody.style, {
    margin: '0',
    padding: '0',
    height: '100%',
    width: '100%',
  } as Partial<CSSStyleDeclaration>);

  let isClosed = false;

  const close = () => {
    try {
      if (!pipWindow.closed) pipWindow.close();
    } catch (err) {
      logger.error('Failed to close PiP window.', err);
    }
  };

  const isOpen = () => !isClosed && !pipWindow.closed;

  const handleUnload = () => {
    isClosed = true;
  };

  pipWindow.addEventListener('beforeunload', handleUnload);
  pipWindow.addEventListener('unload', handleUnload);

  return {
    window: pipWindow,
    parentWindow: window,
    render: (children) => {
      try {
        return isOpen() && children ? createPortal(children, pipBody) : null;
      } catch (err) {
        logger.error('Failed to render into PiP body.', err);
        return null;
      }
    },
    renderHead: (render) => {
      try {
        return isOpen() && render ? createPortal(render(pipHead), pipHead) : null;
      } catch (err) {
        logger.error('Failed to render into PiP head.', err);
        return null;
      }
    },
    close,
    isOpen,
  };
}
