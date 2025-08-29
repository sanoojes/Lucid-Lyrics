import type { ReactNode } from 'react';
import { type Root, createRoot } from 'react-dom/client';

type RenderOptions = {
  children: ReactNode;
  parent: Element;
  rootId: string;
  prepend?: boolean;
};

export function createRenderer({ children, parent, rootId, prepend = false }: RenderOptions) {
  let root: Root | null = null;
  let container: Element | null = null;

  function mount() {
    if (!container) {
      container = document.getElementById(rootId) as Element | null;

      if (!container) {
        container = document.createElement('div');
        container.id = rootId;
        prepend ? parent.prepend(container) : parent.appendChild(container);
      }
    }

    if (!root) {
      root = createRoot(container);
    }

    root.render(children);
  }

  function update(newChildren: ReactNode) {
    if (!root || !container) {
      throw new Error('Renderer not mounted. Call mount() before update().');
    }
    root.render(newChildren);
  }

  function unmount() {
    if (root) root.unmount();
    if (container && container.parentNode === parent) {
      parent.removeChild(container);
    }
    root = null;
    container = null;
  }

  return { mount, update, unmount };
}
