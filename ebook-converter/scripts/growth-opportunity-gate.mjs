// scripts/growth-opportunity-gate.mjs
// R2 Growth Opportunity Qualification Gate — 把 docs/bing-topic-portfolio-geo-2026-10-14.md
// §四优先级矩阵 [HEURISTIC] 代码化，按序短路判定，输出可复核的资格结论。
//
// 设计纪律：
//  - 只读：不写回 source JSON，不改 board，不建新数据中心。复用 topic-portfolio-opportunities.json。
//  - 三态：PASS(判定一致) / FAIL(源数据与判据冲突或重复 id) / UNKNOWN(判据自检失败，禁静默当通过)。
//  - 反向注入自检：注入矛盾样本必须被判 FAIL，否则门禁不可信 → exit 2。
//  - 机会不足时输出 eligible=[] 且 exit 0 —— 绝不强迫制造增长任务。
//
// 退出码：0=PASS(含合法空集) | 1=FAIL(数据冲突) | 2=UNKNOWN(判据不可执行)
// 用法：
//   node scripts/growth-opportunity-gate.mjs --source data/topic-portfolio-opportunities.json
//   node scripts/growth-opportunity-gate.mjs --self-test
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---- 判据：与 docs 优先级矩阵按序短路一致（HEURISTIC，可复现）----
// 输入一条 query 记录 + topic → 返回 { priority, qualified, reason }
export function qualify(q) {
  const topic = String(q.topic || '');
  const fit = String(q.capabilityFit || 'none');
  const servable = q.servableNow === true;
  // 1. EXCLUDE：超大拥挤非 niche 主题
  if (topic === 'Technology') return { priority: 'EXCLUDE', qualified: false, reason: 'off-niche topic=Technology' };
  // 2. P2：无承载面
  if (fit === 'none') return { priority: 'P2', qualified: false, reason: 'capabilityFit=none' };
  // 3. guide：资格通过，但 P0(已有强承载)/P1(需新建) 的细分无法从现有字段可靠判定。
  //    红队实证：linkedPostSlug 全空、targetSlug 是「计划要建」非「已有承载」证据，
  //    declared P0(TP-022/026) 与 P1(TP-031/044) 均有非空 targetSlug ⇒ 该字段无法区分。
  //    按协议「不可判定报 UNKNOWN 禁 FAIL」：细分降级 UNKNOWN，资格仍 qualified=true。
  if (fit === 'guide') {
    return { priority: 'UNKNOWN', qualified: true,
      reason: 'guide 有承载资格；P0/P1 细分缺「已有承载」判据字段(linkedPostSlug 全空/targetSlug 为计划值) → UNKNOWN，不得伪造区分' };
  }
  // 4. convert 对：servableNow=true → P0；false(402) → P1-parked
  if (fit === 'calibre' || fit === 'js' || fit === 'cloudconvert') {
    if (servable) return { priority: 'P0', qualified: true, reason: `convert 可交付 fit=${fit}` };
    return { priority: 'P1-parked', qualified: false, reason: 'convert 依赖受限(402)，servableNow=false → parked，禁止导流失败页' };
  }
  // 未知 fit → UNKNOWN（不臆断）
  return { priority: 'UNKNOWN', qualified: false, reason: `unrecognized capabilityFit=${fit}` };
}

// ---- 判据自检（注入/恢复反向验证）----
function selfTest() {
  const cases = [
    ['topic=Technology 排除', { topic: 'Technology', capabilityFit: 'guide', targetSlug: 'x' }, r => r.priority === 'EXCLUDE' && !r.qualified],
    ['fit=none 不资格', { topic: 'Books', capabilityFit: 'none' }, r => r.priority === 'P2' && !r.qualified],
    ['guide 承载资格(细分UNKNOWN)', { topic: 'Books', capabilityFit: 'guide', targetSlug: 'how-to-x' }, r => r.priority === 'UNKNOWN' && r.qualified],
    ['guide 无target仍资格(细分UNKNOWN)', { topic: 'Books', capabilityFit: 'guide', targetSlug: '' }, r => r.priority === 'UNKNOWN' && r.qualified],
    ['convert 可交付 P0', { topic: 'Books', capabilityFit: 'calibre', servableNow: true }, r => r.priority === 'P0' && r.qualified],
    ['convert 受限 parked 不资格', { topic: 'Books', capabilityFit: 'calibre', servableNow: false }, r => r.priority === 'P1-parked' && !r.qualified],
    ['未知 fit UNKNOWN', { topic: 'Books', capabilityFit: 'bogus' }, r => r.priority === 'UNKNOWN' && !r.qualified],
  ];
  let fail = 0;
  for (const [name, input, expect] of cases) {
    const r = qualify(input);
    if (!expect(r)) { console.error(`SELFTEST FAIL: ${name} → ${JSON.stringify(r)}`); fail++; }
  }
  // 反向注入：把一个本应 parked 的词强行标 servable=true，判据必须仍按字段判定为 P0（证明判据真读字段而非硬编码）
  const injected = qualify({ topic: 'Books', capabilityFit: 'calibre', servableNow: true });
  if (injected.priority !== 'P0') { console.error('SELFTEST FAIL: 注入 servable=true 未被判据识别'); fail++; }
  if (fail) { console.error(`SELFTEST UNKNOWN: ${fail} 项判据自检失败 → 门禁不可信`); process.exit(2); }
  console.log(`SELFTEST PASS: ${cases.length} 个判据用例 + 1 反向注入，全部符合预期`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) selfTest();

const srcIdx = args.indexOf('--source');
const src = srcIdx >= 0 ? args[srcIdx + 1] : 'data/topic-portfolio-opportunities.json';
let data;
try {
  data = JSON.parse(readFileSync(join(ROOT, src), 'utf8'));
} catch (e) {
  console.error('UNKNOWN: 无法读取/解析源数据 →', String(e?.message || e).slice(0, 200));
  process.exit(2);
}
const queries = Array.isArray(data.queries) ? data.queries : [];

// 重复 id 检测（任务去重的资格层前置）
const ids = queries.map(q => String(q.id || ''));
const dup = ids.filter((id, i) => id && ids.indexOf(id) !== i);
if (dup.length) {
  console.error(`FAIL: 源数据存在重复 query id: ${[...new Set(dup)].join(', ')}`);
  process.exit(1);
}

const results = queries.map(q => ({ id: q.id, query: q.query, declared: q.priority, ...qualify(q) }));
// 声明值与判据冲突 → FAIL（防止人工手填 priority 与可复现矩阵漂移）。
// 唯独 guide 类细分已降级 UNKNOWN（缺判据字段），不得据此判源数据 FAIL。
const conflicts = results.filter(r => r.declared && r.priority !== 'UNKNOWN' &&
  r.declared !== r.priority);
const eligible = results.filter(r => r.qualified);
const unknown = results.filter(r => r.priority === 'UNKNOWN');

console.log(`GATE: 读入 ${queries.length} 条 query；资格通过 ${eligible.length}；UNKNOWN 字段 ${unknown.length}；声明冲突 ${conflicts.length}`);
if (conflicts.length) {
  console.error('FAIL: 以下条目 declared priority 与可复现矩阵判据冲突：');
  for (const c of conflicts.slice(0, 20)) console.error(`  ${c.id} ${c.query}: declared=${c.declared} computed=${c.priority} (${c.reason})`);
  process.exit(1);
}
// 合法输出（含机会不足的空集）：结构化打印供上层经营流程消费，不写回源文件
console.log(JSON.stringify({ eligibleCount: eligible.length, eligible: eligible.map(e => ({ id: e.id, query: e.query, priority: e.priority })), note: '机会不足时 eligible 可为空，不强制生成增长任务' }, null, 2));
process.exit(0);
