import type { ReactNode } from 'react';
import { type Root, createRoot } from 'react-dom/client';

type RenderOptions = {
  children: ReactNode;
  parent: Element;
  rootId: string;
  prepend?: boolean;
  onMount?: (rootContainer: Element | null) => void;
  onUnMount?: () => void;
};

export type CreateRendererAPI = {
  mount: () => void;
  update: (newChildren: ReactNode) => void;
  unmount: () => void;
};

export function createRenderer({
  children,
  parent,
  rootId,
  prepend = false,
  onMount,
  onUnMount,
}: RenderOptions): CreateRendererAPI {
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
    onMount?.(container);
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
    onUnMount?.();
  }

  return { mount, update, unmount };
}
