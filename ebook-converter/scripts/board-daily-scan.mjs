// scripts/board-daily-scan.mjs
// 作战板每日扫描：今日到期 / 逾期 / 未来7天将到期 → 飞书推送。
// 飞书发送逻辑与 scripts/ga-inspection.mjs 的 sendFeishu 保持同一纪律
// （getWebhook 优先级一致、JSON code 判定、3 次退避重试、恒 exit 0、
//  消息必须含 [bookconv] 关键词否则被机器人拦截 code 19024）。
// 纪律来源：docs/feishu-alert-sop-v1.md。stdout 是权威结论。
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── ① 日期（用 Date 对象算，禁手算）──
const now = new Date();
const iso = (d) => d.toISOString().slice(0, 10); // due 是 YYYY-MM-DD，UTC 口径与写入侧一致
const today = iso(now);
const in7 = iso(new Date(now.getTime() + 7 * 86400000));

// ── ② 读板 ──
const data = JSON.parse(readFileSync(join(ROOT, 'data/seo-geo-board.json'), 'utf8'));
const OPEN = new Set(['todo', 'doing', 'blocked']);
const PW = { P0: 0, P1: 1, P2: 2, P3: 3 };

const rows = [];
for (const m of data.modules ?? []) {
  for (const t of m.tasks ?? []) {
    if (!OPEN.has(t.status) || !t.due) continue;
    const diffDays = Math.round((new Date(t.due + 'T00:00:00Z') - new Date(today + 'T00:00:00Z')) / 86400000);
    if (diffDays <= 7) rows.push({ ...t, module: m.name, diffDays });
  }
}
rows.sort((a, b) => (PW[a.priority] ?? 9) - (PW[b.priority] ?? 9) || a.diffDays - b.diffDays);

const overdue = rows.filter(r => r.diffDays < 0);
const dueToday = rows.filter(r => r.diffDays === 0);
const soon = rows.filter(r => r.diffDays > 0);

const fmt = (r) => `[${r.priority}][${r.id}] ${r.action}（${r.module}）${
  r.diffDays < 0 ? `｜逾期${-r.diffDays}天` : r.diffDays === 0 ? '｜今日到期' : `｜${r.diffDays}天后到期`}`;

const L = [];
L.push(`[bookconv] 📋 作战板晨报 ${today}`);
if (rows.length === 0) {
  L.push('今日无到期/逾期任务，未来7天也无将到期项 ✅');
} else {
  if (dueToday.length) { L.push(`\n【今日到期 ${dueToday.length}】`); dueToday.forEach(r => L.push('• ' + fmt(r))); }
  if (overdue.length) { L.push(`\n【⚠️ 逾期 ${overdue.length}】`); overdue.forEach(r => L.push('• ' + fmt(r))); }
  if (soon.length) { L.push(`\n【7天内将到期 ${soon.length}】`); soon.forEach(r => L.push('• ' + fmt(r))); }
  const d = data.decisions?.length ? `\n【待裁决 ${data.decisions.length}】见 /admin/board` : '';
  if (d) L.push(d);
}
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
const r = await sendFeishu(text);
console.log(r.skipped ? 'RESULT: skipped' : r.ok ? 'RESULT: sent' : 'RESULT: failed');
process.exit(0);
