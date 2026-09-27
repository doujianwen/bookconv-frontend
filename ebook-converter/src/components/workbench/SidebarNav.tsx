// src/components/workbench/SidebarNav.tsx
// Sidebar navigation, driven entirely by the panel registry.
// Server component: no client JS needed for the shell itself.
import Link from 'next/link';
import { PANELS, PANEL_GROUPS } from '@/lib/workbench/panels';
import type { PanelKey } from '@/lib/workbench/types';
import { cn } from '@/lib/utils';

export function SidebarNav({
  activeKey,
  basePath = '/admin',
  badges = {},
}: {
  activeKey: PanelKey;
  basePath?: string;
  badges?: Partial<Record<PanelKey, number>>;
}) {
  return (
    <nav aria-label="Workbench sections" className="flex flex-col gap-5">
      {PANEL_GROUPS.map((group) => {
        const items = PANELS.filter((p) => p.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {group}
            </p>
            <ul className="space-y-0.5">
              {items.map((panel) => {
                const active = panel.key === activeKey;
                const badge = badges[panel.key];
                return (
                  <li key={panel.key}>
                    <Link
                      href={`${basePath}${panel.href.replace('/admin', '')}`}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        active
                          ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-gray-100'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 flex-none rounded-full',
                          active ? 'bg-blue-500' : 'bg-gray-300 dark:bg-white/20'
                        )}
                        aria-hidden
                      />
                      <span className="flex-1 truncate">{panel.labelZh}</span>
                      {typeof badge === 'number' && badge > 0 && (
                        <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold leading-4 text-white">
                          {badge}
                        </span>
                      )}
                      {panel.source !== 'remote' && (
                        <span
                          className={cn(
                            'rounded border px-1 text-[9px] uppercase',
                            panel.source === 'static'
                              ? 'border-amber-300 text-amber-600 dark:border-amber-500/40 dark:text-amber-400'
                              : 'border-emerald-300 text-emerald-600 dark:border-emerald-500/40 dark:text-emerald-400'
                          )}
                          title={
                            panel.source === 'static'
                              ? `静态快照，核对于 ${panel.snapshotDate ?? '未知日期'}`
                              : '每次请求从本地仓库重新计算'
                          }
                        >
                          {panel.source === 'static' ? 'snap' : 'calc'}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
