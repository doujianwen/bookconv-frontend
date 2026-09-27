// src/app/api/workbench/route.ts
// Read-only JSON API for the workbench. This is the integration surface for
// the future workbench UI, CLI tooling, or a Slack/WeCom digest job — it
// reuses the exact provider registry the UI uses, so there is one data path
// and one place to swap in real integrations.
//
//   GET /api/workbench                      → every panel
//   GET /api/workbench?panel=seo            → one panel
//   GET /api/workbench?provider=github      → explicit provider
//
// The endpoint is access-controlled: see src/lib/workbench/admin-guard.ts.
// It serves operational metadata, so it is gated on an operator allowlist
// (WORKBENCH_ADMIN_EMAILS) on top of a valid session. Callers who are not
// authorised get a 404, not a 401/403 — we do not advertise that the route
// exists or reveal why access was refused.
import { NextResponse } from 'next/server';
import { PANEL_TO_GETTER, type ProviderPanelKey } from '@/lib/workbench/types';
import { DEFAULT_PROVIDER, getAllWorkbenchPayloads, getWorkbenchPayload, PROVIDERS } from '@/lib/workbench/provider';
import { checkWorkbenchAccess } from '@/lib/workbench/admin-guard';

export const dynamic = 'force-dynamic';

/** Uniform "nothing here" response: indistinguishable from a missing route. */
function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET(request: Request) {
  // ── Access control (fail closed) ──────────────────────────────────────────
  // Any denial — no allowlist configured, unusable AUTH_SECRET, no session, or
  // an account that is not an operator — returns the same 404. The specific
  // reason is logged server-side only, never sent to the caller.
  const access = await checkWorkbenchAccess();
  if (!access.allowed) {
    console.warn('[workbench] denied /api/workbench:', access.reason);
    return notFound();
  }

  const url = new URL(request.url);
  const panel = url.searchParams.get('panel') as ProviderPanelKey | null;
  const providerId = url.searchParams.get('provider') || DEFAULT_PROVIDER;

  if (!(providerId in PROVIDERS)) {
    return NextResponse.json(
      { error: `Unknown provider "${providerId}"`, available: Object.keys(PROVIDERS) },
      { status: 400 }
    );
  }

  if (panel && !(panel in PANEL_TO_GETTER)) {
    return NextResponse.json(
      { error: `Unknown panel "${panel}"`, available: Object.keys(PANEL_TO_GETTER) },
      { status: 400 }
    );
  }

  try {
    const data = panel
      ? { [panel]: await getWorkbenchPayload(panel, providerId) }
      : await getAllWorkbenchPayloads(providerId);

    return NextResponse.json(
      { provider: providerId, generatedAt: new Date().toISOString(), data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Workbench provider failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }
}
