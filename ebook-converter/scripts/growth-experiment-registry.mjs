// scripts/growth-experiment-registry.mjs
// G06 最小增长实验注册表校验器。只校验，不生产实验、不改台账、不碰生产。
//
// 核心纪律（对应 CEO 要求「区分执行成功与经营效果」）：
//   - execution 与 effect 是两套独立状态，禁止用 EXECUTED 代表有效果。
//   - effect=MEASURED 必须给出 metric/value/delta/measuredAt，且与 baseline 等长窗口（禁跨口径相减）。
//   - attribution=CAUSAL 仅在 control.randomized=true 时允许，否则最高 CORRELATIONAL。
//   - change.type=PRODUCTION 且 authorized=true 但无 approvalRef → FAIL（防未授权生产改动被登记为实验）。
//   - taskId 必须存在于现有台账 data/seo-geo-board.json（禁止另建任务体系）。
//
// 退出码：0=PASS | 1=FAIL | 2=UNKNOWN
// 用法：
//   node scripts/growth-experiment-registry.mjs --self-test
//   node scripts/growth-experiment-registry.mjs --validate
//   node scripts/growth-experiment-registry.mjs --list
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXEC_STATES = ['NOT_STARTED', 'RUNNING', 'EXECUTED', 'FAILED', 'BLOCKED'];
const EFFECT_STATES = ['NOT_STARTED', 'PENDING', 'MEASURED', 'UNKNOWN'];
const ATTR = ['CAUSAL', 'CORRELATIONAL', 'UNKNOWN'];
const CHANGE_TYPES = ['PRODUCTION', 'EXISTING_AUTOMATION', 'DRAFT_ONLY', 'DATA_ONLY'];
const CONTROL_TYPES = ['A_B_CONTROL', 'HOLD_OUT', 'CHANNEL_HOLD_OUT', 'PAGE_COHORT', 'NONE'];

const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const nonEmpty = v => typeof v === 'string' && v.trim().length > 0;

export function validateExperiment(e, boardIds) {
  const iss = [];
  const add = (code, field, msg) => iss.push({ code, field, msg });

  if (!e || typeof e !== 'object') { add('E00', '', '实验条目不是对象'); return iss; }
  if (!/^GE-\d{3}$/.test(String(e.id || ''))) add('E01', 'id', 'id 必须形如 GE-001');
  if (!boardIds.has(String(e.taskId || ''))) add('E03', 'taskId', `taskId ${e.taskId} 不在现有台账中（禁止另建任务体系）`);
  for (const f of ['title', 'goal', 'hypothesis']) if (!nonEmpty(e[f])) add('E04', f, `${f} 不能为空`);

  // baseline
  const b = e.baseline || {};
  if (!nonEmpty(b.metric)) add('E05', 'baseline.metric', '缺指标名');
  if (typeof b.value !== 'number' || Number.isNaN(b.value)) add('E05', 'baseline.value', '基线值必须是数字');
  if (!nonEmpty(b.source)) add('E05', 'baseline.source', '缺数据来源');
  if (!nonEmpty(b.capturedAt)) add('E05', 'baseline.capturedAt', '缺采集时点');
  if (!b.window || !nonEmpty(b.window.start) || !nonEmpty(b.window.end)) add('E05', 'baseline.window', '缺基线窗口');
  else {
    const d = days(b.window.start, b.window.end) + 1;
    if (!(b.window.days > 0)) add('E05', 'baseline.window.days', '缺窗口天数');
    else if (d !== b.window.days) add('E05', 'baseline.window', `窗口天数不符：声明 ${b.window.days}，实际 ${d}`);
  }

  // change
  const c = e.change || {};
  if (!CHANGE_TYPES.includes(c.type)) add('E07', 'change.type', `type 非法：${c.type}`);
  if (typeof c.authorized !== 'boolean') add('E07', 'change.authorized', 'authorized 必须是布尔值');
  if (c.type === 'PRODUCTION' && c.authorized === true && !nonEmpty(c.approvalRef)) {
    add('E07', 'change.approvalRef', '生产类实验声明已授权但无 approvalRef（疑似未授权生产改动）');
  }

  // control
  const ctl = e.control || {};
  if (!CONTROL_TYPES.includes(ctl.type)) add('E08', 'control.type', `type 非法：${ctl.type}`);
  if (ctl.type === 'NONE' && !nonEmpty(ctl.description)) add('E08', 'control.description', '无对照必须写明原因与后果');
  if (typeof ctl.randomized !== 'boolean') add('E08', 'control.randomized', '必须显式声明是否随机分配（防把相关当因果）');

  // observation window
  const w = e.observationWindow || {};
  if (!nonEmpty(w.start) || !nonEmpty(w.end)) add('E09', 'observationWindow', '缺观察窗口');
  else {
    const d = days(w.start, w.end) + 1;
    if (d < 7) add('E09', 'observationWindow', `观察窗口仅 ${d} 天，短于 7 天不足以观测`);
    if (d !== w.minDays) add('E09', 'observationWindow.minDays', `minDays 不符：声明 ${w.minDays}，实际 ${d}`);
  }

  // execution
  const x = e.execution || {};
  if (!EXEC_STATES.includes(x.status)) add('E10', 'execution.status', `status 非法：${x.status}`);
  if (x.status === 'EXECUTED' && !nonEmpty(x.evidence)) add('E10', 'execution.evidence', 'EXECUTED 必须附执行证据');
  if (x.status === 'BLOCKED' && !nonEmpty(x.note)) add('E10', 'execution.note', 'BLOCKED 必须写明解阻条件');

  // effect
  const f = e.effect || {};
  if (!EFFECT_STATES.includes(f.status)) add('E11', 'effect.status', `status 非法：${f.status}`);
  if (!ATTR.includes(f.attribution)) add('E13', 'effect.attribution', `attribution 非法：${f.attribution}`);
  if (f.attribution === 'CAUSAL' && ctl.randomized !== true) {
    add('E13', 'effect.attribution', '无随机对照却声明 CAUSAL（相关≠因果）');
  }
  if (f.status === 'MEASURED') {
    if (!nonEmpty(f.metric)) add('E12', 'effect.metric', 'MEASURED 必须给出指标名');
    if (typeof f.value !== 'number') add('E12', 'effect.value', 'MEASURED 必须给出数值');
    if (typeof f.delta !== 'number') add('E12', 'effect.delta', 'MEASURED 必须给出 delta');
    if (!nonEmpty(f.measuredAt)) add('E12', 'effect.measuredAt', 'MEASURED 必须给出测量时点');
    if (!nonEmpty(f.windowDays)) add('E12', 'effect.windowDays', 'MEASURED 必须声明测量窗口天数');
    else if (b.window && b.window.days && Number(f.windowDays) !== Number(b.window.days)) {
      add('E12', 'effect.windowDays', `窗口不等长（基线 ${b.window.days} 天 vs 效果 ${f.windowDays} 天）：禁跨口径相减`);
    }
    if (nonEmpty(f.measuredAt) && nonEmpty(w.end) && Date.parse(f.measuredAt) < Date.parse(w.end)) {
      add('E12', 'effect.measuredAt', '测量时点早于观察窗口结束（提前宣布结果）');
    }
  }
  if (x.status === 'EXECUTED' && f.status === 'NOT_STARTED') {
    add('E14', 'effect.status', '执行已完成但效果未建立观测口径（禁止用执行成功代替经营效果）');
  }
  return iss;
}

export function validateRegistry(reg, boardIds) {
  const issues = [];
  const seen = new Set();
  const list = Array.isArray(reg?.experiments) ? reg.experiments : null;
  if (!list) return [{ code: 'E90', field: 'experiments', msg: '缺少 experiments 数组' }];
  for (const e of list) {
    if (seen.has(e?.id)) issues.push({ code: 'E02', field: 'id', msg: `重复 id ${e.id}` });
    seen.add(e?.id);
    for (const i of validateExperiment(e, boardIds)) issues.push({ ...i, id: e?.id });
  }
  return issues;
}

function loadBoardIds() {
  const b = JSON.parse(readFileSync(join(ROOT, 'data/seo-geo-board.json'), 'utf8'));
  const ids = new Set();
  for (const m of (b.modules || [])) for (const t of (m.tasks || [])) if (t?.id) ids.add(t.id);
  return ids;
}

function selfTest() {
  const boardIds = new Set(['M1-1']);
  const base = () => ({
    id: 'GE-001', taskId: 'M1-1', title: 't', goal: 'g', hypothesis: 'h',
    baseline: { metric: 'm', value: 1, unit: 'u', window: { start: '2026-11-01', end: '2026-11-07', days: 7 }, source: 's', capturedAt: '2026-11-08' },
    change: { type: 'DATA_ONLY', authorized: true, description: 'd', productionTouched: false },
    control: { type: 'HOLD_OUT', description: 'c', randomized: false },
    observationWindow: { start: '2026-11-10', end: '2026-11-16', minDays: 7 },
    execution: { status: 'RUNNING', evidence: '', note: '' },
    effect: { status: 'PENDING', attribution: 'UNKNOWN', metric: null, value: null, delta: null, measuredAt: null },
  });
  const codes = (e) => validateExperiment(e, boardIds).map(i => i.code);
  const cases = [
    ['合法实验通过', codes(base()).length === 0],
    ['未知 taskId 报 E03', codes({ ...base(), taskId: 'X-9' }).includes('E03')],
    ['生产改动无授权引用报 E07', codes({ ...base(), change: { type: 'PRODUCTION', authorized: true, description: 'd' } }).includes('E07')],
    ['无随机对照声明因果报 E13', codes({ ...base(), effect: { ...base().effect, attribution: 'CAUSAL' } }).includes('E13')],
    ['窗口天数造假报 E05', codes({ ...base(), baseline: { ...base().baseline, window: { start: '2026-11-01', end: '2026-11-14', days: 7 } } }).includes('E05')],
    ['MEASURED 缺 delta 报 E12', codes({ ...base(), effect: { status: 'MEASURED', attribution: 'UNKNOWN', metric: 'm', value: 2, measuredAt: '2026-11-20', windowDays: 7 } }).includes('E12')],
    ['跨口径窗口报 E12', codes({ ...base(), effect: { status: 'MEASURED', attribution: 'UNKNOWN', metric: 'm', value: 2, delta: 1, measuredAt: '2026-11-20', windowDays: 14 } }).includes('E12')],
    ['执行完成但效果未启动报 E14', codes({ ...base(), execution: { status: 'EXECUTED', evidence: 'log' }, effect: { ...base().effect, status: 'NOT_STARTED' } }).includes('E14')],    ['观察窗口过短报 E09', codes({ ...base(), observationWindow: { start: '2026-11-10', end: '2026-11-12', minDays: 3 } }).some(c => c === 'E09')],
  ];
  const fails = cases.filter(([, v]) => !v).map(([n]) => n);
  if (fails.length) { console.error('SELFTEST UNKNOWN: 判据自检失败 →', fails.join(' / ')); process.exit(2); }
  console.log(`SELFTEST PASS: ${cases.length} 用例（合法/未知taskId/未授权生产/伪因果/窗口造假/缺delta/跨口径/执行≠效果/窗口过短）全部符合预期`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) selfTest();

const file = (() => { const i = args.indexOf('--file'); return i >= 0 ? args[i + 1] : 'data/growth-experiments.json'; })();
let reg, boardIds;
try {
  reg = JSON.parse(readFileSync(join(ROOT, file), 'utf8'));
  boardIds = loadBoardIds();
} catch (e) {
  console.error('UNKNOWN: 无法读取注册表或台账 →', String(e?.message || e).slice(0, 200));
  process.exit(2);
}

if (args.includes('--list')) {
  for (const e of (reg.experiments || [])) {
    console.log(`${e.id} | task=${e.taskId} | ${e.type} | exec=${e.execution?.status} | effect=${e.effect?.status}/${e.effect?.attribution} | ${e.title}`);
  }
  process.exit(0);
}

const issues = validateRegistry(reg, boardIds);
const n = (reg.experiments || []).length;
if (issues.length) {
  for (const i of issues) console.error(`FAIL ${i.code} ${i.id || ''} ${i.field}: ${i.msg}`);
  console.error(`\nSUMMARY: ${n} 个实验，${issues.length} 项不合格`);
  process.exit(1);
}
const exec = {};
for (const e of reg.experiments) exec[e.execution.status] = (exec[e.execution.status] || 0) + 1;
const eff = {};
for (const e of reg.experiments) eff[e.effect.status] = (eff[e.effect.status] || 0) + 1;
console.log(`PASS: ${n} 个实验全部合格 | execution=${JSON.stringify(exec)} | effect=${JSON.stringify(eff)}`);
console.log('提醒：execution 与 effect 独立，EXECUTED 不构成经营效果。');
process.exit(0);
