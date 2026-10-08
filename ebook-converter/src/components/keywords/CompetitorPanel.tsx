'use client';
// src/components/keywords/CompetitorPanel.tsx
// Renders data/competitor-series.json: for each rival domain, where it ranks
// on each of our target keywords, and how that changed (Δ / trend).
//
// This is table ③ — the "竞品关键词变化" view the SEO/GEO board never had data
// for. Until fetch-competitor-serp.mjs has been run with a SERP key, the matrix
// is empty and the panel explains what to do instead of showing blanks.
import * as React from 'react';
import {
  TREND_LABEL,
  sortCompetitorRows,
  type CompetitorRow,
  type CompetitorSeriesData,
  type CompSortKey,
  type CompSortDir,
} from '@/lib/keywords/competitor';
import {
  latestCompetitorDecisionByKey,
  competitorDecisionKey,
  type CompetitorDecision,
} from '@/lib/keywords/decisions';
import { Callout, Stat } from '@/components/board/primitives';

/** A judgement cell: shows the ledger value, or a muted dash when unset. */
function DecisionCell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-gray-300 dark:text-gray-600">—</span>;
  return (
    <span className="text-xs text-gray-600 dark:text-gray-300" title={value}>
      {value}
    </span>
  );
}

function rankTone(p: number | null): string {
  if (p === null) return 'text-gray-400 dark:text-gray-500';
  if (p <= 3) return 'text-rose-600 dark:text-rose-400';
  if (p <= 10) return 'text-amber-600 dark:text-amber-400';
  if (p <= 20) return 'text-blue-600 dark:text-blue-400';
  return 'text-gray-600 dark:text-gray-300';
}

function TrendCell({ r }: { r: CompetitorRow }) {
  const map: Record<string, string> = {
    up: 'text-rose-600 dark:text-rose-400',
    down: 'text-emerald-600 dark:text-emerald-400',
    flat: 'text-gray-400 dark:text-gray-500',
    new: 'text-rose-500 dark:text-rose-300',
    gone: 'text-gray-500 dark:text-gray-400',
    'no-data': 'text-gray-300 dark:text-gray-600',
  };
  const label = TREND_LABEL[r.trend];
  if (r.trend === 'up' || r.trend === 'new') {
    return <span className={'font-semibold tabular-nums ' + map[r.trend]}>↑ {label}</span>;
  }
  if (r.trend === 'down' || r.trend === 'gone') {
    return <span className={'font-semibold tabular-nums ' + map[r.trend]}>↓ {label}</span>;
  }
  return <span className={'tabular-nums ' + map[r.trend]}>{label}</span>;
}

function fmt(p: number | null): string {
  return p === null ? '—' : String(p);
}

export function CompetitorPanel({
  data,
  decisions = [],
}: {
  data: CompetitorSeriesData;
  /** Human judgement ledger (New Page / Content Diff / AI Mention / Our Gap / Action). */
  decisions?: CompetitorDecision[];
}) {
  const [comp, setComp] = React.useState<string>('all');
  const [q, setQ] = React.useState('');
  const [sortKey, setSortKey] = React.useState<CompSortKey>('delta');
  const [sortDir, setSortDir] = React.useState<CompSortDir>('desc');

  const decisionMap = React.useMemo(() => latestCompetitorDecisionByKey(decisions), [decisions]);

  const rows = React.useMemo(() => {
    let out = data.matrix;
    if (comp !== 'all') out = out.filter((r) => r.domain === comp);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      out = out.filter((r) => r.query.toLowerCase().includes(needle) || r.name.toLowerCase().includes(needle));
    }
    return sortCompetitorRows(out, sortKey, sortDir);
  }, [data.matrix, comp, q, sortKey, sortDir]);

  const toggleSort = (key: CompSortKey) => {
    if (key === sortKey) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir(key === 'query' || key === 'name' ? 'asc' : 'desc');
    }
  };

  if (data.matrix.length === 0) {
    return (
      <div className="space-y-6">
        <header className="border-b border-gray-200 pb-4 dark:border-white/10">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">竞品关键词排名</h1>
        </header>
        <Callout tone="warn" title="还没有竞品排名数据">
          需要先抓一次 SERP。设一个 SERP 数据源环境变量后：
          <pre className="mt-2 rounded-lg bg-gray-100 p-3 text-xs dark:bg-white/10">
{`# 二选一
export SERPAPI_KEY=xxx          # SerpApi Google
export BING_WEB_SEARCH_KEY=xxx  # Bing Web Search API v7

npm run fetch:competitor        # 抓一次，写 数据分析/competitor-serp-<date>.json
npm run build:competitor        # 合并成 data/competitor-series.json`}
          </pre>
          没有 key 时我不会编造竞品排名。配置在 <code className="rounded bg-gray-100 px-1 dark:bg-white/10">data/competitor-config.json</code>
          （盯哪些竞品、哪些词都能改）。
        </Callout>
      </div>
    );
  }

  const t = data.totals;
  return (
    <div className="space-y-6">
      <header className="border-b border-gray-200 pb-4 dark:border-white/10">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">竞品关键词排名</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          数据源 <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] dark:bg-white/10">data/competitor-series.json</code>
          {' · '}由 <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] dark:bg-white/10">npm run build:competitor</code> 从每日 SERP 快照合并
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <Stat label="快照数" value={t.snapshots} hint="合并了几个抓取日" />
        <Stat label="竞品×词" value={t.pairs} hint="监控对" />
        <Stat label="竞品上升" value={t.up} tone="good" />
        <Stat label="竞品下降" value={t.down} tone={t.down > 0 ? 'critical' : 'good'} />
        <Stat label="新进Top100" value={t.new} tone="good" />
        <Stat label="掉出Top100" value={t.gone} tone="warning" />
        <Stat label="无数据" value={t.noData} hint="从未进Top100" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={comp}
          onChange={(e) => setComp(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-white/15 dark:bg-white/5 dark:text-gray-100"
        >
          <option value="all">全部竞品</option>
          {data.config.competitors.map((c) => (
            <option key={c.domain} value={c.domain}>{c.name}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜词 / 竞品…"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-white/15 dark:bg-white/5 dark:text-gray-100"
        />
        <span className="text-xs text-gray-400 dark:text-gray-500">显示 {rows.length} / {data.matrix.length}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
        <table className="w-full min-w-[1500px] border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="cursor-pointer px-3 py-2 hover:text-gray-900 dark:hover:text-gray-100" onClick={() => toggleSort('name')}>竞品 {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              <th className="cursor-pointer px-3 py-2 hover:text-gray-900 dark:hover:text-gray-100" onClick={() => toggleSort('query')}>目标词 {sortKey === 'query' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              <th className="px-3 py-2">落地页</th>
              <th className="cursor-pointer px-3 py-2 text-right hover:text-gray-900 dark:hover:text-gray-100" onClick={() => toggleSort('latestRank')}>最新排名 {sortKey === 'latestRank' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              <th className="px-3 py-2 text-right">上期</th>
              <th className="cursor-pointer px-3 py-2 text-right hover:text-gray-900 dark:hover:text-gray-100" onClick={() => toggleSort('delta')}>Δ {sortKey === 'delta' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
              <th className="px-3 py-2">趋势</th>
              <th className="px-3 py-2 text-right">日期</th>
              <th className="px-3 py-2">新页·更新</th>
              <th className="px-3 py-2">内容差异</th>
              <th className="px-3 py-2">AI 提及</th>
              <th className="px-3 py-2">我方差距</th>
              <th className="px-3 py-2">动作</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 400).map((r) => {
              const d = decisionMap.get(competitorDecisionKey(r.domain, r.query));
              return (
              <tr key={`${r.domain}|${r.query}`} className="border-t border-gray-100 align-top hover:bg-gray-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                  {r.name}
                  <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">{r.domain}</span>
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.query}</td>
                <td className="max-w-[220px] px-3 py-2 text-xs">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noreferrer" className="block truncate font-mono text-blue-600 hover:underline dark:text-blue-400" title={r.url}>
                      {r.url}
                    </a>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )}
                </td>
                <td className={'whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums ' + rankTone(r.latestRank)}>{fmt(r.latestRank)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">{fmt(r.prevRank)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums">
                  {r.delta === null ? <span className="text-gray-400 dark:text-gray-500">—</span> : <span className={r.delta > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{r.delta > 0 ? '↑' : '↓'}{Math.abs(r.delta)}</span>}
                </td>
                <td className="px-3 py-2"><TrendCell r={r} /></td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-xs tabular-nums text-gray-400 dark:text-gray-500">{r.latestDate ?? '—'}</td>
                <td className="px-3 py-2"><DecisionCell value={d?.newPage} /></td>
                <td className="px-3 py-2"><DecisionCell value={d?.contentDiff} /></td>
                <td className="px-3 py-2"><DecisionCell value={d?.aiMention} /></td>
                <td className="px-3 py-2"><DecisionCell value={d?.ourGap} /></td>
                <td className="px-3 py-2"><DecisionCell value={d?.action} /></td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-400 dark:border-white/10 dark:text-gray-500">
        <p>Δ = 上期排名 − 本期排名；正数 = 竞品名次上升（对它有利）。rank 为 — 表示该日未进 Top-100，落地页同步为空。</p>
        <p className="mt-1">「落地页 / 排名 / Δ / 趋势 / 日期」自动抓取；「新页·更新 / 内容差异 / AI 提及 / 我方差距 / 动作」来自决策台账 <code className="rounded bg-gray-100 px-1 dark:bg-white/10">data/competitor-decisions.json</code>。</p>
        <p className="mt-1">抓取配置在 <code className="rounded bg-gray-100 px-1 dark:bg-white/10">data/competitor-config.json</code>（盯哪些竞品 / 哪些词）。</p>
      </footer>
    </div>
  );
}
