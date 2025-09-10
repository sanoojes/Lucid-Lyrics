export default function cx(
  ...args: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  return args
    .map((arg) => {
      if (!arg) return '';
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object' && !Array.isArray(arg) && arg !== null) {
        return Object.entries(arg)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}
