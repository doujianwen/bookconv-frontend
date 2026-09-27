// src/lib/board/types.ts
// Types for the SEO/GEO execution board.
//
// The board is driven entirely by data/seo-geo-board.json — the single source of
// truth transcribed from docs/SEO-GEO-V2.0-执行拆解表-2026-09-27.md. Editing
// that file changes the board; no code change is required.

export type TaskStatus = 'todo' | 'doing' | 'done' | 'blocked' | 'dropped';
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
/** CORE = clause from the spec; SUPP = our supplement (spec silent). */
export type Tier = 'CORE' | 'SUPP';
/**
 * Standing cadences that have no natural "finished" state — they are background
 * discipline, not dated deliverables. They are listed separately so they never
 * bury the dated work that actually has to ship today.
 */
export const STANDING_CADENCES = ['continuous', 'per-change', 'per-round'] as const;
export type Recurring =
  | 'daily'
  | 'weekly'
  | 'weekly-monday'
  | 'every-2-days'
  | 'monthly'
  | 'monthly-first-week'
  | 'monthly-end'
  | 'quarterly'
  | 'continuous'
  | 'per-change'
  | 'per-round';

export interface BoardTask {
  id: string;
  action: string;
  detail: string;
  owner: string;
  deliverable: string;
  accept: string;
  /** YYYY-MM-DD, a cadence label like "每日", or 持续. */
  due: string;
  recurring?: Recurring | string;
  priority: Priority;
  tier: Tier;
  status: TaskStatus;
  recheck?: string;
  result?: string;
  note?: string;
}

export interface BoardModule {
  id: string;
  name: string;
  why: string;
  tier: Tier;
  tasks: BoardTask[];
}

export interface Anchor {
  id: string;
  date: string;
  label: string;
  detail: string;
  kind: 'read' | 'decide' | 'accept';
}

export interface SocialSlot {
  date: string;
  item: string;
  series?: string;
}

export interface SocialChannel {
  account: string;
  cadence: string;
  rule: string;
  slots: SocialSlot[];
  total?: number;
  warnings?: string[];
  [k: string]: unknown;
}

export interface BoardData {
  meta: { project: string; sourceSpec: string; sourceBreakdown: string; d0: string; discipline: string };
  anchors: Anchor[];
  social: { note: string; x: SocialChannel; reddit: SocialChannel };
  modules: BoardModule[];
  openDecisions: { id: string; title: string; context: string; suggestion: string; blocks: string; owner: string }[];
}

// ── Derived views ────────────────────────────────────────────────────────────

export interface ModuleProgress {
  id: string;
  name: string;
  tier: Tier;
  total: number;
  done: number;
  doing: number;
  blocked: number;
  /** todo + doing + blocked (i.e. not done and not dropped) */
  open: number;
  p0Open: number;
  /** Open tasks on an always-on cadence (continuous / per-change / per-round). */
  standingOpen: number;
  /** 0..100, rounded */
  pct: number;
  /** Earliest due date among open dated tasks, or null. */
  nextDue: string | null;
  /** Open tasks past their due date. */
  overdue: number;
}

export interface DueItem {
  taskId: string;
  moduleId: string;
  moduleName: string;
  action: string;
  owner: string;
  priority: Priority;
  /** The date that triggered this entry. */
  date: string;
  /** How it surfaced: due today, overdue, or a recheck falling due. */
  kind: 'due-today' | 'overdue' | 'recheck-today' | 'recheck-overdue';
  recurring?: string;
  daysLate?: number;
  /** Human label for the cadence, e.g. "每日" / "每 2 天". */
  cadenceLabel?: string;
  /** Lifecycle state of the task, so today's list can show what is already moving. */
  status?: TaskStatus;
}

export interface AnchorCountdown extends Anchor {
  daysLeft: number;
  /** true when the anchor date has passed. */
  passed: boolean;
  /** true when the anchor is today. */
  isToday: boolean;
}

export interface SocialDue {
  channel: 'x' | 'reddit';
  account: string;
  /** null when the channel is in warm-up (comments only). */
  item: string | null;
  date: string | null;
  /** Human note for the day, e.g. warm-up instruction. */
  note: string;
  /** Days until the channel's next post window, if applicable. */
  daysUntil?: number;
}

export interface BoardView {
  today: string;
  /**
   * Dated work that has to happen today — either a `due` date landing on today
   * or a calendar cadence (daily / weekly / monthly) firing today.
   */
  dueToday: DueItem[];
  /** Open tasks past due. */
  overdue: DueItem[];
  /**
   * `continuous` / `per-change` / `per-round` cadences. These fire every day by
   * construction, so they are background discipline rather than today's
   * deliverable — kept out of `dueToday` so they cannot bury dated work.
   */
  standing: DueItem[];
  /** Recheck entries falling due today or already late. */
  recheckQueue: DueItem[];
  anchors: AnchorCountdown[];
  social: SocialDue[];
  modules: ModuleProgress[];
  totals: {
    tasks: number;
    done: number;
    open: number;
    p0Open: number;
    overdue: number;
    blocked: number;
    /** Spec clauses vs our supplements, as open counts. */
    coreOpen: number;
    suppOpen: number;
  };
}
