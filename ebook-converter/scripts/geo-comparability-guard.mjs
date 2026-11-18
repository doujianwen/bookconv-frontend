// scripts/geo-comparability-guard.mjs
// R8 GEO 可比性守卫：把「跨轮比较前先判字段定义与采集字段集是否一致，不一致判 UNKNOWN」
// 从文档纪律（审计_GEO三平台复采数据口径_2026-11-02.md §四）代码化。
//
// 背景事故：9/27 bookconv_cited=引用URL(来源卡片)，11/02 bookconv_cited=正文域名，
// 同名不同义被误读成「2→0 归零」。本守卫对两轮产物的 metric 定义签名做比对，
// 不一致/缺定义 → UNKNOWN（禁算涨跌），绝不 fallthrough 到 PASS。
//
// 三态：PASS(字段定义一致，可比) / UNKNOWN(定义缺失或不一致，禁相减) / FAIL(输入不可解析)
// 本工具不产生涨跌数值——只裁定「两轮是否可比」。这是防复发门禁，不是新采集器。
//
// 退出码：0=PASS(可比) | 2=UNKNOWN(不可比/缺定义) | 1=FAIL(输入错误)
// 用法：
//   node scripts/geo-comparability-guard.mjs --self-test
//   node scripts/geo-comparability-guard.mjs --left <metaA.json> --right <metaB.json>
// meta 格式：{ "metrics": { "<name>": { "definition": "...", "source": "body|sources" } } }
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// 定义签名：definition + source 必须都明确且一致；任一为「未采/未定义/空」→ 不可比
export function metricSig(m) {
  if (!m || typeof m !== 'object') return null;
  const def = String(m.definition || '').trim();
  const src = String(m.source || '').trim();
  if (!def || !src || def === '未采' || src === '未采') return null;
  return `${def}::${src}`;
}

// 比对两轮同名字段。返回 { comparable, mismatches[], missing[] }
export function compare(left, right) {
  const L = (left?.metrics) || {}, R = (right?.metrics) || {};
  const names = new Set([...Object.keys(L), ...Object.keys(R)]);
  const mismatches = [], missing = [];
  for (const n of names) {
    const ls = metricSig(L[n]), rs = metricSig(R[n]);
    if (ls === null || rs === null) { missing.push({ metric: n, left: ls, right: rs }); continue; }
    if (ls !== rs) mismatches.push({ metric: n, left: ls, right: rs });
  }
  return { comparable: mismatches.length === 0 && missing.length === 0, mismatches, missing };
}

function selfTest() {
  const A = { metrics: { bookconv_cited: { definition: '引用URL', source: 'sources' } } };
  const B_same = { metrics: { bookconv_cited: { definition: '引用URL', source: 'sources' } } };
  const B_diff = { metrics: { bookconv_cited: { definition: '正文域名', source: 'body' } } };
  const B_missing = { metrics: { bookconv_cited: { definition: '未采', source: 'sources' } } };
  const ok = [
    ['同名同义→可比', compare(A, B_same).comparable === true],
    ['同名不同义→不可比', compare(A, B_diff).comparable === false && compare(A, B_diff).mismatches.length === 1],
    ['未采字段→不可比', compare(A, B_missing).comparable === false && compare(A, B_missing).missing.length === 1],
    ['空定义→不可比', compare(A, { metrics: { bookconv_cited: {} } }).comparable === false],
  ];
  const fails = ok.filter(([,v])=>!v).map(([n])=>n);
  if (fails.length) { console.error('SELFTEST UNKNOWN: 判据自检失败 →', fails.join(' / ')); process.exit(2); }
  console.log(`SELFTEST PASS: ${ok.length} 用例（同名同义/不同义/未采/空定义）全部符合预期`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) selfTest();
const argVal = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i+1] : null; };
const lp = argVal('--left'), rp = argVal('--right');
if (!lp || !rp) { console.error('FAIL: 需 --left <metaA.json> --right <metaB.json>'); process.exit(1); }
let L, R;
try { L = JSON.parse(readFileSync(join(ROOT, lp), 'utf8')); R = JSON.parse(readFileSync(join(ROOT, rp), 'utf8')); }
catch (e) { console.error('FAIL: 输入解析失败 →', String(e?.message||e).slice(0,160)); process.exit(1); }
const res = compare(L, R);
if (!res.comparable) {
  console.error('UNKNOWN: 两轮 GEO 数据不可比 → 禁止相减/禁判涨跌');
  if (res.mismatches.length) console.error('  字段定义冲突:', JSON.stringify(res.mismatches));
  if (res.missing.length) console.error('  定义缺失/未采:', JSON.stringify(res.missing));
  process.exit(2);
}
console.log('PASS: 两轮字段定义与采集字段集一致，可比（本守卫不产出涨跌数值）');
process.exit(0);
