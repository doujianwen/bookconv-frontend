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
//   5. Content depth (字数 ≥2000)
//
// RUN: node scripts/geo-audit-content.mjs
// EXIT: 0 = all PASS, 1 = failures found

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = resolve(ROOT, 'src/data/content');
const MIN_WORD_COUNT = 2000;
const MIN_HEADINGS = 8;
const MIN_FAQ = 6;

function scan() {
  const files = readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => join(CONTENT_DIR, f));

  const results = [];
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const rel = file.replace(ROOT + '/', '');

    // Extract headings
    const headingMatches = src.matchAll(/heading:\s*'([^']+)'/g);
    const headings = [...headingMatches].map(m => m[1]);

    // Count FAQs
    const faqMatches = src.match(/\{ q:/g);
    const faqCount = faqMatches ? faqMatches.length : 0;

    // Count words
    const words = src.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Check GEO elements
    const hasWhen = headings.some(h => /when/i.test(h));
    const hasHowTo = headings.some(h => /how to|step by step/i.test(h));
    const hasComparison = headings.some(h => /comparison|vs\b/i.test(h));
    const hasQuality = headings.some(h => /quality|checklist/i.test(h));

    // Score (0-6)
    let score = 0;
    if (wordCount >= MIN_WORD_COUNT) score++;
    else if (wordCount >= MIN_WORD_COUNT * 0.75) score += 0.5;
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

    results.push({
      file: rel,
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
        wordCount < MIN_WORD_COUNT && 'WordCount',
        faqCount < MIN_FAQ && 'FAQ',
        headings.length < MIN_HEADINGS && 'Headings'
      ].filter(Boolean)
    });
  }

  results.sort((a, b) => {
    const order = { FAIL: 0, WARN: 1, PASS: 2 };
    if (order[a.rating] !== order[b.rating]) return order[a.rating] - order[b.rating];
    return parseFloat(b.score) - parseFloat(a.score);
  });

  return { results, passCount, warnCount, failCount, total: results.length };
}

const { results, passCount, warnCount, failCount, total } = scan();

console.log('\n=== GEO Audit: Convert Pages ===\n');
console.log(`Total pages: ${total}`);
console.log(`PASS (>=5.0): ${passCount} (${(passCount/total*100).toFixed(1)}%)`);
console.log(`WARN (3.0-4.9): ${warnCount} (${(warnCount/total*100).toFixed(1)}%)`);
console.log(`FAIL (<3.0): ${failCount} (${(failCount/total*100).toFixed(1)}%)\n`);

console.log('| File | Headings | FAQ | Words | Score | Rating | Missing |');
console.log('|------|----------|-----|-------|-------|--------|---------|');
for (const r of results) {
  const ratingEmoji = r.rating === 'PASS' ? '✅' : r.rating === 'WARN' ? '🟡' : '❌';
  const missingStr = r.missing.length > 0 ? r.missing.join(', ') : '-';
  console.log(`| ${r.file} | ${r.headings} | ${r.faqs} | ${r.wordCount} | ${r.score} | ${ratingEmoji} ${r.rating} | ${missingStr} |`);
}

console.log('\n=== GEO Standards Reference ===\n');
console.log('Mandatory elements per convert page:');
console.log('  1. "When to Use" section —场景判断，捕获长尾关键词');
console.log('  2. "How to Convert" section — 操作步骤，配合 HowTo Schema');
console.log('  3. "Format Comparison" section — 格式对比，捕获对比类搜索词');
console.log('  4. "Quality Checklist" section — 质量保证，提升权威性');
console.log('  5. Word count >= 2000 — 内容深度达标');
console.log('  6. FAQ >= 6 — 配合 FAQPage Schema');
console.log('  7. Headings >= 8 — 章节结构完整\n');

// Exit with error if any FAIL
if (failCount > 0) {
  console.log(`\n❌ AUDIT FAILED: ${failCount} page(s) below minimum threshold`);
  process.exit(1);
} else if (warnCount > 0) {
  console.log(`\n⚠️  AUDIT WARNING: ${warnCount} page(s) need improvement`);
  process.exit(0);
} else {
  console.log('\n✅ ALL PAGES PASS GEO STANDARDS');
  process.exit(0);
}
