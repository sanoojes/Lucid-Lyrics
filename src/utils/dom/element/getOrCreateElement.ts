export function getOrCreateElement<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  id: string,
  parent: Element | ShadowRoot = document.body,
  prepend: boolean = false
): HTMLElementTagNameMap[T] {
  let element = parent.querySelector?.(`#${id}`) as HTMLElementTagNameMap[T];

  if (!element) {
    element = document.createElement(tagName);
    element.id = id;

    if (prepend) {
      parent.prepend(element);
    } else {
      parent.appendChild(element);
    }
  }

  return element;
}
