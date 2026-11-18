// scripts/growth-daily-entry.mjs
// G07 唯一经营执行入口（single entry，不是调度器：不含定时，只负责「今天这一次」）
//
// 职责：
//   1) 加任务级运行锁（幂等键 daily-ops@YYYY-MM-DD），重复触发安全退出 3；
//   2) 按固定顺序跑既有门禁（复用，不复制逻辑）：数据新鲜度 → 机会资格 → 台账唯一 → 实验注册表 → GEO 可比性 → 内容完整性；
//   3) 落运行记录 _wb_tmp/growth-daily-run-<date>.json（每步真实退出码）；
//   4) 释放锁并写入终态 SUCCESS/FAILED/UNKNOWN。
//
// 边界：
//   - 不改生产、不 push、不发外链、不生成任务；只采集/校验/打分。
//   - 任一步 FAIL → 整体 FAILED（exit 1）；任一步 UNKNOWN（exit 2）且无 FAIL → 整体 UNKNOWN（exit 2）。
//   - 锁被占用 → exit 3（不执行任何步骤）。这是「防双跑」的工程点。
//
// 退出码：0=SUCCESS | 1=FAILED | 2=UNKNOWN | 3=SKIP(重复触发)
// 用法：
//   node scripts/growth-daily-entry.mjs                 # 今天
//   node scripts/growth-daily-entry.mjs --date 2026-11-17 --ttl-min 120
//   node scripts/growth-daily-entry.mjs --dry-run       # 只跑门禁，不写状态文件
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argVal = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };

const tz = 8 * 3600 * 1000;
const today = new Date(Date.now() + tz).toISOString().slice(0, 10);
const date = argVal('--date', today);
const ttl = argVal('--ttl-min', '120');
const dryRun = args.includes('--dry-run');
const STATE = join(ROOT, argVal('--state-file', '_wb_tmp/growth-run-state.json'));
const runKey = `daily-ops@${date}`;

function run(script, extra = []) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [join(ROOT, script), ...extra], { cwd: ROOT, encoding: 'utf8' });
  const code = r.status === null ? 2 : r.status;
  const out = `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n');
  return { step: script, args: extra.join(' '), exit: code, ms: Date.now() - t0, tail: out.slice(-2).join(' | ').slice(0, 300) };
}

if (!dryRun) {
  const acq = run('scripts/growth-task-idempotency.mjs', ['--lock-acquire', '--run-key', runKey, '--ttl-min', ttl, '--state-file', STATE]);
  if (acq.exit === 3) {
    console.log(`SKIP: ${runKey} 已在运行或今日已完成 —— 重复触发被吸收，不执行任何步骤`);
    console.log(acq.tail);
    process.exit(3);
  }
  if (acq.exit !== 0) {
    console.error('UNKNOWN: 无法获取运行锁，拒绝在无锁状态下执行');
    console.error(acq.tail);
    process.exit(2);
  }
  console.log(acq.tail);
}

// 数据新鲜度（本地文件时点，不联网）
function ageHours(path) {
  if (!existsSync(path)) return null;
  return (Date.now() - statSync(path).mtimeMs) / 3600000;
}
const fresh = [];
const ga4Age = ageHours(join(ROOT, '_wb_tmp/ga4-fetch-status.json'));
fresh.push({ name: 'ga4-fetch-status', ageH: ga4Age == null ? null : +ga4Age.toFixed(1), limitH: 24, ok: ga4Age != null && ga4Age <= 24 });
try {
  const k = JSON.parse(readFileSync(join(ROOT, 'data/keyword-series.json'), 'utf8'));
  const kh = (Date.now() - Date.parse(k.generatedAt)) / 3600000;
  fresh.push({ name: 'keyword-series', ageH: +kh.toFixed(1), limitH: 72, ok: kh <= 72 });
} catch { fresh.push({ name: 'keyword-series', ageH: null, limitH: 72, ok: false }); }

const steps = [
  run('scripts/growth-opportunity-gate.mjs', ['--source', 'data/topic-portfolio-opportunities.json']),
  run('scripts/growth-task-idempotency.mjs', ['--board', 'data/seo-geo-board.json']),
  run('scripts/growth-experiment-registry.mjs', ['--validate']),
  run('scripts/geo-comparability-guard.mjs', ['--self-test']),
  run('scripts/audit-content-integrity.mjs', []),
];

const freshFail = fresh.filter(f => !f.ok);
const anyFail = steps.some(s => s.exit === 1) || freshFail.length > 0;
const anyUnknown = steps.some(s => s.exit === 2) || fresh.some(f => f.ageH == null);
const status = anyFail ? 'FAILED' : (anyUnknown ? 'UNKNOWN' : 'SUCCESS');

const record = {
  runKey, date, at: new Date().toISOString(), status,
  freshness: fresh, steps,
  note: '只读校验与打分；未改生产、未发布、未提交外链、未生成任务。'
};
mkdirSync(join(ROOT, '_wb_tmp'), { recursive: true });
const recPath = join(ROOT, `_wb_tmp/growth-daily-run-${date}.json`);
if (!dryRun) writeFileSync(recPath, JSON.stringify(record, null, 2) + '\n', 'utf8');

for (const f of fresh) console.log(`${f.ok ? 'PASS' : (f.ageH == null ? 'UNKNOWN' : 'FAIL')}  新鲜度 ${f.name} age=${f.ageH}h limit=${f.limitH}h`);
for (const s of steps) console.log(`${s.exit === 0 ? 'PASS' : (s.exit === 1 ? 'FAIL' : 'UNKNOWN')}  ${s.step} (exit=${s.exit}, ${s.ms}ms) ${s.tail}`);
console.log(`\nDAILY-ENTRY ${status} @ ${date}${dryRun ? ' (dry-run, 未写状态)' : ' → ' + recPath}`);

if (!dryRun) {
  const rel = run('scripts/growth-task-idempotency.mjs', ['--lock-release', '--run-key', runKey,
    '--status', status === 'SUCCESS' ? 'success' : (status === 'FAILED' ? 'failed' : 'unknown'),
    '--note', `steps_fail=${steps.filter(s => s.exit === 1).length} steps_unknown=${steps.filter(s => s.exit === 2).length}`,
    '--state-file', STATE]);
  console.log(rel.tail);
}
process.exit(status === 'SUCCESS' ? 0 : (status === 'FAILED' ? 1 : 2));
