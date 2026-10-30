#!/usr/bin/env node
// scripts/topic-portfolio-measure.mjs
// M11-4/M11-5 测量薄封装（不改 geo/geo-exposure-probe.py）：
//   1. prompt 哈希锁：sha256(question) 与 data/topic-portfolio-measurement.json 存量比对，漂移 exit 2（fail-closed）
//   2. 统一编排 probe（Gemini+ChatGPT）+ brave（Brave，独立子命令/key）两个子命令
//   3. 运行前后归档 geo/exposure-report*（输出路径硬编码，防覆盖丢失）
//   4. 解析 CSV → 追加 data/topic-portfolio-measurement.json（append-only 时序）
//
// 用法：
//   node scripts/topic-portfolio-measure.mjs --phase R_pre [--demo] [--skip-brave]
// 退出码：0 成功 | 1 子进程失败 | 2 哈希漂移(fail-closed) | 3 输入/参数错误
// 环境：PYTHON_CMD（默认 python）；真实运行需 geo/.env 的 GEMINI_API_KEY/OPENAI_API_KEY/BRAVE_API_KEY
// 注意：probe 的 CSV 无引号转义，question 含逗号时会多列 —— 解析从右向左固定 7 列。
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SEED = path.join(ROOT, 'geo', 'topic-portfolio-questions.json');
const MEAS = path.join(ROOT, 'data', 'topic-portfolio-measurement.json');
const ARCHIVE = path.join(ROOT, 'geo', 'archive');
const PY = process.env.PYTHON_CMD || 'python';
const REPORTS = ['exposure-report.md', 'exposure-report.csv', 'exposure-report-brave.md', 'exposure-report-brave.csv'];

const args = process.argv.slice(2);
const demo = args.includes('--demo');
const skipBrave = args.includes('--skip-brave');
const phaseArg = args.indexOf('--phase');
const PHASE = phaseArg >= 0 ? args[phaseArg + 1] : 'R_pre';
if (!['R_pre', 'R_post'].includes(PHASE)) {
  console.error(`[FAIL] --phase 必须是 R_pre|R_post，收到：${PHASE}`);
  process.exit(3);
}
const runDate = new Date().toISOString().slice(0, 10);

// ---------- 1. 输入 ----------
if (!existsSync(SEED) || !existsSync(MEAS)) {
  console.error('[FAIL] seed 或 measurement 文件缺失');
  process.exit(3);
}
const seed = JSON.parse(readFileSync(SEED, 'utf8'));
const meas = JSON.parse(readFileSync(MEAS, 'utf8'));
if (!Array.isArray(seed) || !seed.length) {
  console.error('[FAIL] seed 必须是顶层数组（probe 的 json.load+for 迭代要求）');
  process.exit(3);
}

// ---------- 2. 哈希锁（fail-closed） ----------
const sha = (s) => 'sha256:' + createHash('sha256').update(s, 'utf8').digest('hex');
const problems = [];
for (const q of seed) {
  const rec = meas.queries.find((m) => m.seedId === q.id && m.query === q.question);
  if (!rec) { problems.push(`seed ${q.id} "${q.question}" 在 measurement 中无对应记录`); continue; }
  const h = sha(q.question);
  if (rec.promptHash && rec.promptHash !== h) {
    problems.push(`seed ${q.id} "${q.question}" 哈希漂移：${rec.promptHash} → ${h}`);
  }
}
if (problems.length) {
  console.error('[FAIL-CLOSED] prompt 哈希漂移/记录缺失，拒绝测量：\n' + problems.join('\n'));
  process.exit(2);
}
// 首次运行：锁入哈希
for (const q of seed) {
  const rec = meas.queries.find((m) => m.seedId === q.id);
  rec.promptHash = sha(q.question);
}

// ---------- 3. 运行前归档（防覆盖既有报告） ----------
mkdirSync(ARCHIVE, { recursive: true });
for (const f of REPORTS) {
  const p = path.join(ROOT, 'geo', f);
  if (existsSync(p)) copyFileSync(p, path.join(ARCHIVE, `pre-${runDate}-${f}`));
}

// ---------- 4. 编排子命令 ----------
// brave 是否真的在本轮运行（防止误解析上一轮的陈旧 brave CSV）
let braveRan = false;
function runSub(sub, extra = []) {
  return spawnSync(PY, ['geo/geo-exposure-probe.py', sub, 'geo/topic-portfolio-questions.json', ...extra],
    { cwd: ROOT, encoding: 'utf8' });
}
const probeRun = runSub('probe', demo ? ['--demo'] : []);
if (probeRun.error || probeRun.status !== 0) {
  console.error(`[FAIL] probe 子进程失败（status=${probeRun.status}）`,
    probeRun.error?.message || '', (probeRun.stderr || '').slice(-600));
  process.exit(1);
}
console.log('[probe]', (probeRun.stdout || '').trim().split('\n').pop());
// 子进程 stderr 含 [warn]/[429] 等证据，成功时也必须浮出（禁静默吞证据）
if ((probeRun.stderr || '').trim()) {
  console.warn('[probe:stderr]', probeRun.stderr.trim().split('\n').slice(-8).join('\n'));
}

let braveFailed = null;
if (!skipBrave && !demo) {
  const braveRun = runSub('brave');
  braveRan = true;
  if (braveRun.error || braveRun.status !== 0) {
    braveFailed = (braveRun.stderr || braveRun.error?.message || '').slice(-300);
    console.warn('[WARN] brave 子进程失败，仅采 probe 引擎结果：', braveFailed);
  } else {
    console.log('[brave]', (braveRun.stdout || '').trim().split('\n').pop());
  }
}

// ---------- 5. 解析 CSV（从右向左固定 7 列，兼容 question 含逗号） ----------
function parseRows(csvPath) {
  if (!existsSync(csvPath)) return [];
  const lines = readFileSync(csvPath, 'utf8').split('\n').filter((l) => l.trim());
  const rows = [];
  for (const line of lines.slice(1)) {
    const p = line.split(',');
    if (p.length < 7) continue;
    const row = {
      engine: p[0],
      question: p.slice(1, p.length - 5).join(','),
      intent: p[p.length - 5],
      target_slug: p[p.length - 4],
      domain: p[p.length - 3],
      url: p[p.length - 2],
      // Python 写出的是 True/False（首字母大写），必须大小写不敏感比较
      is_bookconv: p[p.length - 1].trim().toLowerCase() === 'true',
    };
    rows.push(row);
  }
  return rows;
}
const probeRows = parseRows(path.join(ROOT, 'geo', 'exposure-report.csv'));
const braveRows = braveRan && !braveFailed ? parseRows(path.join(ROOT, 'geo', 'exposure-report-brave.csv')) : [];
const allRows = [...probeRows, ...braveRows];
const engines = [...new Set(allRows.map((r) => r.engine))];

// ---------- 6. 追加测量（append-only；DEMO 模式不写真实时序库，no fake data） ----------
let appended = 0;
for (const q of seed) {
  const rec = meas.queries.find((m) => m.seedId === q.id);
  for (const engine of engines) {
    const rows = allRows.filter((r) => r.engine === engine && r.question === q.question);
    const hit = rows.find((r) => r.is_bookconv);
    // 同日去重守卫：防止重复运行污染 append-only 账本（红队审计 M11-5 发现双跑追加 11 条重复 Brave）
    if (rec.measurements.some((m) => m.date === runDate && m.phase === PHASE && m.engine === engine)) {
      console.warn(`[skip] 同日重复跳过 ${q.id}/${engine}/${runDate}`);
      continue;
    }
    rec.measurements.push({
      date: runDate,
      phase: PHASE,
      engine,
      cited: Boolean(hit),
      citedUrl: hit ? hit.url : null,
      resultRows: rows.length,
      demo,
      promptHash: rec.promptHash,
    });
    appended += 1;
  }
}
meas.generatedAt = new Date().toISOString().slice(0, 10);
if (!demo) writeFileSync(MEAS, JSON.stringify(meas, null, 2) + '\n');

// ---------- 7. 汇报 ----------
const citedAny = meas.queries.filter((m) => m.measurements.some((x) => x.cited));
console.log(`[done] phase=${PHASE}${demo ? ' (DEMO)' : ''} engines=[${engines.join(',') || '无'}] `
  + `追加 ${appended} 条快照；当前 cited=true 的词：${citedAny.map((m) => m.id).join(',') || '无（delta=0 如实记录）'}`);
console.log(`[archive] 运行前报告已归档至 geo/archive/pre-${runDate}-*；本轮报告 geo/exposure-report*`);
if (demo) console.log('[demo] DEMO 数据不充当 R_pre；正式采集请去掉 --demo');
process.exit(0);
