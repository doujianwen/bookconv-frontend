#!/usr/bin/env node
// scripts/git-sync-check.mjs
//
// HARD verification that a `git push` actually landed: query the REMOTE main
// directly with `git ls-remote` and compare its SHA to the local HEAD.
//
// WHY THIS EXISTS
//   Trusting `git rev-list HEAD..origin/main` (behind/ahead counts) or a
//   "Everything up-to-date" message is fragile:
//     - the local tracking branch (origin/main) can be stale, missing, or
//       fail to write on Windows (packed-refs/reftable quirks), producing a
//       FALSE "behind=0" that looks like a successful sync while the remote
//       is actually a forked/orphan history.
//     - A global `url.<base>.insteadOf` rule can silently rewrite SSH -> HTTPS,
//       so `git push origin` fails with TLS errors while you think you pushed.
//   This script asks the remote for the truth. No local tracking branch needed.
//
// USAGE
//   node scripts/git-sync-check.mjs [remote] [branch]
//     remote default: ssh://git@github.com/doujianwen/bookconv-frontend.git
//     branch default: main
//   Exit 0 = in sync, 1 = mismatch / error.
//
// Run this IMMEDIATELY after every `git push` (and after `git push --force`).

import { execSync } from 'node:child_process';

const remote = process.argv[2] || 'ssh://git@github.com/doujianwen/bookconv-frontend.git';
const branch = process.argv[3] || 'main';

function run(cmd) {
  // Bypass any HTTP(S) proxy so the SSH channel is used directly (matches
  // the project's "push over SSH, never HTTPS" hard rule).
  const env = { ...process.env };
  delete env.HTTP_PROXY;
  delete env.HTTPS_PROXY;
  return execSync(cmd, { env, encoding: 'utf8' });
}

let local, remoteSha;
try {
  local = run('git rev-parse HEAD').trim();
} catch (e) {
  console.error('[git-sync] cannot read local HEAD:', e.message);
  process.exit(1);
}

try {
  const out = run(`git ls-remote ${remote} ${branch}`).trim();
  if (!out) {
    console.error(`[git-sync] remote returned nothing for ${remote}/${branch}`);
    process.exit(1);
  }
  remoteSha = out.split('\t')[0].trim();
} catch (e) {
  console.error('[git-sync] ls-remote failed (check SSH channel / network):', e.message);
  process.exit(1);
}

const inSync = local === remoteSha;
console.log(`local  HEAD : ${local}`);
console.log(`remote ${branch}: ${remoteSha}`);
if (inSync) {
  console.log(`[git-sync] PASS — remote ${branch} equals local HEAD`);
} else {
  console.log(`[git-sync] FAIL — remote ${branch} != local HEAD`);
  console.log('  -> the push did NOT land. Do NOT trust behind=0; re-push via SSH and re-run this check.');
}
process.exit(inSync ? 0 : 1);
