/**
 * Content integrity audit for bookconv content/blog TS data files.
 *
 * Why this exists: on 2026-09-17 a batch "P2" edit script inserted new
 * `sections` objects AFTER the array's closing `],`, producing a syntax
 * error that broke `next build` and silently froze the Vercel deploy for
 * two commits (6c02af5, 81b625e). Vercel does NOT surface this -- it just
 * keeps serving the last good deploy, so the site looks fine while every
 * new push is dead on arrival.
 *
 * Two schemas exist, and they are NOT the same:
 *   src/data/content/*.ts  -> slug / title / metaDescription / level / wordCount / content{hero,sections,faq,authorship}
 *   src/data/blog/*.ts     -> slug / title / date / author / tags / content{...} / faqs
 * `src/data/blog/types.ts` is a type-declaration file, not a post -- skipped.
 *
 * Checks:
 *  1. TypeScript parse errors            -> ERROR (build blocker)
 *  2. Duplicate headings within a file   -> WARN  (semantic duplication)
 *  3. Duplicate import bindings          -> ERROR (build blocker)
 *  4. Schema-appropriate required exports-> ERROR when missing
 *
 * Usage:  node scripts/audit-content-integrity.mjs
 * Exit:   0 = clean, 1 = at least one ERROR
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();

// Files that live in the data dirs but are not content records.
const SKIP = new Set([
  'index.ts', // registry
  'types.ts', // type declarations
  'rss.ts', // feed builder
  'shared.ts', // shared helpers
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts') && !SKIP.has(e.name)) out.push(p);
  }
  return out;
}

let errors = 0;
let warnings = 0;

const targets = [
  { dir: path.join(ROOT, 'src/data/content'), kind: 'content' },
  { dir: path.join(ROOT, 'src/data/blog'), kind: 'blog' },
];

for (const { dir, kind } of targets) {
  for (const file of walk(dir)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const src = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ESNext, true);
    const diags = sf.parseDiagnostics || [];

    // 1. parse errors -- these break the build
    if (diags.length) {
      errors++;
      const at = sf.getLineAndCharacterOfPosition(diags[0].start);
      const msg = ts.flattenDiagnosticMessageText(diags[0].messageText, ' ');
      console.log(`ERROR  ${rel}  ->  ${diags.length} parse error(s), first at L${at.line + 1}: ${msg}`);
      console.log(`       this WILL break \`next build\` and silently freeze the Vercel deploy`);
      continue;
    }

    // 2. duplicate headings inside one record.
    //
    // Compare NORMALISED forms, not raw strings. A batch that adds a section
    // without checking for an existing equivalent tends to differ only in
    // punctuation or capitalisation -- e.g. both of these shipped on the same
    // page during the 2026-09 pass:
    //   "How to Convert EPUB to MOBI (Step-by-Step)"
    //   "How to Convert EPUB to MOBI: Step by Step"
    // Raw equality sees two distinct headings; the reader sees one page with
    // the same section twice, which is the duplication signal we are removing.
    const headings = [...src.matchAll(/heading:\s*['`]([^'`]+)['`]/g)].map((m) => m[1]);
    const normalise = (h) => h.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const seen = new Map();
    for (const h of headings) {
      const key = normalise(h);
      if (!key) continue;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(h);
    }
    for (const [, variants] of seen) {
      if (variants.length > 1) {
        warnings++;
        const distinct = [...new Set(variants)];
        console.log(
          `WARN   ${rel}  ->  duplicate heading x${variants.length}` +
            (distinct.length > 1 ? ` (differ only in punctuation/case)` : '') +
            `: ${distinct.join('  //  ')}`
        );
      }
    }

    // 3. duplicate import bindings (the d2a405c regression)
    const imports = [...src.matchAll(/import\s+\*\s+as\s+(\w+)\s+from/g)].map((m) => m[1]);
    const dupImports = [...new Set(imports.filter((n, i) => imports.indexOf(n) !== i))];
    if (dupImports.length) {
      errors++;
      console.log(`ERROR  ${rel}  ->  duplicate import binding(s): ${dupImports.join(', ')}`);
    }

    // 4. schema-appropriate required exports
    const required =
      kind === 'content'
        ? ['slug', 'title'] // `level`/`wordCount`/`metaDescription` are optional
        : ['slug', 'title', 'date', 'author'];

    const missing = required.filter(
      (name) => !new RegExp(`export\\s+const\\s+${name}\\b`).test(src)
    );
    if (missing.length) {
      errors++;
      console.log(`ERROR  ${rel}  ->  missing export(s): ${missing.join(', ')}`);
    }

    // 5. content pages without an explicit metaDescription silently fall back to
    //    content.hero.subtitle (see convert/[slug]/page.tsx:49) -- a hero subtitle
    //    written for on-page display, not for SERP. Flagged for the Title/Description pass.
    if (kind === 'content' && !/export\s+const\s+metaDescription\b/.test(src)) {
      warnings++;
      console.log(
        `WARN   ${rel}  ->  no \`metaDescription\`; SERP description falls back to hero.subtitle`
      );
    }
  }
}

console.log('---');

// The registry file itself -- this is exactly where the d2a405c duplicate-import
// regression landed, so it gets its own pass.
const registry = path.join(ROOT, 'src/data/blog/index.ts');
if (fs.existsSync(registry)) {
  const rel = path.relative(ROOT, registry).replace(/\\/g, '/');
  const src = fs.readFileSync(registry, 'utf8');
  const imports = [...src.matchAll(/import\s+\*\s+as\s+(\w+)\s+from/g)].map((m) => m[1]);
  const dupImports = [...new Set(imports.filter((n, i) => imports.indexOf(n) !== i))];
  if (dupImports.length) {
    errors++;
    console.log(`ERROR  ${rel}  ->  duplicate import binding(s): ${dupImports.join(', ')}`);
  }
  // every imported binding should appear in the posts array
  const postsLine = src.split('\n').find((l) => l.includes('const posts')) || '';
  const unregistered = imports.filter((n) => !postsLine.includes(n));
  if (unregistered.length) {
    warnings++;
    console.log(`WARN   ${rel}  ->  imported but not in posts[]: ${unregistered.join(', ')}`);
  }
}

console.log(`content+blog data files scanned | ${errors} error(s) | ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
