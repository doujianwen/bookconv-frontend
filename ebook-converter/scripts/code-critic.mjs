#!/usr/bin/env node
/**
 * code-critic.mjs — Pure-critic gate for AI-generated code smells.
 *
 * Philosophy (mirrors the "pure critic" agent pattern):
 *   - ONLY audits, never writes or transforms.
 *   - Information isolation: it sees source text + file locations, never
 *     "the build said it's fine", so it cannot be anchored to the mainstream.
 *   - Single veto: any CRITICAL finding => process.exit(1) (CI job fails).
 *
 * Scope deliberately does NOT duplicate tsc/eslint (already covered by the
 * lint-and-typecheck job). It targets the layer they miss: hallucination-style
 * damage where the code is syntactically legal but structurally wrong:
 *   1. Duplicate blocks — large stretches of code copied verbatim (AI signature).
 *   2. Wrong location — .mdx inside src/app (crashes the whole route, historical
 *      500 incident) or stray scripts dumped at the repo root (which pollutes the
 *      tsconfig recursive TypeScript include).
 *
 * Zero dependencies (node built-ins only) so it can run pre-install in CI.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const findings = [];

function add(sev, id, file, detail) {
  findings.push({ sev, id, file, detail });
}

// Recursive file walk, skipping build/dependency/meta dirs.
function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  let ents;
  try {
    ents = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of ents) {
    if (e === 'node_modules' || e === '.next' || e === '.git' || e.startsWith('.workbuddy')) continue;
    const p = join(dir, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(e).toLowerCase())) out.push(p);
  }
  return out;
}

const rel = (p) => p.slice(ROOT.length).replace(/^[\\/]/, '');

// ---------------------------------------------------------------------------
// 1. Duplicate block detection (AI hallucination signature)
// ---------------------------------------------------------------------------
const WIN = 6;
function scanDup(path) {
  const raw = readFileSync(path, 'utf8');
  const lines = raw.split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
  const seen = new Map();
  const n = lines.length;
  for (let i = 0; i + WIN <= n; i++) {
    const window = lines.slice(i, i + WIN);
    if (window.every((l) => l.trim() === '')) continue;
    // Require at least one "semantic" line so pure-bracket/whitespace windows
    // are ignored (avoids false positives on repeated `});` blocks).
    if (!window.some((l) => /[A-Za-z0-9(={]/.test(l))) continue;
    const sig = window.join('\n');
    if (!seen.has(sig)) seen.set(sig, [i + 1]);
    else seen.get(sig).push(i + 1);
  }
  for (const [sig, locs] of seen) {
    if (locs.length >= 2) {
      add(
        'WARN',
        'dup-block',
        rel(path),
        `identical ${WIN}-line block repeated ${locs.length}x at lines ${locs.join(', ')} (possible AI copy-paste)`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Forbidden .mdx inside app route directory (historical 500 incident)
// ---------------------------------------------------------------------------
function scanAppMdx() {
  const appDir = join(ROOT, 'src', 'app');
  for (const f of walk(appDir, ['.mdx'])) {
    add(
      'CRITICAL',
      'app-mdx',
      rel(f),
      '.mdx inside src/app crashes the whole route (historical 500). Blog posts belong in src/data/blog/*.ts.'
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Stray scripts at repo root (pollutes tsconfig "**/*.ts(x)" include)
// ---------------------------------------------------------------------------
const ROOT_WHITELIST = new Set([
  'next.config.ts',
  'next.config.ts.bak',
  'next-sitemap.config.js',
  'jest.config.cjs',
  'jest.setup.ts',
  'playwright.config.ts',
  'postcss.config.mjs',
  'eslint.config.mjs',
  'sentry.client.config.ts',
  'sentry.edge.config.ts',
  'sentry.server.config.ts',
  'next-env.d.ts',
]);
function scanStrayRoot() {
  let ents;
  try {
    ents = readdirSync(ROOT);
  } catch {
    return;
  }
  for (const e of ents) {
    const p = join(ROOT, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (!st.isFile()) continue; // only direct children; subdirs (src/, scripts/, ...) are out of scope
    if (!['.ts', '.tsx', '.mjs', '.js'].includes(extname(e).toLowerCase())) continue;
    if (ROOT_WHITELIST.has(e)) continue;
    add(
      'WARN',
      'stray-root',
      e,
      'script at repo root is outside scripts/ — historically these polluted the tsconfig "**/*.ts(x)" scan. Move to scripts/ or remove.'
    );
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
for (const f of walk(join(ROOT, 'src'), ['.ts', '.tsx', '.mts'])) scanDup(f);
scanAppMdx();
scanStrayRoot();

let crit = 0;
let warn = 0;
for (const f of findings) {
  if (f.sev === 'CRITICAL') crit++;
  else warn++;
}

console.log('\n=== Code Critic Report ===');
if (findings.length === 0) {
  console.log('No findings. Clean.');
} else {
  for (const f of findings) {
    console.log(`[${f.sev}] (${f.id}) ${f.file}${f.detail ? ' — ' + f.detail : ''}`);
  }
}
console.log(`\nSUMMARY: critical=${crit} warn=${warn}`);
process.exit(crit > 0 ? 1 : 0);
