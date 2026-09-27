// src/lib/workbench/facts.ts
// Live fact extraction from the local repository.
//
// Why this exists: the first version of the workbench hard-coded numbers such
// as "audit:claims has 1 failure" and "blog posts: 65". Those are *state*, not
// facts — they change the moment someone edits a file, and a frozen copy of
// them turns the workbench into a lie generator. Every number that can be
// derived locally is derived locally, at request time.
//
// Nothing here performs network I/O. Anything that cannot be computed from
// the repo stays a dated snapshot and is labelled as one.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

function read(rel: string): string | null {
  try {
    return readFileSync(join(ROOT, rel), 'utf8');
  } catch {
    return null;
  }
}

/** Counts that are cheap to recompute and cheap to verify. */
export interface RepoFacts {
  conversionPairs: number;
  distinctFormats: number;
  contentMapKeys: number;
  blogRegistered: number;
  blogNoindex: number;
  guideFiles: number;
  formatPages: number;
  compatPages: number;
  hasQueueDeadCode: number;
  unpushedCommits: number | null;
}

export function collectRepoFacts(): RepoFacts {
  const cm = read('src/lib/conversion-map.ts') ?? '';
  const pairMatches = cm.match(/^\s*"([a-z0-9]+)-([a-z0-9]+)":/gm) ?? [];
  const distinct = new Set<string>();
  for (const p of pairMatches) {
    const m = p.match(/"([a-z0-9]+)-([a-z0-9]+)":/);
    if (m) {
      distinct.add(m[1]);
      distinct.add(m[2]);
    }
  }

  const bi = read('src/data/blog/index.ts') ?? '';
  const postsBlock = bi.match(/const posts: BlogPostMeta\[\] = \[([\s\S]*?)\]/);
  const blogRegistered = postsBlock
    ? postsBlock[1].split(',').filter((x) => x.trim()).length
    : 0;

  let blogNoindex = 0;
  try {
    for (const f of readdirSync(join(ROOT, 'src/data/blog'))) {
      if (!f.endsWith('.ts')) continue;
      const body = read(`src/data/blog/${f}`) ?? '';
      if (body.includes('export const noindex = true')) blogNoindex += 1;
    }
  } catch {
    blogNoindex = 0;
  }

  let guideFiles = 0;
  try {
    guideFiles = readdirSync(join(ROOT, 'src/data/guides')).filter(
      (f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts'
    ).length;
  } catch {
    guideFiles = 0;
  }

  let compatPages = 0;
  try {
    const dir = join(ROOT, 'src/data/compat');
    if (existsSync(dir)) {
      compatPages = readdirSync(dir).filter(
        (f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts'
      ).length;
    }
  } catch {
    compatPages = 0;
  }

  const ft = read('src/data/formats.ts') ?? '';
  const formatPages = (ft.match(/^\s*[a-z0-9]+:\s*\{/gm) ?? []).length;

  const ci = read('src/data/content/index.ts') ?? '';
  const contentMapKeys = (ci.match(/^import \* as [a-z_0-9]+ from/gm) ?? []).length;

  // Dead-code census. Counted, not asserted: the queue stack was deliberately
  // abandoned after 100% 504s on serverless, and must not be re-wired. The
  // workbench reports how much of it is still in the tree.
  const queueFiles = ['src/lib/queue.ts', 'src/lib/redis.ts', 'worker/index.ts'];
  const hasQueueDeadCode = queueFiles.filter((f) => existsSync(join(ROOT, f))).length;

  return {
    conversionPairs: pairMatches.length,
    distinctFormats: distinct.size,
    contentMapKeys,
    blogRegistered,
    blogNoindex,
    guideFiles,
    formatPages,
    compatPages,
    hasQueueDeadCode,
    unpushedCommits: null, // requires git; run via script, not in render path
  };
}

/**
 * Runs a repository audit script and counts its failures.
 *
 * These scripts are the project's own quality gates. Reading their exit
 * status at request time means the workbench shows the gate's *current*
 * verdict instead of a number someone typed once.
 *
 * Returns null when the script is missing or exceeds the timeout — a null is
 * rendered as "unknown", which is the honest answer.
 */
export interface ScriptVerdict {
  name: string;
  command: string;
  exitCode: number | null;
  failures: number | null;
  raw: string;
}

export function runScript(scriptRel: string, args: string[] = [], timeoutMs = 30_000): ScriptVerdict {
  const cmd = `node ${scriptRel}${args.length ? ' ' + args.join(' ') : ''}`;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execFileSync } = require('node:child_process') as typeof import('node:child_process');
    const out = execFileSync(process.execPath, [join(ROOT, scriptRel), ...args], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: timeoutMs,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { name: scriptRel, command: cmd, exitCode: 0, failures: 0, raw: out.slice(-2000) };
  } catch (error) {
    const e = error as { status?: number | null; stdout?: string; stderr?: string; killed?: boolean };
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    if (e.killed) {
      return { name: scriptRel, command: cmd, exitCode: null, failures: null, raw: 'timed out' };
    }
    // The claims audit exits non-zero and prints "N error(s)". Parse it.
    const m = out.match(/(\d+)\s+error\(s\)/);
    return {
      name: scriptRel,
      command: cmd,
      exitCode: e.status ?? 1,
      failures: m ? Number(m[1]) : null,
      raw: out.slice(-2000),
    };
  }
}

/** Extracts the FAIL/PASS tally from the differentiation audit's output. */
export function parseDifferentiation(raw: string): { pass: number; fail: number; total: number } | null {
  const m = raw.match(/(PASS|FAIL)\s+(\d+)\/(\d+)/);
  if (!m) return null;
  const isPass = m[1] === 'PASS';
  const a = Number(m[2]);
  const b = Number(m[3]);
  return { pass: isPass ? a : b - a, fail: isPass ? b - a : a, total: b };
}
