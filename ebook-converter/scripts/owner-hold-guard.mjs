#!/usr/bin/env node
/**
 * Owner HOLD guard for production-bound BookConv content.
 *
 * The M14-2 page was published by an unattended nightly sync despite an Owner
 * HOLD. This guard blocks re-additions/modifications at both commit and push
 * boundaries while allowing the explicitly authorized removal-only recovery.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HOLD_SLUG = 'transfer-ebooks-between-ereaders';
const HOLD_PAGE = 'ebook-converter/src/data/guides/transfer-ebooks-between-ereaders.ts';
const REFERENCE_PATHS = [
  'ebook-converter/src/data/guides/index.ts',
  'ebook-converter/public/llms.txt',
];

function git(args, cwd = process.cwd()) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const detail = error?.stderr?.toString?.() || error?.message || String(error);
    throw new Error(`git ${args.join(' ')} failed: ${detail.trim()}`);
  }
}

function evaluateDiff({ staged = false, range = null, cwd = process.cwd() } = {}) {
  if (staged === Boolean(range)) {
    throw new Error('Choose exactly one diff mode: staged or range.');
  }

  const base = staged ? ['diff', '--cached'] : ['diff', range];
  const pageStatusText = git([...base, '--name-status', '--', HOLD_PAGE], cwd).trim();
  const pageStatus = pageStatusText ? pageStatusText.split(/\s+/)[0] : null;

  if (pageStatus && pageStatus !== 'D') {
    return {
      ok: false,
      reason: `HOLD blocks ${pageStatus} of ${HOLD_PAGE}; only removal is permitted until Owner releases the HOLD.`,
    };
  }

  const referenceDiff = git([...base, '--unified=0', '--', ...REFERENCE_PATHS], cwd);
  const additions = referenceDiff
    .split(/\r?\n/)
    .filter((line) => line.startsWith('+') && !line.startsWith('+++') && line.includes(HOLD_SLUG));

  if (additions.length) {
    return {
      ok: false,
      reason: `HOLD blocks re-adding ${HOLD_SLUG} to guide registry or public llms.txt.`,
    };
  }

  return { ok: true, reason: pageStatus === 'D' ? 'authorized removal-only recovery' : 'no held content reintroduced' };
}

function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bookconv-owner-hold-'));
  const write = (rel, content) => {
    const target = path.join(root, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
  };
  const add = (...paths) => git(['add', ...paths], root);
  const commit = (message) => git(['commit', '-m', message], root);
  const reset = () => git(['reset', '--hard', 'HEAD'], root);
  const results = [];
  const expect = (label, actual, expected) => {
    const ok = actual.ok === expected;
    results.push({ label, expected, actual: actual.ok, ok, reason: actual.reason });
    console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: expected ${expected}, got ${actual.ok} (${actual.reason})`);
  };

  try {
    git(['init', '-q'], root);
    git(['config', 'user.email', 'owner-hold-guard@example.invalid'], root);
    git(['config', 'user.name', 'Owner HOLD Guard Test'], root);

    write(HOLD_PAGE, 'export const slug = \'transfer-ebooks-between-ereaders\'\n');
    write(REFERENCE_PATHS[0], `export const all = ['${HOLD_SLUG}']\n`);
    write(REFERENCE_PATHS[1], `- [Held guide](https://www.bookconv.com/guide/${HOLD_SLUG})\n`);
    add(HOLD_PAGE, ...REFERENCE_PATHS);
    commit('test fixture with held page');
    const base = git(['rev-parse', 'HEAD'], root).trim();

    write(HOLD_PAGE, 'export const slug = \'transfer-ebooks-between-ereaders\'\n// changed\n');
    add(HOLD_PAGE);
    expect('staged modification of held page is blocked', evaluateDiff({ staged: true, cwd: root }), false);
    reset();

    fs.rmSync(path.join(root, HOLD_PAGE));
    add('-u', HOLD_PAGE);
    expect('staged deletion of held page is allowed', evaluateDiff({ staged: true, cwd: root }), true);
    reset();

    write(REFERENCE_PATHS[0], "export const all = ['" + HOLD_SLUG + "']\n// " + HOLD_SLUG + " reintroduced\n");
    add(REFERENCE_PATHS[0]);
    expect('staged re-addition to guide registry is blocked', evaluateDiff({ staged: true, cwd: root }), false);
    reset();
    fs.rmSync(path.join(root, HOLD_PAGE));
    write(REFERENCE_PATHS[0], 'export const all = []\n');
    write(REFERENCE_PATHS[1], '# Guides\n');
    add('-u', HOLD_PAGE, ...REFERENCE_PATHS);
    expect('staged removal-only recovery is allowed', evaluateDiff({ staged: true, cwd: root }), true);
    commit('authorized M14-2 removal');
    const removed = git(['rev-parse', 'HEAD'], root).trim();
    expect('push range containing removal-only recovery is allowed', evaluateDiff({ range: `${base}..${removed}`, cwd: root }), true);

    write(HOLD_PAGE, 'export const slug = \'transfer-ebooks-between-ereaders\'\n');
    write(REFERENCE_PATHS[0], `export const all = ['${HOLD_SLUG}']\n`);
    write(REFERENCE_PATHS[1], `- [Held guide](https://www.bookconv.com/guide/${HOLD_SLUG})\n`);
    add(HOLD_PAGE, ...REFERENCE_PATHS);
    commit('test reintroduction');
    const readded = git(['rev-parse', 'HEAD'], root).trim();
    expect('push range reintroducing held page is blocked', evaluateDiff({ range: `${removed}..${readded}`, cwd: root }), false);

    const passed = results.filter((item) => item.ok).length;
    console.log(`Owner HOLD guard self-test: ${passed}/6 passed`);
    return passed === 6 ? 0 : 1;
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function main() {
  if (process.argv.includes('--self-test')) return selfTest();

  const rangeIndex = process.argv.indexOf('--range');
  const mode = rangeIndex >= 0
    ? { range: process.argv[rangeIndex + 1] }
    : process.argv.includes('--staged')
      ? { staged: true }
      : null;

  if (!mode || (mode.range !== undefined && !mode.range)) {
    console.error('Usage: owner-hold-guard.mjs --staged | --range <git-range> | --self-test');
    return 2;
  }

  try {
    const result = evaluateDiff(mode);
    if (!result.ok) {
      console.error(`⛔ Owner HOLD guard: ${result.reason}`);
      return 1;
    }
    console.log(`Owner HOLD guard PASS: ${result.reason}`);
    return 0;
  } catch (error) {
    console.error(`⛔ Owner HOLD guard UNKNOWN: ${error.message}`);
    return 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exitCode = main();
}
