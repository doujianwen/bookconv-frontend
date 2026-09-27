'use client';

// src/components/workbench/WorkbenchShell.tsx
// Responsive shell: fixed sidebar on desktop, slide-over drawer on mobile.
// The only client-side state in the workbench is drawer open/closed.
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarNav } from './SidebarNav';
import { panelFromPath } from '@/lib/workbench/panels';
import { cn } from '@/lib/utils';

export function WorkbenchShell({
  children,
  basePath,
  badges,
  siteName = 'BookConv.com',
  envLabel = 'production',
}: {
  children: React.ReactNode;
  basePath: string;
  badges?: Record<string, number>;
  siteName?: string;
  envLabel?: string;
}) {
  const pathname = usePathname() || '';
  const active = panelFromPath(pathname);
  const [open, setOpen] = React.useState(false);

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0d12]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0f1115]/90 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 dark:border-white/10 dark:text-gray-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            {open ? (
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{siteName}</p>
          <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">{active.labelZh}</p>
        </div>
        <EnvBadge env={envLabel} />
      </div>

      {/* Drawer backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <div className="lg:flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-[264px] overflow-y-auto border-r border-gray-200 bg-white px-3 py-4 transition-transform duration-200 dark:border-white/10 dark:bg-[#0f1115]',
            'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="mb-5 flex items-center gap-2.5 px-2.5">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              BC
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{siteName}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Workbench</p>
            </div>
          </div>
          <SidebarNav
            activeKey={active.key}
            basePath={basePath}
            badges={badges as Partial<Record<ReturnType<typeof panelFromPath>['key'], number>>}
          />
          <div className="mt-6 rounded-lg bg-gray-50 p-3 dark:bg-white/[0.04]">
            <Link
              href={basePath === '/admin' ? '/' : `${basePath.replace('/admin', '')}/`}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Back to public site
            </Link>
            <p className="mt-1.5 text-[10px] leading-snug text-gray-400 dark:text-gray-500">
              Extension point: register a provider in src/lib/workbench/provider.ts
            </p>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function EnvBadge({ env }: { env: string }) {
  return (
    <span className="flex-none rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
      {env}
    </span>
  );
}
