// src/components/board/BoardView.tsx
// The SEO/GEO execution board: module progress on top, today's work below.
//
// Every number here is derived from data/seo-geo-board.json for the current day
// (see src/lib/board/derive.ts). Nothing is hard-coded, so the board cannot
// drift from the data file.
import * as React from 'react';
import type { BoardData, BoardView as View, DueItem, ModuleProgress } from '@/lib/board/types';
import { cadenceLabel as cadenceText } from '@/lib/board/derive';import {
  Callout,
  Card,
  Chip,
  EmptyRow,
  OwnerChip,
  PriorityChip,
  ProgressBar,
  Section,
  Stat,
  StatusChip,
  TierChip,
} from './primitives';

const KIND_LABEL: Record<DueItem['kind'], string> = {
  'due-today': '今日到期',
  overdue: '已逾期',
  'recheck-today': '今日复查',
  'recheck-overdue': '复查逾期',
};

function fmtDate(d: string | null): string {
  if (!d) return '—';
  const [, m, day] = d.split('-');
  return `${Number(m)}/${Number(day)}`;
}

// ── Today's task table ──────────────────────────────────────────────────────
function TaskTable({
  items,
  kindOf,
  emptyText,
}: {
  items: DueItem[];
  kindOf: 'due' | 'recheck' | 'standing';
  emptyText?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
            <th className="px-3 py-2">优先级</th>
            <th className="px-3 py-2">编号</th>
            <th className="px-3 py-2">动作</th>
            <th className="px-3 py-2">模块</th>
            <th className="px-3 py-2">责任人</th>
            <th className="px-3 py-2">状态</th>
            <th className="px-3 py-2">
              {kindOf === 'recheck' ? '复查日期' : kindOf === 'standing' ? '触发' : '周期 / 到期'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
          {items.length === 0 ? (
            <EmptyRow
              colSpan={7}
              text={
                emptyText ??
                (kindOf === 'recheck' ? '复查队列为空。' : '今日无到期任务。')
              }
            />
          ) : (
            items.map((d) => (
              <tr key={d.taskId + d.kind} className="align-top hover:bg-gray-50/70 dark:hover:bg-white/[0.03]">
                <td className="px-3 py-2.5">
                  <PriorityChip p={d.priority} />
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                  {d.taskId}
                </td>
                <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                  {d.action}
                  {d.daysLate ? (
                    <span className="ml-2 text-xs font-normal text-rose-600 dark:text-rose-400">
                      逾期 {d.daysLate} 天
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                  {d.moduleId} {d.moduleName}
                </td>
                <td className="px-3 py-2.5">
                  <OwnerChip owner={d.owner} />
                </td>
                <td className="px-3 py-2.5">
                  {d.status ? <StatusChip status={d.status} /> : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 dark:text-gray-300">
                  {d.recurring ? (
                    <Chip className="bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30">
                      {cadenceText(d.recurring)}
                    </Chip>
                  ) : (
                    fmtDate(d.date)
                  )}
                  <span className="ml-1.5 text-[11px] text-gray-400">
                    {d.kind === 'overdue' || d.kind === 'recheck-overdue' ? KIND_LABEL[d.kind] : ''}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Standing cadences ───────────────────────────────────────────────────────
// These fire every day by construction, so they are background discipline
// rather than dated work. Collapsed by default so they cannot bury the few
// tasks that actually have to ship today.
function StandingBlock({ items }: { items: DueItem[] }) {
  if (items.length === 0) return null;
  const p0 = items.filter((i) => i.priority === 'P0').length;
  return (
    <details className="group rounded-xl border border-gray-200 bg-gray-50/60 dark:border-white/10 dark:bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm">
        <span className="text-gray-400 transition group-open:rotate-90 dark:text-gray-500">▸</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">常驻纪律</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {items.length} 项 · 持续 / 每次变更 / 每轮，每日均适用
        </span>
        {p0 > 0 ? (
          <Chip className="ml-auto bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
            P0 {p0}
          </Chip>
        ) : null}
      </summary>
      <div className="px-4 pb-4">
        <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          这些条目没有「完成」状态——它们是每天都生效的工作纪律，不是今天的交付物。
          单列出来，避免把真正要出货的有期任务淹掉。
        </p>
        <TaskTable items={items} kindOf="standing" />
      </div>
    </details>
  );
}

// ── Module progress cards ───────────────────────────────────────────────────
function ModuleGrid({ modules }: { modules: ModuleProgress[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => {
        const tone = m.done === m.total ? 'emerald' : m.overdue > 0 ? 'amber' : 'blue';
        return (
          <Card key={m.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold text-gray-400 dark:text-gray-500">{m.id}</span>
                  <TierChip tier={m.tier} />
                </div>
                <div className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-gray-100" title={m.name}>
                  {m.name}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-lg font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                  {m.done}
                  <span className="text-xs font-normal text-gray-400">/{m.total}</span>
                </div>
              </div>
            </div>

            <ProgressBar pct={m.pct} tone={tone as 'blue' | 'amber' | 'emerald'} />

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {m.p0Open > 0 ? (
                <Chip className="bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
                  P0 剩 {m.p0Open}
                </Chip>
              ) : (
                <Chip className="bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                  P0 清零
                </Chip>
              )}
              {m.doing > 0 ? (
                <Chip className="bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30">
                  进行 {m.doing}
                </Chip>
              ) : null}
              {m.standingOpen > 0 ? (
                <Chip className="bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30">
                  常驻 {m.standingOpen}
                </Chip>
              ) : null}
              {m.blocked > 0 ? (
                <Chip className="bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
                  受阻 {m.blocked}
                </Chip>
              ) : null}
              {m.overdue > 0 ? (
                <Chip className="bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                  逾期 {m.overdue}
                </Chip>
              ) : null}
              {m.nextDue ? (
                <span className="ml-auto text-gray-400 dark:text-gray-500">下一个 {fmtDate(m.nextDue)}</span>
              ) : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Anchors ─────────────────────────────────────────────────────────────────
function AnchorStrip({ anchors }: { anchors: View['anchors'] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {anchors.map((a) => {
        const tone = a.passed
          ? 'border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]'
          : a.daysLeft <= 3
            ? 'border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10'
            : a.daysLeft <= 7
              ? 'border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10'
              : 'border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]';
        const numTone = a.passed
          ? 'text-gray-400'
          : a.daysLeft <= 3
            ? 'text-rose-600 dark:text-rose-400'
            : a.daysLeft <= 7
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-900 dark:text-gray-100';
        return (
          <div key={a.id} className={`rounded-xl border p-3 ${tone}`}>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {a.date}
              </span>
              <span className={`text-2xl font-semibold tabular-nums ${numTone}`}>
                {a.passed ? '已过' : a.isToday ? '今天' : `${a.daysLeft}天`}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{a.label}</div>
            <div className="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400">{a.detail}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Social ──────────────────────────────────────────────────────────────────
function SocialStrip({ social }: { social: View['social'] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {social.map((s) => (
        <Card key={s.channel}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Chip
                className={
                  s.channel === 'x'
                    ? 'bg-gray-900 text-white ring-gray-900 dark:bg-white dark:text-gray-900 dark:ring-white'
                    : 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30'
                }
              >
                {s.channel === 'x' ? 'X' : 'Reddit'}
              </Chip>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.account}</span>
            </div>
            {s.item ? (
              <Chip className="bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                今日发布
              </Chip>
            ) : (
              <Chip className="bg-gray-100 text-gray-600 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/20">
                无排期
              </Chip>
            )}
          </div>
          <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {s.item ?? '—'}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{s.note}</p>
        </Card>
      ))}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export function BoardView({ view, data }: { view: View; data: BoardData }) {
  const { totals } = view;

  const nav = [
    { id: 'today', label: "今日工作" },
    { id: 'anchors', label: '关键节点' },
    { id: 'progress', label: '模块进度' },
    { id: 'recheck', label: '复查队列' },
    { id: 'social', label: '社媒排期' },
  ];

  return (
    <div className="space-y-8">
      {/* header */}
      <header className="border-b border-gray-200 pb-5 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              SEO / GEO 作战台
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {data.meta.project} · D0 = {data.meta.d0} · 数据源{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] dark:bg-white/10">
                {data.meta.sourceBreakdown}
              </code>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 dark:text-gray-500">今日</div>
            <div className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">{view.today}</div>
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      {/* totals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="任务总数" value={totals.tasks} hint={`§原文未完成 ${totals.coreOpen} · 🧩补全未完成 ${totals.suppOpen}`} />
        <Stat label="已完成" value={totals.done} tone="good" />
        <Stat label="未完成" value={totals.open} />
        <Stat label="P0 未完成" value={totals.p0Open} tone={totals.p0Open > 0 ? 'critical' : 'good'} hint="阻断性" />
        <Stat label="已逾期" value={totals.overdue} tone={totals.overdue > 0 ? 'critical' : 'good'} />
        <Stat
          label="今日到期"
          value={view.dueToday.length}
          tone={view.dueToday.length > 0 ? 'warning' : 'good'}
          hint={
            view.standing.length > 0
              ? `另有常驻纪律 ${view.standing.length} 项`
              : '有期任务'
          }
        />
      </div>

      {/* today */}
      <Section
        id="today"
        title="今日工作"
        subtitle={`${view.today} 有期任务。优先 P0；逾期项会持续累积，不会自动消失。常驻纪律单列在下方，不占今日清单。`}
      >
        <TaskTable items={view.dueToday} kindOf="due" emptyText="今日无有期任务 —— 清空。可从常驻纪律或模块进度里挑活。" />
        <div className="mt-3">
          <StandingBlock items={view.standing} />
        </div>
        {view.overdue.length > 0 ? (
          <div className="mt-3">
            <Callout tone="danger" title={`${view.overdue.length} 项已逾期`}>
              逾期表示到期日已过但状态仍未完成。按 §4 纪律，缺项须写明「为什么不做」而非凑数。
            </Callout>
            <div className="mt-3">
              <TaskTable items={view.overdue} kindOf="due" />
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <Callout tone="good">当前无逾期项。</Callout>
          </div>
        )}
      </Section>

      {/* anchors */}
      <Section id="anchors" title="关键节点" subtitle="到 3 天内转为红色提示。验收节点只读数、不改站，避免自我干扰。">
        <AnchorStrip anchors={view.anchors} />
      </Section>

      {/* progress */}
      <Section id="progress" title="模块进度" subtitle="M0–M10 共 11 个模块。「P0 剩」是阻断性未完成数，「逾期」是到期未完成数。">
        <ModuleGrid modules={view.modules} />
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span>依据分级：</span>
          <TierChip tier="CORE" />
          <span>= 规范原文条款</span>
          <TierChip tier="SUPP" />
          <span>= 规范未提及，按最佳实践补全的假设条目（共 {data.modules.flatMap((m) => m.tasks).filter((t) => t.tier === 'SUPP').length} 条）</span>
        </div>
      </Section>

      {/* recheck */}
      <Section
        id="recheck"
        title="复查队列"
        subtitle="§5-5：所有动作进入复查队列，到期必须复查并填 Result，不允许「做了就算完」。"
      >
        <TaskTable items={view.recheckQueue} kindOf="recheck" />
      </Section>

      {/* social */}
      <Section id="social" title="社媒排期" subtitle="每日草稿是弹药库，不是当日连发清单。同日多平台连发 = spam 形态。">
        <SocialStrip social={view.social} />
        {data.social.reddit.warnings?.length ? (
          <div className="mt-3 space-y-2">
            {data.social.reddit.warnings.map((w) => (
              <Callout key={w} tone="warn">
                {w}
              </Callout>
            ))}
          </div>
        ) : null}
      </Section>

      {/* open decisions */}
      {data.openDecisions.length > 0 ? (
        <Section title="待你决策" subtitle="这些分叉不做决定，相关任务会一直卡着。">
          <div className="space-y-3">
            {data.openDecisions.map((d) => (
              <Card key={d.id}>
                <div className="flex items-start gap-2">
                  <Chip className="bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                    待决策
                  </Chip>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{d.title}</div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{d.context}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      <span className="font-medium">建议：</span>
                      {d.suggestion}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      阻塞 {d.blocks} · 决策人 {d.owner}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      <footer className="border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-400 dark:border-white/10 dark:text-gray-500">
        <p>
          全部数字由 <code className="rounded bg-gray-100 px-1 dark:bg-white/10">{data.meta.sourceBreakdown}</code>{' '}
          的数据文件在请求时推导，无硬编码。改数据文件即改本页。
        </p>
        <p className="mt-1">纪律：{data.meta.discipline}</p>
      </footer>
    </div>
  );
}

/** The raw task list, grouped by module — the reference view. */
export function TaskRegister({ data, view }: { data: BoardData; view: View }) {
  return (
    <div className="space-y-6">
      {data.modules.map((m) => {
        const mp = view.modules.find((x) => x.id === m.id);
        return (
          <Section
            key={m.id}
            title={`${m.id} · ${m.name}`}
            subtitle={m.why}
            right={
              <div className="flex items-center gap-2">
                <TierChip tier={m.tier} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {mp?.done ?? 0}/{mp?.total ?? m.tasks.length}
                </span>
              </div>
            }
          >
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                    <th className="px-3 py-2">编号</th>
                    <th className="px-3 py-2">任务步骤</th>
                    <th className="px-3 py-2">具体动作</th>
                    <th className="px-3 py-2">责任人</th>
                    <th className="px-3 py-2">交付物</th>
                    <th className="px-3 py-2">评估标准</th>
                    <th className="px-3 py-2">时限</th>
                    <th className="px-3 py-2">优先级</th>
                    <th className="px-3 py-2">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                  {m.tasks.map((t) => (
                    <tr key={t.id} className="align-top hover:bg-gray-50/70 dark:hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {t.id}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{t.action}</td>
                      <td className="px-3 py-2.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{t.detail}</td>
                      <td className="px-3 py-2.5">
                        <OwnerChip owner={t.owner} />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {t.deliverable}
                      </td>
                      <td className="px-3 py-2.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                        {t.accept}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 dark:text-gray-300">
                        {t.recurring ? cadenceText(t.recurring) : fmtDate(t.due)}
                      </td>
                      <td className="px-3 py-2.5">
                        <PriorityChip p={t.priority} />
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusChip status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {m.tasks.some((t) => t.note) ? (
              <div className="mt-2 space-y-1.5">
                {m.tasks
                  .filter((t) => t.note)
                  .map((t) => (
                    <p key={t.id} className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      <span className="font-mono font-medium">{t.id}</span> — {t.note}
                    </p>
                  ))}
              </div>
            ) : null}
          </Section>
        );
      })}
    </div>
  );
}
