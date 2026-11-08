// scripts/board-daily-scan.mjs
// 作战板每日扫描：今日到期 / 逾期 / 未来7天将到期 → 飞书推送。
// 飞书发送逻辑与 scripts/ga-inspection.mjs 的 sendFeishu 保持同一纪律
// （getWebhook 优先级一致、JSON code 判定、3 次退避重试、恒 exit 0、
//  消息必须含 [bookconv] 关键词否则被机器人拦截 code 19024）。
// 纪律来源：docs/feishu-alert-sop-v1.md。stdout 是权威结论。
// 2026-11-08 增补：②-b statusNote 状态语义抑制（用户暂停 / 待用户动作 移出三组清单、
//   进独立备案区）。注意：作废/顺延不在此列——其裁定在逐日计划文档，须回写 board 才生效。
//   `--dry-run` 仅生成正文不发飞书（环境变量会被子进程继承，故不用 env），供回归验证。
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── ① 日期（用 Date 对象算，禁手算）──
const now = new Date();
const iso = (d) => d.toISOString().slice(0, 10); // due 是 YYYY-MM-DD，UTC 口径与写入侧一致
const today = iso(now);


// ── ② 读板 ──
const data = JSON.parse(readFileSync(join(ROOT, 'data/seo-geo-board.json'), 'utf8'));
const OPEN = new Set(['todo', 'doing', 'blocked']);
const PW = { P0: 0, P1: 1, P2: 2, P3: 3 };

// ── ②-b 状态语义抑制（2026-11-08 增补，同日独立复核后加固）──
// 问题：晨报只看 status/due，把「用户主动暂停 / 等用户付费动作」的任务照常算进逾期，
//   制造并不存在的执行信号。依据：docs/作战板到期逾期任务逐项处置_2026-11-08.md
// 纪律：
//   ① 判据只认「明文否定执行信号」的措辞 + 可选结构化字段，禁硬编码任务 ID；
//   ② 以「最后一条状态」为准：本仓 statusNote 是累加日志，后写的「已恢复/已解阻」
//      必须能解除抑制，否则任务恢复后会永久退出晨报（复核 P1-1，方向相反的同类缺陷）；
//   ③ 抑制 ≠ 静默丢弃：统一进【已抑制】区块，信息不丢失；
//   ④ 结构化字段为权威：executionSignal:true / stateTag:active 可强制解除，供 board 回写；
//   ⑤ 标签「排程取代」当前全板命中 0 —— 作废/顺延的裁定在逐日执行计划文档、不在 board，
//      须先回写 data/seo-geo-board.json 才生效；不要据此认为「已作废」类已被覆盖。
const ACTIVE_TAGS = new Set(['active', 'resumed', 'running', 'todo', 'doing']);
const NO_SIGNAL_TAGS = new Set(['paused', 'superseded', 'void', 'waiting-user', 'user-paused']);
const SUPPRESSION_RULES = [
  { tag: '用户暂停',    re: /不再构成执行信号/ },
  // 泛化覆盖「用户主动暂停 / 用户决定：社媒先暂停 / 本项用户暂停」；
  // lookbehind 挡住两类否定：否定式「本次不暂停」，以及「撤销/解除/取消 + 暂停」这个组合
  // ——中文无词边界，`用户…暂停` 会把「用户决定撤销暂停」整句吃掉，必须在「暂停」前设守卫。
  { tag: '用户暂停',    re: /用户[^。；\n]{0,10}(?<![不未])(?<!(?:撤销|解除|取消))暂停/ },
  { tag: '用户暂停',    re: /付费决策挂起/ },
  { tag: '待用户动作',  re: /暂不充值/ },
  { tag: '待用户动作',  re: /等(?:待)?充值窗口重开/ },
  { tag: '排程取代',    re: /禁据旧表派工/ },
];
// 解除抑制：接受自然写法（恢复发布 / 解阻，继续推进 / 充值完成 / 已付费开通 / Tier 已达标），
// 但用 `(?!时)` 挡住条件句「恢复发布时转 todo」「解阻时两项一起动」——M4-3 / M11-9 原文正含此措辞。
// 取向说明：宁可「过度解除」（任务重新被催，可见可纠正），不可「过度抑制」（静默消失）。
const RELEASE_RE = /(?:恢复发布|恢复执行|恢复任务|恢复为|解阻|解除(?:暂停|阻塞|限制)|撤销(?:暂停|该决定|本决定|上述决定)?|充值完成|已充值|已付费|付费开通|已升级|升级Tier|Tier\s*已达标)(?!时)/;
const lower = (s) => String(s ?? '').trim().toLowerCase();

// 取某正则在文本中最后一次出现的下标（用于「以最后一条状态为准」）
function lastMatchIndex(note, re) {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let m, last = -1;
  while ((m = g.exec(note)) !== null) { last = m.index; if (m[0].length === 0) g.lastIndex++; }
  return last;
}

function suppressionOf(t) {
  // ① 结构化字段为权威：可抑制，也可强制解除（board 回写后即生效，无需再改脚本）
  if (t.executionSignal === true) return null;
  if (typeof t.stateTag === 'string') {
    const tag = lower(t.stateTag);
    if (ACTIVE_TAGS.has(tag)) return null;
    if (NO_SIGNAL_TAGS.has(tag)) return `状态标签：${t.stateTag}`;
  }
  if (t.executionSignal === false) return '显式标记：非执行信号';
  // ② statusNote 明文语义：以最后一次出现为准（累加日志，后写的状态覆盖前面的）
  const note = typeof t.statusNote === 'string' ? t.statusNote : '';
  if (!note) return null;
  let supIdx = -1, supTag = null;
  for (const r of SUPPRESSION_RULES) {
    const i = lastMatchIndex(note, r.re);
    if (i > supIdx) { supIdx = i; supTag = r.tag; }
  }
  if (supIdx < 0) return null;
  if (lastMatchIndex(note, RELEASE_RE) > supIdx) return null; // 之后已有恢复记录 → 以最后状态为准
  return supTag;
}

const rows = [];
const suppressed = [];
for (const m of data.modules ?? []) {
  for (const t of m.tasks ?? []) {
    if (!OPEN.has(t.status) || !t.due) continue;
    const diffDays = Math.round((new Date(t.due + 'T00:00:00Z') - new Date(today + 'T00:00:00Z')) / 86400000);
    if (!(diffDays <= 7)) continue; // 含 NaN 守卫，与原行为一致（非日期 due 不进窗口）
    const why = suppressionOf(t);
    if (why) suppressed.push({ ...t, module: m.name, diffDays, why });
    else rows.push({ ...t, module: m.name, diffDays });
  }
}
const byPriority = (a, b) => (PW[a.priority] ?? 9) - (PW[b.priority] ?? 9) || a.diffDays - b.diffDays;
rows.sort(byPriority);
suppressed.sort(byPriority);

const overdue = rows.filter(r => r.diffDays < 0);
const dueToday = rows.filter(r => r.diffDays === 0);
const soon = rows.filter(r => r.diffDays > 0);

const fmt = (r) => `[${r.priority}][${r.id}] ${r.action}（${r.module}）${
  r.diffDays < 0 ? `｜逾期${-r.diffDays}天` : r.diffDays === 0 ? '｜今日到期' : `｜${r.diffDays}天后到期`}`;

const L = [];
L.push(`[bookconv] 📋 作战板晨报 ${today}`);
if (rows.length === 0 && suppressed.length === 0) {
  L.push('今日无到期/逾期任务，未来7天也无将到期项 ✅');
} else {
  if (dueToday.length) { L.push(`\n【今日到期 ${dueToday.length}】`); dueToday.forEach(r => L.push('• ' + fmt(r))); }
  if (overdue.length) { L.push(`\n【⚠️ 逾期 ${overdue.length}】`); overdue.forEach(r => L.push('• ' + fmt(r))); }
  if (soon.length) { L.push(`\n【7天内将到期 ${soon.length}】`); soon.forEach(r => L.push('• ' + fmt(r))); }
  if (rows.length === 0) L.push('\n本次无有效执行信号（下列项已按状态语义抑制）');
  if (suppressed.length) {
    L.push(`\n【ℹ️ 已抑制·非执行信号（7天窗口内）${suppressed.length}】不催办，仅备案`);
    suppressed.forEach(r => L.push(`• [${r.priority}][${r.id}] ${r.action}（${r.module}）｜${r.why}${
      r.diffDays < 0 ? ` · 原计逾期${-r.diffDays}天` : r.diffDays === 0 ? ' · 原计今日到期' : ` · 原计${r.diffDays}天后到期`}`));
  }
}
// 既有缺陷修复（2026-11-08 复核发现）：板里字段名是 openDecisions，原代码读 decisions 恒为
// undefined ⇒「待裁决」区块自上线从未输出过（当前 2 条真实待裁决被静默吞掉）。
// 该区块刻意放在 if/else 之外：否则「所有任务都结清、但仍有待裁决」时会被"无任务"分支吞掉。
const pending = data.openDecisions ?? data.decisions;
const d = pending?.length ? `\n【待裁决 ${pending.length}】见 /admin/board` : '';
if (d) L.push(d);
const text = L.join('\n');

// ── ③ 发飞书（同 ga-inspection.mjs 纪律）──
function getWebhook() {
  if (process.env.FEISHU_WEBHOOK_URL) return process.env.FEISHU_WEBHOOK_URL;
  if (process.env.FEISHU_WEBHOOK) return process.env.FEISHU_WEBHOOK;
  try {
    const c = readFileSync(join(ROOT, '.feishu-webhook'), 'utf8').trim();
    if (c) return c;
  } catch {}
  return null;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function sendOnce(webhook, body) {
  return new Promise((resolve) => {
    const url = new URL(webhook);
    const req = https.request({
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 5000,
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        const raw = d.slice(0, 500);
        if (res.statusCode >= 500) return resolve({ ok: false, retryable: true, error: `HTTP ${res.statusCode}`, raw });
        let parsed = null;
        try { parsed = JSON.parse(d); } catch {}
        if (parsed && typeof parsed.code === 'number') {
          if (parsed.code === 0) return resolve({ ok: true, code: 0 });
          return resolve({ ok: false, retryable: false, code: parsed.code, msg: parsed.msg || '', raw });
        }
        resolve({ ok: false, retryable: true, error: `非JSON响应(HTTP ${res.statusCode})`, raw });
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout(5s)')));
    req.on('error', (e) => resolve({ ok: false, retryable: true, error: String(e.message || e) }));
    req.write(body); req.end();
  });
}

async function sendFeishu(t) {
  const webhook = getWebhook();
  if (!webhook) { console.log('⚠️ 未配置飞书 webhook（FEISHU_WEBHOOK_URL / .feishu-webhook），跳过发送'); return { ok: false, skipped: true }; }
  const body = JSON.stringify({ msg_type: 'text', content: { text: t } });
  const backoffs = [2000, 4000, 8000];
  let last = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    last = await sendOnce(webhook, body);
    if (last.ok) { console.log(`✅ 飞书晨报已送达（第 ${attempt} 次尝试）`); return last; }
    console.log(`⚠️ 飞书发送失败（第 ${attempt}/3 次）：${last.error || `code=${last.code} msg=${last.msg}`}${last.raw ? ` | 响应: ${last.raw}` : ''}`);
    if (!last.retryable) break;
    if (attempt < 3) await sleep(backoffs[attempt - 1]);
  }
  console.log('❌ 最终结论：飞书晨报未送达（3 次尝试失败或命中确定性错误）——本行即权威结果，请勿误判为发送成功');
  return last;
}

console.log(text);
// 回归验证开关：仅生成正文、不发飞书。刻意用 CLI 参数而非环境变量——环境变量会被子进程继承，
// 一旦被误写进 shell profile / 调度环境，会让自动化长期静默不发飞书（2026-11-08 复核 P1 级风险）。
// dry-run 显式输出第四态 RESULT: dry-run，绝不与 sent/failed/skipped 混淆；
// 用 process.exitCode 替代 process.exit，避免管道捕获时截断尾部唯一标记。
if (process.argv.includes('--dry-run')) {
  console.log('RESULT: dry-run（未发送飞书；正文见上方，退出码恒 0）');
} else {
  const r = await sendFeishu(text);
  console.log(r.skipped ? 'RESULT: skipped' : r.ok ? 'RESULT: sent' : 'RESULT: failed');
}
process.exitCode = 0;
