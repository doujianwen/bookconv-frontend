#!/usr/bin/env node
/**
 * convert 页「差异化」可测判据门禁
 *
 * 背景：scripts/audit-content-integrity.mjs 与 find-duplicate-headings.mjs 只检查
 * 「要素是否齐备」与「同文件内重复」，都不量度「页面之间是否雷同」。
 * 而 2026-09-25 的 GEO 标准化（commit 7218b64，31/31 PASS）用统一章节填满
 * 31 个 convert 页，实测造成 24/31 页（77%）共用「Conversion Quality Checklist」——
 * 这正是 Scaled Content 嫌疑的来源。PASS ≠ 差异化完成。
 *
 * 本脚本把「同质度」变成可测、可回归的数字。
 *
 * 用法：node scripts/audit-convert-differentiation.mjs
 * 退出码：0 = PASS，1 = FAIL（未达差异化目标）
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const DIR = 'src/data/content';

/** 判据目标（来自 docs/待执行计划-v3-2026-09-26.md §4.3） */
const TARGET = {
  maxSharedSkeletons: 3, // 出现 >= MIN_SHARE 页的骨架数上限
  minShare: 8, // 「共用」的页数阈值
  maxTopHeadingPages: 8, // 最高频共用章节的覆盖页数上限（<=26% × 31）
  maxAvgJaccard: 0.1, // 同簇两两相似度平均值上限
  maxTopJaccard: 0.4, // 同簇两两相似度最高值上限
};

/** 归一化：抹掉格式名，使 "What is EPUB Format?" 与 "What is MOBI Format?" 视为同一骨架 */
const FORMATS = ['epub', 'pdf', 'mobi', 'azw3', 'azw', 'txt', 'doc', 'docx', 'rtf',
  'html', 'htmlz', 'fb2', 'lit', 'cbr', 'djvu', 'chm', 'jpg', 'png', 'zip'];

function normalize(h) {
  let s = h.toLowerCase();
  for (const f of FORMATS) s = s.split(f).join('<F>');
  return s.replace(/[^a-z<>]/g, '');
}

function collect() {
  const files = readdirSync(DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .map((f) => join(DIR, f));

  const pages = new Map();
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    const heads = [...src.matchAll(/heading:\s*(['"`])(.*?)\1/g)].map((m) => m[2]);
    pages.set(basename(f, '.ts'), heads);
  }
  return pages;
}

const pages = collect();
const names = [...pages.keys()].sort();
const total = names.length;

if (total === 0) {
  console.error('ERROR  未找到任何 content 文件，检查 DIR 配置');
  process.exit(1);
}

// --- 1. 共用骨架统计（归一化后） ---
const skeletonHits = new Map(); // 归一化骨架 -> Set(pageName)
for (const [name, heads] of pages) {
  for (const h of heads) {
    const k = normalize(h);
    if (!skeletonHits.has(k)) skeletonHits.set(k, new Set());
    skeletonHits.get(k).add(name);
  }
}
const shared = [...skeletonHits.entries()]
  .filter(([, set]) => set.size >= TARGET.minShare)
  .sort((a, b) => b[1].size - a[1].size);

// --- 2. 原始 heading 频次（用于定位具体该改哪句） ---
const rawHits = new Map();
for (const [, heads] of pages) {
  for (const h of heads) rawHits.set(h, (rawHits.get(h) || 0) + 1);
}
const topRaw = [...rawHits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

// --- 3. 两两 Jaccard ---
const pairs = [];
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const a = new Set(pages.get(names[i]));
    const b = new Set(pages.get(names[j]));
    if (!a.size || !b.size) continue;
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    pairs.push({ s: inter / (a.size + b.size - inter), x: names[i], y: names[j] });
  }
}
pairs.sort((p, q) => q.s - p.s);
const avgJ = pairs.length ? pairs.reduce((t, p) => t + p.s, 0) / pairs.length : 0;
const topJ = pairs.length ? pairs[0].s : 0;

// --- 判定 ---
const results = [];
const check = (label, actual, limit, ok) => {
  results.push({ label, actual, limit, ok });
};

check(`共用骨架数（出现在 >=${TARGET.minShare} 页）`, shared.length, `<= ${TARGET.maxSharedSkeletons}`,
  shared.length <= TARGET.maxSharedSkeletons);
const topSharedCount = shared.length ? shared[0][1].size : 0;
check('最高频共用章节覆盖页数', topSharedCount, `<= ${TARGET.maxTopHeadingPages}`,
  topSharedCount <= TARGET.maxTopHeadingPages);
check('两两 Jaccard 平均', avgJ.toFixed(3), `< ${TARGET.maxAvgJaccard}`,
  avgJ < TARGET.maxAvgJaccard);
check('两两 Jaccard 最高', topJ.toFixed(3), `< ${TARGET.maxTopJaccard}`,
  topJ < TARGET.maxTopJaccard);

// --- 输出 ---
console.log(`convert 页差异化门禁 — 扫描 ${total} 页\n`);
console.log('判定：');
for (const r of results) {
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.label}: ${r.actual}  (目标 ${r.limit})`);
}

console.log('\n高频共用章节原文（改动时的靶子）：');
for (const [h, n] of topRaw) {
  console.log(`  ${String(n).padStart(3)} 页  ${h.slice(0, 72)}`);
}

if (pairs.length) {
  console.log('\n最相似的页对（Top5）：');
  for (const p of pairs.slice(0, 5)) {
    console.log(`  ${p.s.toFixed(2)}  ${p.x}  <->  ${p.y}`);
  }
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'}  ${results.length - failed}/${results.length} 项达标`);
process.exit(failed === 0 ? 0 : 1);
