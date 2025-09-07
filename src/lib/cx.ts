export default function cx(
  ...args: (string | undefined | null | false | Record<string, boolean>)[]
) {
  return args
    .map((arg) => {
      if (!arg) return '';
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') {
        return Object.entries(arg)
          .filter(([_, val]) => Boolean(val))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}
