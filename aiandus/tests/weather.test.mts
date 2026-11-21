import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_PLACE, getForecast, searchPlaces } from '../src/weather.ts';

test('forecast uses Tallinn time, attaches frost to the correct forecast day and preserves unavailable values', async (context) => {
  context.mock.method(globalThis, 'fetch', async (input: string) => {
    const query = new URL(input).searchParams;
    assert.equal(query.get('timezone'), 'Europe/Tallinn');
    assert.equal(query.get('forecast_days'), '7');
    return Response.json({
      current: { temperature_2m: 4 },
      daily: { time: ['2027-04-01', '2027-04-02'], precipitation_sum: [0, null], temperature_2m_max: [9, 10] },
      hourly: { time: ['2027-04-01T03:00', '2027-04-02T03:00', '2027-04-02T12:00'], temperature_2m: [0, null, -1] },
    });
  });
  const forecast = await getForecast(DEFAULT_PLACE, new AbortController().signal);
  assert.equal(forecast.days[0].frost, true);
  assert.equal(forecast.days[1].frost, false);
  assert.equal(forecast.days[0].rain, 0);
  assert.equal(forecast.days[1].rain, null);
});

test('place search restricts suggestions to Estonia and gracefully handles an empty result', async (context) => {
  context.mock.method(globalThis, 'fetch', async (input: string) => {
    assert.equal(new URL(input).searchParams.get('countryCode'), 'EE');
    return Response.json({});
  });
  assert.deepEqual(await searchPlaces('Tartu', new AbortController().signal), []);
});
