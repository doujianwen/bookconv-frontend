// scripts/growth-task-idempotency.mjs
// R3/R6 任务生命周期 + 去重幂等门禁 + 运行锁（G07）
//
// 三段能力（同一个文件，不新建调度器）：
//   1) 台账唯一性：board 内任务 id 不得重复            --board
//   2) 同日执行幂等：同一 taskId@date 只允许一个执行事件  --events --date
//   3) 运行锁：任务级 acquire/release，处理重复触发、超时接管、失败重试、UNKNOWN  --lock-*
//
// 设计纪律：
//  - 不写回 board JSON；锁状态只写 data/growth-run-state.json（本地运行态，非生产数据）。
//  - 幂等键沿用 existing 体系：taskId@date。
//  - 三态 + 一个专门的「跳过」码：PASS/FAIL/UNKNOWN，SKIP=3 表示重复触发被安全吸收（非故障）。
//  - 超时不是 PASS：锁超过 TTL 未释放 → 旧尝试标 UNKNOWN(timeout)，允许新尝试接管并计 attempts。
//  - 「机会不足不生成任务」：本门禁只校验不生产，空任务集合法。
//
// 退出码：0=PASS/ACQUIRED/RETRY | 1=FAIL | 2=UNKNOWN | 3=SKIP(重复或已完成，安全无操作)
// 用法：
//   node scripts/growth-task-idempotency.mjs --self-test
//   node scripts/growth-task-idempotency.mjs --board data/seo-geo-board.json
//   node scripts/growth-task-idempotency.mjs --lock-acquire --run-key "M1-1@2026-11-17" --ttl-min 90
//   node scripts/growth-task-idempotency.mjs --lock-release --run-key "M1-1@2026-11-17" --status success
//   node scripts/growth-task-idempotency.mjs --lock-status
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_STATE = join(ROOT, 'data', 'growth-run-state.json');

export function extractIds(board) {
  const ids = [];
  for (const m of (Array.isArray(board?.modules) ? board.modules : [])) {
    for (const t of (Array.isArray(m?.tasks) ? m.tasks : [])) {
      if (t && typeof t.id === 'string') ids.push(t.id);
    }
  }
  return ids;
}

export function findDuplicates(ids) {
  const seen = new Set(), dup = new Set();
  for (const id of ids) { if (seen.has(id)) dup.add(id); seen.add(id); }
  return [...dup];
}

// 幂等键：taskId + date。同一 task 同一 date 最多一个执行事件。
export function idemKey(taskId, date) { return `${taskId}@${date}`; }

export function findSameDayDup(events, date) {
  const keys = (Array.isArray(events) ? events : [])
    .filter(e => e && e.date === date && e.taskId)
    .map(e => idemKey(e.taskId, e.date));
  return findDuplicates(keys);
}

// ---------- 运行锁纯函数（可单测，不碰 IO）----------
export const LOCK_STATES = ['RUNNING', 'SUCCESS', 'FAILED', 'UNKNOWN'];

/**
 * 决定一次 acquire 的处置。
 * @param {object|null} rec 现有锁记录
 * @param {number} nowMs
 * @param {number} ttlMin
 * @returns {{action:'ACQUIRE'|'RETRY'|'SKIP_DUPLICATE'|'SKIP_DONE', reason:string, prevStatus?:string}}
 */
export function decideAcquire(rec, nowMs, ttlMin) {
  if (!rec || !rec.state) return { action: 'ACQUIRE', reason: '无历史记录' };
  if (rec.state === 'SUCCESS') return { action: 'SKIP_DONE', reason: '该 run-key 已成功完成（幂等吸收）', prevStatus: 'SUCCESS' };
  if (rec.state === 'RUNNING') {
    const ageMin = (nowMs - Number(rec.heartbeatAt || rec.startedAt || 0)) / 60000;
    if (ageMin < ttlMin) return { action: 'SKIP_DUPLICATE', reason: `同键运行中（${ageMin.toFixed(1)}min < TTL ${ttlMin}min）`, prevStatus: 'RUNNING' };
    return { action: 'ACQUIRE', reason: `检测到超时锁（${ageMin.toFixed(1)}min >= TTL ${ttlMin}min），旧尝试标 UNKNOWN 后接管`, prevStatus: 'RUNNING_TIMEOUT' };
  }
  if (rec.state === 'FAILED') return { action: 'RETRY', reason: '上次失败，允许重试', prevStatus: 'FAILED' };
  if (rec.state === 'UNKNOWN') return { action: 'RETRY', reason: '上次状态未定，允许重试', prevStatus: 'UNKNOWN' };
  return { action: 'ACQUIRE', reason: '未知状态，按新尝试处理', prevStatus: rec.state };
}

function readState(file) {
  if (!existsSync(file)) return { version: 1, runs: {} };
  const raw = readFileSync(file, 'utf8');
  const s = JSON.parse(raw);
  if (!s || typeof s !== 'object' || typeof s.runs !== 'object' || s.runs === null) throw new Error('state schema invalid');
  return s;
}

function writeState(file, state) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function selfTest() {
  const cases = [
    ['唯一 id 通过', findDuplicates(['M1-1','M1-2','M2-1']).length === 0],
    ['重复 id 检出', JSON.stringify(findDuplicates(['M1-1','M1-1','M2-1'])) === JSON.stringify(['M1-1'])],
    ['空集合法', findDuplicates([]).length === 0],
    ['同日重复执行检出', findSameDayDup([{taskId:'M1-1',date:'2026-11-16'},{taskId:'M1-1',date:'2026-11-16'}], '2026-11-16').length === 1],
    ['跨日执行不重复', findSameDayDup([{taskId:'M1-1',date:'2026-11-15'},{taskId:'M1-1',date:'2026-11-16'}], '2026-11-16').length === 0],
    ['锁-无记录应获取', decideAcquire(null, 1000, 90).action === 'ACQUIRE'],
    ['锁-运行中未超时应跳过', decideAcquire({state:'RUNNING', startedAt: 1000, heartbeatAt: 1000}, 1000 + 10*60000, 90).action === 'SKIP_DUPLICATE'],
    ['锁-运行中已超时应接管', decideAcquire({state:'RUNNING', startedAt: 1000, heartbeatAt: 1000}, 1000 + 120*60000, 90).action === 'ACQUIRE'],
    ['锁-已成功应跳过', decideAcquire({state:'SUCCESS'}, 1000, 90).action === 'SKIP_DONE'],
    ['锁-失败应允许重试', decideAcquire({state:'FAILED'}, 1000, 90).action === 'RETRY'],
    ['锁-UNKNOWN 应允许重试', decideAcquire({state:'UNKNOWN'}, 1000, 90).action === 'RETRY'],
  ];
  const fails = cases.filter(([,v]) => !v).map(([n]) => n);
  if (fails.length) { console.error('SELFTEST UNKNOWN: 判据自检失败 →', fails.join(' / ')); process.exit(2); }
  console.log(`SELFTEST PASS: ${cases.length} 用例（台账唯一 / 同日重复 / 跨日 / 空集 / 锁 6 态）全部符合预期`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) selfTest();

const argVal = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const stateFile = argVal('--state-file', DEFAULT_STATE);

// ---------- 运行锁模式 ----------
const isLock = args.includes('--lock-acquire') || args.includes('--lock-release') || args.includes('--lock-status');
if (isLock) {
  let state;
  try { state = readState(stateFile); }
  catch (e) { console.error('UNKNOWN: 锁状态文件不可解析 →', String(e?.message||e).slice(0,160), '|', stateFile); process.exit(2); }

  if (args.includes('--lock-status')) {
    const key = argVal('--run-key', '');
    const runs = state.runs || {};
    const view = key ? { [key]: runs[key] ?? null } : runs;
    const n = Object.keys(view).length;
    if (n === 0) { console.error('UNKNOWN: 无运行记录（未接线或首次运行）'); console.log(JSON.stringify({ version: state.version, runs: {} }, null, 2)); process.exit(2); }
    console.log(JSON.stringify({ version: state.version, runs: view }, null, 2));
    process.exit(0);
  }

  const key = argVal('--run-key', '');
  if (!key) { console.error('UNKNOWN: 缺少 --run-key（约定格式 taskId@YYYY-MM-DD）'); process.exit(2); }
  const now = Date.now();

  if (args.includes('--lock-acquire')) {
    const ttlMin = Number(argVal('--ttl-min', '90'));
    if (!Number.isFinite(ttlMin) || ttlMin <= 0) { console.error('UNKNOWN: --ttl-min 必须为正数'); process.exit(2); }
    const rec = state.runs[key] ?? null;
    const d = decideAcquire(rec, now, ttlMin);
    state.runs[key] = state.runs[key] || { key, attempts: 0, history: [] };
    const entry = state.runs[key];

    if (d.action === 'SKIP_DUPLICATE' || d.action === 'SKIP_DONE') {
      console.log(`SKIP(${d.action}): ${key} — ${d.reason}；不重复执行，退出码 3`);
      process.exit(3);
    }

    entry.attempts = Number(entry.attempts || 0) + 1;
    if (d.prevStatus === 'RUNNING_TIMEOUT') {
      entry.history.push({ at: new Date(now).toISOString(), event: 'TIMEOUT_TAKEOVER', prevState: 'RUNNING', note: d.reason });
    }
    entry.state = 'RUNNING';
    entry.pid = process.pid;
    entry.ttlMin = ttlMin;
    entry.endedAt = null;
    entry.startedAt = entry.startedAt && d.action === 'RETRY' ? entry.startedAt : now;
    entry.heartbeatAt = now;
    entry.lastReason = d.reason;
    entry.history.push({ at: new Date(now).toISOString(), event: d.action, attempt: entry.attempts, reason: d.reason });
    writeState(stateFile, state);
    console.log(`${d.action}: ${key} (attempt=${entry.attempts}, ttl=${ttlMin}min) — ${d.reason}`);
    process.exit(0);
  }

  // --lock-release
  const status = String(argVal('--status', '')).toLowerCase();
  const map = { success: 'SUCCESS', failed: 'FAILED', unknown: 'UNKNOWN' };
  if (!map[status]) { console.error('UNKNOWN: --status 必须是 success|failed|unknown'); process.exit(2); }
  const entry = state.runs[key];
  if (!entry) { console.error(`FAIL: 未持有锁 ${key}，拒绝写入结果（防止无锁状态下伪造完成）`); process.exit(1); }
  if (entry.state === 'SUCCESS') { console.log(`SKIP: ${key} 已是 SUCCESS，重复释放被吸收`); process.exit(3); }
  entry.state = map[status];
  entry.endedAt = now;
  entry.heartbeatAt = now;
  entry.lastReason = argVal('--note', '');
  entry.history.push({ at: new Date(now).toISOString(), event: 'RELEASE_' + map[status], note: entry.lastReason });
  writeState(stateFile, state);
  console.log(`RELEASED: ${key} → ${map[status]}`);
  process.exit(0);
}

// ---------- 台账模式 ----------
let board;
try {
  board = JSON.parse(readFileSync(join(ROOT, argVal('--board', 'data/seo-geo-board.json')), 'utf8'));
} catch (e) {
  console.error('UNKNOWN: 无法读取/解析 board →', String(e?.message || e).slice(0, 200));
  process.exit(2);
}
const ids = extractIds(board);
const dup = findDuplicates(ids);
console.log(`GATE: board 任务 ${ids.length} 条，唯一 id ${new Set(ids).size} 个，重复 ${dup.length} 个`);
if (dup.length) { console.error('FAIL: 重复任务 id →', dup.join(', ')); process.exit(1); }

// 可选：同日执行事件幂等校验（事件日志缺失时明确标 UNKNOWN，不 fallthrough 到 PASS）
const eventsPath = args.includes('--events') ? argVal('--events', '') : null;
const date = argVal('--date', '');
if (eventsPath) {
  let events;
  try { events = JSON.parse(readFileSync(join(ROOT, eventsPath), 'utf8')); }
  catch (e) { console.error('UNKNOWN: 无法读取事件日志 →', String(e?.message||e).slice(0,160)); process.exit(2); }
  if (!date) { console.error('UNKNOWN: --events 需同时提供 --date'); process.exit(2); }
  const sd = findSameDayDup(events, date);
  if (sd.length) { console.error(`FAIL: ${date} 同日重复执行 → ${sd.join(', ')}`); process.exit(1); }
  console.log(`GATE: ${date} 执行事件幂等通过（${(events||[]).filter(e=>e&&e.date===date).length} 条，无同日重复）`);
}
console.log('PASS: 任务 id 唯一' + (eventsPath ? ' 且执行事件幂等' : '（未提供事件日志，幂等维度=NOT_CHECKED）'));
process.exit(0);
