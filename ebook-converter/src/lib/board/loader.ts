// src/lib/board/loader.ts
// Reads the board data file and exposes derived views.
//
// The JSON file is the single source of truth. This module only reads it.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BoardData, BoardView } from './types';
import { deriveBoard, isoDay } from './derive';

const BOARD_FILE = 'data/seo-geo-board.json';

/** Load and parse data/seo-geo-board.json from the project root. */
export function loadBoardData(root: string = process.cwd()): BoardData {
  const raw = readFileSync(join(root, BOARD_FILE), 'utf8');
  const data = JSON.parse(raw) as BoardData;
  validateBoardData(data);
  return data;
}

/** Build the whole board view for a day (defaults to today, UTC). */
export function getBoardView(today: string = isoDay(), root: string = process.cwd()): BoardView {
  return deriveBoard(loadBoardData(root), today);
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
