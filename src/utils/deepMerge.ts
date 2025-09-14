export default function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target } as any;

  for (const key in source) {
    const sourceValue = (source as any)[key];
    const targetValue = (target as any)[key];

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      output[key] = deepMerge(targetValue ?? {}, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  }

  return output;
}
