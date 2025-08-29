export type OnElementOptions = {
  timeout?: number;
};

export function onElement(
  selector: string,
  callback: (el: Element) => void,
  { timeout = 3000 }: OnElementOptions = {}
): void {
  const startTime = performance.now();

  function check(): void {
    const el = document.querySelector(selector);

    if (el) {
      callback(el);
      return;
    }

    if (performance.now() - startTime > timeout) {
      console.warn(`Timeout waiting for element: ${selector}`);
      return;
    }

    requestAnimationFrame(check);
  }

  check();
}
