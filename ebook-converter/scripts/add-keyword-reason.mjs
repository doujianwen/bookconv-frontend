// scripts/add-keyword-reason.mjs
// Append a human "why did this move" note for a keyword.
//
//   node scripts/add-keyword-reason.mjs "<query>" "<YYYY-MM-DD>" "<原因>"
//
// The note lands in data/keyword-reasons.json, which the keyword panel reads to
// fill its "原因" column and the build:keywords script merges into the
// keyword-rank-latest.csv "Reasons" column. Reasons are curated by hand — the
// series data only knows Δ, not the cause.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const FP = join(ROOT, 'data', 'keyword-reasons.json');

function die(msg) {
  console.error(`✗ ${msg}`);
  console.error('usage: node scripts/add-keyword-reason.mjs "<query>" "<YYYY-MM-DD>" "<reason>"');
  process.exit(1);
}

const [query, date, reason] = process.argv.slice(2);
if (!query || !date || !reason) die('缺少参数');
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) die(`日期格式应为 YYYY-MM-DD，收到: ${date}`);

let doc;
if (existsSync(FP)) {
  try {
    doc = JSON.parse(readFileSync(FP, 'utf8'));
  } catch {
    die('data/keyword-reasons.json 不是合法 JSON，请先修复');
  }
} else {
  doc = {
    $schema: 'keyword-reasons/v1',
    _readme: ['按 query 记录排名变化原因。每天 build:keywords 后对变动词补一条。'],
    entries: [],
  };
}
if (!Array.isArray(doc.entries)) doc.entries = [];

doc.entries.push({ query, date, reason });
writeFileSync(FP, JSON.stringify(doc, null, 2) + '\n', 'utf8');
console.log(`✓ 已记录：${query} @ ${date} → ${reason}`);
console.log(`  data/keyword-reasons.json 现有 ${doc.entries.length} 条`);
