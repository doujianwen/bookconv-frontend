#!/usr/bin/env node
// scripts/build-workbench-html.mjs
//
// Generates a single self-contained HTML file for the workbench.
//
// Why this exists: the /admin routes need a Node server, and `output: 'export'`
// is not an option for this project — 14 API routes, middleware, and 9 config
// redirects/headers all stop working under static export, and those carry the
// site's SEO-critical behaviour (/es whitelist, /en 301s, keyword-cannibalisation
// redirects, security headers).
//
// So the workbench is rendered once, here, into one portable file:
//   - zero external requests (no CDN, no fonts, no scripts)
//   - opens by double-click, works offline
//   - numbers are a snapshot of the moment of generation, and the file says so
//
// The data comes from the SAME provider the live routes use. This script
// transpiles the TypeScript data layer with @swc/core so there is exactly one
// source of truth for what the workbench shows.
//
// Usage:
//   node scripts/build-workbench-html.mjs [outfile]
//   npm run build:workbench

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from '@swc/core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(process.argv[2] || join(ROOT, 'workbench.html'));

// ---------------------------------------------------------------- TS loading
// Transpile the workbench data layer into a temp ESM directory, then import it.
// A tiny loader keeps the two files (types/facts/panels/provider) resolvable.
const TMP = join(ROOT, '.wb-build');

function transpile(rel) {
  const abs = join(ROOT, rel);
  const src = readFileSync(abs, 'utf8');
  const out = transformSync(src, {
    filename: abs,
    jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
    module: { type: 'es6' },
  });
  // Rewrite bare specifiers so Node can resolve the siblings.
  const code = out.code
    .replace(/from ['"]\.\/([a-z-]+)['"]/g, "from './$1.mjs'")
    .replace(/from ['"]@\/(.*?)['"]/g, (_m, p) => `from '${p}.mjs'`);
  const dest = join(TMP, rel.replace(/^src\//, '').replace(/\.ts$/, '.mjs'));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, code);
  return dest;
}

function prepareDataLayer() {
  const files = [
    'src/lib/workbench/types.ts',
    'src/lib/workbench/facts.ts',
    'src/lib/workbench/panels.ts',
    'src/lib/workbench/provider-repo.ts',
    'src/lib/workbench/provider.ts',
    // The SEO/GEO board reads its own data file rather than a provider; it is
    // bundled so the single file shows today's work too.
    'src/lib/board/types.ts',
    'src/lib/board/derive.ts',
    'src/lib/board/loader.ts',
    // The keyword panel likewise reads its own generated file
    // (data/keyword-series.json), built by scripts/build-keyword-series.mjs.
    'src/lib/keywords/series.ts',
    'src/lib/keywords/loader.ts',
    // The competitor panel reads data/competitor-series.json.
    'src/lib/keywords/competitor.ts',
  ];
  for (const f of files) transpile(f);
  return pathToFileURL(join(TMP, 'lib/workbench/provider.mjs')).href;
}

// ---------------------------------------------------------------- formatting
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const LEVEL = {
  healthy: { fg: '#059669', bg: '#ecfdf5', bd: '#a7f3d0', dot: '#10b981' },
  warning: { fg: '#b45309', bg: '#fffbeb', bd: '#fde68a', dot: '#f59e0b' },
  critical: { fg: '#be123c', bg: '#fff1f2', bd: '#fecdd3', dot: '#f43f5e' },
  unknown: { fg: '#6b7280', bg: '#f9fafb', bd: '#e5e7eb', dot: '#9ca3af' },
};

const SOURCE_KIND = {
  derived: { fg: '#047857', bg: '#ecfdf5', bd: '#a7f3d0', label: '实时计算', note: '生成时从本地仓库重新计算' },
  remote: { fg: '#1d4ed8', bg: '#eff6ff', bd: '#bfdbfe', label: '实时接口', note: '来自外部 API' },
  static: { fg: '#b45309', bg: '#fffbeb', bd: '#fde68a', label: '快照', note: '静态数字，非实时' },
};

function pill(level, text, detail) {
  const c = LEVEL[level] ?? LEVEL.unknown;
  return `<span class="pill" style="color:${c.fg};background:${c.bg};border-color:${c.bd}" title="${esc(detail)}"><i style="background:${c.dot}"></i>${esc(text)}</span>`;
}

function metricCard(m) {
  const good = m.goodDirection ?? 'up';
  const trend = m.trend ?? 'flat';
  const isGood = trend === 'flat' ? null : trend === good;
  const color = isGood === null ? '#6b7280' : isGood ? '#059669' : '#e11d48';
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const delta = m.delta
    ? `<span class="metric-delta" style="color:${color}"><span aria-hidden="true">${arrow}</span> ${esc(m.delta)}</span>`
    : '';
  const hint = m.hint ? `<p class="metric-hint">${esc(m.hint)}</p>` : '';
  return `<div class="metric"><p class="metric-label">${esc(m.label)}</p><div class="metric-row"><span class="metric-value">${esc(m.value)}</span>${delta}</div>${hint}</div>`;
}

function tableBlock(t) {
  if (!t.rows.length) return `<p class="empty">${esc(t.emptyMessage ?? '无数据')}</p>`;
  const head = t.columns
    .map(
      (c) =>
        `<th style="text-align:${c.align === 'right' ? 'right' : c.align === 'center' ? 'center' : 'left'}">${esc(c.label)}</th>`
    )
    .join('');
  const body = t.rows
    .map((row) => {
      const cells = t.columns
        .map((c) => {
          const v = row.cells[c.key];
          let content;
          if (v === null || v === undefined || v === '') content = '<span class="dash">—</span>';
          else if (c.asPill && LEVEL[String(v)]) content = pill(String(v), String(v));
          else content = esc(v);
          const align = c.align === 'right' ? 'right' : c.align === 'center' ? 'center' : 'left';
          return `<td style="text-align:${align}">${content}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function checklistBlock(c) {
  const done = c.items.filter((i) => i.done).length;
  const pct = Math.round((done / c.items.length) * 100);
  const bar = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';
  const items = c.items
    .map((i) => {
      const mark = i.done
        ? '<span class="tick on" aria-hidden="true">✓</span>'
        : '<span class="tick" aria-hidden="true"></span>';
      const detail = i.detail ? `<span class="cl-detail">${esc(i.detail)}</span>` : '';
      return `<li class="cl-item">${mark}<span class="cl-body"><span class="cl-label${i.done ? ' done' : ''}">${esc(i.label)}</span>${detail}</span></li>`;
    })
    .join('');
  return `<section class="card"><header class="card-head"><h3>${esc(c.title)}</h3><span class="count">${done}/${c.items.length} · ${pct}%</span></header><div class="card-body"><div class="progress"><div style="width:${pct}%;background:${bar}"></div></div><ul class="cl">${items}</ul></div></section>`;
}

function timelineBlock(events) {
  const items = events
    .map((e) => {
      const c = LEVEL[e.level] ?? LEVEL.unknown;
      return `<li class="tl-item"><span class="tl-dot" style="background:${c.dot}"></span><p class="tl-title">${esc(e.title)}</p>${e.detail ? `<p class="tl-detail">${esc(e.detail)}</p>` : ''}<p class="tl-meta">${esc(new Date(e.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }))}${e.actor ? ' · ' + esc(e.actor) : ''}</p></li>`;
    })
    .join('');
  return `<section class="card"><header class="card-head"><h3>最近动态</h3></header><div class="card-body"><ol class="tl">${items}</ol></div></section>`;
}

function renderPanel(key, meta, payload) {
  const kind = payload.sourceKind ?? meta.source;
  const k = SOURCE_KIND[kind];
  const parts = [];

  parts.push(`<header class="panel-head">
    <div class="panel-title-row">
      <h2>${esc(meta.labelZh)}</h2>
      <span class="src" style="color:${k.fg};background:${k.bg};border-color:${k.bd}" title="${esc(k.note)}">${esc(k.label)}</span>
    </div>
    <p class="panel-sub">${esc(meta.labelEn)} · /admin${meta.href.replace('/admin', '')}</p>
    <div class="panel-meta">
      <span>provider: ${esc(payload.source ?? '—')}</span>
      ${kind === 'static' && meta.snapshotDate ? `<span class="warn-chip">数字核对于 ${esc(meta.snapshotDate)} — 之后站点的变化不会反映在这里</span>` : ''}
      ${payload.measuredAt ? `<span>数字产出时间 ${esc(payload.measuredAt)}</span>` : ''}
    </div>
  </header>`);

  if (kind === 'static') {
    parts.push(
      `<div class="banner amber">⚠ 本面板的数字是人工核对的静态快照，不随站点变化自动更新。不要用它做当日决策。</div>`
    );
  } else if (kind === 'derived') {
    parts.push(
      `<div class="banner green">本面板的数字在生成时从本地仓库重新计算。但它只能看到本地文件——索引状态、排名、流量等外部信号不在此列。</div>`
    );
  }

  if (payload.pills?.length) {
    parts.push(`<div class="pills">${payload.pills.map((p) => pill(p.level, p.label, p.detail)).join('')}</div>`);
  }
  if (payload.metrics?.length) {
    parts.push(`<div class="metrics">${payload.metrics.map(metricCard).join('')}</div>`);
  }
  if (payload.checklists?.length) {
    parts.push(`<div class="checks">${payload.checklists.map(checklistBlock).join('')}</div>`);
  }
  if (payload.tables?.length) {
    for (const t of payload.tables) {
      parts.push(
        `<section class="card"><header class="card-head"><h3>${esc(t.title)}</h3></header><div class="card-body">${tableBlock(t)}</div></section>`
      );
    }
  }
  if (payload.timelines?.length) parts.push(timelineBlock(payload.timelines));
  if (payload.notes?.length) {
    parts.push(
      `<section class="notes"><h4>数据说明与已知限制</h4><ul>${payload.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>`
    );
  }

  return `<section class="panel" id="panel-${key}" data-key="${key}">${parts.join('\n')}</section>`;
}

// ---------------------------------------------------------------- board
// The SEO/GEO execution board. Rendered from data/seo-geo-board.json for the
// day the file is generated, so the offline copy shows the same "today" the
// live route would.

const PRIORITY_COLOR = {
  P0: { fg: '#be123c', bg: '#fff1f2', bd: '#fecdd3' },
  P1: { fg: '#b45309', bg: '#fffbeb', bd: '#fde68a' },
  P2: { fg: '#0369a1', bg: '#f0f9ff', bd: '#bae6fd' },
  P3: { fg: '#4b5563', bg: '#f9fafb', bd: '#e5e7eb' },
};

const chip = (text, c) =>
  `<span class="pill" style="color:${c.fg};background:${c.bg};border-color:${c.bd}">${esc(text)}</span>`;

const priChip = (p) => chip(p, PRIORITY_COLOR[p] ?? PRIORITY_COLOR.P3);

const RECUR = {
  daily: '每日',
  continuous: '持续',
  weekly: '每周',
  'weekly-monday': '每周一',
  'every-2-days': '隔日',
  'monthly-first-week': '每月首周',
  'monthly-end': '每月末',
  monthly: '每月',
  quarterly: '每季首周',
  'per-change': '每次改动',
  'per-round': '每轮',
};

const STATUS_COLOR = {
  todo: { fg: '#4b5563', bg: '#f9fafb', bd: '#e5e7eb' },
  doing: { fg: '#1d4ed8', bg: '#eff6ff', bd: '#bfdbfe' },
  done: { fg: '#047857', bg: '#ecfdf5', bd: '#a7f3d0' },
  blocked: { fg: '#be123c', bg: '#fff1f2', bd: '#fecdd3' },
  dropped: { fg: '#9ca3af', bg: '#f9fafb', bd: '#e5e7eb' },
};

const STATUS_LABEL = {
  todo: '未开始',
  doing: '进行中',
  done: '已完成',
  blocked: '受阻',
  dropped: '已弃用',
};

function fmtMd(d) {
  if (!d) return '—';
  const [, m, day] = d.split('-');
  return `${Number(m)}/${Number(day)}`;
}

function boardSection(view, data) {
  const t = view.totals;

  const stat = (label, value, tone) =>
    `<div class="bstat"${tone ? ` style="color:${tone}"` : ''}><span class="bstat-l">${esc(label)}</span><span class="bstat-v">${esc(String(value))}</span></div>`;

  const stats = `<div class="bstats">
    ${stat('任务总数', t.tasks)}
    ${stat('已完成', t.done, '#059669')}
    ${stat('未完成', t.open)}
    ${stat('P0 未完成', t.p0Open, t.p0Open > 0 ? '#be123c' : '#059669')}
    ${stat('已逾期', t.overdue, t.overdue > 0 ? '#be123c' : '#059669')}
    ${stat('今日到期', view.dueToday.length, view.dueToday.length > 0 ? '#b45309' : '#059669')}
  </div>`;

  const taskRows = (items, kindOf) =>
    items.length === 0
      ? `<tr><td colspan="7" class="empty">${
          kindOf === 'recheck'
            ? '复查队列为空。'
            : '今日无有期任务 —— 清空。可从常驻纪律或模块进度里挑活。'
        }</td></tr>`
      : items
          .map(
            (d) => `<tr>
        <td>${priChip(d.priority)}</td>
        <td class="mono dim">${esc(d.taskId)}</td>
        <td><b>${esc(d.action)}</b>${d.daysLate ? ` <span class="late">逾期 ${d.daysLate} 天</span>` : ''}</td>
        <td class="dim small">${esc(d.moduleId)} ${esc(d.moduleName)}</td>
        <td class="mono small">${esc(d.owner)}</td>
        <td>${d.status ? chip(STATUS_LABEL[d.status] ?? d.status, STATUS_COLOR[d.status] ?? STATUS_COLOR.todo) : ''}</td>
        <td class="small dim">${d.recurring ? esc(RECUR[d.recurring] ?? d.recurring) : esc(fmtMd(d.date))}</td>
      </tr>`
          )
          .join('');

  const taskTable = (items, kindOf) =>
    `<div class="tw"><table><thead><tr><th>优先级</th><th>编号</th><th>动作</th><th>模块</th><th>责任人</th><th>状态</th><th>${
      kindOf === 'recheck' ? '复查日期' : kindOf === 'standing' ? '触发' : '周期/到期'
    }</th></tr></thead><tbody>${taskRows(items, kindOf)}</tbody></table></div>`;

  // Standing cadences fire every day by construction. Collapsed with <details>
  // so they cannot bury the dated work that actually has to ship today.
  const standingBlock =
    view.standing.length === 0
      ? ''
      : `<details class="standing">
    <summary><span class="tri">▸</span> <b>常驻纪律</b> <span class="dim small">${view.standing.length} 项 · 持续 / 每次变更 / 每轮，每日均适用</span></summary>
    <p class="dim small" style="margin:8px 0">这些条目没有「完成」状态——它们是每天都生效的工作纪律，不是今天的交付物。单列出来，避免把真正要出货的有期任务淹掉。</p>
    ${taskTable(view.standing, 'standing')}
  </details>`;

  const anchorCards = view.anchors
    .map((a) => {
      const tone = a.passed
        ? { fg: '#9ca3af', bd: '#e5e7eb', bg: '#ffffff' }
        : a.daysLeft <= 3
          ? { fg: '#be123c', bd: '#fecdd3', bg: '#fff1f2' }
          : a.daysLeft <= 7
            ? { fg: '#b45309', bd: '#fde68a', bg: '#fffbeb' }
            : { fg: '#111827', bd: '#e5e7eb', bg: '#ffffff' };
      const big = a.passed ? '已过' : a.isToday ? '今天' : `${a.daysLeft}天`;
      return `<div class="anchor" style="border-color:${tone.bd};background:${tone.bg}">
        <div class="anchor-head"><span class="dim small">${esc(a.date)}</span><span class="anchor-n" style="color:${tone.fg}">${esc(big)}</span></div>
        <div class="anchor-t">${esc(a.label)}</div>
        <p class="dim small">${esc(a.detail)}</p>
      </div>`;
    })
    .join('');

  const modCards = view.modules
    .map((m) => {
      const tone = m.done === m.total ? '#10b981' : m.overdue > 0 ? '#f59e0b' : '#3b82f6';
      const tierChip =
        m.tier === 'CORE'
          ? chip('§原文', { fg: '#4b5563', bg: '#f9fafb', bd: '#e5e7eb' })
          : chip('🧩补全', { fg: '#7e22ce', bg: '#faf5ff', bd: '#e9d5ff' });
      return `<div class="mod">
      <div class="mod-head"><div><span class="mono dim small">${esc(m.id)}</span> ${tierChip}<div class="mod-name">${esc(m.name)}</div></div>
        <span class="mod-n"><b>${m.done}</b><span class="dim">/${m.total}</span></span></div>
      <div class="bar"><i style="width:${m.pct}%;background:${tone}"></i></div>
      <div class="mod-meta">
        ${m.p0Open > 0 ? chip(`P0 剩 ${m.p0Open}`, PRIORITY_COLOR.P0) : chip('P0 清零', { fg: '#047857', bg: '#ecfdf5', bd: '#a7f3d0' })}
        ${m.doing > 0 ? chip(`进行 ${m.doing}`, { fg: '#1d4ed8', bg: '#eff6ff', bd: '#bfdbfe' }) : ''}
        ${m.standingOpen > 0 ? chip(`常驻 ${m.standingOpen}`, { fg: '#6d28d9', bg: '#f5f3ff', bd: '#ddd6fe' }) : ''}
        ${m.overdue > 0 ? chip(`逾期 ${m.overdue}`, PRIORITY_COLOR.P1) : ''}
        ${m.nextDue ? `<span class="dim small" style="margin-left:auto">下一个 ${esc(fmtMd(m.nextDue))}</span>` : ''}
      </div></div>`;
    })
    .join('');

  const socialCards = view.social
    .map(
      (s) => `<div class="mod">
      <div class="mod-head"><div><b>${s.channel === 'x' ? 'X' : 'Reddit'}</b> <span class="dim small">${esc(s.account)}</span></div>
        ${s.item ? chip('今日发布', { fg: '#047857', bg: '#ecfdf5', bd: '#a7f3d0' }) : chip('无排期', { fg: '#6b7280', bg: '#f9fafb', bd: '#e5e7eb' })}</div>
      <div class="mod-name" style="margin:6px 0 4px">${esc(s.item ?? '—')}</div>
      <p class="dim small" style="margin:0">${esc(s.note)}</p></div>`
    )
    .join('');

  const decisions = data.openDecisions
    .map(
      (d) => `<div class="note-item"><b>${esc(d.title)}</b><p class="dim small" style="margin:4px 0">${esc(d.context)}</p><p class="small" style="margin:0"><b>建议：</b>${esc(d.suggestion)}</p><p class="dim small" style="margin:4px 0 0">阻塞 ${esc(d.blocks)} · 决策人 ${esc(d.owner)}</p></div>`
    )
    .join('');

  return `<section class="panel" id="panel-board" data-key="board">
  <header class="phead">
    <div><h2>SEO / GEO 作战台</h2><p class="dim">今日工作 · 模块进度 · 关键节点 · 社媒排期。全部数字由 data/seo-geo-board.json 推导。</p></div>
    <span class="pkind">derived</span>
  </header>
  <p class="dim small" style="margin:-4px 0 12px">快照日 ${esc(view.today)} · D0 = ${esc(data.meta.d0)} · 共 ${view.modules.length} 个模块 / ${t.tasks} 条任务</p>
  ${stats}
  <h3 class="bh3" id="board-today">今日工作</h3>
  ${taskTable(view.dueToday, 'due')}
  ${standingBlock}
  ${view.overdue.length > 0 ? `<h3 class="bh3">已逾期 ${view.overdue.length} 项</h3>${taskTable(view.overdue, 'due')}` : '<p class="ok-note">当前无逾期项。</p>'}
  <h3 class="bh3" id="board-anchors">关键节点</h3>
  <div class="anchors">${anchorCards}</div>
  <h3 class="bh3" id="board-progress">模块进度</h3>
  <div class="mods">${modCards}</div>
  <h3 class="bh3" id="board-recheck">复查队列</h3>
  ${taskTable(view.recheckQueue, 'recheck')}
  <h3 class="bh3" id="board-social">社媒排期</h3>
  <div class="mods two">${socialCards}</div>
  ${decisions ? `<h3 class="bh3">待你决策</h3><div class="notes">${decisions}</div>` : ''}
  <section class="notes">
    <h4>数据说明</h4>
    <ul>
      <li>改 <span class="mono">data/seo-geo-board.json</span> 即改本页，无需改代码。</li>
      <li>纪律：${esc(data.meta.discipline)}</li>
    </ul>
  </section>
</section>`;
}

// ---------------------------------------------------------------- keywords
// The keyword ranking table. The SEO/GEO board only ever said "build the
// keyword sheet" — it never showed data. This is the data.
function keywordSection(series) {
  if (!series) {
    return `<section class="panel" id="panel-keywords" data-key="keywords">
  <header class="phead">
    <div><h2>关键词排名</h2><p class="dim">尚未生成 data/keyword-series.json。</p></div>
    <span class="pkind">derived</span>
  </header>
  <section class="notes"><h4>如何生成</h4><ul>
    <li><span class="mono">npm run fetch:bing</span> → <span class="mono">npm run fetch:gsc</span> → <span class="mono">npm run build:keywords</span></li>
  </ul></section>
</section>`;
  }

  const b = series.bing;
  const g = series.gsc;
  const t = b?.totals;

  const stat = (label, value, tone) =>
    `<div class="bstat"${tone ? ` style="color:${tone}"` : ''}><span class="bstat-l">${esc(label)}</span><span class="bstat-v">${esc(String(value))}</span></div>`;

  const stats = t
    ? `<div class="bstats">
    ${stat('唯一关键词', t.keywords)}
    ${stat('可比(≥2点)', t.comparable, '#b45309')}
    ${stat('名次上升', t.up, '#059669')}
    ${stat('名次下降', t.down, t.down > 0 ? '#be123c' : '#059669')}
    ${stat('单点词', t.singlePoint)}
    ${stat('丢弃残留', t.droppedJunk)}
  </div>`
    : '';

  const caveats = b?.caveats?.length
    ? `<div class="banner amber" style="margin:10px 0"><b>读数前必须知道的三件事</b><ul style="margin:6px 0 0;padding-left:18px">${b.caveats
        .map((c) => `<li>${esc(c)}</li>`)
        .join('')}</ul></div>`
    : '';

  const posColor = (p) => (p === null || p === undefined ? 'var(--muted)' : p <= 3 ? '#059669' : p <= 10 ? '#1d4ed8' : p <= 20 ? '#b45309' : 'var(--muted)');

  const kwRow = (k) => {
    const d = k.delta;
    const deltaCell =
      d === null
        ? '<span class="dim small">无基准</span>'
        : d === 0
          ? '<span class="dim small">持平</span>'
          : `<b style="color:${d > 0 ? '#e11d48' : '#059669'}">${d > 0 ? '↑' : '↓'}${Math.abs(d)}</b>`;
    return `<tr>
      <td><b>${esc(k.query)}</b>${k.observations < 2 ? ' <span class="dim small">单点</span>' : ''}</td>
      <td style="text-align:right;font-weight:600;color:${posColor(k.latest?.impressionPosition)}">${k.latest?.impressionPosition ?? '—'}</td>
      <td style="text-align:right" class="dim">${k.previous?.impressionPosition ?? '—'}</td>
      <td style="text-align:right">${deltaCell}</td>
      <td style="text-align:right" class="dim">${k.latest?.impressions ?? '—'}</td>
      <td style="text-align:right" class="dim">${k.latest?.clicks ?? '—'}</td>
      <td style="text-align:right" class="dim small">${k.observations}</td>
    </tr>`;
  };

  const kwTable = (rows) =>
    `<div class="tw"><table><thead><tr>
      <th>关键词</th><th style="text-align:right">最新排名</th><th style="text-align:right">前一期</th>
      <th style="text-align:right">Δ</th><th style="text-align:right">展示</th><th style="text-align:right">点击</th>
      <th style="text-align:right">观测</th></tr></thead>
      <tbody>${
        rows.length === 0
          ? '<tr><td colspan="7" class="empty">无数据</td></tr>'
          : rows.map(kwRow).join('')
      }</tbody></table></div>`;

  const movers = (b?.keywords ?? []).filter((k) => k.delta !== null && k.delta !== 0).sort((x, y) => y.delta - x.delta);
  const top = (b?.keywords ?? [])
    .filter((k) => k.latest?.impressionPosition !== null && k.latest?.impressionPosition !== undefined)
    .sort((x, y) => x.latest.impressionPosition - y.latest.impressionPosition)
    .slice(0, 25);

  const gscBlock = g
    ? `<h3 class="bh3">Google Search Console</h3>
  <p class="dim small" style="margin:0 0 8px">${esc(g.label)} · ${g.snapshots} 次导出 · ${g.totals.keywords} 个词 · 窗口 ${
        g.distinctWindowDays.join(' / ')
      } 天 → 可比性 = <b style="color:${g.comparable ? '#059669' : '#be123c'}">${g.comparable ? '是' : '否'}</b></p>
  ${
    g.comparable
      ? ''
      : `<div class="banner amber" style="margin:0 0 10px"><b>这份 GSC 数据不能用来做跨日对比</b><ul style="margin:6px 0 0;padding-left:18px">${g.caveats
          .map((c) => `<li>${esc(c)}</li>`)
          .join('')}</ul><p style="margin:6px 0 0">修法：固定导出参数（同一窗口长度、同一行数上限）后重跑 <span class="mono">npm run fetch:gsc</span>。</p></div>`
  }
  <div class="tw"><table><thead><tr><th>导出日</th><th>区间</th><th style="text-align:right">窗口</th><th style="text-align:right">行数</th></tr></thead>
  <tbody>${g.windows
    .map(
      (w) =>
        `<tr><td class="mono small">${esc(w.fetchedAt)}</td><td class="dim small">${esc(w.start)} → ${esc(w.end)}</td><td style="text-align:right" class="dim small">${w.windowDays} 天</td><td style="text-align:right" class="dim small">${w.rows}</td></tr>`
    )
    .join('')}</tbody></table></div>`
    : '';

  return `<section class="panel" id="panel-keywords" data-key="keywords">
  <header class="phead">
    <div><h2>关键词排名</h2><p class="dim">排名位置 · 变化 Δ · 展示点击。数据源 data/keyword-series.json（由 npm run build:keywords 从原始快照合并）。</p></div>
    <span class="pkind">derived</span>
  </header>
  ${stats}
  ${caveats}
  <h3 class="bh3">名次变动（按 Δ 排序）</h3>
  ${kwTable(movers)}
  <h3 class="bh3">最新排名 Top 25</h3>
  ${kwTable(top)}
  ${gscBlock}
  <section class="notes">
    <h4>数据说明</h4>
    <ul>
      <li>Δ = 该词「最近两次观测」之差；正数 = 名次上升（数字变小）。两点间隔见悬停提示或 CSV 的 SpanDays 列。</li>
      <li>只有 ≥2 个观测点的词才有 Δ；单点词标「单点」，无法判断趋势。</li>
      <li>完整表格：<span class="mono">数据分析/keyword-rank-latest.csv</span> 与 <span class="mono">keyword-rank-series.csv</span>。</li>
      <li>原始快照在 <span class="mono">数据分析/</span>，该目录<b>未纳入版本控制</b>。</li>
      <li>生成于 ${esc(series.generatedAt)}</li>
    </ul>
  </section>
</section>`;
}

// ---------------------------------------------------------------- competitors
// The competitor keyword-ranking table (table ③). Until fetch:competitor has
// been run with a SERP key, the matrix is empty and we show the setup steps.
const COMP_TREND = {
  up: '上升',
  down: '下降',
  flat: '持平',
  new: '新进Top100',
  gone: '掉出Top100',
  'no-data': '无数据',
};
function competitorSection(series) {
  if (!series || series.matrix.length === 0) {
    return `<section class="panel" id="panel-competitors" data-key="competitors">
  <header class="phead">
    <div><h2>竞品关键词排名</h2><p class="dim">还没有竞品排名数据。</p></div>
    <span class="pkind">derived</span>
  </header>
  <div class="notes">
    <p>先抓一次 SERP（需要 <span class="mono">SERPAPI_KEY</span> 或 <span class="mono">BING_WEB_SEARCH_KEY</span>）：</p>
    <pre class="mono">npm run fetch:competitor
npm run build:competitor</pre>
    <p>配置在 <span class="mono">data/competitor-config.json</span>（盯哪些竞品 / 哪些词都能改）。没有 key 时不编造竞品排名。</p>
  </div>
</section>`;
  }
  const t = series.totals;
  const cstat = (label, value, tone) =>
    `<div class="bstat"${tone ? ` style="color:${tone}"` : ''}><span class="bstat-l">${esc(label)}</span><span class="bstat-v">${esc(String(value))}</span></div>`;
  const rows = series.matrix
    .slice(0, 400)
    .map(
      (r) => `<tr>
      <td><b>${esc(r.name)}</b> <span class="dim small">${esc(r.domain)}</span></td>
      <td>${esc(r.query)}</td>
      <td style="text-align:right;font-weight:600">${r.latestRank ?? '—'}</td>
      <td style="text-align:right" class="dim">${r.prevRank ?? '—'}</td>
      <td style="text-align:right">${
        r.delta == null
          ? '<span class="dim small">—</span>'
          : `<b style="color:${r.delta > 0 ? '#e11d48' : '#059669'}">${r.delta > 0 ? '↑' : '↓'}${Math.abs(r.delta)}</b>`
      }</td>
      <td>${esc(COMP_TREND[r.trend] || r.trend)}</td>
      <td style="text-align:right" class="dim small">${esc(r.latestDate ?? '—')}</td>
    </tr>`
    )
    .join('');
  return `<section class="panel" id="panel-competitors" data-key="competitors">
  <header class="phead">
    <div><h2>竞品关键词排名</h2><p class="dim">竞品在目标词上的排名与变化。数据源 data/competitor-series.json（npm run build:competitor 合并）。</p></div>
    <span class="pkind">derived</span>
  </header>
  <div class="bstats">
    ${cstat('快照数', t.snapshots)}
    ${cstat('竞品×词', t.pairs)}
    ${cstat('竞品上升', t.up, '#059669')}
    ${cstat('竞品下降', t.down, '#dc2626')}
    ${cstat('新进Top100', t.new, '#059669')}
    ${cstat('掉出Top100', t.gone, '#b45309')}
  </div>
  <div class="tw"><table><thead><tr>
    <th>竞品</th><th>目标词</th><th style="text-align:right">最新</th><th style="text-align:right">上期</th>
    <th style="text-align:right">Δ</th><th>趋势</th><th style="text-align:right">日期</th>
  </tr></thead><tbody>${
    rows.length === 0 ? '<tr><td colspan="7" class="empty">无数据</td></tr>' : rows
  }</tbody></table></div>
  <section class="notes">
    <h4>数据说明</h4>
    <ul>
      <li>Δ = 上期排名 − 本期排名；正数 = 竞品名次上升（对它有利）。rank 为 — 表示该日未进 Top-100。</li>
      <li>抓取配置在 <span class="mono">data/competitor-config.json</span>。</li>
      <li>生成于 ${esc(series.generatedAt)}</li>
    </ul>
  </section>
</section>`;
}

// ---------------------------------------------------------------- main
async function main() {
  console.log('transpiling workbench data layer...');
  const providerUrl = prepareDataLayer();
  const { getAllWorkbenchPayloads } = await import(providerUrl);
  const { PANELS } = await import(pathToFileURL(join(TMP, 'lib/workbench/panels.mjs')).href);
  const { SOURCE_LABEL } = await import(pathToFileURL(join(TMP, 'lib/workbench/panels.mjs')).href);

  console.log('collecting panel data (runs the audit scripts)...');
  const payloads = await getAllWorkbenchPayloads();

  console.log('deriving SEO/GEO board...');
  const boardMod = await import(pathToFileURL(join(TMP, 'lib/board/loader.mjs')).href);
  const deriveMod = await import(pathToFileURL(join(TMP, 'lib/board/derive.mjs')).href);
  const boardData = boardMod.loadBoardData(ROOT);
  const boardView = deriveMod.deriveBoard(boardData, deriveMod.isoDay(new Date()));
  const boardHtml = boardSection(boardView, boardData);

  console.log('loading keyword series...');
  const kwMod = await import(pathToFileURL(join(TMP, 'lib/keywords/loader.mjs')).href);
  const kwSeries = kwMod.loadKeywordSeries(ROOT);
  const keywordHtml = keywordSection(kwSeries);

  console.log('loading competitor series...');
  const compSeries = kwMod.loadCompetitorSeries(ROOT);
  const competitorHtml = competitorSection(compSeries);

  const generatedAt = new Date();
  const staticCount = PANELS.filter((p) => p.source === 'static').length;

  // `board` is not provider-backed, so it is excluded from payload lookups and
  // rendered from its own data file instead.
  const providerPanels = PANELS.filter(
    (p) => p.key !== 'board' && p.key !== 'keywords' && p.key !== 'competitors',
  );

  const nav = PANELS.map(
    (p) => `<li><a href="#panel-${p.key}" data-key="${p.key}">
      <span class="nav-label">${esc(p.labelZh)}</span>
      <span class="nav-src ${p.source}">${p.source === 'static' ? 'SNAP' : p.source === 'remote' ? 'LIVE' : 'CALC'}</span>
    </a></li>`
  ).join('');

  const overview = payloads.overview;
  const grid = providerPanels
    .filter((p) => p.key !== 'overview')
    .map((p) => {
      const pl = payloads[p.key];
      const ms = (pl?.metrics ?? []).slice(0, 2);
      const crit = (pl?.pills ?? []).filter((x) => x.level === 'critical').length;
      const warn = (pl?.pills ?? []).filter((x) => x.level === 'warning').length;
      const rows = ms.length
        ? ms
            .map(
              (m) =>
                `<div class="gc-row"><span>${esc(m.label)}</span><b>${esc(m.value)}</b></div>`
            )
            .join('')
        : '<p class="gc-none">待接入数据源</p>';
      const badges = [
        crit ? pill('critical', `${crit} critical`) : '',
        warn ? pill('warning', `${warn} warning`) : '',
      ].join('');
      return `<a class="grid-card ${p.source}" href="#panel-${p.key}">
        <div class="gc-head"><div><p class="gc-title">${esc(p.labelZh)}</p><p class="gc-sub">${esc(p.labelEn)}</p></div><span class="src ${p.source}">${esc(SOURCE_LABEL[p.source].short)}</span></div>
        <div class="gc-body">${rows}</div>
        ${badges ? `<div class="pills">${badges}</div>` : ''}
      </a>`;
    })
    .join('');

  const panelsHtml =
    boardHtml +
    '\n' +
    keywordHtml +
    '\n' +
    competitorHtml +
    '\n' +
    providerPanels.map((p) => renderPanel(p.key, p, payloads[p.key] ?? {})).join('\n');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, nocache">
<title>BookConv 网站工作台 — 离线快照 ${generatedAt.toISOString().slice(0, 10)}</title>
<style>
:root{
  --bg:#f8fafc;--panel:#ffffff;--fg:#0f172a;--muted:#64748b;--line:#e2e8f0;
  --accent:#2563eb;--amber:#b45309;--green:#047857;
  --radius:12px;
}
@media (prefers-color-scheme:dark){
  :root{--bg:#0b0d12;--panel:#141821;--fg:#e5e7eb;--muted:#94a3b8;--line:#242a36;--accent:#60a5fa;}
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:16px}
body{margin:0;background:var(--bg);color:var(--fg);
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif;
  font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}
.layout{display:flex;min-height:100vh;align-items:flex-start}

/* sidebar */
.side{position:sticky;top:0;height:100vh;width:250px;flex:0 0 250px;overflow-y:auto;
  background:var(--panel);border-right:1px solid var(--line);padding:16px 12px}
.brand{display:flex;gap:10px;align-items:center;padding:0 6px 14px}
.brand-mark{width:32px;height:32px;border-radius:9px;background:var(--accent);color:#fff;
  display:grid;place-items:center;font-weight:800;font-size:12px;flex:0 0 auto}
.brand-name{font-weight:700;font-size:14px}
.brand-sub{font-size:11px;color:var(--muted)}
.nav{list-style:none;margin:0;padding:0}
.nav li{margin-bottom:2px}
.nav a{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:9px;
  color:var(--fg);font-size:13px;transition:background .12s}
.nav a:hover{background:rgba(37,99,235,.09)}
.nav a.active{background:rgba(37,99,235,.14);color:var(--accent);font-weight:600}
.nav-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nav-src{font-size:9px;letter-spacing:.04em;padding:1px 4px;border-radius:4px;border:1px solid;flex:0 0 auto}
.nav-src.static{color:var(--amber);border-color:#fcd34d;background:rgba(251,191,36,.12)}
.nav-src.derived{color:var(--green);border-color:#6ee7b7;background:rgba(16,185,129,.12)}
.nav-src.remote{color:var(--accent);border-color:#bfdbfe;background:rgba(59,130,246,.12)}
.side-foot{margin-top:16px;padding:10px;border-radius:10px;background:var(--bg);
  font-size:11px;color:var(--muted);line-height:1.5}

/* main */
.main{flex:1;min-width:0;padding:22px 26px 60px;max-width:1180px}
.page-head{margin-bottom:20px}
.page-head h1{margin:0;font-size:21px;letter-spacing:-.01em}
.page-head p{margin:6px 0 0;color:var(--muted);font-size:13px;max-width:76ch}
.stamp{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--muted)}
.stamp span{border:1px solid var(--line);border-radius:999px;padding:2px 9px}
.stamp .hot{border-color:#fcd34d;color:var(--amber)}

.banner{border-radius:10px;padding:9px 12px;font-size:12px;margin:14px 0;border:1px solid}
.banner.amber{background:rgba(251,191,36,.12);border-color:#fcd34d;color:#92400e}
.banner.green{background:rgba(16,185,129,.1);border-color:#a7f3d0;color:#065f46}
@media (prefers-color-scheme:dark){
  .banner.amber{color:#fcd34d}.banner.green{color:#6ee7b7}
}

.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:12px;margin:18px 0 26px}
.grid-card{display:block;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);
  padding:14px;color:var(--fg);transition:border-color .15s,box-shadow .15s}
.grid-card:hover{box-shadow:0 4px 14px rgba(15,23,42,.08)}
.grid-card.static{border-color:#fcd34d}
.grid-card.static:hover{border-color:#f59e0b}
.grid-card.derived:hover{border-color:var(--accent)}
.gc-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.gc-title{margin:0;font-weight:650;font-size:13.5px}
.gc-sub{margin:2px 0 0;font-size:11px;color:var(--muted)}
.src{font-size:10px;font-weight:600;padding:2px 7px;border-radius:999px;border:1px solid;white-space:nowrap;flex:0 0 auto}
.src.static{color:var(--amber);background:rgba(251,191,36,.12);border-color:#fcd34d}
.src.derived{color:var(--green);background:rgba(16,185,129,.12);border-color:#a7f3d0}
.src.remote{color:var(--accent);background:rgba(59,130,246,.12);border-color:#bfdbfe}
.gc-body{margin-top:11px;display:flex;flex-direction:column;gap:5px}
.gc-row{display:flex;justify-content:space-between;gap:10px;font-size:11.5px;color:var(--muted)}
.gc-row b{color:var(--fg);font-variant-numeric:tabular-nums}
.gc-none{margin:0;font-size:11.5px;color:var(--muted)}

.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);
  padding:18px;margin-bottom:18px;scroll-margin-top:16px}
.panel-title-row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.panel-head h2{margin:0;font-size:17px;letter-spacing:-.01em}
.panel-sub{margin:3px 0 0;font-size:11.5px;color:var(--muted)}
.panel-meta{margin-top:9px;display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--muted)}
.panel-meta span{border:1px solid var(--line);border-radius:999px;padding:1px 8px}
.warn-chip{border-color:#fcd34d!important;color:var(--amber)!important}

.pills{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;
  padding:3px 10px;border-radius:999px;border:1px solid}
.pill i{width:6px;height:6px;border-radius:50%;display:block;flex:0 0 auto}

.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:14px 0}
.metric{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px}
.metric-label{margin:0;font-size:11px;font-weight:600;color:var(--muted)}
.metric-row{margin-top:5px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.metric-value{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums}
.metric-delta{font-size:11px;font-weight:600}
.metric-hint{margin:4px 0 0;font-size:10.5px;color:var(--muted);line-height:1.4}

.checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;margin:14px 0}
.card{background:var(--bg);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.card-head{display:flex;justify-content:space-between;align-items:center;gap:10px;
  padding:9px 13px;border-bottom:1px solid var(--line)}
.card-head h3{margin:0;font-size:12.5px;font-weight:650}
.count{font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.card-body{padding:12px 13px}
.progress{height:5px;border-radius:999px;background:var(--line);overflow:hidden;margin-bottom:11px}
.progress div{height:100%;border-radius:999px}
.cl{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.cl-item{display:flex;gap:9px;align-items:flex-start}
.tick{width:15px;height:15px;border-radius:50%;flex:0 0 auto;margin-top:2px;
  background:var(--line);display:grid;place-items:center;color:#fff;font-size:9px;font-weight:800}
.tick.on{background:#10b981}
.cl-body{min-width:0}
.cl-label{font-size:12.5px}
.cl-label.done{color:var(--muted);text-decoration:line-through}
.cl-detail{display:block;font-size:11px;color:var(--muted);margin-top:1px}

.table-wrap{overflow-x:auto;margin:0 -13px}
table{border-collapse:collapse;width:100%;min-width:520px;font-size:12.5px}
th{font-size:11px;font-weight:600;color:var(--muted);text-align:left;
  padding:7px 11px;border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:8px 11px;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover{background:rgba(37,99,235,.04)}
td:first-child{font-weight:600}
.dash{color:var(--muted)}
.empty{margin:0;padding:18px;text-align:center;color:var(--muted);font-size:12.5px}

.tl{list-style:none;margin:0;padding:0 0 0 16px;position:relative}
.tl::before{content:"";position:absolute;left:3px;top:5px;bottom:5px;width:1px;background:var(--line)}
.tl-item{position:relative;margin-bottom:13px}
.tl-dot{position:absolute;left:-16px;top:5px;width:7px;height:7px;border-radius:50%;display:block}
.tl-title{margin:0;font-size:12.5px}
.tl-detail{margin:2px 0 0;font-size:11.5px;color:var(--muted)}
.tl-meta{margin:2px 0 0;font-size:10.5px;color:var(--muted)}

.notes{background:rgba(148,163,184,.08);border:1px solid var(--line);border-radius:10px;
  padding:12px 14px;margin-top:14px}
.notes h4{margin:0 0 7px;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.notes ul{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:5px}
.notes li{font-size:11.5px;color:var(--muted);line-height:1.55}

.page-foot{margin-top:30px;padding-top:16px;border-top:1px solid var(--line);
  font-size:11px;color:var(--muted);line-height:1.7}

.mobile-bar{display:none}
@media(max-width:900px){
  .side{display:none}
  .mobile-bar{display:flex;position:sticky;top:0;z-index:20;align-items:center;gap:10px;
    background:var(--panel);border-bottom:1px solid var(--line);padding:10px 14px}
  .mobile-bar select{flex:1;padding:7px 9px;border-radius:8px;border:1px solid var(--line);
    background:var(--bg);color:var(--fg);font-size:13px}
  .main{padding:16px 14px 50px}
  .metrics{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
  .checks{grid-template-columns:1fr}
}
/* ---- SEO/GEO board ---- */
.bstats{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin:0 0 16px}
.bstat{background:var(--card);border:1px solid var(--line);border-radius:9px;padding:9px 11px;display:flex;flex-direction:column;gap:2px}
.bstat-l{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.bstat-v{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums;color:inherit}
.bstat[style*="color"] .bstat-v{color:inherit}
.bh3{font-size:13px;font-weight:600;margin:20px 0 9px}
.mods{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.mods.two{grid-template-columns:repeat(2,1fr)}
.mod{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:11px}
.mod-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.mod-name{font-size:12.5px;font-weight:600;margin-top:3px}
.mod-n{font-size:16px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.bar{height:5px;background:rgba(148,163,184,.18);border-radius:99px;overflow:hidden;margin:9px 0 8px}
.bar i{display:block;height:100%;border-radius:99px}
.mod-meta{display:flex;flex-wrap:wrap;align-items:center;gap:5px}
.standing{background:rgba(148,163,184,.06);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-top:10px}
.standing>summary{cursor:pointer;font-size:12.5px;list-style:none}
.standing>summary::-webkit-details-marker{display:none}
.standing .tri{color:var(--muted);display:inline-block;transition:transform .15s}
.standing[open] .tri{transform:rotate(90deg)}
.anchors{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
.anchor{border:1px solid var(--line);border-radius:10px;padding:10px 11px}
.anchor-head{display:flex;align-items:baseline;justify-content:space-between;gap:6px}
.anchor-n{font-size:20px;font-weight:700;font-variant-numeric:tabular-nums}
.anchor-t{font-size:12.5px;font-weight:600;margin:4px 0 2px}
.anchor p{margin:0;line-height:1.5}
.ok-note{font-size:11.5px;color:#047857;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);border-radius:8px;padding:8px 11px;margin:0}
.note-item{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:8px}
.note-item b{font-size:12.5px}
.late{color:#be123c;font-size:10.5px;font-weight:500}
tbody td .dim,td.dim{color:var(--muted)}
@media (max-width:1100px){
  .bstats{grid-template-columns:repeat(3,1fr)}
  .mods{grid-template-columns:repeat(2,1fr)}
  .anchors{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:640px){
  .bstats{grid-template-columns:repeat(2,1fr)}
  .mods,.mods.two,.anchors{grid-template-columns:1fr}
}
@media print{
  .side,.mobile-bar{display:none}
  .panel{break-inside:avoid;border-color:#ccc}
  body{background:#fff}
  .nav a,.grid-card{break-inside:avoid}
}
</style>
</head>
<body>
<div class="mobile-bar">
  <select id="jump" aria-label="跳转到模块">
    ${PANELS.map((p) => `<option value="panel-${p.key}">${esc(p.labelZh)}</option>`).join('')}
  </select>
</div>
<div class="layout">
  <aside class="side">
    <div class="brand">
      <span class="brand-mark">BC</span>
      <div><div class="brand-name">BookConv</div><div class="brand-sub">网站工作台 · 离线快照</div></div>
    </div>
    <ul class="nav" id="nav">${nav}</ul>
    <div class="side-foot">
      生成于 ${esc(generatedAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }))}<br>
      单文件离线快照，无外部请求。<br>
      ${staticCount} / ${PANELS.length} 个模块为静态快照，其余生成时重算。
    </div>
  </aside>

  <main class="main">
    <div class="page-head">
      <h1>网站工作台</h1>
      <p>全站状态汇总。每个模块都标注数据来源类型：<b>实时计算</b> = 生成时从本地仓库重算；<b>实时接口</b> = 外部 API；<b>快照</b> = 人工核对的静态数字。</p>
      <div class="stamp">
        <span>生成时间 ${esc(generatedAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }))}</span>
        <span>模块 ${PANELS.length}</span>
        <span class="hot">快照 ${staticCount}</span>
        <span>provider: ${esc(overview?.source ?? 'repo')}</span>
      </div>
    </div>

    <div class="grid">${grid}</div>

    ${panelsHtml}

    <div class="page-foot">
      <p><b>这份文件是离线快照。</b>生成脚本：<code>node scripts/build-workbench-html.mjs</code>（<code>npm run build:workbench</code>）。
      数据来自与线上 <code>/admin</code> 相同的 provider，但数字冻结在生成时刻。</p>
      <p>⚠ 快照模块的数字标注了核对日期，之后站点的变化不会反映在这里。用于决策前请重新生成，或访问线上 <code>/admin</code> 查看实时版本。</p>
      <p>本文件已设 <code>noindex</code>，且不在站点 sitemap 内。</p>
    </div>
  </main>
</div>
<script>
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('#nav a'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var jump = document.getElementById('jump');
  if (jump) {
    jump.addEventListener('change', function(){
      var el = document.getElementById(jump.value);
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }
  function activate(key){
    links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('data-key') === key); });
    if (jump) jump.value = 'panel-' + key;
  }
  if ('IntersectionObserver' in window) {
    var visible = {};
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        visible[en.target.getAttribute('data-key')] = en.isIntersecting;
      });
      for (var i = 0; i < panels.length; i++) {
        var k = panels[i].getAttribute('data-key');
        if (visible[k]) { activate(k); break; }
      }
    }, {rootMargin:'-10% 0px -70% 0px', threshold:0});
    panels.forEach(function(p){ io.observe(p); });
  }
  activate(${JSON.stringify('overview')});
})();
</script>
</body>
</html>`;

  writeFileSync(OUT, html, 'utf8');
  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`\nworkbench written: ${OUT}`);
  console.log(`  size: ${kb} KB`);
  console.log(`  panels: ${PANELS.length} (${staticCount} static snapshots)`);
  console.log(`  external requests: 0\n`);
  return OUT;
}

main().catch((err) => {
  console.error('build-workbench-html failed:', err);
  process.exit(1);
});
