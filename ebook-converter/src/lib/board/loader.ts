// src/lib/board/loader.ts
// Reads the board data file and exposes derived views.
//
// ── Why this reads via a static import, not readFileSync ───────────────────
// This loader originally did:
//
//     readFileSync(join(process.cwd(), 'data/seo-geo-board.json'), 'utf8')
//
// which works locally and **fails on Vercel**. Next.js output file tracing only
// bundles files reachable through the static import graph; a path built at
// runtime with `join(process.cwd(), …)` is invisible to that analysis, so the
// JSON is not present in the serverless function bundle and every read throws
// ENOENT. Observed on 2026-10-03 as HTTP 500 ("Something went wrong") on both
// /es/admin/board and /es/admin/board/register, while every other /admin page
// rendered fine — i.e. the failure tracked this loader specifically, not auth
// and not the JSON contents (the same file validated cleanly with 0 errors).
//
// The fix is a static `import` with a JSON import assertion: the bundler now
// sees the dependency, emits the file, and the runtime read disappears.
//
// The cast to BoardData is deliberate and unavoidable: TypeScript's default
// `resolveJsonModule` types land as widened primitives rather than the literal
// unions in BoardTask, so the declared shape is asserted rather than inferred.
// validateBoardData() below is the runtime guard that makes the assertion safe
// — it is not a bare lie, it is checked on every load. Keep it that way: adding
// a field to BoardData without teaching the validator about it reintroduces
// silent drift, so extend the validator in the same commit.
import boardJson from '../../../data/seo-geo-board.json' with { type: 'json' };
import type { BoardData, BoardView } from './types';
import { deriveBoard, isoDay } from './derive';

/**
 * Parse and validate the board data.
 *
 * Kept as a separate step (rather than validating the imported object
 * in place) so tests and any future non-JS source can reuse the same guard.
 */
function parseBoardData(raw: unknown): BoardData {
  const data = raw as BoardData;
  validateBoardData(data);
  return data;
}

/** Load, parse and validate data/seo-geo-board.json. */
export function loadBoardData(): BoardData {
  return parseBoardData(boardJson);
}

/** Build the whole board view for a day (defaults to today, UTC). */
export function getBoardView(today: string = isoDay()): BoardView {
  return deriveBoard(loadBoardData(), today);
}

/**
 * Structural validation. The board is hand-edited, so a typo in one task's
 * status or priority should fail loudly here rather than render as a blank
 * cell that looks like "no data".
 */
const STATUSES = new Set(['todo', 'doing', 'done', 'blocked', 'dropped']);
const PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);
const TIERS = new Set(['CORE', 'SUPP']);

export function validateBoardData(data: BoardData): void {
  const errors: string[] = [];

  if (!Array.isArray(data.modules) || data.modules.length === 0) {
    errors.push('modules must be a non-empty array');
  }

  const seenIds = new Set<string>();
  for (const m of data.modules ?? []) {
    if (!m.id || !m.name) errors.push(`module missing id/name: ${JSON.stringify(m.id)}`);
    if (!TIERS.has(m.tier)) errors.push(`${m.id}: bad module tier "${m.tier}"`);
    for (const t of m.tasks ?? []) {
      if (!t.id) errors.push(`${m.id}: task missing id (${t.action})`);
      if (seenIds.has(t.id)) errors.push(`duplicate task id: ${t.id}`);
      seenIds.add(t.id);
      if (!STATUSES.has(t.status)) errors.push(`${t.id}: bad status "${t.status}"`);
      if (!PRIORITIES.has(t.priority)) errors.push(`${t.id}: bad priority "${t.priority}"`);
      if (!TIERS.has(t.tier)) errors.push(`${t.id}: bad tier "${t.tier}"`);
      if (!t.action || !t.detail || !t.accept) {
        errors.push(`${t.id}: action/detail/accept must all be present`);
      }
      if (!t.owner) errors.push(`${t.id}: owner is required`);
      if (!t.due) errors.push(`${t.id}: due is required`);
    }
  }

  if (errors.length > 0) {
    throw new Error('seo-geo-board.json failed validation:\n  - ' + errors.join('\n  - '));
  }
}
