import Storage from 'expo-sqlite/kv-store';

export async function read<T>(key: string): Promise<T | null> {
  const value = await Storage.getItem(key);
  return value === null ? null : JSON.parse(value) as T;
}

export async function write<T>(key: string, value: T): Promise<void> {
  await Storage.setItem(key, JSON.stringify(value));
}
