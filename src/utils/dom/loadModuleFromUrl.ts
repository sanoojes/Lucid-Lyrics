export async function loadModuleFromUrl<T = any>(url: string): Promise<T> {
  try {
    const module = await import(url);

    return module as T;
  } catch (err) {
    throw new Error(`Failed to load module from URL: ${url}\n${err}`);
  }
}
