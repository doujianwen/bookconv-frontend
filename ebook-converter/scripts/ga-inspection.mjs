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


import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import { DIRECT_UPLOAD_INFRA_CODES, USER_INPUT_CODES, USER_SIDE_ALERT_CODES } from './lib/ga-error-codes.mjs';

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
  const conv = evalConversion(complete, failed, upload, live.failedByErrorCode ?? null);
  return {
    ok: true,
    source: 'ga4-data-api',
    date: live.date,
    conclusion: '实时数据（GA4 Data API）',
    abnormal: conv.abnormal,
    undecided: conv.undecided,
    convReason: conv.reason,
    engineFailed: conv.engineFailed,
    quotaFailed: conv.quotaFailed,
    clientFailed: conv.clientFailed,
    infraFailed: conv.infraFailed ?? 0,
    failedByErrorCode: live.failedByErrorCode ?? null,
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
    engineFailed: conv.engineFailed,
    quotaFailed: conv.quotaFailed,
    clientFailed: conv.clientFailed,
    failedByErrorCode: null,
    metrics: { users, events, complete, failed, upload, rate },
    batch: evalBatchAnomaly(failed, upload),
  };
}

// ── ①-b 转化失败率门禁 ─────────────────────────────────────────────────
// 判据（2026-10-28 v2：按 error_code 三分类后测不变量，不硬编码清单）：
//   * FILE_TOO_LARGE            — 客户端大小拦截，请求未发出 ⇒ 剔除（引擎无关，UX 范畴）
//   * CONVERSION_QUOTA_EXCEEDED — 额度跳过/402 ⇒ 单独展示（Route A 下属 MON-2/3 正常降级，
//     但真实故障日靠「成功率<50%」仍会触发，反向验证见 10-24）
//   * 其余                       — 引擎失败 engineFailed ⇒ 异常 = engineFailed > 完成数
//   兜底：成功率(完成/上传) < 50% 恒判异常（全量口径，防 error_code 误分类漏网）。
//   error_code 明细缺失时按旧口径（全量 failed）并标 undecided（不可判定不硬报）。
// 判据（2026-10-31 v3：红队命中后新增基础设施分类）：
//   * 直传族（DIRECT_UPLOAD_FAILED 聚合旧码 + 2026-11-02 拆分的 PRESIGN_UNAVAILABLE/
//     PRESIGN_ERROR/PUT_FAILED 三码，单一事实源 scripts/lib/ga-error-codes.mjs）
//     — 直传链路故障（presign/R2/网络），非引擎非客户端 ⇒ 单独展示，
//     不计入 engineFailed（否则 1 次直传失败+0 完成会误报「引擎失败偏高」）。
//     ⚠️ 漏改本集合 → 新码掉 else 被算成引擎失败 + 飞书误报系统侧红卡（红队审计 G2）。
// 2026-11-02：并入 USER_INPUT_CODES（当前仅 UPLOAD_EMPTY，单一事实源
// ga-error-codes.mjs）。其真实语义不是「客户端拦截」而是「未进入引擎就被拒」——
// 与 FILE_TOO_LARGE 在**排 engineFailed** 这件事上完全同族，故共用本集合；
// 若散落在 else 分支，空文件会被算成引擎失败并触发飞书误报。
// 注意 INPUT_TOO_SMALL 故意不在此集合（见 ga-error-codes.mjs 注释：后端实测能转
// 13 字节 txt，该类失败实为容量/降级链问题，算成「未进引擎」会掩盖容量故障）。
const CLIENT_INTERCEPT_CODES = new Set(['FILE_TOO_LARGE', ...USER_INPUT_CODES]);
const QUOTA_CODES = new Set(['CONVERSION_QUOTA_EXCEEDED']);
const INFRA_CODES = new Set(DIRECT_UPLOAD_INFRA_CODES);
// 展示层告警分级专用集合（不可并入 CLIENT_INTERCEPT_CODES，语义见 ga-error-codes.mjs）
const ALERT_USER_CODES = new Set(USER_SIDE_ALERT_CODES);

function splitFailures(failed, failedByErrorCode) {
  const f = Number(failed);
  if (!Number.isFinite(f) || f <= 0) {
    return { engineFailed: 0, quotaFailed: 0, clientFailed: 0, infraFailed: 0, decided: Number.isFinite(f) };
  }
  if (!failedByErrorCode || typeof failedByErrorCode !== 'object') {
    return { engineFailed: f, quotaFailed: 0, clientFailed: 0, infraFailed: 0, decided: false }; // 明细缺失→旧口径，标 undecided
  }
  let client = 0, quota = 0, infra = 0;
  for (const [code, n] of Object.entries(failedByErrorCode)) {
    const v = Number(n) || 0;
    if (CLIENT_INTERCEPT_CODES.has(code)) client += v;
    else if (QUOTA_CODES.has(code)) quota += v;
    else if (INFRA_CODES.has(code)) infra += v;
  }
  return { engineFailed: Math.max(0, f - client - quota - infra), quotaFailed: quota, clientFailed: client, infraFailed: infra, decided: true };
}

// F5（2026-11-01 红队复核）：把当日失败签名按「用户侧(灰)/系统侧(红)」二分，
// 产出统一健康裁定；当「日报 Part A 引擎结论=正常」却仍存在系统侧失败签名时，
// 发检测盲区告警（实时红卡/系统失败被日报阈值漏判的场景）。
// 判定（2026-11-04 修正）：展示层告警分级，对齐生产飞书告警卡
// src/lib/alerts.ts USER_SIDE_ERROR_CODES，单一事实源 = ga-error-codes.mjs
// USER_SIDE_ALERT_CODES。命中 CLIENT/QUOTA/INFRA/USER_SIDE_ALERT 四集合归用户侧(灰)，
// 其余（INTERNAL_ERROR / UNKNOWN / 超时等引擎或归因缺失类）归系统侧(红)。
// ⚠️ 这里刻意**不改 splitFailures**：CORRUPT_INPUT 可能已由 Calibre 尝试过，
// 从 engineFailed 剥离会虚高引擎侧成功率并让 Part A 与 D2 口径失配。
// 即「告警归用户侧」与「是否到过引擎」是两件事，不许再复用同一集合。
// failedByErrorCode 为 null/缺失→decided:false（不臆断）。
function classifyFailureSides(failedByErrorCode) {
  const userSide = { codes: {}, total: 0 };
  const systemSide = { codes: {}, total: 0 };
  if (!failedByErrorCode || typeof failedByErrorCode !== 'object') return { userSide, systemSide, decided: false };
  for (const [code, n] of Object.entries(failedByErrorCode)) {
    const v = Number(n) || 0;
    if (v <= 0) continue;
    if (CLIENT_INTERCEPT_CODES.has(code) || QUOTA_CODES.has(code) || INFRA_CODES.has(code) || ALERT_USER_CODES.has(code)) {
      userSide.codes[code] = v; userSide.total += v;
    } else {
      systemSide.codes[code] = v; systemSide.total += v;
    }
  }
  return { userSide, systemSide, decided: true };
}

function evalConversion(complete, failed, upload, failedByErrorCode = null) {
  const c = Number(complete), f = Number(failed), u = Number(upload);
  if (!Number.isFinite(c) || !Number.isFinite(f) || !Number.isFinite(u) || u <= 0) {
    return { abnormal: false, undecided: true, reason: '无上传数据，不可判定转化失败率' };
  }
  const { engineFailed, quotaFailed, clientFailed, decided } = splitFailures(f, failedByErrorCode);
  const rate = c / u;
  const abnormal = engineFailed > c || rate < 0.5;
  return {
    abnormal,
    undecided: !decided,
    engineFailed,
    quotaFailed,
    clientFailed,
    reason: abnormal
      ? `引擎失败${engineFailed} > 完成${c} 或 成功率${Math.round(rate * 100)}% < 50%`
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

// ── ②-b 红队审计结果读取（Part B 执行结果 / Part D 深度分析）──────────
function readRedteam(name) {
  try {
    const p = join(ROOT, '_wb_tmp', name)
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

// ── ③ 组装简报 ────────────────────────────────────────────────────────
function buildReport(basic, syntax, geo, adv, redteam, redteamAnalysis) {
  const lines = [];
  let engineHardAlarm = false; // 2026-11-03 F15 收紧：系统侧(引擎类)失败 ≥3 次硬告警
  lines.push('📊 [bookconv] GA4 每日巡检');
  lines.push('');

  // 基础分析
  if (basic.ok) {
    const srcTag = basic.source === 'ga4-data-api' ? '🔴 实时(GA4 API)' : '📄 回退(GA4日报md)';
    lines.push(`【基础分析 · ${basic.date} · ${srcTag}】`);
    lines.push(`• 活跃用户: ${basic.metrics.users} | 事件: ${basic.metrics.events}`);
    // 口径说明：完成率 = conversion_complete / file_upload；失败率 = conversion_failed / file_upload（分母均为上传数）
    // ⚠️ WP4 failover 后（2026-10-27）新增客户端 FILE_TOO_LARGE 事件追踪：
    //    file_upload 只统计成功提交到 /api/convert 的请求，conversion_failed 还包含客户端拦截事件。
    //    当 file_upload < 实际请求数时，失败率会虚高（假阳性）。真实根因需结合 error_code 维度分析。
    const u = Number(basic.metrics.upload), c = Number(basic.metrics.complete), f = Number(basic.metrics.failed);
    const ratesLine = (Number.isFinite(u) && u > 0 && Number.isFinite(c) && Number.isFinite(f))
      ? `• 转换事件: 上传 ${u} 次 → 完成 ${c} 次 | 失败 ${f} 次 | 完成率(完成/上传) ${Math.round(c / u * 100)}% | 失败率(失败/上传) ${Math.round(f / u * 100)}%`
      : `• 转换事件: 上传 ${basic.metrics.upload ?? '—'} | 完成 ${basic.metrics.complete} | 失败 ${basic.metrics.failed} | 比率不可计算（缺上传数）`;
    lines.push(ratesLine);
    // 真实成功率（2026-10-31 红队复核后新增，仅展示不动门禁）：
    // 客户端拦截（FILE_TOO_LARGE）不触发 file_upload 但触发 conversion_failed，
    // 上传数低估尝试数 ⇒ 完成/上传 高估成功率。补 完成/(完成+失败) 与 引擎侧 完成/(完成+引擎失败)。
    const tc = Number(basic.metrics.complete), tf = Number(basic.metrics.failed);
    const engFailN = Number(basic.engineFailed);
    const trueRate = (Number.isFinite(tc) && Number.isFinite(tf) && tc + tf > 0)
      ? Math.round(tc / (tc + tf) * 100) : null;
    const engRate = (Number.isFinite(tc) && Number.isFinite(engFailN) && tc + engFailN > 0)
      ? Math.round(tc / (tc + engFailN) * 100) : null;
    if (trueRate !== null) {
      const trueParts = [`• 真实成功率(完成/(完成+失败)): ${trueRate}%`];
      if (engRate !== null && basic.failedByErrorCode && engRate !== trueRate) {
        trueParts.push(`引擎侧成功率: ${engRate}%`);
      }
      lines.push(trueParts.join(' | '));
    }
    // error_code 分布（仅实时源有）：让"失败"构成一目了然
    const fec = basic.failedByErrorCode;
    if (fec && typeof fec === 'object' && Object.keys(fec).length > 0) {
      const dist = Object.entries(fec).map(([k, v]) => `${k}:${v}`).join(' | ');
      const parts = [`• 失败构成: ${dist}`];
      if (basic.clientFailed > 0) parts.push(`客户端拦截 ${basic.clientFailed}（未到引擎）`);
      if (basic.quotaFailed > 0) parts.push(`额度降级 ${basic.quotaFailed}（MON-2/3 范畴）`);
      if (basic.infraFailed > 0) parts.push(`上传链路故障 ${basic.infraFailed}（直传 presign/R2/网络，非引擎）`);
      lines.push(parts.join(' — '));
    }
    if (basic.undecided) lines.push('• 转化失败率：⚠️ 不可判定（缺上传数据或失败明细）');
    else if (basic.abnormal) {
      lines.push(`• ⚠️ 服务端引擎失败偏高（${basic.convReason}；需人工核查引擎/额度，衔接 error_code 维度）`);
    }
    else {
      // 2026-10-31 红队复核：Part A 的"正常"结论须由深度分析 D2 背书。D2=UNKNOWN/FAIL
      // （失败分流数据缺失，或与 Part A 引擎结论矛盾）时，引擎结论不可验证，禁写"正常"
      // —— 否则即叙述层假成功（同日报 Part A 称正常、D2 说不可验证的矛盾复发）。
      const d2 = (redteamAnalysis?.checks || []).find((c) => c.id === 'D2');
      // 红队复核（2026-11-01 二次审计修正）：兜底必须是「!d2 || verdict!==PASS」。
      // 此前写成「d2 && verdict!==PASS」会把 D2 检查项缺失（数据最糟、比 UNKNOWN 更糟）
      // 误归入 else 分支写「正常」——即原审计要消灭的叙述层假成功。务必用「缺失即不可验证」。
      if (!d2 || d2.verdict !== 'PASS') {
        const d2verdict = d2 ? d2.verdict : 'MISSING';
        const d2evidence = d2 ? d2.evidence : '深度分析未产出 D2 检查项，失败分流不可验证';
        lines.push(`• 转化失败率：⚠️ 引擎结论不可验证（深度分析 D2=${d2verdict}：${d2evidence}）`);
      } else {
        // 2026-11-04：去掉「正常 / 引擎侧无异常失败」的绝对表述。它只代表
        // 日报主阈值未触发（engineFailed ≤ 完成 且 完成率 ≥ 50%），并不代表没有
        // 系统侧失败签名；下方健康裁定/硬告警可能同时给出红项，旧文案与之自相矛盾。
        lines.push('• 转化失败率：日报主阈值未触发（引擎失败数未超完成数、完成率≥50%）；分项归因见下方健康裁定');
      }
    }
    // F5（2026-11-01 红队复核）：统一健康裁定 + 检测盲区告警（复用上方 D2 已校验过的
    // failedByErrorCode）。即便 Part A 引擎结论=正常，只要存在系统侧失败签名即提示人工核对
    // 实时飞书告警——这是 F5 要求的「实时红卡 spike 但日报正常 → 盲区告警」代理实现
    // （实时卡本身发往飞书、无本地落盘，GA4 失败签名是唯一可程序化关联的同源数据）。
    const sides = classifyFailureSides(basic.failedByErrorCode);
    if (sides.decided) {
      const userStr = Object.entries(sides.userSide.codes).map(([k, v]) => `${k}:${v}`).join(' | ') || '—';
      const sysStr = Object.entries(sides.systemSide.codes).map(([k, v]) => `${k}:${v}`).join(' | ') || '—';
      lines.push(`• 统一健康裁定: 用户侧(灰) ${sides.userSide.total} 次 [${userStr}] / 系统侧(红) ${sides.systemSide.total} 次 [${sysStr}]`);
      // 硬告警（2026-11-03 F15 收紧；2026-11-04 分级修正）：系统侧 = 引擎/归因缺失类
      // （INTERNAL_ERROR / UNKNOWN / 超时等），已排除直传 INFRA、客户端拦截、额度，
      // 以及 2026-11-04 起按生产告警卡归用户侧的 DRM/CORRUPT_INPUT/VERIFICATION_FAILED。
      // 主阈值「引擎失败>完成 或 成功率<50%」对低流量站过松——11-01 引擎失败4、完成153
      // 不触发；11-02 系统侧5 亦只落软警告。当系统侧失败 ≥3 次即升级硬告警，避免引擎故障
      // 被埋入「正常」结论（红队要消灭的叙述层假成功）。
      // ⚠️ 分级来源 = USER_SIDE_ALERT_CODES（对齐 alerts.ts）；这里只作展示与告警，
      // 不改 splitFailures 的 engineFailed 口径，故 B6 / D2 数字不受影响。
      if (sides.systemSide.total >= 3) {
        engineHardAlarm = true;
        lines.push(`• 🚨 引擎硬告警: 系统侧(引擎/归因缺失类)失败 ${sides.systemSide.total} 次（≥3），日报主阈值（引擎失败>完成 或 成功率<50%）未触发但已达硬告警线，立即核查引擎日志与实时飞书卡`);
      } else if (sides.systemSide.total > 0 && !basic.abnormal && sides.systemSide.total >= 2) {
        lines.push(`• 🔍 检测盲区: 系统侧失败 ${sides.systemSide.total} 次但日报引擎阈值未触发（成功率/引擎失败数未达告警线），建议人工核对当日飞书实时告警卡`);
      }
    }
    // P1-4 批量异常告警（v2 手册模块 7）
    const b = basic.batch;
    if (b?.decided && b.triggered) lines.push(`• 🚨 批量异常：${b.reason}（前置拦截/直传链路失败需人工分流，衔接 error_code 维度）`);
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

  // 红队审计（Part B 执行结果 / Part D 深度分析）
  lines.push('');
  lines.push('【红队审计】');
  if (redteam) {
    const mark = redteam.overall === 'FAIL' ? '❌' : (redteam.overall === 'PASS' ? '✅' : '⚠️');
    const c = redteam.counts || {};
    lines.push(`• 执行结果审计: ${mark} overall=${redteam.overall} (PASS ${c.PASS || 0}/FAIL ${c.FAIL || 0}/UNKNOWN ${c.UNKNOWN || 0})`);
    for (const chk of (redteam.checks || [])) {
      if (chk.verdict !== 'PASS') lines.push(`   - ${chk.level} ${chk.id} ${chk.verdict} ${chk.name}: ${chk.evidence}`);
    }
  } else {
    lines.push('• 执行结果审计: ⚠️ 未运行（自动化应先跑 ga4-redteam.mjs）');
  }
  if (redteamAnalysis) {
    const mark = redteamAnalysis.overall === 'FAIL' ? '❌' : (redteamAnalysis.overall === 'PASS' ? '✅' : '⚠️');
    const c = redteamAnalysis.counts || {};
    lines.push(`• 深度分析审计: ${mark} overall=${redteamAnalysis.overall} (PASS ${c.PASS || 0}/FAIL ${c.FAIL || 0}/UNKNOWN ${c.UNKNOWN || 0})`);
    for (const chk of (redteamAnalysis.checks || [])) {
      if (chk.verdict !== 'PASS') lines.push(`   - ${chk.level} ${chk.id} ${chk.verdict} ${chk.name}: ${chk.evidence}`);
    }
  } else {
    lines.push('• 深度分析审计: ⚠️ 未运行（自动化应先跑 ga4-redteam-analysis.mjs）');
  }

  const basicBad = basic.abnormal === true || basic.batch?.triggered === true;
  const basicUndecided = basic.undecided === true;
  const hasFail = syntax.ok === false || geo.ok === false || !basic.ok || !adv.ok || basicBad || engineHardAlarm;
  const notRun = syntax.ok === null || geo.ok === null;
  const rtB = redteam?.overall;
  const rtD = redteamAnalysis?.overall;
  const rtFailed = rtB === 'FAIL' || rtD === 'FAIL';
  const rtResidual = rtB === 'PASS_WITH_RESIDUALS' || rtD === 'PASS_WITH_RESIDUALS';
  lines.push('');
  if (rtFailed) lines.push('🛡️ 红队审计拦截：检出假成功/漏报，巡检结论不可全信 ⚠️');
  else if (hasFail) lines.push('巡检发现异常 ⚠️');
  else if (notRun) lines.push('部分检查未运行，详见上 ⚠️');
  else if (basicUndecided) lines.push('巡检完毕，但基础分析转化失败率不可判定 ⚠️');
  else if (rtResidual) lines.push('巡检完毕，全绿 ✅（红队有残余项，见上）');
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
const redteam = readRedteam('ga-redteam-latest.json');
const redteamAnalysis = readRedteam('ga-redteam-analysis-latest.json');
const report = buildReport(basic, syntax, geo, adv, redteam, redteamAnalysis);

console.log(report);
console.log('\n---');

if (NO_SEND) {
  console.log('[--no-send] 未发送飞书');
} else {
  await sendFeishu(report);
}
