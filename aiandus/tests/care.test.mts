import assert from 'node:assert/strict';
import test from 'node:test';
import { CARE, careMoonDays, nextFeedingRange } from '../src/care.ts';
import { CROPS } from '../src/calendar.ts';

test('all listed crops have sourced guides from sowing to harvest', () => {
  for (const crop of CROPS) {
    assert.ok(CARE[crop.id]?.stages.length >= 3, crop.id);
    assert.ok(CARE[crop.id]?.sources.length, crop.id);
  }
});

test('feeding intervals apply to container tomatoes and cucumbers across calendar boundaries', () => {
  assert.deepEqual(nextFeedingRange('tomat', '2026-12-25'), { start: '2027-01-04', end: '2027-01-08' });
  assert.deepEqual(nextFeedingRange('kurk', '2028-02-29'), { start: '2028-03-10', end: '2028-03-14' });
  assert.equal(nextFeedingRange('kurk', '2027-02-29'), undefined);
  assert.equal(nextFeedingRange('hernes', '2027-04-15'), undefined);
});

test('care recommendations follow lunar phase without inventing uncovered dates', () => {
  const days = careMoonDays('topping', '2027-01-07');
  assert.equal(days.length, 7);
  assert.equal(days[0].matches, true);
  assert.equal(days[1].matches, false);
  assert.equal(careMoonDays('transplanting', '2027-01-07')[1].matches, true);
  assert.ok(careMoonDays('weeding', '2032-01-01').every(({ period, matches }) => period === undefined && !matches));
});
