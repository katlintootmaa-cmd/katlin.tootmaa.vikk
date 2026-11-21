import type { Entry } from './journal';

export const remindersAvailable = false;

export async function enableReminders(): Promise<boolean> {
  return false;
}

export async function syncReminders(_entries: Entry[]): Promise<void> {
  // The web preview stores plans locally. Phone notifications run in the native app.
}
