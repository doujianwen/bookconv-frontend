// src/components/board/primitives.tsx
// Presentation atoms for the SEO/GEO execution board.
// Theme-aware (light background + dark text in light mode, inverted in dark).
import * as React from 'react';
import { cn } from '@/lib/utils';

// ── priority ────────────────────────────────────────────────────────────────
export const PRIORITY_STYLE: Record<string, string> = {
  P0: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
  P1: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
  P2: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  P3: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/20',
};

export const OWNER_STYLE: Record<string, string> = {
  A: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30',
  O: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30',
  S: 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/30',
  T: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30',
};

const OWNER_LEGEND: Record<string, string> = {
  O: '站长裁决',
  A: 'AI 执行',
  S: '脚本门禁',
  T: '第三方工具',
};

export function Chip({ className, children, title }: { className?: string; children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        className
      )}
    >
      {children}
    </span>
  );
}

export function PriorityChip({ p }: { p: string }) {
  const why =
    p === 'P0'
      ? '阻断性：不做则后续全部失真'
      : p === 'P1'
        ? '本周必须推进'
        : p === 'P2'
          ? '有明确页面承接时做'
          : '低确定性机会，先观察';
  return (
    <Chip className={PRIORITY_STYLE[p] ?? PRIORITY_STYLE.P3} title={why}>
      {p}
    </Chip>
  );
}

export function OwnerChip({ owner }: { owner: string }) {
  // owner may be a combo like "A→O" or "S+A"; render each part.
  const parts = owner.split(/(→|\+)/).filter((s) => /^[AOST]$/.test(s));
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5">
      {parts.map((p) => (
        <Chip key={p} className={OWNER_STYLE[p]} title={`${p} = ${OWNER_LEGEND[p]}`}>
          {p}
        </Chip>
      ))}
    </span>
  );
}

export function TierChip({ tier }: { tier: string }) {
  return tier === 'CORE' ? (
    <Chip className="bg-slate-100 text-slate-600 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/20" title="规范原文条款">
      §原文
    </Chip>
  ) : (
    <Chip className="bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:ring-fuchsia-500/30" title="规范未提及，按行业最佳实践补全的假设条目">
      🧩补全
    </Chip>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    todo: { cls: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/20', label: '待办' },
    doing: { cls: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30', label: '进行中' },
    done: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30', label: '已完成' },
    blocked: { cls: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30', label: '受阻' },
    dropped: { cls: 'bg-gray-100 text-gray-500 ring-gray-200 line-through dark:bg-white/5 dark:text-gray-500 dark:ring-white/10', label: '已放弃' },
  };
  const s = map[status] ?? map.todo;
  return <Chip className={s.cls}>{s.label}</Chip>;
}

// ── layout ──────────────────────────────────────────────────────────────────
export function Section({
  id,
  title,
  subtitle,
  right,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'critical' | 'warning' | 'good';
}) {
  const toneCls =
    tone === 'critical'
      ? 'text-rose-600 dark:text-rose-400'
      : tone === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : tone === 'good'
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-gray-900 dark:text-gray-100';
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      <div className={cn('mt-0.5 text-xl font-semibold tabular-nums', toneCls)}>{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{hint}</div> : null}
    </div>
  );
}

export function ProgressBar({ pct, tone = 'blue' }: { pct: number; tone?: 'blue' | 'amber' | 'emerald' }) {
  const bar =
    tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-blue-500';
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
      <div className={cn('h-full rounded-full transition-all', bar)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn' | 'danger' | 'good';
  title?: string;
  children: React.ReactNode;
}) {
  const map = {
    info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-200',
    warn: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200',
    danger: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200',
  };
  return (
    <div className={cn('rounded-lg border px-3 py-2.5 text-sm', map[tone])}>
      {title ? <div className="font-semibold">{title}</div> : null}
      <div className={title ? 'mt-0.5' : ''}>{children}</div>
    </div>
  );
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        {text}
      </td>
    </tr>
  );
}
