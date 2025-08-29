export type ObserveElementOptions = {
  root?: ParentNode;
  once?: boolean;
  timeout?: number;
};

export function observeElement(
  selector: string,
  onAdd: (el: Element, onRemove: (cb: (el: Element) => void) => void) => void,
  { root = document.body, once = false, timeout }: ObserveElementOptions = {}
): MutationObserver {
  let current: Element | null = root.querySelector(selector);
  let removeCb: ((el: Element) => void) | null = null;

  const registerOnRemove = (cb: (el: Element) => void) => {
    removeCb = cb;
  };

  if (current) {
    onAdd(current, registerOnRemove);
    if (once) return new MutationObserver(() => {});
  }

  const observer = new MutationObserver(() => {
    const el = root.querySelector(selector);

    if (el && el !== current) {
      current = el;
      onAdd(el, registerOnRemove);
      if (once) {
        observer.disconnect();
      }
    } else if (!el && current) {
      removeCb?.(current);
      removeCb = null;
      current = null;
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  if (timeout) {
    setTimeout(() => {
      observer.disconnect();
      if (!current) {
        console.warn(`Timeout waiting for element: ${selector}`);
      }
    }, timeout);
  }

  return observer;
}
