export function shiftDay(iso, days) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function inspectionSummary(rows, previous = []) {
  const prior = new Map(previous.map(r => [r.url, r]));
  const counts = {}, transitions = [];
  for (const row of rows) {
    const state = row.http === 200 ? row.inspectionResult?.indexStatusResult?.coverageState || 'UNKNOWN' : 'API_ERROR';
    counts[state] = (counts[state] || 0) + 1;
    const old = prior.get(row.url);
    const oldState = old?.http === 200 ? old.inspectionResult?.indexStatusResult?.coverageState || 'UNKNOWN' : old ? 'API_ERROR' : null;
    if (oldState && oldState !== state) transitions.push({ url: row.url, from: oldState, to: state });
  }
  return { denominator: rows.length, counts, transitions };
}

export function observationWindows(plan, availableThrough) {
  return plan.milestones.map(m => ({
    ...m,
    preStart: shiftDay(plan.releaseDayPT, -m.days),
    preEnd: shiftDay(plan.releaseDayPT, -1),
    performanceWindowElapsed: m.end <= availableThrough,
  }));
}
