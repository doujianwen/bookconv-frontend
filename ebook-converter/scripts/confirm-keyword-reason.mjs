// scripts/confirm-keyword-reason.mjs
// Promote a CANDIDATE cause into the confirmed truth file.
//
//   node scripts/confirm-keyword-reason.mjs "<query>" <itemIndex>
//
// Reads data/keyword-reason-candidates.json, picks candidates[query].items[index],
// and appends a confirmed { query, date, reason } entry to data/keyword-reasons.json.
// This is the ONLY path that writes into the confirmed file — nothing is ever
// auto-promoted. The candidate's own text becomes the reason; the date used is
// the observed latestDate from the series.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CAND_PATH = join(ROOT, 'data', 'keyword-reason-candidates.json');
const REASONS_PATH = join(ROOT, 'data', 'keyword-reasons.json');

function die(msg) {
  console.error(`✗ ${msg}`);
  console.error('usage: node scripts/confirm-keyword-reason.mjs "<query>" <itemIndex>');
  process.exit(1);
}

const [query, idxArg] = process.argv.slice(2);
if (!query || idxArg === undefined) die('缺少参数');
const index = Number(idxArg);
if (!Number.isInteger(index) || index < 0) die(`itemIndex 应为 ≥0 整数，收到: ${idxArg}`);

if (!existsSync(CAND_PATH)) die('候选文件缺失，先跑 node scripts/suggest-keyword-reasons.mjs');

let candDoc;
try {
  candDoc = JSON.parse(readFileSync(CAND_PATH, 'utf8'));
} catch {
  die('keyword-reason-candidates.json 不是合法 JSON');
}

const entry = (candDoc.candidates || []).find((c) => c.query === query);
if (!entry) die(`候选文件里没有查询词：${query}`);
const item = entry.items[index];
if (!item) die(`该词只有 ${entry.items.length} 条候选，index ${index} 越界`);

let reasonsDoc;
if (existsSync(REASONS_PATH)) {
  try {
    reasonsDoc = JSON.parse(readFileSync(REASONS_PATH, 'utf8'));
  } catch {
    die('keyword-reasons.json 不是合法 JSON，请先修复');
  }
} else {
  reasonsDoc = {
    $schema: 'keyword-reasons/v1',
    _readme: ['按 query 记录排名变化原因。每天 build:keywords 后对变动词补一条。'],
    entries: [],
  };
}
if (!Array.isArray(reasonsDoc.entries)) reasonsDoc.entries = [];

const date = entry.observed.latestDate || candDoc.d0 || new Date().toISOString().slice(0, 10);
// The candidate is a hypothesis; on confirmation we store it verbatim as the
// human-accepted reason, tagged so future readers know it came from evidence.
const reason = `[${item.type}] ${item.text}`;
reasonsDoc.entries.push({ query, date, reason });
writeFileSync(REASONS_PATH, JSON.stringify(reasonsDoc, null, 2) + '\n', 'utf8');

console.log(`✓ 已确认并写入：${query} @ ${date}`);
console.log(`  原因：${reason}`);
console.log(`  data/keyword-reasons.json 现有 ${reasonsDoc.entries.length} 条`);
