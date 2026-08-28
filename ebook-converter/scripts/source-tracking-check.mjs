#!/usr/bin/env node
// scripts/source-tracking-check.mjs
//
// GUARD against the 2026-08-28 incident recurring:
//   An unanchored `.gitignore` rule (`data/`) silently ignored the entire
//   `src/data/` content system (87 pages). A naive `git push` would have
//   shipped a build with NO content and broken the live site — the bug was
//   only caught because we diffed live vs local before pushing.
//
// This script fails the build/deploy verification if any CRITICAL source tree
// is (a) git-ignored, or (b) has untracked files. Run it BEFORE every push,
// right after `git-sync-check.mjs`.
//
// Usage:
//   node scripts/source-tracking-check.mjs
//   npm run verify:tracking
// Exit 0 = all critical source fully tracked; 1 = something is ignored/untracked.

import { execSync } from 'node:child_process';

// Trees that MUST always be committed (losing any of these breaks the site).
const CRITICAL = [
  'src/data/blog',
  'src/data/guides',
  'src/data/content',
  'src/data/compat',
  'src/app',
  'src/lib',
  'public',
];

// Known junk that is fine to leave untracked (never commit, never fail on it).
// `nul` is a Windows reserved device name — git cannot index it on Windows and
// `git add` aborts the whole staging if it is not skipped.
const IGNORE_UNTRACKED_BASENAMES = new Set(['nul']);

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' });
  } catch (e) {
    // git status/check-ignore exit non-zero in some edge cases; fall through.
    return e.stdout || '';
  }
}

let failed = false;

console.log('[tracking] Checking critical source trees are fully tracked...\n');

for (const dir of CRITICAL) {
  const ignored = sh(`git check-ignore -z -- ${dir} 2>/dev/null`)
    .split('\0')
    .filter(Boolean);
  if (ignored.length) {
    failed = true;
    console.error(`  ✗ FAIL  "${dir}" is git-IGNORED (would not be deployed):`);
    ignored.forEach((p) => console.error(`      - ${p}`));
    continue;
  }

  const status = sh(`git status --porcelain -- ${dir} 2>/dev/null`);
  const untracked = status
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => {
      const code = l.slice(0, 2);
      const path = l.slice(3);
      if (code === '??' && IGNORE_UNTRACKED_BASENAMES.has(path.split('/').pop())) {
        return false; // known junk, ignore
      }
      // Untracked (??) or staged-but-new (A) both mean "not yet committed".
      return code === '??' || code === 'A ' || code === 'AM';
    });

  if (untracked.length) {
    failed = true;
    console.error(`  ✗ FAIL  "${dir}" has ${untracked.length} untracked source file(s):`);
    untracked.slice(0, 10).forEach((l) => console.error(`      - ${l.slice(3)}`));
    if (untracked.length > 10) console.error(`      ... and ${untracked.length - 10} more`);
  } else {
    console.log(`  ✓ OK    ${dir}`);
  }
}

console.log('');
if (failed) {
  console.error('[tracking] FAIL — fix .gitignore or `git add` the missing source before pushing.');
  console.error('  (Windows reserved name `nul` is expected to stay untracked; everything else must be tracked.)');
  process.exit(1);
}
console.log('[tracking] PASS — all critical source trees are tracked and will deploy.');
process.exit(0);
