import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shiftDay, observationWindows, inspectionSummary } from './gsc-observation.mjs';

test('calendar windows are inclusive and exclude release day', () => {
  const [w] = observationWindows({ releaseDayPT: '2026-11-01', milestones: [{ days: 7, start: '2026-11-02', end: '2026-11-08' }] }, '2026-11-07');
  assert.equal(w.preStart, '2026-10-25');
  assert.equal(w.preEnd, '2026-10-31');
  assert.equal(w.performanceWindowElapsed, false);
  assert.equal(shiftDay('2026-12-01', -1), '2026-11-30');
});
test('API errors remain in the denominator and do not become unknown or indexed', () => {
  const r = inspectionSummary([{ url: 'a', http: 500 }, { url: 'b', http: 200 }]);
  assert.deepEqual(r.counts, { API_ERROR: 1, UNKNOWN: 1 });
  assert.equal(r.denominator, 2);
});
test('discovery transitions are distinct from index growth', () => {
  const row = (state) => ({ url: 'a', http: 200, inspectionResult: { indexStatusResult: { coverageState: state } } });
  const r = inspectionSummary([row('Discovered - currently not indexed')], [row('URL is unknown to Google')]);
  assert.equal(r.transitions[0].to, 'Discovered - currently not indexed');
  assert.equal(r.counts['Submitted and indexed'], undefined);
});
