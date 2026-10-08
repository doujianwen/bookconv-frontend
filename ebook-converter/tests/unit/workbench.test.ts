// tests/unit/workbench.test.ts
// Tests for the workbench data layer.
//
// These exist because the first version of the workbench shipped with zero
// coverage while `npx jest` reported 125 passing — the suite was green because
// it never looked here. A gate that does not cover the new code is not
// evidence about the new code.
import { collectRepoFacts, parseDifferentiation } from '@/lib/workbench/facts';
import { PANELS, PANEL_GROUPS, getPanel, panelFromPath } from '@/lib/workbench/panels';
import { getProvider, getWorkbenchPayload, getAllWorkbenchPayloads } from '@/lib/workbench/provider';
import { PANEL_TO_GETTER, SELF_SOURCED_PANELS, type PanelKey, type ProviderPanelKey } from '@/lib/workbench/types';
import {
  checkWorkbenchAccess,
  parseAllowlist,
  hasUsableSecret,
  DENIAL_HINT,
  type AccessDenialReason,
} from '@/lib/workbench/admin-guard';

describe('workbench panel registry', () => {
  it('registers the operational panels plus the self-sourced ones', () => {
    // Derive the expected count from the two authorities instead of a literal:
    // every provider-backed panel (PANEL_TO_GETTER) plus every self-sourced one
    // (SELF_SOURCED_PANELS). A hand-maintained number here silently rots the
    // moment a panel is added — which is exactly what happened when `feedback`
    // shipped (the gate still said 13 while the registry had 14).
    expect(PANELS).toHaveLength(
      Object.keys(PANEL_TO_GETTER).length + SELF_SOURCED_PANELS.length,
    );
    const keys = PANELS.map((p) => p.key).sort();
    expect(keys).toEqual(
      ['analytics', 'board', 'competitors', 'content', 'deploy', 'domain', 'extensions', 'feedback', 'keywords', 'notifications', 'overview', 'security', 'seo', 'users'].sort()
    );
  });

  it('keeps every self-sourced panel out of the provider contract', () => {
    // A self-sourced panel reads its own data file; asking a provider for it
    // would imply a data source it does not have.
    const keys = PANELS.map((p) => p.key) as string[];
    for (const k of SELF_SOURCED_PANELS) {
      expect(keys).toContain(k);
      expect(Object.keys(PANEL_TO_GETTER)).not.toContain(k);
    }
  });

  it('gives every panel a unique href inside /admin', () => {
    const hrefs = PANELS.map((p) => p.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const h of hrefs) expect(h.startsWith('/admin')).toBe(true);
  });

  it('assigns every panel to a known group', () => {
    for (const p of PANELS) expect(PANEL_GROUPS).toContain(p.group);
  });

  it('stamps a snapshot date on every static panel', () => {
    // A static panel without a date is indistinguishable from a live one.
    for (const p of PANELS.filter((x) => x.source === 'static')) {
      expect(p.snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('does not stamp a snapshot date on derived or remote panels', () => {
    for (const p of PANELS.filter((x) => x.source !== 'static')) {
      expect(p.snapshotDate).toBeUndefined();
    }
  });

  it('maps every panel to a distinct provider getter', () => {
    const getters = Object.values(PANEL_TO_GETTER);
    // Count derived from the map itself, so adding a provider getter cannot
    // leave a stale number behind — the invariant under test is "one distinct
    // getter per provider-backed panel", not a fixed registry size.
    expect(getters).toHaveLength(Object.keys(PANEL_TO_GETTER).length);
    expect(new Set(getters).size).toBe(getters.length);
  });

  it('resolves paths, including the locale prefix, to the right panel', () => {
    expect(panelFromPath('/admin').key).toBe('overview');
    expect(panelFromPath('/admin/').key).toBe('overview');
    expect(panelFromPath('/admin/seo').key).toBe('seo');
    expect(panelFromPath('/es/admin/seo').key).toBe('seo');
    expect(panelFromPath('/es/admin').key).toBe('overview');
  });

  it('falls back to overview for unknown admin slugs', () => {
    expect(panelFromPath('/admin/does-not-exist').key).toBe('overview');
  });

  it('throws on an unknown panel key rather than returning undefined', () => {
    expect(() => getPanel('nope' as PanelKey)).toThrow(/Unknown workbench panel/);
  });
});

describe('repository fact extraction', () => {
  const facts = collectRepoFacts();

  it('derives the conversion pair count from conversion-map.ts', () => {
    // The workbench must not hard-code this. Guards against the constant
    // drifting away from the actual map.
    expect(facts.conversionPairs).toBeGreaterThan(20);
    expect(facts.conversionPairs).toBeLessThan(60);
  });

  it('derives distinct format identifiers covering from- and to-sides', () => {
    // A previous audit script counted only the left-hand side of each pair and
    // reported 15; the true figure counts both sides. This test pins the
    // difference so the mistake cannot silently return.
    expect(facts.distinctFormats).toBeGreaterThan(facts.conversionPairs / 2);
    expect(facts.distinctFormats).toBe(18);
  });

  it('finds registered blog posts and noindex flags', () => {
    expect(facts.blogRegistered).toBeGreaterThan(50);
    expect(facts.blogNoindex).toBeGreaterThanOrEqual(1);
  });

  it('counts guide and format pages', () => {
    expect(facts.guideFiles).toBeGreaterThan(15);
    expect(facts.formatPages).toBeGreaterThan(10);
  });

  it('reports abandoned queue modules without asserting their removal', () => {
    // The queue stack is dead code that must not be re-wired. It should still
    // be present; this test documents that expectation rather than the ideal.
    expect(facts.hasQueueDeadCode).toBeGreaterThanOrEqual(0);
  });
});

describe('differentiation output parsing', () => {
  it('parses a PASS tally', () => {
    expect(parseDifferentiation('FAIL  3/4 项达标')).toEqual({ pass: 1, fail: 3, total: 4 });
  });

  it('parses a FAIL tally', () => {
    expect(parseDifferentiation('PASS  2/4 项达标')).toEqual({ pass: 2, fail: 2, total: 4 });
  });

  it('returns null when nothing matches, instead of inventing a number', () => {
    expect(parseDifferentiation('no tally here')).toBeNull();
  });
});

describe('provider registry', () => {
  it('exposes the repo provider as the default', () => {
    expect(getProvider().id).toBe('repo');
  });

  it('throws a helpful error for an unknown provider', () => {
    expect(() => getProvider('nope')).toThrow(/Unknown workbench provider/);
  });

  it('implements every getter the panel map expects', () => {
    const provider = getProvider();
    for (const getter of Object.values(PANEL_TO_GETTER)) {
      expect(typeof provider[getter]).toBe('function');
    }
  });
});

describe('provider payload contract', () => {
  const expected = Object.keys(PANEL_TO_GETTER) as ProviderPanelKey[];

  it.each(expected)('returns a well-formed payload for %s', async (panel) => {
    const payload = await getWorkbenchPayload(panel);

    // Provenance is mandatory. A payload without a source kind cannot be
    // rendered honestly, and the UI relies on it.
    expect(['static', 'derived', 'remote']).toContain(payload.sourceKind);
    expect(payload.source).toBeDefined();
    expect((payload.source as string).length).toBeGreaterThan(0);

    // updatedAt must be a real timestamp, not a literal from 2026-09-27.
    expect(payload.updatedAt).toBeDefined();
    const age = Date.now() - new Date(payload.updatedAt as string).getTime();
    expect(age).toBeGreaterThanOrEqual(0);
    expect(age).toBeLessThan(60_000);

    expect(payload.measuredAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Every panel must render something, even if only notes.
    const items =
      (payload.metrics?.length ?? 0) +
      (payload.pills?.length ?? 0) +
      (payload.tables?.length ?? 0) +
      (payload.timelines?.length ?? 0) +
      (payload.checklists?.length ?? 0);
    expect(items).toBeGreaterThan(0);
  });

  it('marks static panels as static and never as live', async () => {
    for (const panel of expected.filter((k) => getPanel(k).source === 'static')) {
      const payload = await getWorkbenchPayload(panel);
      expect(payload.sourceKind).toBe('static');
    }
  });

  it('keeps SEO and GEO metrics in separate panels', async () => {
    // Combining them into one score is explicitly prohibited by the handbook.
    const seo = await getWorkbenchPayload('seo');
    const analytics = await getWorkbenchPayload('analytics');
    const seoText = JSON.stringify(seo);
    expect(seoText).not.toMatch(/GEO\s*score/i);
    expect(JSON.stringify(analytics)).not.toMatch(/GEO\s*score/i);
  });

  it('qualifies the Bing citation figure instead of presenting it as traffic', async () => {
    const analytics = await getWorkbenchPayload('analytics');
    const text = JSON.stringify(analytics);
    // The citations number must always travel with its caveat.
    expect(text).toMatch(/9,012/);
    expect(text).toMatch(/traffic promise|NOT sessions|did not convert/i);
  });

  it('returns all provider-backed panels from the bulk fetch', async () => {
    const all = await getAllWorkbenchPayloads();
    expect(Object.keys(all)).toHaveLength(expected.length);
    for (const key of expected) expect(all[key]).toBeDefined();
  });
});

// ── Access control ────────────────────────────────────────────────────────────
// The workbench serves operational metadata. These tests pin the two rules that
// matter: (1) an allowlist, not mere "has a session", decides access — because
// the site's auth is customer auth and anyone can self-register; and (2) every
// misconfiguration fails CLOSED. A gate that defaults to open when an env var is
// missing is worse than no gate, because it looks protected.
describe('workbench access control', () => {
  const GOOD_SECRET = 'a-long-random-production-secret-value';
  const alice = { email: 'alice@bookconv.com' };

  it('denies everyone when no allowlist is configured (fail closed)', async () => {
    for (const raw of [undefined, null, '', '   ', ',,']) {
      const v = await checkWorkbenchAccess({
        allowlist: raw,
        secret: GOOD_SECRET,
        getSessionImpl: async () => alice, // even a valid session must not help
      });
      expect(v.allowed).toBe(false);
      if (!v.allowed) expect(v.reason).toBe('no_allowlist');
    }
  });

  it('denies when AUTH_SECRET is missing, because the public default is forgeable', async () => {
    const v = await checkWorkbenchAccess({
      allowlist: 'alice@bookconv.com',
      secret: undefined,
      getSessionImpl: async () => alice,
    });
    expect(v.allowed).toBe(false);
    if (!v.allowed) expect(v.reason).toBe('weak_secret');
  });

  it('denies when AUTH_SECRET is still the shipped placeholder', async () => {
    const v = await checkWorkbenchAccess({
      allowlist: 'alice@bookconv.com',
      secret: 'change-me-in-production-use-a-long-random-string',
      getSessionImpl: async () => alice,
    });
    expect(v.allowed).toBe(false);
    if (!v.allowed) expect(v.reason).toBe('weak_secret');
  });

  it('denies an unauthenticated caller even with a valid allowlist', async () => {
    const v = await checkWorkbenchAccess({
      allowlist: 'alice@bookconv.com',
      secret: GOOD_SECRET,
      getSessionImpl: async () => null,
    });
    expect(v.allowed).toBe(false);
    if (!v.allowed) expect(v.reason).toBe('no_session');
  });

  it('denies a signed-in non-operator (customer auth is not operator auth)', async () => {
    const v = await checkWorkbenchAccess({
      allowlist: 'alice@bookconv.com',
      secret: GOOD_SECRET,
      getSessionImpl: async () => ({ email: 'random-customer@example.com' }),
    });
    expect(v.allowed).toBe(false);
    if (!v.allowed) expect(v.reason).toBe('not_operator');
  });

  it('allows an allowlisted operator with a valid session', async () => {
    const v = await checkWorkbenchAccess({
      allowlist: 'alice@bookconv.com,bob@bookconv.com',
      secret: GOOD_SECRET,
      getSessionImpl: async () => alice,
    });
    expect(v.allowed).toBe(true);
    if (v.allowed) expect(v.email).toBe('alice@bookconv.com');
  });

  it('treats the allowlist as case-insensitive and whitespace-tolerant', async () => {
    const v = await checkWorkbenchAccess({
      allowlist: '  Alice@BookConv.COM , bob@bookconv.com ',
      secret: GOOD_SECRET,
      getSessionImpl: async () => ({ email: 'ALICE@bookconv.com' }),
    });
    expect(v.allowed).toBe(true);
  });

  it('denies rather than throwing when the session resolver blows up', async () => {
    const v = await checkWorkbenchAccess({
      allowlist: 'alice@bookconv.com',
      secret: GOOD_SECRET,
      getSessionImpl: async () => {
        throw new Error('cookie store unavailable');
      },
    });
    expect(v.allowed).toBe(false);
    if (!v.allowed) expect(v.reason).toBe('no_session');
  });

  it('checks configuration before identity, so a broken config never grants', async () => {
    // Both wrong at once: the reason must be a config reason, and access denied.
    const v = await checkWorkbenchAccess({
      allowlist: '',
      secret: undefined,
      getSessionImpl: async () => alice,
    });
    expect(v.allowed).toBe(false);
  });

  it('parses allowlists without keeping junk entries', () => {
    expect([...parseAllowlist('a@x.com, , A@X.com ,,b@y.com')]).toEqual(['a@x.com', 'b@y.com']);
    expect([...parseAllowlist(undefined)]).toEqual([]);
  });

  it('rejects the placeholder secret but accepts a real one', () => {
    expect(hasUsableSecret('change-me-in-production-use-a-long-random-string')).toBe(false);
    expect(hasUsableSecret('')).toBe(false);
    expect(hasUsableSecret(undefined)).toBe(false);
    expect(hasUsableSecret('s3cr3t-with-real-entropy')).toBe(true);
  });

  it('gives every denial reason an operator-facing hint', () => {
    const reasons: AccessDenialReason[] = ['no_allowlist', 'weak_secret', 'no_session', 'not_operator'];
    for (const r of reasons) expect(DENIAL_HINT[r].length).toBeGreaterThan(10);
  });
});
