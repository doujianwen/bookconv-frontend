/**
 * Locate duplicate `heading:` entries inside content data files.
 *
 * Companion to scripts/audit-content-integrity.mjs, which flags duplicates but
 * not where they are or which variant is richer. This prints, per occurrence:
 *   line number | body size | bulleted-vs-plain style
 * so a human (or the next agent) can decide which copy to keep.
 *
 * Background: the 2026-09 "P2" batch appended a reformatted copy of an existing
 * section instead of replacing it, leaving the same <h2> twice on a page.
 *
 * Usage: node scripts/find-duplicate-headings.mjs [file...]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}

const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...walk(path.join(ROOT, 'src/data/content')), ...walk(path.join(ROOT, 'src/data/blog'))];

for (const t of targets) {
  const file = path.isAbsolute(t) ? t : path.join(ROOT, t);
  if (!fs.existsSync(file)) continue;

  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const byHeading = new Map();

  lines.forEach((line, i) => {
    const m = line.match(/heading:\s*['"`](.+?)['"`]\s*,?\s*$/);
    if (!m) return;
    const heading = m[1];

    // Measure the body: walk forward until the closing backtick / quote.
    let j = i + 1;
    let chars = 0;
    let bullets = 0;
    while (j < lines.length) {
      const cur = lines[j];
      if (/`\s*,?\s*$/.test(cur) || /'\s*,?\s*$/.test(cur) || /"\s*,?\s*$/.test(cur)) break;
      chars += cur.length;
      if (/^\s*-\s+\*\*/.test(cur)) bullets++;
      j++;
    }

    if (!byHeading.has(heading)) byHeading.set(heading, []);
    byHeading.get(heading).push({
      line: i + 1,
      chars,
      bullets,
      style: bullets > 0 ? 'BULLETED' : 'PLAIN',
    });
  });

  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const dupes = [...byHeading.entries()].filter(([, v]) => v.length > 1);
  if (!dupes.length) continue;

  console.log(`### ${rel}`);
  for (const [heading, occ] of dupes) {
    console.log(`  "${heading}"  x${occ.length}`);
    for (const o of occ) {
      console.log(
        `     L${String(o.line).padEnd(5)} ${o.style.padEnd(9)} bodyChars=${String(o.chars).padEnd(5)} bullets=${o.bullets}`
      );
    }
    // Suggested action: keep the richest copy, drop the rest.
    const richest = occ.reduce((a, b) => (b.chars > a.chars ? b : a));
    const drop = occ.filter((o) => o !== richest).map((o) => 'L' + o.line);
    console.log(`     -> KEEP L${richest.line} (richest); candidate drops: ${drop.join(', ')}`);
  }
  console.log('');
}
