import type { ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type RenderOptions = {
  children: ReactElement;
  parent: HTMLElement;
  rootId: string;
  prepend?: boolean;
  autoMount?: boolean;
  onMount?: (container: HTMLElement | null) => void;
  onUnMount?: () => void;
};

export type CreateRendererAPI = {
  mount: () => Promise<void>;
  update: (newChildren: ReactElement) => void;
  unmount: () => void;
};

export function createRenderer({
  children,
  parent,
  rootId,
  prepend = false,
  autoMount = true,
  onMount,
  onUnMount,
}: RenderOptions): CreateRendererAPI {
  let root: Root | null = null;
  let container: HTMLElement | null = null;

  async function mount() {
    if (!container) {
      container = document.getElementById(rootId) as HTMLElement | null;

      if (!container) {
        container = document.createElement("div");
        container.id = rootId;

        parent[prepend ? "prepend" : "appendChild"](container);
      }
    }

    if (!root) {
      root = createRoot(container);
    }

    root.render(children);
    onMount?.(container);
  }

  function update(newChildren: ReactElement) {
    if (!root) throw new Error("Renderer not mounted");
    root.render(newChildren);
  }

  function unmount() {
    root?.unmount();
    if (container?.parentNode === parent) parent.removeChild(container);
    root = null;
    container = null;
    onUnMount?.();
  }

  if (autoMount) {
    void mount();
  }

  return { mount, update, unmount };
}
