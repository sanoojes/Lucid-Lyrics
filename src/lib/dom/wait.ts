export function wait<T>(
  p: () => T | undefined,
  { interval = 50, timeout = 30000 }: { interval?: number; timeout?: number } = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const tick = () => {
      try {
        const res = p();
        if (res !== undefined) return resolve(res);

        if (Date.now() - start >= timeout) {
          return reject(new Error("Timeout"));
        }

        setTimeout(tick, interval);
      } catch (err) {
        reject(err);
      }
    };

    tick();
  });
}

export type WaitForElementOptions = {
  timeout?: number;
  interval?: number;
};

export function waitForElement(
  selector: string,
  { timeout = 30000, interval = 50 }: WaitForElementOptions = {},
): Promise<Element> {
  return wait(() => document.querySelector(selector) ?? undefined, { interval, timeout });
}
