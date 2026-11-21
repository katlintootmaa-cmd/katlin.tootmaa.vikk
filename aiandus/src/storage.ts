export async function read<T>(key: string): Promise<T | null> {
  const value = globalThis.localStorage.getItem(`kuukulv:${key}`);
  return value === null ? null : JSON.parse(value) as T;
}

export async function write<T>(key: string, value: T): Promise<void> {
  globalThis.localStorage.setItem(`kuukulv:${key}`, JSON.stringify(value));
}
