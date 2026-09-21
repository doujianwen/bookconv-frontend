/**
 * Full-tree TypeScript parse gate.
 *
 * Why this exists: on 2026-09-21 a batch edit appended internal-link sentences
 * AFTER the closing backtick of `body` template literals in four
 * src/data/blog/*.ts files. Those files became syntax errors, `next build`
 * failed, and Vercel -- which serves the previous deployment when a build fails
 * -- kept the site up and looking healthy while every push that day was dead.
 * The freeze ran 14 hours before anyone noticed.
 *
 * audit-content-integrity.mjs also parses those files, but only src/data/**.
 * Its coverage is the blast radius of whatever is edited; this gate's coverage
 * is the whole source tree, so a syntax error of any shape is caught before it
 * reaches the deploy.
 *
 * transpileModule reports syntax diagnostics only -- a hit here is a real parse
 * error, never a type complaint. It is fast enough to run before `tsc`.
 *
 * Usage: node scripts/syntax-sweep.mjs
 * Exit:  0 = every file parses, 1 = at least one parse failure
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();

let ts;
try {
  ts = require('typescript');
} catch (err) {
  console.log(`typescript is not installed -> ${err.message}`);
  process.exit(2);
}

const SCAN_ROOTS = ['src', 'worker', 'tests', 'scripts'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', '_archived']);

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(abs);
  }
}

const files = [];
for (const root of SCAN_ROOTS) walk(path.join(ROOT, root), files);

// A scope that resolves to nothing reports zero findings, which reads exactly
// like a clean tree -- assert the fixtures were actually found.
if (files.length === 0) {
  console.log(`ERROR  scanned 0 files under ${SCAN_ROOTS.join(', ')} -- wrong working directory?`);
  console.log('Run this from the app directory, not the repository root.');
  process.exit(1);
}

let failed = 0;
for (const abs of files) {
  const code = fs.readFileSync(abs, 'utf8');
  const out = ts.transpileModule(code, {
    fileName: abs,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
    },
  });
  const errors = (out.diagnostics || []).filter(
    (d) => d.category === ts.DiagnosticCategory.Error
  );
  if (!errors.length) continue;

  failed++;
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
  const first = errors[0];
  const pos = first.file && first.start != null
    ? first.file.getLineAndCharacterOfPosition(first.start)
    : null;
  console.log(
    `FAIL  ${rel}  [${errors.length} error(s)]  ` +
      ts.flattenDiagnosticMessageText(first.messageText, ' ') +
      (pos ? ` @line ${pos.line + 1}` : '')
  );
}

if (failed) {
  console.log('');
  console.log('A parse error fails `next build`. A failed Vercel build does NOT surface:');
  console.log('the previous deployment keeps serving, so the site looks fine. Fix before pushing.');
}

console.log(`---`);
console.log(`parsed ${files.length} file(s) | parse failures: ${failed}`);
process.exit(failed ? 1 : 0);
