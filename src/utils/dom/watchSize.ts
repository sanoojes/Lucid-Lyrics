export function watchSize(
  element: Element,
  callback: (size: { width: number; height: number }) => void
): ResizeObserver {
  console.log(element);

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect) {
        callback({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    }
  });

  observer.observe(element);
  return observer;
}
