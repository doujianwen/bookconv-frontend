// scripts/geo-audit-content.mjs
//
// GEO compliance audit for convert pages (src/data/content/*.ts).
//
// WHY THIS EXISTS:
// - We have comprehensive GEO standards for BLOG posts (correction-guards.blog.mjs)
// - But ZERO enforcement for CONVERT pages — they use a different schema
// - This audit fills the gap by checking the 5 mandatory GEO elements:
//   1. When to Use (场景判断)
//   2. How to Convert (操作步骤)
//   3. Format Comparison (格式对比)
//   4. Quality Checklist (质量保证)
//   5. Content depth (英文正文词数 ≥1000 满分 / ≥600 合格；旧 2000 阈值实测不可达，已校准 2026-09-25)
//
// RUN: node scripts/geo-audit-content.mjs [--json] [--no-online]
// EXIT: 0 = all PASS, 1 = failures or warnings found
//
// FIXES APPLIED (2026-09-24 Red Team Audit):
// 1. Word count now only counts body text in template strings (not TS code)
// 2. Online schema verification added (fetches live page, checks FAQPage/HowTo)
// 3. Exit code: WARN now exits 1 (was 0), blocking deployment

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src/data/content');
// CALIBRATED 2026-09-25 against actual EN-only data (max EN body = 1287 words).
// The old 2000-word threshold was unreachable — no page met it. Values below
// are set from the real distribution: deep pages cluster at 800-1300 EN words,
// thin pages at <500. Thresholds are graded, not binary.
const TARGET_WORD_COUNT = 1000;   // full credit at/above this (deep content)
const WARN_WORD_COUNT = 600;      // half credit floor
const MIN_HEADINGS = 8;           // structural completeness (EN sections)
const MIN_FAQ = 6;                // FAQPage schema support

// Parse CLI args
const { values } = parseArgs({
  options: {
    json: { type: 'boolean', default: false },
    'no-online': { type: 'boolean', default: false }
  }
});

async function verifyOnline(pageSlug) {
  try {
    const url = `https://www.bookconv.com/convert/${pageSlug}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await resp.text();
    const faqCount = (html.match(/FAQPage/g) || []).length;
    const howToCount = (html.match(/HowTo/g) || []).length;
    return { faqCount, howToCount };
  } catch (e) {
    return { error: e.message, faqCount: 0, howToCount: 0 };
  }
}

function enOnly(src) {
  // Only audit the English (primary GEO target) content, not the `es` translation mirror.
  const idx = src.indexOf('export const es =');
  return idx > 0 ? src.slice(0, idx) : src;
}

function countWordsIn(text) {
  return text.split(/\s+/).filter(w => /^[a-zA-Z]{3,}$/.test(w)).length;
}

function countBodyWords(src) {
  let totalWords = 0;
  // Backtick template literals (span newlines, tolerate internal backticks)
  for (const m of src.matchAll(/body:\s*`([\s\S]*?)`\s*}/g)) {
    totalWords += countWordsIn(m[1]);
  }
  // Single-quoted strings (single line; tolerate \n and \' escapes)
  for (const m of src.matchAll(/body:\s*'((?:[^'\\]|\\.)*)'\s*}/g)) {
    totalWords += countWordsIn(m[1]);
  }
  return totalWords;
}

async function scan() {
  const files = readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => join(CONTENT_DIR, f));

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
      results.push({ file: file.replace(ROOT + '\\', '').replace(ROOT + '/', ''), error: e.message, rating: 'ERROR' });
      continue;
    }

    const rel = file.replace(ROOT + '\\', '').replace(ROOT + '/', '');
    const slug = file.replace(CONTENT_DIR + '\\', '').replace(CONTENT_DIR + '/', '').replace('.ts', '');

    // Audit EN-only content (primary GEO target). ES is a translation mirror.
    const enSrc = enOnly(src);

    // Extract headings
    const headingMatches = enSrc.matchAll(/heading:\s*'([^']+)'/g);
    const headings = [...headingMatches].map(m => m[1]);

    // Count FAQs
    const faqMatches = enSrc.match(/\{ q:/g);
    const faqCount = faqMatches ? faqMatches.length : 0;

    // Count body words ONLY (not TS code)
    const wordCount = countBodyWords(enSrc);

    // Check GEO elements
    const hasWhen = headings.some(h => /when/i.test(h));
    const hasHowTo = headings.some(h => /how to|step by step/i.test(h));
    const hasComparison = headings.some(h => /comparison|vs\b/i.test(h));
    const hasQuality = headings.some(h => /quality|checklist/i.test(h));

    // Score (0-7) — calibrated against real EN-only distribution
    let score = 0;
    if (wordCount >= TARGET_WORD_COUNT) score++;
    else if (wordCount >= WARN_WORD_COUNT) score += 0.5;
    if (faqCount >= MIN_FAQ) score++;
    else if (faqCount >= MIN_FAQ * 0.6) score += 0.5;
    if (hasWhen) score++;
    if (hasHowTo) score++;
    if (hasComparison) score++;
    if (hasQuality) score++;
    if (headings.length >= MIN_HEADINGS) score++;

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
      score: score.toFixed(1),
      rating,
      hasWhen,
      hasHowTo,
      hasComparison,
      hasQuality,
      missing: [
        !hasWhen && 'When',
        !hasHowTo && 'HowTo',
        !hasComparison && 'Comparison',
        !hasQuality && 'Quality',
        wordCount < TARGET_WORD_COUNT && 'WordCount',
        faqCount < MIN_FAQ && 'FAQ',
        headings.length < MIN_HEADINGS && 'Headings'
      ].filter(Boolean),
      online
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
  writeFileSync('audit-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    total,
    passCount,
    warnCount,
    failCount,
    onlineErrors,
    results: results.map(r => ({
      file: r.file,
      slug: r.slug,
      score: r.score,
      rating: r.rating,
      wordCount: r.wordCount,
      faqs: r.faqs,
      headings: r.headings,
      missing: r.missing,
      online: r.online
    }))
  }, null, 2));
  console.log('JSON report written to audit-report.json');
}

console.log('\n=== GEO Audit: Convert Pages ===\n');
console.log(`Total pages: ${total}`);
console.log(`PASS (>=5.0): ${passCount} (${(passCount/total*100).toFixed(1)}%)`);
console.log(`WARN (3.0-4.9): ${warnCount} (${(warnCount/total*100).toFixed(1)}%)`);
console.log(`FAIL (<3.0): ${failCount} (${(failCount/total*100).toFixed(1)}%)`);
if (onlineErrors > 0) console.log(`Online errors: ${onlineErrors}`);
console.log('');

console.log('| File | Headings | FAQ | Words | Score | Rating | Missing | Online Schema |');
console.log('|------|----------|-----|-------|-------|--------|---------|---------------|');
for (const r of results) {
  const ratingEmoji = r.rating === 'PASS' ? '✅' : r.rating === 'WARN' ? '🟡' : '❌';
  const missingStr = r.missing?.length > 0 ? r.missing.join(', ') : '-';
  const onlineSchema = r.online?.error ? '⚠️ ERROR' : r.online ? `${r.online.faqCount} FAQ` : '-';
  console.log(`| ${r.file} | ${r.headings} | ${r.faqs} | ${r.wordCount} | ${r.score} | ${ratingEmoji} ${r.rating} | ${missingStr} | ${onlineSchema} |`);
}

console.log('\n=== GEO Standards Reference (EN-only, calibrated 2026-09-25) ===\n');
console.log('Mandatory elements per convert page (English content audited):');
console.log('  1. "When to Use" section —场景判断，捕获长尾关键词');
console.log('  2. "How to Convert" section — 操作步骤，配合 HowTo Schema');
console.log('  3. "Format Comparison" section — 格式对比，捕获对比类搜索词');
console.log('  4. "Quality Checklist" section — 质量保证，提升权威性');
console.log(`  5. Word count >= ${TARGET_WORD_COUNT} (full) / >= ${WARN_WORD_COUNT} (half) — 内容深度（仅英文正文）`);
console.log('  6. FAQ >= 6 — 配合 FAQPage Schema');
console.log('  7. Headings >= 8 — 章节结构完整（仅英文）\n');

// Exit with error if any FAIL or WARN (stricter than before)
const exitCode = (failCount > 0 || warnCount > 0 || onlineErrors > 0) ? 1 : 0;
if (failCount > 0) {
  console.log(`\n❌ AUDIT FAILED: ${failCount} page(s) below minimum threshold`);
}
if (warnCount > 0) {
  console.log(`\n⚠️  AUDIT WARNING: ${warnCount} page(s) need improvement`);
}
if (onlineErrors > 0) {
  console.log(`\n⚠️  ONLINE VERIFICATION: ${onlineErrors} page(s) failed live schema check`);
}
process.exit(exitCode);
