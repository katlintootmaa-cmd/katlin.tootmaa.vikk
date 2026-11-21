import assert from 'node:assert/strict';
import test from 'node:test';
import { CROPS, addDays, inSeason, localDay, lunarPeriod, monthGrid, moonEvent, nextWindow, recommended, tallinnTime, validDay } from '../src/calendar.ts';

test('Tallinn civil dates and reminder times respect summer time and midnight', () => {
  assert.equal(localDay(new Date('2027-01-07T22:05:00Z')), '2027-01-08');
  assert.equal(tallinnTime('2027-03-27', 9).toISOString(), '2027-03-27T07:00:00.000Z');
  assert.equal(tallinnTime('2027-03-28', 9).toISOString(), '2027-03-28T06:00:00.000Z');
  assert.equal(tallinnTime('2027-10-31', 9).toISOString(), '2027-10-31T07:00:00.000Z');
});

test('calendar handles leap years, Monday weeks, and year boundaries', () => {
  assert.equal(validDay('2027-02-29'), false);
  assert.equal(validDay('2028-02-29'), true);
  assert.equal(addDays('2027-12-31', 1), '2028-01-01');
  assert.equal(monthGrid('2027-05-12')[0], '2027-04-26');
  assert.equal(monthGrid('2027-05-12').at(-1), '2027-06-06');
});

test('moon phase display and lunar sowing classification use the published instant', () => {
  assert.equal(moonEvent('2027-01-07')?.instant, '2027-01-07T20:24:00Z');
  assert.equal(lunarPeriod('2027-01-07'), 'waning');
  assert.equal(lunarPeriod('2027-01-08'), 'waxing');
  assert.equal(lunarPeriod('2032-01-01'), undefined);
  const tomato = CROPS.find(({ id }) => id === 'tomat')!;
  assert.equal(inSeason(tomato, '2027-03-01'), true);
  assert.equal(inSeason(tomato, '2027-03-31'), true);
  assert.equal(recommended(tomato, '2027-04-01'), false);
  assert.equal(recommended(tomato, '2032-03-15'), false);
  assert.deepEqual(nextWindow(tomato, '2027-04-01'), { start: '2028-03-01', end: '2028-03-31' });
});
