import { TIME_ZONE, validDay } from './calendar.ts';

export type Place = { id: number; name: string; region?: string; latitude: number; longitude: number };
export type ForecastDay = {
  day: string; low: number | null; high: number | null; rain: number | null;
  wind: number | null; code: number | null; frost: boolean;
};
export type Forecast = {
  placeId: number; loadedAt: number; temperature: number | null; code: number | null; days: ForecastDay[];
};

export const DEFAULT_PLACE: Place = { id: 588409, name: 'Tallinn', latitude: 59.437, longitude: 24.7536 };
export const WEATHER_SOURCE = 'https://open-meteo.com/';

async function request<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
  return response.json() as Promise<T>;
}

export async function searchPlaces(name: string, signal: AbortSignal): Promise<Place[]> {
  const parameters = new URLSearchParams({ name, countryCode: 'EE', language: 'et', count: '8' });
  const response = await request<{ results?: (Place & { admin1?: string })[] }>(
    `https://geocoding-api.open-meteo.com/v1/search?${parameters}`, signal,
  );
  return (response.results ?? []).map(({ id, name, admin1, latitude, longitude }) => ({ id, name, region: admin1, latitude, longitude }));
}

type WeatherResponse = {
  current?: { temperature_2m?: number | null; weather_code?: number | null };
  daily: {
    time: string[]; temperature_2m_min: (number | null)[]; temperature_2m_max: (number | null)[];
    precipitation_sum: (number | null)[]; wind_speed_10m_max: (number | null)[]; weather_code: (number | null)[];
  };
  hourly?: { time: string[]; temperature_2m: (number | null)[] };
};

export async function getForecast(place: Place, signal: AbortSignal): Promise<Forecast> {
  const parameters = new URLSearchParams({
    latitude: String(place.latitude), longitude: String(place.longitude), timezone: TIME_ZONE,
    forecast_days: '7', current: 'temperature_2m,weather_code', hourly: 'temperature_2m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
  });
  const payload = await request<WeatherResponse>(`https://api.open-meteo.com/v1/forecast?${parameters}`, signal);
  const { daily, hourly } = payload;
  if (!daily?.time?.length || !daily.time.every(validDay)) throw new Error('Ilmaprognoosi kuupäevad puuduvad.');
  const cold = new Set<string>();
  hourly?.time.forEach((time, index) => {
    const hour = Number(time.slice(11, 13));
    const temperature = hourly.temperature_2m[index];
    if ((hour < 7 || hour >= 22) && typeof temperature === 'number' && temperature <= 0) cold.add(time.slice(0, 10));
  });
  return {
    placeId: place.id, loadedAt: Date.now(), temperature: payload.current?.temperature_2m ?? null,
    code: payload.current?.weather_code ?? null,
    days: daily.time.map((day, index) => ({
      day, low: daily.temperature_2m_min?.[index] ?? null, high: daily.temperature_2m_max?.[index] ?? null,
      rain: daily.precipitation_sum?.[index] ?? null, wind: daily.wind_speed_10m_max?.[index] ?? null,
      code: daily.weather_code?.[index] ?? null, frost: cold.has(day),
    })),
  };
}

export function weatherLabel(code: number | null | undefined): string {
  if (code == null) return 'Ilmaolud teadmata';
  if (code === 0) return 'Selge';
  if (code < 4) return 'Pilvine';
  if (code < 50) return 'Udu';
  if (code >= 95) return 'Äike';
  if ((code >= 71 && code <= 77) || code >= 85) return 'Lumi';
  return 'Sajune';
}
