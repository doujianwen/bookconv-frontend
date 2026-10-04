// tests/unit/board.test.ts
// Tests for the SEO/GEO execution board.
//
// The board's whole value is that "today's work" is derived, not hand-maintained.
// If the derivation silently breaks, the operator sees an empty or wrong day and
// has no way to tell. So these tests pin the behaviours that matter:
//   - the data file is structurally valid (a typo fails loudly, not silently)
//   - recurrence fires on the right weekday
//   - overdue accumulates and never disappears
//   - anchors count down and flip to "passed"
//   - the numbers on the page match the data file
import { loadBoardData, getBoardView, validateBoardData } from '@/lib/board/loader';
import { deriveBoard, firesOn, isIsoDate, daysBetween, isOpen, isStanding, cadenceLabel, weekday } from '@/lib/board/derive';
import type { BoardData, BoardTask } from '@/lib/board/types';

const data = loadBoardData();

function taskById(id: string, d: BoardData = data): BoardTask {
  const t = d.modules.flatMap((m) => m.tasks).find((x) => x.id === id);
  if (!t) throw new Error(`no such task: ${id}`);
  return t;
}

describe('board data file', () => {
  it('passes structural validation', () => {
    expect(() => validateBoardData(data)).not.toThrow();
  });

  it('covers all eleven modules M0–M10', () => {
    expect(data.modules.map((m) => m.id)).toEqual([
      'M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10',
    ]);
  });

  it('has 66 tasks (63 from the breakdown table + M2-8/M2-9/M9-7 added 2026-10-02)', () => {
    expect(data.modules.flatMap((m) => m.tasks)).toHaveLength(66);
  });

  it('uses unique task ids', () => {
    const ids = data.modules.flatMap((m) => m.tasks).map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rejects an invalid status rather than rendering a blank cell', () => {
    const bad = JSON.parse(JSON.stringify(data)) as BoardData;
    bad.modules[0].tasks[0].status = 'in-progress' as never;
    expect(() => validateBoardData(bad)).toThrow(/bad status/);
  });

  it('rejects an invalid priority', () => {
    const bad = JSON.parse(JSON.stringify(data)) as BoardData;
    bad.modules[0].tasks[0].priority = 'URGENT' as never;
    expect(() => validateBoardData(bad)).toThrow(/bad priority/);
  });

  it('rejects duplicate task ids', () => {
    const bad = JSON.parse(JSON.stringify(data)) as BoardData;
    bad.modules[0].tasks[1].id = bad.modules[0].tasks[0].id;
    expect(() => validateBoardData(bad)).toThrow(/duplicate task id/);
  });

  it('marks every task as either a spec clause or a documented supplement', () => {
    for (const t of data.modules.flatMap((m) => m.tasks)) {
      expect(['CORE', 'SUPP']).toContain(t.tier);
    }
  });

  it('carries five anchors and two social channels', () => {
    expect(data.anchors).toHaveLength(5);
    expect(data.social.x.account).toBe('GinoTou2024');
    expect(data.social.reddit.account).toBe('u/hongjiandou');
  });

  it('declares at least one open decision for the owner', () => {
    expect(data.openDecisions.length).toBeGreaterThan(0);
    for (const d of data.openDecisions) expect(d.blocks).toMatch(/^M\d+-\d+$/);
  });
});

describe('date helpers', () => {
  it('recognises ISO dates only', () => {
    expect(isIsoDate('2026-09-27')).toBe(true);
    expect(isIsoDate('每日')).toBe(false);
    expect(isIsoDate('每周一')).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });

  it('computes day deltas', () => {
    expect(daysBetween('2026-09-27', '2026-09-28')).toBe(1);
    expect(daysBetween('2026-09-27', '2026-10-01')).toBe(4);
    expect(daysBetween('2026-10-01', '2026-09-27')).toBe(-4);
  });

  it('maps weekdays stably', () => {
    // 2026-09-28 is a Monday.
    expect(weekday('2026-09-28')).toBe(1);
    expect(weekday('2026-10-04')).toBe(0); // Sunday
  });

  it('treats done and dropped as closed', () => {
    expect(isOpen('todo')).toBe(true);
    expect(isOpen('doing')).toBe(true);
    expect(isOpen('blocked')).toBe(true);
    expect(isOpen('done')).toBe(false);
    expect(isOpen('dropped')).toBe(false);
  });
});

describe('recurrence', () => {
  it('fires daily task every day', () => {
    expect(firesOn(taskById('M9-2'), '2026-09-28')).toBe(true);
    expect(firesOn(taskById('M9-2'), '2026-10-04')).toBe(true);
  });

  it('fires weekly tasks on Monday only', () => {
    expect(firesOn(taskById('M1-6'), '2026-09-28')).toBe(true); // Mon
    expect(firesOn(taskById('M1-6'), '2026-09-29')).toBe(false); // Tue
  });

  it('fires monthly-first-week only in the first 7 days on a Monday', () => {
    expect(firesOn(taskById('M8-7'), '2026-10-05')).toBe(true); // Oct 5, Monday, day<=7
    expect(firesOn(taskById('M8-7'), '2026-10-12')).toBe(false); // Monday but day 12
    expect(firesOn(taskById('M8-7'), '2026-10-06')).toBe(false); // day 6 but Tuesday
  });

  it('fires monthly-end only in the last three days', () => {
    // September 2026 has 30 days.
    expect(firesOn(taskById('M9-6'), '2026-09-30')).toBe(true);
    expect(firesOn(taskById('M9-6'), '2026-09-28')).toBe(true);
    expect(firesOn(taskById('M9-6'), '2026-09-27')).toBe(false);
  });

  it('fires quarterly only in the first week of Jan/Apr/Jul/Oct on a Monday', () => {
    expect(firesOn(taskById('M3-6'), '2026-10-05')).toBe(true); // Oct, Monday, day 5
    expect(firesOn(taskById('M3-6'), '2026-11-02')).toBe(false); // November
    expect(firesOn(taskById('M3-6'), '2026-10-12')).toBe(false); // Monday, day 12
  });

  it('never auto-lists event-driven tasks (per-change / per-round)', () => {
    expect(firesOn(taskById('M2-7'), '2026-09-28')).toBe(false);
    expect(firesOn(taskById('M7-5'), '2026-09-28')).toBe(false);
  });

  it('classifies the three standing cadences and nothing else', () => {
    expect(isStanding('continuous')).toBe(true);
    expect(isStanding('per-change')).toBe(true);
    expect(isStanding('per-round')).toBe(true);
    // Calendar cadences are dated work, not standing discipline.
    for (const c of ['daily', 'weekly', 'weekly-monday', 'every-2-days', 'monthly', 'monthly-end', 'quarterly']) {
      expect(isStanding(c)).toBe(false);
    }
    expect(isStanding(undefined)).toBe(false);
  });

  it('labels every cadence that appears in the data file', () => {
    const cadences = new Set(
      data.modules.flatMap((m) => m.tasks).map((t) => t.recurring).filter((r): r is string => !!r)
    );
    for (const c of cadences) {
      const label = cadenceLabel(c);
      expect(label).not.toBe('');
      // An unmapped cadence falls through as its raw key; every key here is mapped.
      expect(label).not.toBe(c);
    }
  });

  it('does not treat non-recurring fixed-date tasks as recurring', () => {
    expect(firesOn(taskById('M0-1'), '2026-09-28')).toBe(false);
  });

  it('anchors the every-2-days parity to D0, not to run time', () => {
    const t = taskById('M7-3');
    // D0 is 2026-09-27; even offsets fire, odd offsets do not.
    expect(firesOn(t, '2026-09-27')).toBe(true);
    expect(firesOn(t, '2026-09-28')).toBe(false);
    expect(firesOn(t, '2026-09-29')).toBe(true);
  });
});

describe('board derivation', () => {
  const view = deriveBoard(data, '2026-09-27');

  it('reports the totals straight from the data file', () => {
    expect(view.totals.tasks).toBe(66);
    // 2026-10-03 backfill: 25 overdue tasks audited against on-disk evidence.
    // 18 moved todo->done, 6 todo->doing (gate built, acceptance not met),
    // 1 pre-existing done (M3-2); M8-5 + M2-5 + M6-4 + M6-5 + M7-2 + M5-1 +
    // M0-5 + M6-1 closed done the same day (all grep/online-verified).
    // 2026-10-04: M3-5 (no-JS render audit) closed done after
    // scripts/verify-nojs-render.mjs passed 10/10 page templates online.
    // open = todo + doing.
    expect(view.totals.done).toBe(28);
    expect(view.totals.open).toBe(38);
    expect(view.totals.coreOpen + view.totals.suppOpen).toBe(38);
  });

  it('lists fixed-date tasks due today', () => {
    // No fixed-date task is due exactly on D0; the D0 list is recurring-only.
    const fixed = view.dueToday.filter((d) => !d.recurring);
    expect(fixed).toHaveLength(0);
  });

  it('lists recurring tasks on D0', () => {
    const ids = view.dueToday.map((d) => d.taskId);
    expect(ids).toContain('M9-2'); // daily
    expect(ids).toContain('M1-5'); // daily
  });

  it('routes standing cadences out of the dated list', () => {
    // `continuous` / `per-change` / `per-round` fire every day by construction.
    // They are background discipline, not today's deliverable, so they must not
    // bury the handful of tasks that actually have to ship.
    const datedIds = view.dueToday.map((d) => d.taskId);
    const standingIds = view.standing.map((d) => d.taskId);
    expect(datedIds).not.toContain('M10-3'); // continuous
    expect(standingIds).toContain('M10-3');
    expect(standingIds).toContain('M8-1'); // continuous
    expect(standingIds).toContain('M8-6'); // continuous
    // No task may appear in both buckets.
    for (const id of standingIds) expect(datedIds).not.toContain(id);
  });

  it('keeps D0 actionable by excluding standing discipline', () => {
    // Without the split, D0 lists 11 items and only 5 of them are dated work
    // (the other 6 are standing discipline spread across six modules).
    expect(view.dueToday.length).toBe(5);
    expect(view.dueToday.every((d) => !isStanding(d.recurring))).toBe(true);
    expect(view.standing.length).toBe(8); // 6 continuous + 1 per-change + 1 per-round
    expect(view.standing.filter((d) => d.recurring === 'continuous')).toHaveLength(6);
  });

  it('reports per-module standing counts without polluting nextDue', () => {
    const m8 = view.modules.find((m) => m.id === 'M8')!;
    expect(m8.standingOpen).toBe(3); // M8-1, M8-2, M8-6 continuous (M8-7 is monthly)
    // M10 has only one dated task (M10-2); the standing one must not pin nextDue.
    const m10 = view.modules.find((m) => m.id === 'M10')!;
    expect(m10.standingOpen).toBe(1); // M10-3 continuous
    expect(m10.nextDue).toBe('2026-10-15'); // M10-2, not "today" from M10-3
  });

  it('carries the task status and cadence label into the due item', () => {
    const m15 = view.dueToday.find((d) => d.taskId === 'M1-5')!;
    expect(m15.status).toBe('todo');
    expect(m15.cadenceLabel).toBe('每日');
  });

  it('has nothing overdue on day zero', () => {
    expect(view.overdue).toHaveLength(0);
  });

  it('surfaces a task as overdue the day after its due date', () => {
    const next = deriveBoard(data, '2026-09-29');
    const ids = next.overdue.map((d) => d.taskId);
    // 2026-10-03 backfill: M0-1/M0-2/M1-1/M9-1 were closed by that audit;
    // M2-5 closed done the same day (top-asset assertions). M2-1 (due 09-28,
    // still doing) is now the earliest open overdue probe.
    expect(ids).toContain('M2-1'); // due 09-28
    expect(ids).not.toContain('M0-1'); // closed 2026-10-03
    expect(ids).not.toContain('M2-5'); // closed 2026-10-03
    // and records how late it is
    const m21 = next.overdue.find((d) => d.taskId === 'M2-1')!;
    expect(m21.daysLate).toBe(1);
  });

  it('keeps overdue items accumulating rather than dropping off', () => {
    const d1 = deriveBoard(data, '2026-09-29');
    const d2 = deriveBoard(data, '2026-10-05');
    expect(d2.overdue.length).toBeGreaterThan(d1.overdue.length);
    // the earliest item is still present, now later
    // M2-1 (due 09-28, still doing) is the earliest open one after the
    // 2026-10-03 backfill closed M0-1 and M2-5.
    expect(d2.overdue.map((d) => d.taskId)).toContain('M2-1');
  });

  it('sorts due-today by priority, P0 first', () => {
    const next = deriveBoard(data, '2026-09-28');
    const priorities = next.dueToday.map((d) => d.priority);
    const ranked = priorities.map((p) => (p === 'P0' ? 0 : p === 'P1' ? 1 : p === 'P2' ? 2 : 3));
    expect(ranked).toEqual([...ranked].sort((a, b) => a - b));
  });

  it('counts module progress from statuses only', () => {
    const m0 = view.modules.find((m) => m.id === 'M0')!;
    // 2026-10-03: M0-5 closed done (claim-tier register), M0 fully complete.
    expect(m0.total).toBe(5);
    expect(m0.done).toBe(5);
    expect(m0.pct).toBe(100);
    expect(m0.p0Open).toBe(0);
    expect(m0.nextDue).toBeNull();
  });

  it('reflects a completed task in module progress and totals', () => {
    const mutated = JSON.parse(JSON.stringify(data)) as BoardData;
    // M2-1 is 'doing' (overdue probe); promoting it to done shifts totals.
    const m2 = mutated.modules.find((m) => m.id === 'M2')!;
    m2.tasks.find((t) => t.id === 'M2-1')!.status = 'done';
    const v = deriveBoard(mutated, '2026-09-27');
    const m2v = v.modules.find((m) => m.id === 'M2')!;
    expect(m2v.pct).toBeGreaterThan(0);
    expect(v.totals.done).toBe(29); // 28 incl. M3-5 + M2-1 promoted
    expect(v.totals.open).toBe(37); // isOpen() counts todo + doing
  });

  it('excludes dropped tasks from the open count', () => {
    const mutated = JSON.parse(JSON.stringify(data)) as BoardData;
    // M1-1 closed in the 2026-10-03 backfill, so drop an actually-open task (M1-4).
    mutated.modules[1].tasks[3].status = 'dropped';
    const v = deriveBoard(mutated, '2026-09-27');
    expect(v.totals.open).toBe(37); // 38 - M1-4 dropped
    expect(v.modules.find((m) => m.id === 'M1')!.open).toBe(3);
  });

  it('counts blocked tasks separately', () => {
    const mutated = JSON.parse(JSON.stringify(data)) as BoardData;
    mutated.modules[2].tasks[0].status = 'blocked';
    const v = deriveBoard(mutated, '2026-09-27');
    expect(v.totals.blocked).toBe(1);
    expect(v.modules.find((m) => m.id === 'M2')!.blocked).toBe(1);
  });

  it('counts down to anchors and flips them to passed', () => {
    const before = deriveBoard(data, '2026-09-27');
    const tier1 = before.anchors.find((a) => a.label === 'Tier-1 首读')!;
    expect(tier1.daysLeft).toBe(4);
    expect(tier1.passed).toBe(false);

    const after = deriveBoard(data, '2026-10-02');
    const tier1b = after.anchors.find((a) => a.label === 'Tier-1 首读')!;
    expect(tier1b.passed).toBe(true);
    expect(tier1b.daysLeft).toBe(-1);
  });

  it('marks an anchor as today when the date matches', () => {
    const v = deriveBoard(data, '2026-10-20');
    const g = v.anchors.find((a) => a.label === 'Google 重评估')!;
    expect(g.isToday).toBe(true);
    expect(g.daysLeft).toBe(0);
  });

  it('sorts anchors soonest first', () => {
    const deltas = view.anchors.map((a) => a.daysLeft);
    expect(deltas).toEqual([...deltas].sort((a, b) => a - b));
  });

  it('surfaces the scheduled X slot for its date', () => {
    const d0 = deriveBoard(data, '2026-09-27').social.find((s) => s.channel === 'x')!;
    expect(d0.item).toBe('Post 1');
    const off = deriveBoard(data, '2026-09-28').social.find((s) => s.channel === 'x')!;
    expect(off.item).toBeNull();
  });

  it('keeps Reddit in warm-up until the window opens', () => {
    const during = deriveBoard(data, '2026-09-27').social.find((s) => s.channel === 'reddit')!;
    expect(during.item).toBeNull();
    expect(during.note).toMatch(/养号期/);
    expect(during.daysUntil).toBe(29);

    const onDay = deriveBoard(data, '2026-10-26').social.find((s) => s.channel === 'reddit')!;
    expect(onDay.item).toBe('r/webdev');
  });

  it('never returns an empty recheck queue shape (it is a list, possibly empty)', () => {
    expect(Array.isArray(view.recheckQueue)).toBe(true);
  });

  it('routes a task into the recheck queue once it has a recheck date', () => {
    const mutated = JSON.parse(JSON.stringify(data)) as BoardData;
    mutated.modules[0].tasks[0].status = 'done';
    mutated.modules[0].tasks[0].recheck = '2026-09-30';
    const due = deriveBoard(mutated, '2026-09-30');
    expect(due.recheckQueue.map((d) => d.taskId)).toContain('M0-1');

    const late = deriveBoard(mutated, '2026-10-02');
    const item = late.recheckQueue.find((d) => d.taskId === 'M0-1')!;
    expect(item.kind).toBe('recheck-overdue');
    expect(item.daysLate).toBe(2);
  });

  it('surfaces COMPLETED work for recheck — that is the whole point of a recheck', () => {
    // §5-5: nothing is finished until its result is confirmed. A recheck on a
    // done task must still appear; restricting the queue to open tasks would
    // silently drop exactly the items the queue exists for.
    const mutated = JSON.parse(JSON.stringify(data)) as BoardData;
    mutated.modules[0].tasks[0].status = 'done';
    mutated.modules[0].tasks[0].recheck = '2026-09-28';
    const v = deriveBoard(mutated, '2026-09-28');
    expect(v.recheckQueue.map((d) => d.taskId)).toContain('M0-1');
  });

  it('does not list a completed task as still due', () => {
    const mutated = JSON.parse(JSON.stringify(data)) as BoardData;
    mutated.modules[0].tasks[0].status = 'done';
    // M0-1 was due 09-28; once done it must not appear in due-today or overdue.
    const v = deriveBoard(mutated, '2026-09-28');
    expect(v.dueToday.map((d) => d.taskId)).not.toContain('M0-1');
    const later = deriveBoard(mutated, '2026-10-05');
    expect(later.overdue.map((d) => d.taskId)).not.toContain('M0-1');
  });

  it('never rechecks a dropped task', () => {
    const mutated = JSON.parse(JSON.stringify(data)) as BoardData;
    mutated.modules[0].tasks[0].status = 'dropped';
    mutated.modules[0].tasks[0].recheck = '2026-09-28';
    const v = deriveBoard(mutated, '2026-09-28');
    expect(v.recheckQueue.map((d) => d.taskId)).not.toContain('M0-1');
  });

  it('is pure: same input yields the same view', () => {
    const a = deriveBoard(data, '2026-09-27');
    const b = deriveBoard(data, '2026-09-27');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('does not mutate the input data', () => {
    const snapshot = JSON.stringify(data);
    deriveBoard(data, '2026-10-05');
    expect(JSON.stringify(data)).toBe(snapshot);
  });

  it('exposes a convenience loader for a given day', () => {
    const v = getBoardView('2026-09-27');
    expect(v.today).toBe('2026-09-27');
    expect(v.totals.tasks).toBe(66);
  });
});

describe('board honesty', () => {
  it('labels supplement tasks as SUPP so they are never read as spec clauses', () => {
    const supp = data.modules.flatMap((m) => m.tasks).filter((t) => t.tier === 'SUPP');
    // M3 (technical SEO) and M5 (localisation) are entirely supplements.
    expect(supp.length).toBeGreaterThanOrEqual(15);
    for (const id of ['M3-1', 'M5-1', 'M5-2', 'M6-7', 'M8-6']) {
      expect(taskById(id).tier).toBe('SUPP');
    }
  });

  it('keeps the spec-clause tasks marked CORE', () => {
    for (const id of ['M0-1', 'M1-1', 'M2-1', 'M6-1', 'M9-1']) {
      expect(taskById(id).tier).toBe('CORE');
    }
  });

  it('never presents a citation count as a traffic promise', () => {
    const blob = JSON.stringify(data);
    if (/9,012/.test(blob)) {
      expect(blob).toMatch(/引用|citation/i);
    }
    // The forbidden framing must not appear anywhere in the board data.
    expect(blob).not.toMatch(/citations?\s*(=|are)\s*traffic/i);
    expect(blob).not.toMatch(/GEO\s*score/i);
  });

  it('states the supplement discipline in the readme so the file is self-explaining', () => {
    const readme = (data as unknown as { _readme: string[] })._readme.join(' ');
    expect(readme).toMatch(/唯一数据源/);
    expect(readme).toMatch(/改这里 = 改工作台/);
  });
});
