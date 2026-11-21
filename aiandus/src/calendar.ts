import phases from './data/moon-phases.json' with { type: 'json' };

export const TIME_ZONE = 'Europe/Tallinn';
export type Day = string;
export type Method = 'outdoor' | 'indoors';
type LunarPeriod = 'waxing' | 'waning';

export const METHOD = { outdoor: 'Avamaale külv', indoors: 'Ettekasvatus' } as const;
export const PHASE_NAMES: Record<string, string> = {
  'New Moon': 'Noorkuu', 'First Quarter': 'Esimene veerand',
  'Full Moon': 'Täiskuu', 'Last Quarter': 'Viimane veerand',
};
export const USNO = 'https://aa.usno.navy.mil/data/MoonPhases';
export const TRADITION = 'https://www.almanac.com/planting-by-the-moon';

export type Crop = {
  id: string; name: string; icon: string; method: Method; lunar: LunarPeriod;
  start: string; end: string; advice: string; source: string;
};

const gardest = 'https://gardest.ee/wp-content/uploads/2026/01/Gardesti-kulvikalender-Koogiviljad.pdf';
const growing = 'https://kasvatamine.ee/eesti-koogiviljade-kulvikalender-praktiline-juhend-avamaale-ja-kasvuhoonesse/';

// Indicative spring windows. Day boundaries approximate month-level guidance.
export const CROPS: Crop[] = [
  { id: 'redis', name: 'Redis', icon: '🌱', method: 'outdoor', lunar: 'waning', start: '04-20', end: '05-31', advice: 'Külva, kui muld on tahenenud ja piisavalt niiske.', source: 'https://www.maheseemned.ee/et/mahe-orgaanilised-koogiviljade-seemned/435-radish-cherry-belle' },
  { id: 'porgand', name: 'Porgand', icon: '🥕', method: 'outdoor', lunar: 'waning', start: '04-21', end: '05-31', advice: 'Vali kobeda mullaga peenar ja hoia külvi ühtlaselt niiskena.', source: growing },
  { id: 'hernes', name: 'Hernes', icon: '🫛', method: 'outdoor', lunar: 'waxing', start: '04-01', end: '05-31', advice: 'Külva, kui muld on tahenenud ja peenart saab harida.', source: gardest },
  { id: 'salat', name: 'Aedsalat', icon: '🥬', method: 'outdoor', lunar: 'waxing', start: '04-01', end: '05-31', advice: 'Aedsalat sobib kevadiseks külviks, kui muld on haritav.', source: growing },
  { id: 'tomat', name: 'Tomat', icon: '🍅', method: 'indoors', lunar: 'waxing', start: '03-01', end: '03-31', advice: 'Alusta soojas ja valgusküllases kohas umbes 6–8 nädalat enne istutamist.', source: growing },
  { id: 'kurk', name: 'Kurk', icon: '🥒', method: 'indoors', lunar: 'waxing', start: '04-21', end: '05-31', advice: 'Külva potti soojas kohas. Välja istutamisel arvesta öökülma ja mulla soojenemisega.', source: growing },
];

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});
const hourFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', hourCycle: 'h23' });

export function localDay(date: Date = new Date()): Day {
  const parts = dateFormatter.formatToParts(date);
  return ['year', 'month', 'day'].map((part) => parts.find((entry) => entry.type === part)?.value).join('-');
}

export function tallinnTime(day: Day, hour: number): Date {
  const guess = new Date(`${day}T${String(hour).padStart(2, '0')}:00:00Z`);
  const dayShift = (Date.parse(localDay(guess)) - Date.parse(day)) / 86_400_000;
  const offset = Number(hourFormatter.format(guess)) + dayShift * 24 - hour;
  return new Date(guess.getTime() - offset * 3_600_000);
}

const dateOf = (day: Day) => new Date(`${day}T00:00:00Z`);

export function validDay(day: Day): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < '1900-01-01' || day > '2100-12-31') return false;
  const date = dateOf(day);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(day);
}

export function addDays(day: Day, count: number): Day {
  const date = dateOf(day);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

export function changeMonth(day: Day, count: number): Day {
  const date = dateOf(`${day.slice(0, 7)}-01`);
  date.setUTCMonth(date.getUTCMonth() + count);
  return date.toISOString().slice(0, 10);
}

export function monthGrid(day: Day): Day[] {
  const start = `${day.slice(0, 7)}-01`;
  const leading = (dateOf(start).getUTCDay() + 6) % 7;
  const last = addDays(changeMonth(day, 1), -1);
  const cells = Math.ceil((leading + Number(last.slice(8))) / 7) * 7;
  return Array.from({ length: cells }, (_, index) => addDays(start, index - leading));
}

export function formatDay(day: Day, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }): string {
  return new Intl.DateTimeFormat('et-EE', { ...options, timeZone: 'UTC' }).format(dateOf(day));
}

const lunarEvents = phases.map((event) => ({ ...event, day: localDay(new Date(event.instant)) }));
const turningPoints = lunarEvents.filter(({ phase }) => phase === 'New Moon' || phase === 'Full Moon');

export function moonEvent(day: Day) {
  return lunarEvents.find((event) => event.day === day);
}

export function lunarPeriod(day: Day): LunarPeriod | undefined {
  const noon = tallinnTime(day, 12).toISOString();
  const nextIndex = turningPoints.findIndex(({ instant }) => instant > noon);
  if (nextIndex < 1) return undefined;
  const previous = turningPoints[nextIndex - 1];
  if (previous.phase === turningPoints[nextIndex].phase) return undefined;
  return previous.phase === 'New Moon' ? 'waxing' : 'waning';
}

export function sowingWindow(crop: Crop, year: string) {
  return { start: `${year}-${crop.start}`, end: `${year}-${crop.end}` };
}

export function inSeason(crop: Crop, day: Day): boolean {
  return day.slice(5) >= crop.start && day.slice(5) <= crop.end;
}

export function recommended(crop: Crop, day: Day): boolean {
  return inSeason(crop, day) && lunarPeriod(day) === crop.lunar;
}

export function nextSuggestedDay(crop: Crop, from: Day): Day | undefined {
  const { start, end } = sowingWindow(crop, from.slice(0, 4));
  for (let day = from > start ? from : start; day <= end; day = addDays(day, 1)) {
    if (recommended(crop, day)) return day;
  }
}

export function nextWindow(crop: Crop, from: Day) {
  const year = from.slice(0, 4);
  const current = sowingWindow(crop, year);
  return current.end >= from ? current : sowingWindow(crop, String(Number(year) + 1));
}
