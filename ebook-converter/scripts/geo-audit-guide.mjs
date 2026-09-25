// scripts/geo-audit-guide.mjs
//
// GEO compliance audit for Guide pages (src/data/guides/*.ts).
//
// WHY THIS EXISTS:
// - Convert pages have `geo-audit-content.mjs` (calibrated 2026-09-25, 31/31 PASS)
// - Blog posts have `correction-guards.blog.mjs` (FAQ + Key Takeaways + de-AI + links)
// - Guide pages (22 个教程) had ZERO dedicated GEO audit — only `audit-content-integrity`
//   which checks structural integrity, not GEO depth.
//
// This audit fills the gap by checking the 6 mandatory GEO elements for guides:
//   1. Key Takeaways (蓝框要点 — 已有 keyTakeaways 字段，检查非空)
//   2. FAQ >= 5 (GEO 可引用片段 + FAQPage Schema)
//   3. Headings >= 5 (章节结构完整)
//   4. Authorship block (E-E-A-T: author + lastVerified + credentials)
//   5. Content depth (英文正文词数 — 阈值针对 Guide 实际分布校准)
//   6. Internal link coverage (至少 1 条内链到 /convert 或 /blog)
//
// CALIBRATION 2026-09-25:
//   Guide 22 页正文字数分布: min 80 / max 491 / 全部 <600
//   旧 1000 词阈值（Convert 专用）对 Guide 完全不可达。
//   按 Guide 实际分布分级:
//   - TARGET = 400 (full credit, 2/22 达到)
//   - WARN   = 250 (half credit floor, 8/22 达到)
//   - MIN    = 100 (below this = 严重薄内容, 14/22 低于此线)
//
// RUN: node scripts/geo-audit-guide.mjs [--json] [--no-online]
// EXIT: 0 = all PASS, 1 = any FAIL or WARN

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = process.cwd();
const GUIDES_DIR = join(ROOT, 'src/data/guides');
const TARGET_WORD_COUNT = 400;
const WARN_WORD_COUNT = 250;
const MIN_WORD_COUNT = 100;
const MIN_HEADINGS = 5;
const MIN_FAQ = 5;
const MIN_INTERNAL_LINKS = 1;

const { values } = parseArgs({
  options: {
    json: { type: 'boolean', default: false },
    'no-online': { type: 'boolean', default: false },
  },
});

async function verifyOnline(slug) {
  try {
    const url = `https://www.bookconv.com/guide/${slug}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await resp.text();
    const faqCount = (html.match(/FAQPage/g) || []).length;
    const howToCount = (html.match(/HowTo/g) || []).length;
    return { faqCount, howToCount };
  } catch (e) {
    return { error: e.message, faqCount: 0, howToCount: 0 };
  }
}

function countWordsIn(text) {
  return text.split(/\s+/).filter((w) => /^[a-zA-Z]{3,}$/.test(w)).length;
}

function countBodyWords(src) {
  let total = 0;
  // body: `...` — template literals (backtick-quoted, may contain \n, internal quotes)
  for (const m of src.matchAll(/body:\s*`([\s\S]*?)`/g)) {
    total += countWordsIn(m[1]);
  }
  // body: '...' — single-quoted
  for (const m of src.matchAll(/body:\s*'((?:[^'\\]|\\.)*)'/g)) {
    total += countWordsIn(m[1]);
  }
  // body: "..." — double-quoted
  for (const m of src.matchAll(/body:\s*"((?:[^"\\]|\\.)*)"/g)) {
    total += countWordsIn(m[1]);
  }
  return total;
}

function countInternalLinks(src) {
  let count = 0;
  for (const m of src.matchAll(/\((\/(?:convert|blog|guide)\/[^)]+)\)/g)) {
    count++;
  }
  return count;
}

function countKeyTakeaways(src) {
  // keyTakeaways can be `keyTakeaways = [` or `keyTakeaways: [`
  const match = src.match(/keyTakeaways\s*[=:]?\s*\[([\s\S]*?)\]/);
  if (!match) return 0;
  return (match[1].match(/\n\s+'/g) || []).length;
}

async function scan() {
  const files = readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts')
    .map((f) => join(GUIDES_DIR, f));

  const results = [];
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;
  let onlineErrors = 0;

  for (const file of files) {
    let src;
    try {
      src = readFileSync(file, 'utf8');
    } catch (e) {
      results.push({
        file: file.replace(ROOT + '\\', '').replace(ROOT + '/', ''),
        error: e.message,
        rating: 'ERROR',
      });
      continue;
    }

    const rel = file.replace(ROOT + '\\', '').replace(ROOT + '/', '');
    const slug = file.replace(GUIDES_DIR + '\\', '').replace(GUIDES_DIR + '/', '').replace('.ts', '');

    // --- Extract structural fields ---
    const headings = [...src.matchAll(/heading:\s*'([^']+)'/g)].map((m) => m[1]);
    const faqCount = (src.match(/\{\s*question:/g) || []).length;
    const wordCount = countBodyWords(src);
    const internalLinks = countInternalLinks(src);
    const keyTakeaways = countKeyTakeaways(src);
    const hasAuthorship = /authorship\s*=\s*\{/.test(src);
    const hasLastVerified = /lastVerified\s*:\s*['\x22]/.test(src);
    const hasCredentials = /credentials\s*:\s*['\x22]/.test(src);

    // --- Score (0-7) ---
    let score = 0;

    // 1. Key Takeaways (蓝框要点 — GEO 可引用摘要)
    if (keyTakeaways >= 3) score++;
    else if (keyTakeaways >= 1) score += 0.5;

    // 2. FAQ
    if (faqCount >= 6) score++;
    else if (faqCount >= MIN_FAQ) score += 0.5;

    // 3. Headings
    if (headings.length >= 7) score++;
    else if (headings.length >= MIN_HEADINGS) score += 0.5;

    // 4. Authorship block
    if (hasAuthorship && hasLastVerified && hasCredentials) score++;
    else if (hasAuthorship) score += 0.5;

    // 5. Word count (graded)
    if (wordCount >= TARGET_WORD_COUNT) score++;
    else if (wordCount >= WARN_WORD_COUNT) score += 0.5;
    // < MIN_WORD_COUNT = 0.0 (serious thin content)

    // 6. Internal links
    if (internalLinks >= 3) score++;
    else if (internalLinks >= MIN_INTERNAL_LINKS) score += 0.5;

    // 7. Intro presence (content.intro)
    const hasIntro = /intro\s*:\s*['"`]/.test(src);
    if (hasIntro) score++;

    const rating = score >= 5 ? 'PASS' : score >= 3 ? 'WARN' : 'FAIL';

    if (rating === 'PASS') passCount++;
    else if (rating === 'WARN') warnCount++;
    else failCount++;

    // Online verification
    let online = null;
    if (!values['no-online']) {
      online = await verifyOnline(slug);
      if (online.error) onlineErrors++;
    }

    results.push({
      file: rel,
      slug,
      headings: headings.length,
      faqs: faqCount,
      wordCount,
      keyTakeaways,
      internalLinks,
      authorship: hasAuthorship,
      lastVerified: hasLastVerified,
      credentials: hasCredentials,
      hasIntro,
      score: score.toFixed(1),
      rating,
      missing: [
        keyTakeaways < 3 && 'KeyTakeaways',
        faqCount < MIN_FAQ && 'FAQ',
        headings.length < MIN_HEADINGS && 'Headings',
        !hasAuthorship && 'Authorship',
        wordCount < TARGET_WORD_COUNT && `WordCount(<${TARGET_WORD_COUNT})`,
        wordCount < MIN_WORD_COUNT && `ThinContent(<${MIN_WORD_COUNT})`,
        internalLinks < MIN_INTERNAL_LINKS && 'InternalLinks',
        !hasIntro && 'Intro',
      ].filter(Boolean),
      online,
    });
  }

  results.sort((a, b) => {
    const order = { ERROR: 0, FAIL: 0, WARN: 1, PASS: 2 };
    if (order[a.rating] !== order[b.rating]) return order[a.rating] - order[b.rating];
    return parseFloat(b.score) - parseFloat(a.score);
  });

  return { results, passCount, warnCount, failCount, total: results.length, onlineErrors };
}

const { results, passCount, warnCount, failCount, total, onlineErrors } = await scan();

if (values.json) {
  writeFileSync(
    'audit-guide-report.json',
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        total,
        passCount,
        warnCount,
        failCount,
        onlineErrors,
        results: results.map((r) => ({
          file: r.file,
          slug: r.slug,
          score: r.score,
          rating: r.rating,
          wordCount: r.wordCount,
          faqs: r.faqs,
          headings: r.headings,
          keyTakeaways: r.keyTakeaways,
          internalLinks: r.internalLinks,
          authorship: r.authorship,
          missing: r.missing,
          online: r.online,
        })),
      },
      null,
      2,
    ),
  );
  console.log('JSON report written to audit-guide-report.json');
}

console.log('\n=== GEO Audit: Guide Pages ===\n');
const totalPct = total > 0 ? (passCount / total) * 100 : 0;
const warnPct = total > 0 ? (warnCount / total) * 100 : 0;
const failPct = total > 0 ? (failCount / total) * 100 : 0;
console.log(`Total guides: ${total}`);
console.log(`PASS (>=5.0): ${passCount} (${totalPct.toFixed(1)}%)`);
console.log(`WARN (3.0-4.9): ${warnCount} (${warnPct.toFixed(1)}%)`);
console.log(`FAIL (<3.0): ${failCount} (${failPct.toFixed(1)}%)`);
if (onlineErrors > 0) console.log(`Online errors: ${onlineErrors}`);
console.log('');

console.log('| File | H | FAQ | Words | KT | Links | Auth | Score | Rating | Missing | Online |');
console.log('|------|---|-----|-------|----|----|------|-------|--------|---------|--------|');
for (const r of results) {
  const ratingEmoji = r.rating === 'PASS' ? '✅' : r.rating === 'WARN' ? '🟡' : '❌';
  const missingStr = r.missing?.length > 0 ? r.missing.join(', ') : '-';
  const onlineSchema = r.online?.error
    ? '⚠️ ERROR'
    : r.online
      ? `${r.online.faqCount}F/${r.online.howToCount}H`
      : '-';
  console.log(
    `| ${r.file} | ${r.headings} | ${r.faqs} | ${r.wordCount} | ${r.keyTakeaways} | ${r.internalLinks} | ${r.authorship ? '✓' : '✗'} | ${r.score} | ${ratingEmoji} ${r.rating} | ${missingStr} | ${onlineSchema} |`,
  );
}

console.log('\n=== GEO Standards for Guide Pages (calibrated 2026-09-25) ===\n');
console.log('Mandatory elements per guide (English content):');
console.log('  1. Key Takeaways >= 3 — 蓝框要点，GEO 可引用摘要');
console.log('  2. FAQ >= 5 (≥6 full credit) — FAQPage Schema');
console.log(`  3. Headings >= ${MIN_HEADINGS} (≥7 full credit) — 章节结构`);
console.log('  4. Authorship block — E-E-A-T (author + lastVerified + credentials)');
console.log(`  5. Word count >= ${TARGET_WORD_COUNT} (full) / >= ${WARN_WORD_COUNT} (half) — 内容深度`);
console.log(`     ⚠️ 低于 ${MIN_WORD_COUNT} = 严重薄内容，AI 引擎无法引用`);
console.log('  6. Internal links >= 1 (≥3 full credit) — 内链到 /convert 或 /blog');
console.log('  7. Intro present — content.intro 字段\n');

// --- Word count summary (calibration reference) ---
const wcSorted = results.map((r) => r.wordCount).sort((a, b) => a - b);
console.log(`Word count distribution: min=${wcSorted[0]} median=${wcSorted[Math.floor(wcSorted.length / 2)]} max=${wcSorted[wcSorted.length - 1]}`);
console.log(`  below ${MIN_WORD_COUNT} (severe thin): ${wcSorted.filter((w) => w < MIN_WORD_COUNT).length}`);
console.log(`  ${MIN_WORD_COUNT}–${WARN_WORD_COUNT} (thin): ${wcSorted.filter((w) => w >= MIN_WORD_COUNT && w < WARN_WORD_COUNT).length}`);
console.log(`  ${WARN_WORD_COUNT}–${TARGET_WORD_COUNT} (mid): ${wcSorted.filter((w) => w >= WARN_WORD_COUNT && w < TARGET_WORD_COUNT).length}`);
console.log(`  >= ${TARGET_WORD_COUNT} (full): ${wcSorted.filter((w) => w >= TARGET_WORD_COUNT).length}\n`);

const exitCode = failCount > 0 || warnCount > 0 || onlineErrors > 0 ? 1 : 0;
if (failCount > 0) console.log(`\n❌ AUDIT FAILED: ${failCount} guide(s) below minimum threshold`);
if (warnCount > 0) console.log(`\n⚠️  AUDIT WARNING: ${warnCount} guide(s) need improvement`);
if (onlineErrors > 0) console.log(`\n⚠️  ONLINE VERIFICATION: ${onlineErrors} guide(s) failed live schema check`);
process.exit(exitCode);
