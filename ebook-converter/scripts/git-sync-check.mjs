#!/usr/bin/env node
// scripts/git-sync-check.mjs
//
// HARD verification that a `git push` actually landed: query the REMOTE main
// directly and compare its SHA to the local HEAD (or the CI commit SHA).
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
//
// CI MODE
//   When run inside GitHub Actions (env GITHUB_ACTIONS=true / CI=true) the
//   script switches to the GitHub REST API to read the remote tip (no SSH key
//   required). It compares against $GITHUB_SHA (the exact commit that triggered
//   the workflow) when present, otherwise the checked-out HEAD. A mismatch
//   (e.g. main was force-pushed under the workflow) fails the job.

import { execSync } from 'node:child_process';

const remote = process.argv[2] || 'ssh://git@github.com/doujianwen/bookconv-frontend.git';
const branch = process.argv[3] || 'main';

const inCI = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';

function run(cmd) {
  // Bypass any HTTP(S) proxy so the SSH channel is used directly (matches
  // the project's "push over SSH, never HTTPS" hard rule). In real CI there
  // is no proxy, so this is a no-op there.
  const env = { ...process.env };
  delete env.HTTP_PROXY;
  delete env.HTTPS_PROXY;
  return execSync(cmd, { env, encoding: 'utf8' });
}

function runApi(cmd) {
  // For the GitHub API call we keep the proxy env intact: on a dev machine
  // that blocks direct HTTPS, curl needs the proxy; in CI there is no proxy
  // and direct HTTPS works. We only strip a proxy when we are in the local
  // SSH branch (run()), never here.
  return execSync(cmd, { encoding: 'utf8' });
}

function parseOwnerRepo(remoteUrl) {
  // ssh://git@github.com/doujianwen/bookconv-frontend.git
  // https://github.com/doujianwen/bookconv-frontend.git
  const m = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

let local, remoteSha;

// Determine the local reference SHA to compare against.
try {
  local = (process.env.GITHUB_SHA || run('git rev-parse HEAD').trim());
} catch (e) {
  console.error('[git-sync] cannot read local HEAD:', e.message);
  process.exit(1);
}

if (inCI) {
  // --- CI path: read remote tip via GitHub REST API (no SSH key needed) ---
  const info = parseOwnerRepo(remote);
  if (!info) {
    console.error('[git-sync] cannot parse owner/repo from remote:', remote);
    process.exit(1);
  }
  const apiUrl = `https://api.github.com/repos/${info.owner}/${info.repo}/git/refs/heads/${branch}`;
  const token = process.env.GITHUB_TOKEN;
  const curlArgs = [
    '-s',
    '-H', 'Accept: application/vnd.github+json',
    '-H', 'User-Agent: ebook-converter-git-sync',
    '-H', 'X-GitHub-Api-Version: 2022-11-28',
  ];
  if (token) curlArgs.push('-H', `Authorization: Bearer ${token}`);
  try {
    const out = runApi(`curl ${curlArgs.join(' ')} "${apiUrl}"`);
    const json = JSON.parse(out);
    remoteSha = json?.object?.sha;
    if (!remoteSha) {
      console.error('[git-sync] API did not return a SHA (repo private + no token, or rate-limited):');
      console.error(out.slice(0, 300));
      process.exit(1);
    }
  } catch (e) {
    console.error('[git-sync] GitHub API ls-remote failed:', e.message);
    process.exit(1);
  }
} else {
  // --- Local path: ask the remote directly over SSH via git ls-remote ---
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
}

const inSync = local === remoteSha;
console.log(`local  HEAD : ${local}`);
console.log(`remote ${branch}: ${remoteSha}${inCI ? '  (via GitHub API)' : ''}`);
if (inSync) {
  console.log(`[git-sync] PASS — remote ${branch} equals local HEAD`);
} else {
  console.log(`[git-sync] FAIL — remote ${branch} != local HEAD`);
  console.log('  -> the push did NOT land (or main was force-pushed under this run).');
  console.log('  -> Do NOT trust behind=0; re-push via SSH and re-run this check.');
}
process.exit(inSync ? 0 : 1);
