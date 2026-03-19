export type ObserveElementOptions = {
  root?: ParentNode;
};

export function observeElement(
  selector: string,
  onAdd: (el: Element, onRemove: (cb: (el: Element) => void) => void) => void,
  { root = document.body }: ObserveElementOptions = {},
): MutationObserver {
  let current: Element | null = null;
  let removeCb: ((el: Element) => void) | null = null;

  const registerOnRemove = (cb: (el: Element) => void) => {
    removeCb = cb;
  };
  const triggerRemove = () => {
    if (current && removeCb) {
      removeCb(current);
    }
    removeCb = null;
    current = null;
  };

  const handleCheck = () => {
    const el = root.querySelector(selector);

    if (el && el !== current) {
      if (current) triggerRemove();

      current = el;
      onAdd(el, registerOnRemove);
    } else if (!el && current) {
      triggerRemove();
    }
  };

  const observer = new MutationObserver(handleCheck);

  handleCheck();
  observer.observe(root, { childList: true, subtree: true });

  return observer;
}
