import Link from 'next/link';
import { Card, ChecklistCard, DataTable, MetricCard, PanelHeader, StatusChip, Timeline } from '@/components/workbench/primitives';
import { PANELS } from '@/lib/workbench/panels';
import { getAllWorkbenchPayloads } from '@/lib/workbench/provider';
import type { ProviderPanelKey } from '@/lib/workbench/types';
import { SELF_SOURCED_PANELS } from '@/lib/workbench/types';
import { cn } from '@/lib/utils';

// 站点概览 — the landing panel. It aggregates the headline slice of every
// other panel so the operator sees the whole site state in one screen,
// then drills into a module. Aggregation goes through the same provider
// registry as every panel, so wiring a real provider upgrades this page too.
//
// Provenance is the point of this page: each module card states whether its
// numbers are recomputed per request (derived), fetched live (remote), or a
// dated human-verified snapshot (static). The card border colour follows.
export default async function AdminOverviewPage() {
  const payloads = await getAllWorkbenchPayloads();
  const overview = payloads.overview;
  const staticCount = PANELS.filter((p) => p.source === 'static').length;

  return (
    <div>
      <PanelHeader
        title="站点概览"
        description="全站状态汇总。每张模块卡片都标注数据来源类型：derived = 每次请求重新计算；live = 外部接口；snapshot = 人工核对的静态快照。"
        sourceKind={overview.sourceKind}
        measuredAt={overview.measuredAt}
        provider={overview.source}
      />

      {overview.pills && overview.pills.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {overview.pills.map((p) => (
            <StatusChip key={p.label} level={p.level} label={p.label} detail={p.detail} />
          ))}
        </div>
      )}

      {overview.metrics && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {overview.metrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>
      )}

      {/* Module grid — every module gets an entry card, so the overview doubles
          as a map of what is live, what is derived, and what is a stale snapshot. */}
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">模块导航</h2>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          10 个模块中 <span className="font-semibold text-amber-600 dark:text-amber-400">{staticCount}</span> 个是静态快照
          （黄框），<span className="font-semibold text-emerald-600 dark:text-emerald-400">{PANELS.length - staticCount}</span> 个每次请求重新计算
        </p>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PANELS.filter((p) => p.key !== 'overview' && !(SELF_SOURCED_PANELS as readonly string[]).includes(p.key)).map((panel) => {
          const p = payloads[panel.key as ProviderPanelKey];
          const metrics = p?.metrics?.slice(0, 2) ?? [];
          const critical = p?.pills?.filter((x) => x.level === 'critical').length ?? 0;
          const warning = p?.pills?.filter((x) => x.level === 'warning').length ?? 0;
          const kind = p?.sourceKind ?? panel.source;
          return (
            <Link
              key={panel.key}
              href={`./${panel.href.replace('/admin/', '').replace('/admin', '')}`}
              className={cn(
                'group rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-white/[0.03]',
                kind === 'static'
                  ? 'border-amber-200 hover:border-amber-400 dark:border-amber-500/20 dark:hover:border-amber-500/40'
                  : 'border-gray-200 hover:border-blue-300 dark:border-white/10 dark:hover:border-blue-500/40'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                    {panel.labelZh}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-gray-500">{panel.labelEn}</p>
                </div>
                <span
                  className={cn(
                    'flex-none rounded-full px-2 py-0.5 text-[10px] font-medium',
                    kind === 'static'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                      : kind === 'remote'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                  )}
                  title={kind === 'static' ? `人工核对于 ${panel.snapshotDate}` : '每次请求重新计算'}
                >
                  {kind === 'static' ? `snapshot ${panel.snapshotDate}` : kind === 'remote' ? 'live' : 'derived'}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                {metrics.length > 0 ? (
                  metrics.map((m) => (
                    <div key={m.label} className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[11px] text-gray-500 dark:text-gray-400">{m.label}</span>
                      <span className="flex-none text-xs font-semibold tabular-nums text-gray-800 dark:text-gray-200">
                        {m.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">待接入数据源</p>
                )}
              </div>
              {(critical > 0 || warning > 0) && (
                <div className="mt-3 flex gap-1.5">
                  {critical > 0 && <StatusChip level="critical" label={`${critical} critical`} />}
                  {warning > 0 && <StatusChip level="warning" label={`${warning} warning`} />}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {overview.timelines && (
          <Card title="全站动态">
            <Timeline events={overview.timelines} />
          </Card>
        )}
        <Card title="扩展接口说明" subtitle="新增模块只需两步">
          <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-medium">1.</span> 在{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-white/10">
                src/lib/workbench/provider.ts
              </code>{' '}
              的 <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-white/10">PROVIDERS</code> 注册新的
              WorkbenchProvider。
            </li>
            <li>
              <span className="font-medium">2.</span> 如需新面板，在{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-white/10">
                src/lib/workbench/panels.ts
              </code>{' '}
              加一条注册项，导航与路由自动生成。
            </li>
            <li className="text-xs text-gray-500 dark:text-gray-400">
              面板组件不感知数据来源——换 provider 不需要改任何 UI 代码。
            </li>
          </ol>
        </Card>
      </div>

      {payloads.security?.checklists && (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {payloads.security.checklists.map((c) => (
            <ChecklistCard key={c.title} checklist={c} />
          ))}
        </div>
      )}

      {payloads.deploy?.tables && payloads.deploy.tables[1] && (
        <div className="mt-4">
          <Card title="质量门禁总览" subtitle="改内容后必须全绿，且需人工复核命中数">
            <DataTable table={payloads.deploy.tables[1]} />
          </Card>
        </div>
      )}
    </div>
  );
}
