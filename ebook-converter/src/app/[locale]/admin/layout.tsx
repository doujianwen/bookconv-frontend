import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkbenchShell } from '@/components/workbench/WorkbenchShell';
import { getWorkbenchPayload } from '@/lib/workbench/provider';
import { checkWorkbenchAccess, DENIAL_HINT } from '@/lib/workbench/admin-guard';

// The workbench is an internal operations surface. It must never be indexed
// and must never emit hreflang alternates that would create duplicate public
// URLs. This metadata is applied to every page under /[locale]/admin.
export const metadata: Metadata = {
  title: '工作台 · Workbench',
  robots: { index: false, follow: false, nocache: true },
};

// No caching: the access verdict must be evaluated per request.
export const dynamic = 'force-dynamic';

const LOCALES = ['en', 'es'];

/**
 * Denial screen. We deliberately do NOT redirect to the sign-in page: a
 * redirect would tell an unauthenticated prober that /admin exists and is
 * gated. A plain denial page that says nothing about the route's contents is
 * the quieter failure mode. The hint is generic operator guidance, not data.
 */
function AccessDenied({ reason }: { reason: string }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 460, textAlign: 'center' }}>
        <p style={{ fontSize: 40, margin: 0, lineHeight: 1.2 }} aria-hidden="true">
          🔒
        </p>
        <h1 style={{ fontSize: 20, margin: '0.75rem 0 0.5rem' }}>Access restricted</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          This operations surface requires an authorised operator account.
        </p>
        {DENIAL_HINT[reason as keyof typeof DENIAL_HINT] ? (
          <p
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 8,
              color: '#92400e',
              fontSize: 13,
              textAlign: 'left',
            }}
          >
            <strong>Operator note:</strong> {DENIAL_HINT[reason as keyof typeof DENIAL_HINT]}
          </p>
        ) : null}
        <p style={{ marginTop: '1.5rem' }}>
          <a href="/" style={{ color: '#2563eb', fontSize: 14 }}>
            ← Back to site
          </a>
        </p>
      </div>
    </main>
  );
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();

  // ── Access control (fail closed) ───────────────────────────────────────────
  // Evaluated on every request, before any panel data is fetched. A denied
  // caller sees the denial screen and no operational metadata reaches the
  // render tree.
  const access = await checkWorkbenchAccess();
  if (!access.allowed) {
    console.warn(`[workbench] denied /${locale}/admin:`, access.reason);
    return <AccessDenied reason={access.reason} />;
  }

  // Badge counts come from the notifications panel so the sidebar never
  // hard-codes a number that can drift from the data.
  let unread = 0;
  try {
    const payload = await getWorkbenchPayload('notifications');
    unread = payload.timelines?.filter((t) => t.level === 'critical').length ?? 0;
  } catch {
    unread = 0;
  }

  return (
    <WorkbenchShell basePath={`/${locale}/admin`} badges={{ notifications: unread }}>
      {children}
    </WorkbenchShell>
  );
}
