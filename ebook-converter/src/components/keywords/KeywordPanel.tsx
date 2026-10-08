'use client';
// src/components/keywords/KeywordPanel.tsx
// Renders data/keyword-series.json as an interactive table: sort, filter, search.
//
// The point of this panel is that the SEO/GEO board only ever said "build the
// keyword sheet" — it never showed any data. This shows the data.
import * as React from 'react';
import {
  isMoving,
  sortRows,
  latestReasonByQuery,
  type KeywordRow,
  type KeywordReason,
  type KeywordSeriesData,
  type SortDir,
  type SortKey,
} from '@/lib/keywords/series';
import {
  latestCandidateByQuery,
  type CandidateEntry,
} from '@/lib/keywords/candidates';
import {
  deriveIntent,
  deriveTargetUrl,
  competitorsForQuery,
  type CompetitorOverlapSource,
} from '@/lib/keywords/meta';
import { type KeywordDecision, latestDecisionByQuery } from '@/lib/keywords/decisions';
import { Callout, Card, Chip, Stat } from '@/components/board/primitives';

type View = 'all' | 'moving' | 'top20' | 'single';

const VIEWS: { id: View; label: string; hint: string }[] = [
  { id: 'all', label: '全部', hint: '所有抓到的关键词' },
  { id: 'moving', label: '有变化', hint: '≥2 个观测点且名次发生变动' },
  { id: 'top20', label: 'Top 20', hint: '最新排名在前 20 名内' },
  { id: 'single', label: '单点词', hint: '只有一次观测，无法判断趋势' },
];

function fmtPos(p: number | null | undefined): string {
  return p === null || p === undefined ? '—' : String(p);
}

/** Rank numbers are "smaller is better", so the colour follows that, not Δ. */
function posTone(p: number | null): string {
  if (p === null) return 'text-gray-400 dark:text-gray-500';
  if (p <= 3) return 'text-emerald-600 dark:text-emerald-400';
  if (p <= 10) return 'text-blue-600 dark:text-blue-400';
  if (p <= 20) return 'text-amber-600 dark:text-amber-400';
  return 'text-gray-500 dark:text-gray-400';
}

function DeltaCell({ k }: { k: KeywordRow }) {
  if (k.delta === null) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500" title="只有一个观测点，无法判断趋势">
        无基准
      </span>
    );
  }
  if (k.delta === 0) {
    return <span className="text-xs text-gray-400 dark:text-gray-500">持平</span>;
  }
  const up = k.delta > 0;
  return (
    <span
      className={
        'font-semibold tabular-nums ' +
        (up ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')
      }
      title={`${k.previous?.date} → ${k.latest?.date}，间隔 ${k.spanDays} 天`}
    >
      {up ? '↑' : '↓'}
      {Math.abs(k.delta)}
    </span>
  );
}

/** A judgement cell: shows the ledger value, or a muted dash when unset. */
function DecisionCell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-gray-300 dark:text-gray-600">—</span>;
  return (
    <span className="text-xs text-gray-600 dark:text-gray-300" title={value}>
      {value}
    </span>
  );
}

function PriorityCell({ p }: { p?: string }) {
  if (!p) return <span className="text-gray-300 dark:text-gray-600">—</span>;
  const tone: Record<string, string> = {
    P0: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
    P1: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    P2: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30',
    P3: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/15',
  };
  return <Chip className={tone[p] ?? tone.P3}>{p}</Chip>;
}

function Row({
  k,
  reason,
  candidate,
  convertSlugs,
  competitors,
  decision,
}: {
  k: KeywordRow;
  reason?: KeywordReason;
  candidate?: CandidateEntry;
  convertSlugs: string[];
  competitors: CompetitorOverlapSource[] | null;
  decision?: KeywordDecision;
}) {
  const moving = isMoving(k);
  const intent = decision?.intent || deriveIntent(k.query);
  const targetUrl = decision?.targetUrl || deriveTargetUrl(k.query, convertSlugs);
  const overlaps = competitorsForQuery(k.query, competitors);
  return (
    <tr
      className={
        'align-top hover:bg-gray-50/70 dark:hover:bg-white/[0.03]' +
        (moving ? ' bg-amber-50/40 dark:bg-amber-500/[0.06]' : '')
      }
    >
      <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
        {k.query}
        {k.observations < 2 ? (
          <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500">单点</span>
        ) : null}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500 dark:text-gray-400">{intent}</td>
      <td className="whitespace-nowrap px-3 py-2 text-xs">
        {targetUrl ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-blue-600 hover:underline dark:text-blue-400"
          >
            {targetUrl}
          </a>
        ) : (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        )}
      </td>
      <td className={'whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums ' + posTone(k.latest?.impressionPosition ?? null)}>
        {fmtPos(k.latest?.impressionPosition)}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
        {fmtPos(k.previous?.impressionPosition)}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right">
        <DeltaCell k={k} />
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {k.latest?.impressions ?? '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300">
        {k.latest?.clicks ?? '—'}
      </td>
      <td className="px-3 py-2 text-xs">
        {overlaps.length ? (
          <span className="text-gray-600 dark:text-gray-300">{overlaps.join('、')}</span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        )}
      </td>
      <td className="px-3 py-2"><DecisionCell value={decision?.mainGap} /></td>
      <td className="px-3 py-2"><DecisionCell value={decision?.action} /></td>
      <td className="whitespace-nowrap px-3 py-2"><PriorityCell p={decision?.priority} /></td>
      <td className="whitespace-nowrap px-3 py-2 text-right text-xs tabular-nums text-gray-400 dark:text-gray-500">
        {k.latest?.date ?? '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-xs"><DecisionCell value={decision?.recheck} /></td>
      <td className="px-3 py-2"><DecisionCell value={decision?.result} /></td>
      <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
        {reason ? (
          <span title={`${reason.date} 记录`}>{reason.reason}</span>
        ) : candidate && candidate.items.length > 0 ? (
          <span
            className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30"
            title={candidate.items.map((it, i) => `候选${i}·${it.confidence}置信：${it.text}`).join('\n\n')}
          >
            候选 {candidate.items.length} 条（待确认）
          </span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        )}
      </td>
    </tr>
  );
}

export function KeywordPanel({
  data,
  reasons = [],
  candidates = [],
  convertSlugs = [],
  competitors = null,
  decisions = [],
}: {
  data: KeywordSeriesData;
  reasons?: KeywordReason[];
  candidates?: CandidateEntry[];
  /** Object.keys(CONTENT_MAP) — passed from the server page so Target URL only
   *  ever points at a page that really ships. */
  convertSlugs?: string[];
  /** Monitored competitors with their overlap keywords (Target-URL join). */
  competitors?: CompetitorOverlapSource[] | null;
  /** Human judgement ledger (Intent / Main Gap / Action / Priority / Recheck / Result). */
  decisions?: KeywordDecision[];
}) {
  const [view, setView] = React.useState<View>('moving');
  const [sortKey, setSortKey] = React.useState<SortKey>('delta');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');
  const [q, setQ] = React.useState('');

  const bing = data.bing;
  const gsc = data.gsc;
  const reasonMap = React.useMemo(() => latestReasonByQuery(reasons), [reasons]);
  const candidateMap = React.useMemo(() => latestCandidateByQuery(candidates), [candidates]);
  const decisionMap = React.useMemo(() => latestDecisionByQuery(decisions), [decisions]);

  const rows = React.useMemo(() => {
    if (!bing) return [];
    let out = bing.keywords;
    if (view === 'moving') out = out.filter(isMoving);
    else if (view === 'top20') out = out.filter((k) => (k.latest?.impressionPosition ?? 999) <= 20);
    else if (view === 'single') out = out.filter((k) => k.observations < 2);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      out = out.filter((k) => k.query.toLowerCase().includes(needle));
    }
    return sortRows(out, sortKey, sortDir);
  }, [bing, view, sortKey, sortDir, q]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir(key === 'query' ? 'asc' : 'desc');
    }
  };

  if (!bing && !gsc) {
    return (
      <Callout tone="warn" title="关键词序列尚未生成">
        请先抓取数据再构建序列：
        <code className="mx-1 rounded bg-gray-100 px-1 dark:bg-white/10">npm run fetch:bing</code>→
        <code className="mx-1 rounded bg-gray-100 px-1 dark:bg-white/10">npm run build:keywords</code>
      </Callout>
    );
  }

  const t = bing?.totals;

  return (
    <div className="space-y-6">
      <header className="border-b border-gray-200 pb-4 dark:border-white/10">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">关键词排名</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          数据源 <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] dark:bg-white/10">data/keyword-series.json</code>
          {' · '}由 <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] dark:bg-white/10">npm run build:keywords</code> 从原始快照合并生成
        </p>
      </header>

      {t ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="唯一关键词" value={t.keywords} hint={`${bing?.snapshots ?? 0} 次抓取`} />
          <Stat label="可比（≥2点）" value={t.comparable} tone="warning" hint="能算 Δ 的词" />
          <Stat label="名次上升" value={t.up} tone="good" />
          <Stat label="名次下降" value={t.down} tone={t.down > 0 ? 'critical' : 'good'} />
          <Stat label="单点词" value={t.singlePoint} hint="无基准，不可判断" />
          <Stat label="丢弃残留" value={t.droppedJunk} hint="非搜索词" />
        </div>
      ) : null}

      {bing?.caveats?.length ? (
        <Callout tone="warn" title="读数前必须知道的三件事">
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {bing.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Callout>
      ) : null}

      {bing ? (
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                title={v.hint}
                onClick={() => setView(v.id)}
                className={
                  'rounded-full border px-3 py-1 text-xs font-medium transition ' +
                  (view === v.id
                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/[0.04]')
                }
              >
                {v.label}
              </button>
            ))}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索关键词…"
              className="ml-auto w-48 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-100"
            />
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
            <table className="w-full min-w-[1500px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                  <th className="cursor-pointer px-3 py-2 hover:text-gray-900 dark:hover:text-gray-100" onClick={() => toggleSort('query')}>
                    关键词 {sortKey === 'query' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-3 py-2">意图</th>
                  <th className="px-3 py-2">目标页</th>
                  <th className="cursor-pointer px-3 py-2 text-right hover:text-gray-900 dark:hover:text-gray-100" onClick={() => toggleSort('position')}>
                    最新排名 {sortKey === 'position' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-3 py-2 text-right">前一期</th>
                  <th className="cursor-pointer px-3 py-2 text-right hover:text-gray-900 dark:hover:text-gray-100" onClick={() => toggleSort('delta')}>
                    Δ {sortKey === 'delta' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="cursor-pointer px-3 py-2 text-right hover:text-gray-900 dark:hover:text-gray-100" onClick={() => toggleSort('impressions')}>
                    展示 {sortKey === 'impressions' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-3 py-2 text-right">点击</th>
                  <th className="px-3 py-2">竞品</th>
                  <th className="px-3 py-2">主要差距</th>
                  <th className="px-3 py-2">动作</th>
                  <th className="px-3 py-2">优先级</th>
                  <th className="px-3 py-2 text-right">日期</th>
                  <th className="px-3 py-2">复查</th>
                  <th className="px-3 py-2">结果</th>
                  <th className="px-3 py-2">原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="px-3 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                      当前筛选下没有关键词。
                    </td>
                  </tr>
                ) : (
                  rows.slice(0, 300).map((k) => (
                    <Row
                      key={k.query}
                      k={k}
                      reason={reasonMap.get(k.query)}
                      candidate={candidateMap.get(k.query)}
                      convertSlugs={convertSlugs}
                      competitors={competitors}
                      decision={decisionMap.get(k.query)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            显示 {Math.min(rows.length, 300)} / {rows.length} 条
            {rows.length > 300 ? '（已截断，用搜索缩小范围）' : ''} ·
            Δ 为正 = 名次上升（数字变小）· 行底色标黄 = 名次发生变动 ·
            意图 / 目标页 / 竞品 为自动派生，其余判断列来自决策台账
          </p>
        </Card>
      ) : null}

      {gsc ? (
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{gsc.label}</span>
            {gsc.comparable ? (
              <Chip className="bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                窗口一致
              </Chip>
            ) : (
              <Chip className="bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
                不可比
              </Chip>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {gsc.snapshots} 次导出 · {gsc.totals.keywords} 个词
            </span>
          </div>
          {!gsc.comparable ? (
            <div className="mt-3">
              <Callout tone="danger" title="这份 GSC 数据不能用来做跨日对比">
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {gsc.caveats.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="mt-2">
                  修法：把导出参数固定下来（同一个窗口长度、同一个行数上限），重跑{' '}
                  <code className="rounded bg-gray-100 px-1 dark:bg-white/10">npm run fetch:gsc</code>。
                </p>
              </Callout>
            </div>
          ) : null}
          <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                  <th className="px-3 py-2">导出日</th>
                  <th className="px-3 py-2">区间</th>
                  <th className="px-3 py-2 text-right">窗口</th>
                  <th className="px-3 py-2 text-right">行数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {gsc.windows.map((w) => (
                  <tr key={w.fetchedAt}>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">{w.fetchedAt}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                      {w.start} → {w.end}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-xs text-gray-600 dark:text-gray-300">
                      {w.windowDays} 天
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-xs text-gray-600 dark:text-gray-300">{w.rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <footer className="border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-400 dark:border-white/10 dark:text-gray-500">
        <p>
          生成于 {data.generatedAt} · 原始快照在 <code className="rounded bg-gray-100 px-1 dark:bg-white/10">数据分析/</code>
          （注意：该目录未纳入版本控制）
        </p>
        <p className="mt-1">
          已确认 <span className="font-semibold text-gray-500 dark:text-gray-400">{reasons.length}</span> 条变化原因 ·
          <span className="font-semibold text-gray-500 dark:text-gray-400">{candidates.length}</span> 个词有候选原因（待确认）
        </p>
        <p className="mt-1">
          生成候选：<code className="rounded bg-gray-100 px-1 dark:bg-white/10">node scripts/suggest-keyword-reasons.mjs</code> ·
          确认晋升：<code className="rounded bg-gray-100 px-1 dark:bg-white/10">node scripts/confirm-keyword-reason.mjs &quot;&lt;词&gt;&quot; &lt;index&gt;</code>
        </p>
      </footer>
    </div>
  );
}
