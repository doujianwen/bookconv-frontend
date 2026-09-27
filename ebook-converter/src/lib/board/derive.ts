// src/lib/board/derive.ts
// Pure derivation: BoardData + a date -> BoardView.
//
// Everything the board shows about "today" is computed here from the data file,
// so nothing on the page is a frozen copy that can drift from reality:
//   - which tasks are due today / overdue  (from `due`)
//   - which rechecks have come due         (from `recheck`)
//   - how far each module has progressed   (from `status`)
//   - how many days until each anchor      (from `anchors[].date`)
//   - what social post is scheduled today  (from `social.*.slots`)
//
// All date handling is YYYY-MM-DD string comparison against a caller-supplied
// "today" so the functions stay pure and testable without freezing the clock.
import type {
  AnchorCountdown,
  BoardData,
  BoardTask,
  BoardView,
  DueItem,
  ModuleProgress,
  SocialDue,
  TaskStatus,
} from './types';
import { STANDING_CADENCES } from './types';

/** True when the string looks like an ISO date (YYYY-MM-DD). Narrows the type. */
export function isIsoDate(s: string | undefined | null): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/**
 * Background cadences (`continuous` / `per-change` / `per-round`) are standing
 * discipline that applies every single day. They are separate from dated work.
 */
export function isStanding(cadence: string | undefined): boolean {
  return typeof cadence === 'string' && (STANDING_CADENCES as readonly string[]).includes(cadence);
}

/** Short human label for a cadence, shown next to the task in today's list. */
export function cadenceLabel(cadence: string | undefined): string {
  if (!cadence) return '';
  const map: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    'weekly-monday': '每周一',
    'every-2-days': '每 2 天',
    monthly: '每月',
    'monthly-first-week': '每月首周',
    'monthly-end': '月末',
    quarterly: '每季',
    continuous: '持续',
    'per-change': '每次变更',
    'per-round': '每轮',
  };
  return map[cadence] ?? cadence;
}

/** Whole days from `a` to `b` (b - a). Both YYYY-MM-DD. */
export function daysBetween(a: string, b: string): number {
  const da = Date.parse(a + 'T00:00:00Z');
  const db = Date.parse(b + 'T00:00:00Z');
  if (Number.isNaN(da) || Number.isNaN(db)) return NaN;
  return Math.round((db - da) / 86_400_000);
}

/** Tasks that still need work. `dropped` is deliberately excluded. */
export function isOpen(status: TaskStatus): boolean {
  return status !== 'done' && status !== 'dropped';
}

/** Weekday of a YYYY-MM-DD date: 0=Sun … 6=Sat (UTC-stable). */
export function weekday(date: string): number {
  return new Date(date + 'T00:00:00Z').getUTCDay();
}

/**
 * A recurring task fires on a cadence rather than a fixed date. Decide whether
 * `today` is a firing day for it. Non-recurring or unparseable -> false.
 *
 * Standing cadences return true here; `deriveBoard` keeps them out of the dated
 * list, but the flag stays truthful so callers can still ask the question.
 */
export function firesOn(task: BoardTask, today: string): boolean {
  const r = task.recurring;
  if (!r) return false;
  switch (r) {
    case 'daily':
    case 'continuous':
      return true;
    case 'weekly':
      // Monday-based week start.
      return weekday(today) === 1;
    case 'weekly-monday':
      return weekday(today) === 1;
    case 'every-2-days': {
      // Anchor the parity to D0 so it is stable across runs rather than
      // depending on when the file was read.
      const d0 = '2026-09-27';
      const n = daysBetween(d0, today);
      return Number.isFinite(n) && ((n % 2) + 2) % 2 === 0;
    }
    case 'monthly':
    case 'monthly-first-week': {
      // First Monday of the month.
      const day = Number(today.slice(8, 10));
      return weekday(today) === 1 && day <= 7;
    }
    case 'monthly-end': {
      // Last three days of the month.
      const d = new Date(today + 'T00:00:00Z');
      const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
      return d.getUTCDate() > last - 3;
    }
    case 'quarterly':
      // First Monday of Jan/Apr/Jul/Oct.
      return [1, 4, 7, 10].includes(Number(today.slice(5, 7))) && weekday(today) === 1 && Number(today.slice(8, 10)) <= 7;
    case 'per-change':
    case 'per-round':
      // Event-driven, not calendar-driven: never auto-listed.
      return false;
    default:
      return false;
  }
}

/** Flatten modules -> tasks, tagging each with its module for display. */
export function flatten(data: BoardData): { task: BoardTask; moduleId: string; moduleName: string }[] {
  const out: { task: BoardTask; moduleId: string; moduleName: string }[] = [];
  for (const m of data.modules) {
    for (const t of m.tasks) out.push({ task: t, moduleId: m.id, moduleName: m.name });
  }
  return out;
}

function toDueItem(
  row: { task: BoardTask; moduleId: string; moduleName: string },
  date: string,
  kind: DueItem['kind'],
  daysLate?: number
): DueItem {
  const cadence = typeof row.task.recurring === 'string' ? row.task.recurring : undefined;
  return {
    taskId: row.task.id,
    moduleId: row.moduleId,
    moduleName: row.moduleName,
    action: row.task.action,
    owner: row.task.owner,
    priority: row.task.priority,
    date,
    kind,
    recurring: cadence,
    cadenceLabel: cadenceLabel(cadence) || undefined,
    status: row.task.status,
    daysLate,
  };
}

/**
 * Build the whole board view for a given day.
 * @param data   parsed seo-geo-board.json
 * @param today  YYYY-MM-DD
 */
export function deriveBoard(data: BoardData, today: string): BoardView {
  const rows = flatten(data);

  const dueToday: DueItem[] = [];
  const overdue: DueItem[] = [];
  const standing: DueItem[] = [];
  const recheckQueue: DueItem[] = [];

  for (const row of rows) {
    const { task } = row;

    // ── due dates apply only to open work ────────────────────────────────────
    // A finished task is not "due", and a dropped one is out of scope entirely.
    if (isOpen(task.status)) {
      if (isIsoDate(task.due)) {
        if (task.due === today) dueToday.push(toDueItem(row, task.due, 'due-today'));
        else if (task.due < today) {
          overdue.push(toDueItem(row, task.due, 'overdue', daysBetween(task.due, today)));
        }
      } else if (isStanding(task.recurring)) {
        // ── continuous discipline: always on, but not today's deliverable ────
        // These fire every day by construction, so listing them in the dated
        // list would bury the handful of tasks that actually have to ship.
        standing.push(toDueItem(row, today, 'due-today'));
      } else if (firesOn(task, today)) {
        // ── calendar cadences fire today ─────────────────────────────────────
        dueToday.push(toDueItem(row, today, 'due-today'));
      }
    }

    // ── recheck queue (§5-5) ─────────────────────────────────────────────────
    // This is deliberately NOT restricted to open tasks: the point of a recheck
    // is to revisit work you already marked done and confirm the result landed.
    // Only `dropped` is excluded, since it is out of scope by definition.
    if (task.status === 'dropped') continue;
    const rc = task.recheck;
    if (isIsoDate(rc)) {
      if (rc === today) recheckQueue.push(toDueItem(row, rc, 'recheck-today'));
      else if (rc < today) {
        recheckQueue.push(toDueItem(row, rc, 'recheck-overdue', daysBetween(rc, today)));
      }
    }
  }

  // Highest priority first, then most-late first.
  const pri = (p: string) => (p === 'P0' ? 0 : p === 'P1' ? 1 : p === 'P2' ? 2 : 3);
  const sortByUrgency = (a: DueItem, b: DueItem) =>
    pri(a.priority) - pri(b.priority) || (b.daysLate ?? 0) - (a.daysLate ?? 0) || a.taskId.localeCompare(b.taskId);
  dueToday.sort(sortByUrgency);
  overdue.sort(sortByUrgency);
  recheckQueue.sort(sortByUrgency);
  standing.sort(sortByUrgency);

  // ── module progress ────────────────────────────────────────────────────────
  const modules: ModuleProgress[] = data.modules.map((m) => {
    const total = m.tasks.length;
    const done = m.tasks.filter((t) => t.status === 'done').length;
    const doing = m.tasks.filter((t) => t.status === 'doing').length;
    const blocked = m.tasks.filter((t) => t.status === 'blocked').length;
    const openTasks = m.tasks.filter((t) => isOpen(t.status));
    const p0Open = openTasks.filter((t) => t.priority === 'P0').length;
    // Only dated work counts toward "next due" — an always-on cadence has no
    // meaningful next date and would otherwise pin every module to today.
    const dated = openTasks.filter((t) => isIsoDate(t.due)).map((t) => t.due).sort();
    const overdueCount = dated.filter((d) => d < today).length;
    const standingOpen = openTasks.filter((t) => isStanding(t.recurring)).length;
    return {
      id: m.id,
      name: m.name,
      tier: m.tier,
      total,
      done,
      doing,
      blocked,
      open: openTasks.length,
      p0Open,
      standingOpen,
      pct: total === 0 ? 0 : Math.round((done / total) * 100),
      nextDue: dated[0] ?? null,
      overdue: overdueCount,
    };
  });

  // ── anchors ────────────────────────────────────────────────────────────────
  const anchors: AnchorCountdown[] = data.anchors
    .map((a) => {
      const n = daysBetween(today, a.date);
      return { ...a, daysLeft: n, passed: n < 0, isToday: n === 0 };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // ── social ─────────────────────────────────────────────────────────────────
  const social: SocialDue[] = [];

  const xSlot = data.social.x.slots.find((s) => s.date === today);
  social.push({
    channel: 'x',
    account: data.social.x.account,
    item: xSlot?.item ?? null,
    date: xSlot?.date ?? null,
    note: xSlot
      ? `发布 ${xSlot.item}${xSlot.series ? ` · ${xSlot.series}` : ''}。字符数必须由 self-check.py 实算。`
      : '今日无 X 排期（每 2 天 1 条）。',
  });

  const rd = data.social.reddit;
  const warmupEnd = typeof rd.warmupEnd === 'string' ? String(rd.warmupEnd) : null;
  const rdSlot = rd.slots.find((s) => s.date === today);
  const untilWindow = warmupEnd ? daysBetween(today, warmupEnd) + 1 : 0;
  social.push({
    channel: 'reddit',
    account: rd.account,
    item: rdSlot?.item ?? null,
    date: rdSlot?.date ?? null,
    note: rdSlot
      ? `发布到 ${rdSlot.item}。发帖前必须改写时态锚点（Today/This week 已失真）。`
      : untilWindow > 0
        ? `养号期：只评论不发帖，目标 karma ≥ ${rd.karmaTarget}。距可发帖还有 ${untilWindow} 天。`
        : `已过养号期（${warmupEnd}），karma 未达标则继续顺延 —— 不以日期为唯一判据。`,
    daysUntil: untilWindow > 0 ? untilWindow : undefined,
  });

  // ── totals ─────────────────────────────────────────────────────────────────
  const allTasks = rows.map((r) => r.task);
  const openTasks = allTasks.filter((t) => isOpen(t.status));

  return {
    today,
    dueToday,
    overdue,
    standing,
    recheckQueue,
    anchors,
    social,
    modules,
    totals: {
      tasks: allTasks.length,
      done: allTasks.filter((t) => t.status === 'done').length,
      open: openTasks.length,
      p0Open: openTasks.filter((t) => t.priority === 'P0').length,
      overdue: overdue.length,
      blocked: allTasks.filter((t) => t.status === 'blocked').length,
      coreOpen: openTasks.filter((t) => t.tier === 'CORE').length,
      suppOpen: openTasks.filter((t) => t.tier === 'SUPP').length,
    },
  };
}

/** Strip a Date to its YYYY-MM-DD counterpart in UTC. */
export function isoDay(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}
