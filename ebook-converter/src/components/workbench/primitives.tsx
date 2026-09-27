// src/components/workbench/primitives.tsx
// Presentation primitives shared by every workbench panel.
// Theme-aware: light backgrounds with dark text in light mode, inverted in
// dark mode. Status colors are explicit so nothing falls back to black.
import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Checklist, HealthLevel, Metric, StatusPill, TimelineEvent, WorkbenchTable } from '@/lib/workbench/types';

export const LEVEL_STYLES: Record<HealthLevel, { chip: string; dot: string; text: string }> = {
  healthy: {
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    chip: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  critical: {
    chip: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
    dot: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
  },
  unknown: {
    chip: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/20',
    dot: 'bg-gray-400',
    text: 'text-gray-500 dark:text-gray-400',
  },
};

export function StatusChip({ level, label, detail }: { level: HealthLevel; label: string; detail?: string }) {
  const s = LEVEL_STYLES[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        s.chip
      )}
      title={detail}
    >
      <span className={cn('h-1.5 w-1.5 flex-none rounded-full', s.dot)} aria-hidden />
      {label}
    </span>
  );
}

/** Renders a raw cell value as a chip when the column asks for it. */
function CellValue({ value, asPill }: { value: string | number | null; asPill?: boolean }) {
  if (value === null || value === '') return <span className="text-gray-400">—</span>;
  if (asPill) {
    const level = String(value) as HealthLevel;
    if (level in LEVEL_STYLES) return <StatusChip level={level} label={level} />;
  }
  return <>{value}</>;
}

export function Card({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]',
        className
      )}
    >
      {(title || right) && (
        <header className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-white/10 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}

export function MetricCard({ metric }: { metric: Metric }) {
  const good = metric.goodDirection ?? 'up';
  const trend = metric.trend ?? 'flat';
  const isGood = trend === 'flat' ? null : trend === good;
  const trendColor =
    isGood === null
      ? 'text-gray-500 dark:text-gray-400'
      : isGood
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-rose-600 dark:text-rose-400';
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{metric.label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{metric.value}</span>
        {metric.delta && (
          <span className={cn('text-xs font-medium', trendColor)}>
            <span aria-hidden>{arrow}</span> {metric.delta}
          </span>
        )}
      </div>
      {metric.hint && <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">{metric.hint}</p>}
    </div>
  );
}

export function DataTable({ table }: { table: WorkbenchTable }) {
  if (table.rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {table.emptyMessage ?? 'No rows.'}
      </p>
    );
  }
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-white/10">
            {table.columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  'px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400',
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                )}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 dark:border-white/5 dark:hover:bg-white/[0.02]"
            >
              {table.columns.map((c, i) => (
                <td
                  key={c.key}
                  className={cn(
                    'px-3 py-2.5 align-top text-gray-700 dark:text-gray-300',
                    c.align === 'right' ? 'text-right tabular-nums' : c.align === 'center' ? 'text-center' : 'text-left',
                    i === 0 && 'font-medium text-gray-900 dark:text-gray-100'
                  )}
                >
                  <CellValue value={row.cells[c.key] ?? null} asPill={c.asPill} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">No activity.</p>;
  return (
    <ol className="relative space-y-3.5 pl-5">
      <span className="absolute left-[3px] top-2 bottom-2 w-px bg-gray-200 dark:bg-white/10" aria-hidden />
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span
            className={cn('absolute -left-5 top-1.5 h-[7px] w-[7px] rounded-full ring-2 ring-white dark:ring-[#0f1115]', LEVEL_STYLES[e.level].dot)}
            aria-hidden
          />
          <p className="text-sm text-gray-800 dark:text-gray-200">{e.title}</p>
          {e.detail && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{e.detail}</p>}
          <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
            {new Date(e.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            {e.actor ? ` · ${e.actor}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function ChecklistCard({ checklist }: { checklist: Checklist }) {
  const done = checklist.items.filter((i) => i.done).length;
  const pct = Math.round((done / checklist.items.length) * 100);
  return (
    <Card
      title={checklist.title}
      right={
        <span className="text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">
          {done}/{checklist.items.length} · {pct}%
        </span>
      }
    >
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-2">
        {checklist.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5">
            <span
              className={cn(
                'mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full text-[10px] font-bold text-white',
                item.done ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/20'
              )}
              aria-hidden
            >
              {item.done ? '✓' : ''}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  'text-sm',
                  item.done
                    ? 'text-gray-500 line-through decoration-gray-300 dark:text-gray-500'
                    : 'text-gray-800 dark:text-gray-200'
                )}
              >
                {item.label}
              </span>
              {item.detail && <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{item.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function PanelHeader({
  title,
  description,
  sourceKind,
  snapshotDate,
  measuredAt,
  provider,
}: {
  title: string;
  description?: string;
  sourceKind?: 'static' | 'derived' | 'remote';
  snapshotDate?: string;
  measuredAt?: string;
  provider?: string;
}) {
  const badge = sourceKind
    ? {
        derived: {
          cls: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
          label: '实时计算',
          hint: '每次请求读取本地仓库重新计算',
        },
        remote: {
          cls: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
          label: '实时接口',
          hint: '来自外部 API',
        },
        static: {
          cls: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
          label: '快照',
          hint: '静态数字，非实时。请按标注日期重新核对',
        },
      }[sourceKind]
    : null;

  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">{title}</h1>
        {badge && (
          <span
            title={badge.hint}
            className={cn('flex-none rounded-full border px-2.5 py-1 text-[11px] font-semibold', badge.cls)}
          >
            {badge.label}
          </span>
        )}
      </div>
      {description && <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
        {provider && (
          <span className="rounded border border-gray-200 px-1.5 py-0.5 dark:border-white/10">provider: {provider}</span>
        )}
        {sourceKind === 'static' && snapshotDate && (
          <span className="rounded border border-amber-200 px-1.5 py-0.5 text-amber-700 dark:border-amber-500/30 dark:text-amber-300">
            数字核对于 {snapshotDate} — 之后站点的变化不会反映在这里
          </span>
        )}
        {measuredAt && <span>数字产出时间 {new Date(measuredAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-white/15">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}
