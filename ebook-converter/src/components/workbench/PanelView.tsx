// src/components/workbench/PanelView.tsx
// Renders a PanelPayload in a consistent order: metrics → pills → checklists
// → tables → timeline → notes. Any panel, wired or not, renders through here,
// so a new provider needs no new UI code.
//
// Data provenance is surfaced unconditionally: a snapshot panel looks
// different from a derived panel, and the difference is not subtle.
import { Card, ChecklistCard, DataTable, EmptyState, MetricCard, PanelHeader, StatusChip, Timeline } from './primitives';
import type { PanelKey, PanelPayload } from '@/lib/workbench/types';
import { getPanel } from '@/lib/workbench/panels';

export function PanelView({
  panelKey,
  payload,
  description,
}: {
  panelKey: PanelKey;
  payload: PanelPayload;
  description?: string;
}) {
  const meta = getPanel(panelKey);
  const kind = payload.sourceKind ?? meta.source;
  const hasAnything =
    (payload.metrics?.length ?? 0) +
      (payload.pills?.length ?? 0) +
      (payload.tables?.length ?? 0) +
      (payload.timelines?.length ?? 0) +
      (payload.checklists?.length ?? 0) >
    0;

  return (
    <div>
      <PanelHeader
        title={meta.labelZh}
        description={description}
        sourceKind={kind}
        snapshotDate={meta.snapshotDate}
        measuredAt={payload.measuredAt}
        provider={payload.source}
      />

      {kind === 'static' && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          ⚠ 本面板的数字是人工核对的静态快照，不随站点变化自动更新。不要用它做当日决策。
        </div>
      )}

      {kind === 'derived' && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          本面板的数字在每次请求时从本地仓库重新计算。但它只能看到本地文件——索引状态、排名、流量等外部信号不在此列。
        </div>
      )}

      {!hasAnything && (
        <EmptyState
          title="此模块尚未接入数据源"
          hint="在 src/lib/workbench/provider.ts 注册一个 provider，实现 WorkbenchProvider 接口的对应方法。"
        />
      )}

      {payload.pills && payload.pills.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {payload.pills.map((p) => (
            <StatusChip key={p.label} level={p.level} label={p.label} detail={p.detail} />
          ))}
        </div>
      )}

      {payload.metrics && payload.metrics.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {payload.metrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>
      )}

      {payload.checklists && payload.checklists.length > 0 && (
        <div className="mb-5 grid gap-4 xl:grid-cols-2">
          {payload.checklists.map((c) => (
            <ChecklistCard key={c.title} checklist={c} />
          ))}
        </div>
      )}

      {payload.tables && payload.tables.length > 0 && (
        <div className="mb-5 space-y-4">
          {payload.tables.map((t) => (
            <Card key={t.title} title={t.title}>
              <DataTable table={t} />
            </Card>
          ))}
        </div>
      )}

      {payload.timelines && payload.timelines.length > 0 && (
        <div className="mb-5">
          <Card title="最近动态">
            <Timeline events={payload.timelines} />
          </Card>
        </div>
      )}

      {payload.notes && payload.notes.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            数据说明与已知限制
          </p>
          <ul className="space-y-1">
            {payload.notes.map((n, i) => (
              <li key={i} className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                · {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
