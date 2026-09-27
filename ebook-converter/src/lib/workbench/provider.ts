// src/lib/workbench/provider.ts
// Provider registry — the workbench's extension seam.
//
// The UI calls `getWorkbenchPayload(panelKey)` and never knows which provider
// answered. To integrate a real system:
//
//   1. Create src/lib/workbench/provider-<name>.ts implementing WorkbenchProvider.
//   2. Register it in the PROVIDERS map below.
//   3. Point WORKBENCH_PROVIDER at it (env var), or flip DEFAULT_PROVIDER.
//
// Panels do not change. That is the whole point of the indirection.
//
// The default provider is `repo`, which derives what it can from local files
// and honestly labels the rest as dated snapshots.

import {
  PANEL_TO_GETTER,
  type PanelKey,
  type PanelPayload,
  type ProviderPanelKey,
  type WorkbenchProvider,
} from './types';
import { repoProvider } from './provider-repo';

export const PROVIDERS: Record<string, WorkbenchProvider> = {
  repo: repoProvider,
  // Real integrations to add, one file each:
  //   github    — commits, branches, workflow runs
  //   vercel    — deployments, domains, build logs
  //   gsc       — impressions, clicks, positions, indexing status
  //   bing      — AI citations, keyword positions
  //   cloudflare— DNS records, SSL, WAF
  //   sentry    — issues, releases, uptime
};

/** Default provider id. Override with WORKBENCH_PROVIDER=<id>. */
export const DEFAULT_PROVIDER = process.env.WORKBENCH_PROVIDER || 'repo';

export function getProvider(id: string = DEFAULT_PROVIDER): WorkbenchProvider {
  const provider = PROVIDERS[id];
  if (!provider) {
    throw new Error(
      `Unknown workbench provider "${id}". Registered: ${Object.keys(PROVIDERS).join(', ')}`
    );
  }
  return provider;
}

/** Resolve a panel's payload through the active provider. */
export async function getWorkbenchPayload(
  panel: ProviderPanelKey,
  providerId: string = DEFAULT_PROVIDER
): Promise<PanelPayload> {
  const provider = getProvider(providerId);
  const getter = PANEL_TO_GETTER[panel];
  return provider[getter]();
}

/**
 * Fetch every provider-backed panel at once. Used by the overview grid and the
 * API route. Note this covers the panels answered by a provider; the SEO/GEO
 * board is NOT included — it reads its own data file (src/lib/board/).
 */
export async function getAllWorkbenchPayloads(
  providerId: string = DEFAULT_PROVIDER
): Promise<Record<ProviderPanelKey, PanelPayload>> {
  const provider = getProvider(providerId);
  const keys = Object.keys(PANEL_TO_GETTER) as ProviderPanelKey[];
  const entries = await Promise.all(
    keys.map(async (key) => [key, await provider[PANEL_TO_GETTER[key]]()] as const)
  );
  return Object.fromEntries(entries) as Record<ProviderPanelKey, PanelPayload>;
}
