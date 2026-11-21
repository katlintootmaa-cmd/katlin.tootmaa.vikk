import type { Day } from './calendar';

export type Entry = {
  id: string;
  cropId: string;
  kind: 'planned' | 'done';
  day: Day;
  end?: Day;
  plannedDay?: Day;
  variety?: string;
  note: string;
  reminder: boolean;
};
