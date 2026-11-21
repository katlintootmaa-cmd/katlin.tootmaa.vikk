import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDay } from './calendar';
import { read, write } from './storage';
import { getForecast, type Forecast, type Place } from './weather';

const hour = 3_600_000;

export function useWeather(place: Place | undefined) {
  const [forecast, setForecast] = useState<Forecast>();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!place) return;
    let controller: AbortController | undefined;
    let active = true;
    let cached: Forecast | null = null;

    async function refresh(force = false) {
      if (!place || !active || controller) return;
      if (!force && cached && Date.now() - cached.loadedAt < hour && cached.days.some(({ day }) => day === localDay())) return;
      const pending = new AbortController();
      controller = pending;
      setLoading(true);
      setError(false);
      const timeout = setTimeout(() => pending.abort(), 12_000);
      try {
        const latest = await getForecast(place, pending.signal);
        if (!active) return;
        cached = latest;
        setForecast(latest);
        await write(`weather:${place.id}`, latest).catch(() => undefined);
      } catch {
        if (active) setError(true);
      } finally {
        clearTimeout(timeout);
        controller = undefined;
        if (active) setLoading(false);
      }
    }

    setForecast(undefined);
    setError(false);
    setLoading(true);
    void read<Forecast>(`weather:${place.id}`).catch(() => null).then((saved) => {
      if (!active) return;
      cached = saved;
      setForecast(saved ?? undefined);
      setLoading(false);
      void refresh(reload > 0);
    });
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    const interval = setInterval(() => { if (AppState.currentState === 'active') void refresh(); }, hour);
    return () => {
      active = false;
      controller?.abort();
      subscription.remove();
      clearInterval(interval);
    };
  }, [place, reload]);

  return {
    forecast: forecast?.placeId === place?.id ? forecast : undefined, error, loading,
    refresh: () => setReload((value) => value + 1),
  };
}
