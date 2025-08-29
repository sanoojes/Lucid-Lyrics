export type WaitForElementOptions = {
  timeout?: number;
};

export function waitForElement(
  selector: string,
  { timeout = 3000 }: WaitForElementOptions = {}
): Promise<Element> {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    function check(): void {
      const el = document.querySelector(selector);

      if (el) {
        resolve(el);
        return;
      }

      if (performance.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for element: ${selector}`));
        return;
      }

      requestAnimationFrame(check);
    }

    check();
  });
}
