#!/usr/bin/env node
/**
 * ga-inspection.mjs — GA4 每日巡检（基础分析 + 进阶卫生）
 *
 * 合并两部分：
 *   ① 基础分析：读取最新的 数据分析/GA4日报-*.md，抽取 headline 指标
 *   ② 进阶卫生：syntax-sweep + geo-audit-guide + 埋点待办检查
 *
 * 输出：合并简报 → 飞书 Webhook（消息必须含 [bookconv] 关键词，否则被机器人拦截）
 *
 * 用法：
 *   node scripts/ga-inspection.mjs            # 跑全部 + 发飞书
 *   node scripts/ga-inspection.mjs --no-send  # 只跑检查，打印不发送
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ANALYSIS_DIR = join(ROOT, '数据分析');
const DOCS_DIR = join(ROOT, 'docs');

const NO_SEND = process.argv.includes('--no-send');

// ── ① 基础分析：优先 GA4 Data API 实时数据，回退到最新 GA4日报 md ──────
function readGa4Live() {
  try {
    const p = join(ROOT, '_wb_tmp', 'ga4-live.json');
    const j = JSON.parse(readFileSync(p, 'utf8'));
    if (j && j.source === 'ga4-data-api') return j;
  } catch {}
  return null;
}

function latestGaReport() {
  const files = readdirSync(ANALYSIS_DIR)
    .filter(f => /^GA4日报-\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort();
  if (files.length === 0) return null;
  const path = join(ANALYSIS_DIR, files[files.length - 1]);
  return { path, name: files[files.length - 1], text: readFileSync(path, 'utf8') };
}

function basicFromLive(live) {
  const complete = live.events?.conversion_complete ?? '—';
  const failed = live.events?.conversion_failed ?? '—';
  const upload = live.events?.file_upload ?? '—';
  const conv = evalConversion(complete, failed, upload);
  return {
    ok: true,
    source: 'ga4-data-api',
    date: live.date,
    conclusion: '实时数据（GA4 Data API）',
    abnormal: conv.abnormal,
    undecided: conv.undecided,
    convReason: conv.reason,
    metrics: {
      users: String(live.activeUsers),
      events: String(live.eventCount),
      complete: String(complete),
      failed: String(failed),
      upload: String(upload),
      rate: live.conversionRate ?? '—',
    },
    batch: evalBatchAnomaly(failed, upload),
  };
}

function basicFromReport(report) {
  if (!report) return { ok: false, source: 'none', note: '未找到 GA4日报（基础分析缺数据）' };
  const t = report.text;
  const dateMatch = report.name.match(/GA4日报-(\d{4}-\d{2}-\d{2})\.md/);
  const date = dateMatch ? dateMatch[1] : '未知';
  const conclIdx = t.indexOf('## 一、结论先行');
  const coreIdx = t.indexOf('## 二、核心指标表');
  const conclusion = conclIdx >= 0
    ? t.slice(conclIdx, coreIdx >= 0 ? coreIdx : conclIdx + 400)
        .replace(/^## 一、结论先行\s*\n/, '').trim().split('\n')[0]
    : '';
  const grab = (re) => { const m = t.match(re); return m ? m[1].trim() : '—'; };
  const users = grab(/活跃用户[^\n]*?\*\*(\d+)\*\*/);
  const events = grab(/总事件数[^\n]*?\*\*(\d+)\*\*/);
  const complete = grab(/conversion_complete[^\n]*?(\d+)/);
  const failed = grab(/conversion_failed[^\n]*?(\d+)/);
  const upload = grab(/file_upload[^\n]*?(\d+)/);
  const rate = grab(/转化率（完成\/上传）[^\n]*?\|[^*\n]*?(\d+%)/);
  const conv = evalConversion(complete, failed, upload);
  return {
    ok: true,
    source: 'ga4-report-md',
    date,
    conclusion: conclusion.slice(0, 120),
    abnormal: conv.abnormal,
    undecided: conv.undecided,
    convReason: conv.reason,
    metrics: { users, events, complete, failed, upload, rate },
    batch: evalBatchAnomaly(failed, upload),
  };
}

// ── ①-b 转化失败率门禁 ─────────────────────────────────────────────────
// 判据（测不变量，不硬编码清单）：
//   异常 = 失败数 > 完成数，或 成功率(完成/上传) < 50%
//   不可判定 = 无上传数据或数值缺失（降级，不报 FAIL，符合门禁纪律）
function evalConversion(complete, failed, upload) {
  const c = Number(complete), f = Number(failed), u = Number(upload);
  if (!Number.isFinite(c) || !Number.isFinite(f) || !Number.isFinite(u) || u <= 0) {
    return { abnormal: false, undecided: true, reason: '无上传数据，不可判定转化失败率' };
  }
  const rate = c / u;
  const abnormal = f > c || rate < 0.5;
  return {
    abnormal,
    undecided: false,
    reason: abnormal
      ? `失败${f} > 完成${c} 或 成功率${Math.round(rate * 100)}% < 50%`
      : '',
  };
}

// ── ①-c 批量异常告警（2026-10-11 P1-4，v2 手册模块 7）─────────────────
// 判据（测不变量）：单日 file_upload≥5 且 失败率(失败/上传)>60% ⇒ 批量异常。
//   上传<5 视为样本不足→不可判定（不报异常，符合门禁纪律#6：不可判定项不报 FAIL）
function evalBatchAnomaly(failed, upload) {
  const f = Number(failed), u = Number(upload);
  if (!Number.isFinite(f) || !Number.isFinite(u) || u < 5) {
    return { decided: false, triggered: false, reason: '上传<5，样本不足不可判定' };
  }
  const ratio = f / u;
  const triggered = ratio > 0.6;
  return {
    decided: true,
    triggered,
    reason: triggered ? `上传${u}、失败${f}，失败率${Math.round(ratio * 100)}% > 60%` : '',
  };
}

function extractBasic() {
  // 优先实时
  const live = readGa4Live();
  if (live) return basicFromLive(live);
  // 回退到 md
  const report = latestGaReport();
  if (report) return basicFromReport(report);
  return { ok: false, source: 'none', note: '无 GA4 数据源（Data API 未授权且缺 GA4日报 md）' };
}

// ── ② 进阶卫生检查（读外部结果文件，避免 node 内 spawn node 触 EBUSY）──
function readResultFile(name) {
  try {
    const p = join(ROOT, '_wb_tmp', name);
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function runSyntaxSweep() {
  const r = readResultFile('ga-syntax.json');
  if (!r) return { ok: null, detail: '未运行（自动化应先跑 syntax-sweep.mjs）' };
  return { ok: r.ok, detail: r.detail || (r.ok ? '通过' : '失败') };
}

function runGeoAudit() {
  const r = readResultFile('ga-geo.json');
  if (!r) return { ok: null, detail: '未运行（自动化应先跑 geo-audit-guide.mjs）' };
  return { ok: r.ok, detail: r.detail || `>=400词 guide: ${r.full ?? '?'}（基线9）` };
}

function checkAdvancedDimensions() {
  const path = join(DOCS_DIR, 'ga-advanced-analysis-dimensions.md');
  try {
    const t = readFileSync(path, 'utf8');
    const idx = t.indexOf('埋点待办清单');
    const section = idx >= 0 ? t.slice(idx, idx + 1500) : '';
    // 检查是否有「新增格式对转化失败高发」标记
    const flag = /新增格式[^\n]*转化失败[^\n]*高发/.test(section) ||
                 /转化失败高发/.test(section);
    return {
      ok: true,
      newFormatFailureFlagged: flag,
      note: flag ? '⚠️ 发现新增格式转化失败高发，记为待分析项' : '无新增格式转化失败异常',
    };
  } catch (e) {
    return { ok: false, note: '无法读取进阶分析手册: ' + String(e.message || e).slice(0, 100) };
  }
}

// ── ③ 组装简报 ────────────────────────────────────────────────────────
function buildReport(basic, syntax, geo, adv) {
  const lines = [];
  lines.push('📊 [bookconv] GA4 每日巡检');
  lines.push('');

  // 基础分析
  if (basic.ok) {
    const srcTag = basic.source === 'ga4-data-api' ? '🔴 实时(GA4 API)' : '📄 回退(GA4日报md)';
    lines.push(`【基础分析 · ${basic.date} · ${srcTag}】`);
    lines.push(`• 活跃用户: ${basic.metrics.users} | 事件: ${basic.metrics.events}`);
    // 口径说明：完成率 = conversion_complete / file_upload；失败率 = conversion_failed / file_upload（分母均为上传数）
    const u = Number(basic.metrics.upload), c = Number(basic.metrics.complete), f = Number(basic.metrics.failed);
    const ratesLine = (Number.isFinite(u) && u > 0 && Number.isFinite(c) && Number.isFinite(f))
      ? `• 转换事件: 上传 ${u} 次 → 完成 ${c} 次 | 失败 ${f} 次 | 完成率(完成/上传) ${Math.round(c / u * 100)}% | 失败率(失败/上传) ${Math.round(f / u * 100)}%`
      : `• 转换事件: 上传 ${basic.metrics.upload ?? '—'} | 完成 ${basic.metrics.complete} | 失败 ${basic.metrics.failed} | 比率不可计算（缺上传数）`;
    lines.push(ratesLine);
    if (basic.undecided) lines.push('• 转化失败率：⚠️ 不可判定（缺上传数据）');
    else if (basic.abnormal) lines.push(`• ⚠️ 转化失败率偏高（${basic.convReason}；疑似 CloudConvert 免费额度耗尽，需人工核查）`);
    else lines.push('• 转化失败率：正常');
    // P1-4 批量异常告警（v2 手册模块 7）
    const b = basic.batch;
    if (b?.decided && b.triggered) lines.push(`• 🚨 批量异常：${b.reason}（引擎/额度根因需人工分流，衔接 error_code 维度）`);
    if (basic.source === 'ga4-report-md') lines.push(`• 结论: ${basic.conclusion}`);
  } else {
    lines.push('【基础分析】⚠️ ' + basic.note);
  }
  lines.push('');

  // 进阶卫生
  lines.push('【进阶卫生】');
  const symMark = syntax.ok === null ? '⚠️' : (syntax.ok ? '✅' : '❌');
  const geoMark = geo.ok === null ? '⚠️' : (geo.ok ? '✅' : '❌');
  lines.push(`• syntax-sweep: ${symMark} ${syntax.detail}`);
  lines.push(`• geo-audit-guide: ${geoMark} ${geo.detail}`);
  lines.push(`• 埋点待办: ${adv.ok ? '✅' : '❌'} ${adv.note}`);

  const basicBad = basic.abnormal === true || basic.batch?.triggered === true;
  const basicUndecided = basic.undecided === true;
  const hasFail = syntax.ok === false || geo.ok === false || !basic.ok || !adv.ok || basicBad;
  const notRun = syntax.ok === null || geo.ok === null;
  lines.push('');
  if (hasFail) lines.push('巡检发现异常 ⚠️');
  else if (notRun) lines.push('部分检查未运行，详见上 ⚠️');
  else if (basicUndecided) lines.push('巡检完毕，但基础分析转化失败率不可判定 ⚠️');
  else lines.push('巡检完毕，全绿 ✅');
  return lines.join('\n');
}

// ── ④ 发送飞书（2026-10-10：结构化判定 + 3 次退避重试，workflow 缺口 6.3）──
// 设计说明（详见 docs/feishu-alert-sop-v1.md）：
//   - 成功判据改为 JSON 解析 code 字段（旧 includes('"code":0') 字符串匹配脆弱）
//   - 仅 网络错误/超时/HTTP 5xx/非JSON响应 可重试（3 次退避 2s/4s/8s）；
//     确定性错误（如 code 19024 关键词拦截）不重试，重试无用
//   - 恒 exit 0，结论以 stdout 为准（调用方 WorkBuddy 自动化读 stdout，不依赖退出码）
//   - 消息必须含 [bookconv] 关键词，否则被机器人拦截（code 19024）
function getWebhook() {
  if (process.env.FEISHU_WEBHOOK_URL) return process.env.FEISHU_WEBHOOK_URL;
  if (process.env.FEISHU_WEBHOOK) return process.env.FEISHU_WEBHOOK; // ai-audit.js 惯例，兼容不重构
  try {
    const p = join(ROOT, '.feishu-webhook');
    const c = readFileSync(p, 'utf8').trim();
    if (c) return c;
  } catch {}
  return null;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 单次发送：返回 { ok, retryable, code, msg, raw, error }
function sendOnce(webhook, text) {
  const body = JSON.stringify({ msg_type: 'text', content: { text } });
  const url = new URL(webhook);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (r) => { if (!settled) { settled = true; resolve(r); } };
    const req = https.request({
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 5000,
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        const raw = d.slice(0, 500);
        if (res.statusCode >= 500) {
          return finish({ ok: false, retryable: true, error: `HTTP ${res.statusCode}`, raw });
        }
        let parsed = null;
        try { parsed = JSON.parse(d); } catch {}
        if (parsed && typeof parsed.code === 'number') {
          if (parsed.code === 0) return finish({ ok: true, retryable: false, code: 0, msg: parsed.msg || '', raw });
          return finish({ ok: false, retryable: false, code: parsed.code, msg: parsed.msg || '', raw });
        }
        // HTTP 200 但响应体非 JSON（网关异常等）→ 按可重试处理
        finish({ ok: false, retryable: true, error: `非JSON响应(HTTP ${res.statusCode})`, raw });
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout(5s)')));
    req.on('error', (e) => finish({ ok: false, retryable: true, error: String(e.message || e), raw: '' }));
    req.write(body); req.end();
  });
}

// 带重试：最多 3 次，退避 2s/4s/8s（仅可重试类错误）。恒 exit 0，结论以 stdout 为准。
async function sendFeishu(text) {
  const webhook = getWebhook();
  if (!webhook) {
    console.log('⚠️ 未配置 FEISHU_WEBHOOK_URL / FEISHU_WEBHOOK / .feishu-webhook，跳过发送');
    return { ok: false, skipped: true };
  }
  const backoffs = [2000, 4000, 8000];
  let last = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    last = await sendOnce(webhook, text);
    if (last.ok) {
      console.log(`✅ 飞书通知已送达（第 ${attempt} 次尝试）`);
      return last;
    }
    console.log(`⚠️ 飞书发送失败（第 ${attempt}/3 次）：${last.error || `code=${last.code} msg=${last.msg}`}${last.raw ? ` | 响应: ${last.raw}` : ''}`);
    if (!last.retryable) break; // 确定性错误，重试无用
    if (attempt < 3) await sleep(backoffs[attempt - 1]);
  }
  console.log('❌ 最终结论：飞书通知未送达（3 次尝试失败或命中确定性错误）——本行即权威结果，请勿误判为发送成功');
  return last;
}

// ── main ───────────────────────────────────────────────────────────────
const basic = extractBasic();
const syntax = runSyntaxSweep();
const geo = runGeoAudit();
const adv = checkAdvancedDimensions();
const report = buildReport(basic, syntax, geo, adv);

console.log(report);
console.log('\n---');

if (NO_SEND) {
  console.log('[--no-send] 未发送飞书');
} else {
  await sendFeishu(report);
}
