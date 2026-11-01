import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGaDate, dailyWindow } from './ga-date.mjs';

test('compact and ISO exports produce the same calendar date', () => {
  assert.equal(normalizeGaDate('20261031'), '2026-10-31');
  assert.equal(normalizeGaDate('2026-10-31'), '2026-10-31');
  for (const value of [undefined, '', '20260230', '2026-13-01', 20261031]) assert.equal(normalizeGaDate(value), null);
});
test('mixed date formats sort chronologically and form a closed window', () => {
  const result = dailyWindow([{ date: '20261031' }, { date: '2026-10-29' }, { date: '20261030' }], '2026-10-31');
  assert.equal(result.ok, true);
  assert.deepEqual(result.rows.map(x => x.date), ['2026-10-29', '2026-10-30', '2026-10-31']);
});
test('gaps, duplicates, missing dates and stale end dates cannot pass', () => {
  for (const rows of [[{ date: '20261029' }, { date: '20261031' }], [{ date: '20261031' }, { date: '2026-10-31' }], [{}], [{ date: '20261030' }]]) {
    assert.equal(dailyWindow(rows, '2026-10-31').ok, false);
  }
});
