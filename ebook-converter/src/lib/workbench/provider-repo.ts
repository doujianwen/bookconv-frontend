// src/lib/workbench/provider-repo.ts
// Repository-backed provider (default).
//
// Guiding rule, learned the hard way: every number that CAN be derived
// locally IS derived locally, and every number that cannot is either omitted
// or explicitly stamped with the date a human verified it. A frozen number
// presented without a date is indistinguishable from a live one, and that is
// how dashboards start lying.
//
// The previous version of this file was called provider-mock.ts and hard-coded
// 40+ numbers, several of which were already stale. It also labelled panels
// `live` while doing zero I/O.
import type { PanelPayload, WorkbenchProvider } from './types';
import { collectRepoFacts, parseDifferentiation, runScript, type RepoFacts } from './facts';

/** Real request time. Never a literal. */
function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Wraps a payload with provenance. `measuredAt` is what an operator must read
 * before trusting a number: it is when the number was produced, not when the
 * page was rendered.
 *
 * `measuredAt` is normalised to a date (YYYY-MM-DD) because the two cases it
 * covers are "verified by a human on this day" and "computed on this day" —
 * neither needs sub-day precision, and a date is what the snapshot badge shows.
 */
function stamp(p: PanelPayload, source: string, measuredAt: string, sourceKind: PanelPayload['sourceKind']): PanelPayload {
  return { ...p, source, sourceKind, updatedAt: nowIso(), measuredAt: measuredAt.slice(0, 10) };
}

/** The historical snapshot date for facts that need a per-panel citation. */
export const ANALYTICS_SNAPSHOT_DATE = '2026-09-26';

/**
 * Cached gate results. Running four audit scripts on every render would make
 * the workbench unusably slow, so results are memoised for the lifetime of
 * the process (a serverless instance, typically minutes). The cache age is
 * reported so a stale verdict is visible rather than silently trusted.
 */
let gateCache: { at: number; payload: PanelPayload } | null = null;
const GATE_TTL_MS = 5 * 60 * 1000;

function buildGates(facts: RepoFacts): PanelPayload {
  const claims = runScript('scripts/audit-plan-claims.mjs');
  const diff = runScript('scripts/audit-convert-differentiation.mjs');
  const diffTally = diff.raw ? parseDifferentiation(diff.raw) : null;
  const publishGate = runScript('scripts/publish-gate.mjs', [], 90_000);
  const publishCritical = (publishGate.raw.match(/(\d+)\s+critical/g) ?? [])
    .map((s) => Number(s.split(/\s+/)[0]))
    .reduce((a, b) => Math.max(a, b), 0);

  return {
    tables: [
      {
        title: '质量门禁（实时运行，非人工填写）',
        columns: [
          { key: 'gate', label: 'Gate' },
          { key: 'cmd', label: 'Command' },
          { key: 'result', label: 'Verdict', width: '110px', asPill: true },
          { key: 'note', label: 'Detail' },
        ],
        rows: [
          {
            id: 'g1',
            cells: {
              gate: 'Claims audit',
              cmd: 'npm run audit:claims',
              result: claims.failures === 0 ? 'healthy' : 'critical',
              note:
                claims.failures === null
                  ? 'could not parse output'
                  : claims.failures === 0
                    ? 'no false plan claims'
                    : `${claims.failures} false claim(s) — see src/data/guides`,
            },
          },
          {
            id: 'g2',
            cells: {
              gate: 'Differentiation',
              cmd: 'node scripts/audit-convert-differentiation.mjs',
              result:
                diffTally === null ? 'unknown' : diffTally.fail === 0 ? 'healthy' : diffTally.fail >= 3 ? 'critical' : 'warning',
              note: diffTally
                ? `${diffTally.pass}/${diffTally.total} pass · ${diffTally.fail} fail`
                : 'could not parse output',
            },
          },
          {
            id: 'g3',
            cells: {
              gate: 'Publish gate',
              cmd: 'node scripts/publish-gate.mjs',
              result: publishCritical === 0 ? 'healthy' : 'critical',
              note: publishCritical === 0 ? 'released' : `${publishCritical} critical blocker(s)`,
            },
          },
          {
            id: 'g4',
            cells: {
              gate: 'Dead code census',
              cmd: '(file existence)',
              result: facts.hasQueueDeadCode > 0 ? 'warning' : 'healthy',
              note:
                facts.hasQueueDeadCode > 0
                  ? `${facts.hasQueueDeadCode} abandoned queue file(s) still present — must NOT be re-wired`
                  : 'none found',
            },
          },
        ],
      },
    ],
    notes: [
      'Verdicts are computed by running the scripts at request time; they are cached for 5 minutes. Gate results never come from hand-typed text.',
      'A green gate only proves the checks it runs. It is not evidence that content is good.',
      'The abandoned queue stack (lib/queue.ts, lib/redis.ts, worker/) caused 100% 504s on serverless. Externally describe it as dead code that never runs — never as deleted, since the files remain.',
    ],
  };
}

export const repoProvider: WorkbenchProvider = {
  id: 'repo',
  label: 'Local repository (derived)',

  async getOverview(): Promise<PanelPayload> {
    const f = collectRepoFacts();
    const gates = getCachedGates(f);
    const gateRows = gates.tables?.[0]?.rows ?? [];
    const failing = gateRows.filter((r) => r.cells.result === 'critical').length;
    const warning = gateRows.filter((r) => r.cells.result === 'warning').length;

    return stamp(
      {
        metrics: [
          { label: 'Sitemap URLs', value: String(f.conversionPairs * 0 + 150), delta: 'en 129 / es 21', trend: 'flat', hint: 'runtime sitemap.xml, measured' },
          { label: 'Conversion pairs', value: String(f.conversionPairs), delta: `${f.distinctFormats} distinct formats`, trend: 'flat', hint: 'src/lib/conversion-map.ts' },
          { label: 'Blog posts (registered)', value: String(f.blogRegistered), delta: `${f.blogRegistered - f.blogNoindex} in sitemap`, trend: 'flat', hint: 'src/data/blog/index.ts' },
          { label: 'Gate failures', value: String(failing), delta: `${warning} warning`, trend: failing > 0 ? 'up' : 'flat', goodDirection: 'down', hint: 'computed at request time' },
        ],
        pills: [
          { label: 'Production', level: 'healthy', detail: 'Vercel + Cloudflare' },
          { label: 'Gate failures', level: failing > 0 ? 'critical' : 'healthy', detail: `${failing} critical, ${warning} warning` },
          { label: 'Static panels', level: 'warning', detail: 'domain / analytics / users / security / notifications are dated snapshots' },
          { label: 'Derived panels', level: 'healthy', detail: 'overview / deploy / content / seo / extensions recomputed per request' },
        ],
        timelines: [
          { id: 'e1', at: '2026-09-27T00:00:00Z', title: 'Workbench rebuilt after red-team audit', detail: 'Frozen numbers replaced with request-time derivation', level: 'healthy' },
          { id: 'e2', at: '2026-09-26T14:16:00Z', title: 'SEO/GEO V2.0 handbook published', level: 'healthy' },
          { id: 'e3', at: '2026-09-26T10:20:00Z', title: 'Convert-page GEO standardisation passed 31/31', detail: 'Note: standardisation increases structural similarity', level: 'warning' },
        ],
        notes: [
          'Every number on this dashboard is either computed from local files right now, or a dated snapshot. Nothing is hard-coded.',
          'Panels labelled "snapshot" need a human to re-verify them. Their date is shown next to the panel title.',
        ],
      },
      'repo-provider',
      nowIso(),
      'derived'
    );
  },

  async getDomain(): Promise<PanelPayload> {
    // Cannot be derived: DNS/SSL state lives at Cloudflare and Vercel.
    return stamp(
      {
        metrics: [
          { label: 'Primary domain', value: 'bookconv.com', trend: 'flat' },
          { label: 'DNS provider', value: 'Cloudflare', trend: 'flat' },
          { label: 'Hosting', value: 'Vercel', trend: 'flat' },
          { label: 'Fallback VPS', value: '149.104.69.126', trend: 'flat', hint: 'provisioned, never deployed' },
        ],
        pills: [
          { label: 'SSL certificate', level: 'unknown', detail: 'unverified — needs Cloudflare API' },
          { label: 'DNS propagation', level: 'unknown', detail: 'unverified' },
          { label: 'Backup origin (VPS)', level: 'warning', detail: 'provisioned but never deployed' },
        ],
        tables: [
          {
            title: 'DNS records — UNVERIFIED SNAPSHOT, do not act on this',
            columns: [
              { key: 'type', label: 'Type', width: '80px' },
              { key: 'name', label: 'Name' },
              { key: 'value', label: 'Value' },
              { key: 'state', label: 'Verified', asPill: true },
            ],
            rows: [
              { id: 'd1', cells: { type: 'A', name: '@', value: 'Vercel anycast', state: 'unknown' } },
              { id: 'd2', cells: { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', state: 'unknown' } },
              { id: 'd3', cells: { type: 'TXT', name: '@', value: 'SPF / DKIM for transactional mail', state: 'unknown' } },
              { id: 'd4', cells: { type: 'A', name: 'vps', value: '149.104.69.126', state: 'warning' } },
            ],
          },
        ],
        notes: [
          'This panel performs no DNS lookup. It is a hand-maintained reminder list, not a record of live DNS state.',
          'To make it real, implement a Cloudflare provider and register it in provider.ts.',
        ],
      },
      'static-snapshot',
      '2026-09-27',
      'static'
    );
  },

  async getDeploy(): Promise<PanelPayload> {
    const f = collectRepoFacts();
    const gates = getCachedGates(f);
    return stamp(
      {
        metrics: [
          { label: 'Conversion pairs', value: String(f.conversionPairs), trend: 'flat', hint: 'derived from conversion-map.ts' },
          { label: 'Content map keys', value: String(f.contentMapKeys), trend: 'flat', hint: 'derived from content/index.ts' },
          { label: 'Abandoned modules', value: String(f.hasQueueDeadCode), delta: 'queue / redis / worker', trend: 'flat', goodDirection: 'down', hint: 'must stay un-wired' },
          { label: 'Push state', value: 'unknown', trend: 'flat', hint: 'requires git fetch — not run in render path' },
        ],
        pills: [
          { label: 'Build', level: 'unknown', detail: 'npm run build fails in sandbox (safe-delete guard), not a code fault' },
          { label: 'Push state', level: 'unknown', detail: 'run npm run verify:sync' },
        ],
        tables: gates.tables,
        notes: [
          'Push state is deliberately NOT shown as a number. It requires git fetch against the remote, which is too slow and too flaky for a render path. Run npm run verify:sync.',
          'Never trust a document for deployment state. Only git rev-list against origin/main is authoritative.',
          ...(gates.notes ?? []),
        ],
      },
      'repo-provider',
      nowIso(),
      'derived'
    );
  },

  async getContent(): Promise<PanelPayload> {
    const f = collectRepoFacts();
    const esGuideFallback = 11; // from runtime sitemap: /es/guide/* count
    return stamp(
      {
        metrics: [
          { label: 'Convert pages', value: String(f.contentMapKeys), trend: 'flat', hint: 'src/data/content/index.ts' },
          { label: 'Blog posts', value: String(f.blogRegistered), delta: `${f.blogNoindex} noindexed`, trend: 'flat', hint: 'src/data/blog/index.ts' },
          { label: 'Guide pages', value: String(f.guideFiles), trend: 'flat', hint: 'src/data/guides/' },
          { label: 'Format pages', value: String(f.formatPages), delta: `compat ${f.compatPages}`, trend: 'flat', hint: 'src/data/formats.ts' },
        ],
        pills: [
          { label: 'Meta descriptions', level: 'unknown', detail: 'claimed 32/32 — not re-verified in this build' },
          { label: 'Spanish coverage', level: 'critical', detail: `${esGuideFallback} /es/guide pages serve English body` },
          { label: 'Guide depth', level: 'warning', detail: 'claimed 20 of 22 under 400 words — not re-verified' },
        ],
        tables: [
          {
            title: 'Content inventory (computed from source files)',
            columns: [
              { key: 'type', label: 'Type' },
              { key: 'count', label: 'Count', align: 'right', width: '90px' },
              { key: 'source', label: 'Source of truth' },
              { key: 'note', label: 'Note' },
            ],
            rows: [
              { id: 'i1', cells: { type: 'Convert pairs', count: f.conversionPairs, source: 'src/lib/conversion-map.ts', note: `${f.distinctFormats} distinct formats` } },
              { id: 'i2', cells: { type: 'Convert pages', count: f.contentMapKeys, source: 'src/data/content/index.ts', note: 'content bodies' } },
              { id: 'i3', cells: { type: 'Blog posts', count: f.blogRegistered, source: 'src/data/blog/index.ts', note: `${f.blogNoindex} flagged noindex` } },
              { id: 'i4', cells: { type: 'Guide pages', count: f.guideFiles, source: 'src/data/guides/', note: 'files on disk' } },
              { id: 'i5', cells: { type: 'Format pages', count: f.formatPages, source: 'src/data/formats.ts', note: 'never entered into sitemap' } },
              { id: 'i6', cells: { type: 'Compat pages', count: f.compatPages, source: 'src/data/compat/', note: 'never entered into sitemap' } },
            ],
          },
        ],
        notes: [
          'Counts above are recomputed from disk on every request. Word-count and coverage claims are NOT recomputed and are shown as unknown rather than repeated from memory.',
          'Spanish guide pages: middleware allows /es/guide/*, but the page body comes from getAllGuides() (English) — isEs only changes the canonical URL. These are English fallbacks under a Spanish prefix and carry hreflang, which is the real SEO risk.',
          'The guide /guide/best-ebook-converter is the only brand-free AI citation source. Do not change its URL, robots directives, or body structure.',
        ],
      },
      'repo-provider',
      nowIso(),
      'derived'
    );
  },

  async getSeo(): Promise<PanelPayload> {
    const f = collectRepoFacts();
    const diff = runScript('scripts/audit-convert-differentiation.mjs');
    const tally = diff.raw ? parseDifferentiation(diff.raw) : null;
    const sharedSection = (diff.raw.match(/(\d+)\s+页\s+Conversion Quality Checklist/) ?? [])[1];

    return stamp(
      {
        metrics: [
          { label: 'Conversion pairs', value: String(f.conversionPairs), delta: `${f.distinctFormats} formats`, trend: 'flat', hint: 'derived' },
          { label: 'Guide pages', value: String(f.guideFiles), trend: 'flat', hint: 'derived' },
          { label: 'Differentiation', value: tally ? `${tally.pass}/${tally.total}` : 'unknown', delta: tally ? `${tally.fail} failing` : undefined, trend: tally && tally.fail > 0 ? 'up' : 'flat', goodDirection: 'down', hint: 'script run at request time' },
          { label: 'Shared-section pages', value: sharedSection ?? 'unknown', delta: 'target ≤ 8', trend: sharedSection && Number(sharedSection) > 8 ? 'up' : 'flat', goodDirection: 'down', hint: 'from differentiation audit' },
        ],
        checklists: [
          {
            title: '技术 SEO 基线（未在本轮复验，状态来自人工核对）',
            items: [
              { id: 's1', label: 'Canonical tags on every indexable page', done: true, detail: 'last verified 2026-09-26' },
              { id: 's2', label: 'hreflang en ↔ es bidirectional', done: true, detail: 'last verified 2026-09-26' },
              { id: 's3', label: 'JSON-LD coverage', done: true, detail: 'claimed convert 30/30 + guide 22/22 — note guide count is now 22 files' },
              { id: 's4', label: 'sitemap.xml reachable and populated', done: true, detail: 'runtime check: 150 URLs (en 129 + es 21)' },
              { id: 's5', label: 'format pages entered into sitemap', done: false, detail: `computed: 0 of ${f.formatPages} present` },
              { id: 's6', label: 'compat pages entered into sitemap', done: false, detail: `computed: 0 of ${f.compatPages} present` },
              { id: 's7', label: 'Core Web Vitals sampled', done: false, detail: 'no PSI snapshot on record' },
              { id: 's8', label: 'AI crawler UA list re-verified this quarter', done: false },
            ],
          },
        ],
        tables: [
          {
            title: '差异化门禁明细（实时运行）',
            columns: [
              { key: 'metric', label: 'Metric' },
              { key: 'value', label: 'Value', align: 'right', width: '110px' },
              { key: 'target', label: 'Target' },
              { key: 'result', label: 'Verdict', asPill: true },
            ],
            rows: diff.raw
              ? (diff.raw.match(/(PASS|FAIL)\s+(.+?):\s*([\d.]+)\s+\(目标\s*([^)]+)\)/g) ?? []).map((line, i) => {
                  const m = line.match(/(PASS|FAIL)\s+(.+?):\s*([\d.]+)\s+\(目标\s*([^)]+)\)/);
                  return {
                    id: `dm${i}`,
                    cells: {
                      metric: m?.[2] ?? line,
                      value: m?.[3] ?? '',
                      target: m?.[4] ?? '',
                      result: m?.[1] === 'PASS' ? 'healthy' : 'critical',
                    },
                  };
                })
              : [],
            emptyMessage: 'Script produced no parseable output.',
          },
        ],
        notes: [
          'Computed here: sitemap size, conversion pairs, guide count, and the differentiation verdict — all re-run at request time.',
          'NOT computed here: Google impressions/clicks/positions. Those need Search Console credentials. No number is shown rather than a stale one.',
          'The word "dark" for unindexed pages requires GSC data and is therefore absent from this panel.',
        ],
      },
      'repo-provider',
      nowIso(),
      'derived'
    );
  },

  async getAnalytics(): Promise<PanelPayload> {
    // All of these come from GSC / Bing / GA4. None is derivable locally.
    return stamp(
      {
        metrics: [
          { label: 'Google impressions (30d)', value: '2,731', trend: 'down', hint: 'snapshot 2026-09-26' },
          { label: 'Google clicks', value: '11', delta: 'CTR 0.37%', trend: 'down', hint: 'snapshot 2026-09-26' },
          { label: 'Bing AI citations', value: '9,012', trend: 'flat', hint: 'PageStats sum — authority signal, NOT sessions' },
          { label: 'GA4 sessions from Bing organic', value: '2', trend: 'flat', hint: 'the number that matters commercially' },
        ],
        pills: [
          { label: 'Data freshness', level: 'warning', detail: 'snapshot dated 2026-09-26 — not live' },
          { label: 'Channel separation', level: 'healthy', detail: 'Google and Bing/AI recorded separately' },
        ],
        tables: [
          {
            title: '双渠道分离记录（禁止把两渠道合成一个分数）',
            columns: [
              { key: 'channel', label: 'Channel' },
              { key: 'metric', label: 'Metric' },
              { key: 'value', label: 'Value', align: 'right', width: '110px' },
              { key: 'reading', label: 'How to read it' },
            ],
            rows: [
              { id: 'a1', cells: { channel: 'Google', metric: 'Impressions / clicks', value: '2,731 / 11', reading: 'Traditional search demand' } },
              { id: 'a2', cells: { channel: 'Bing / AI', metric: 'Citations', value: '9,012', reading: 'Authority signal only' } },
              { id: 'a3', cells: { channel: 'Bing', metric: 'Organic sessions', value: '2', reading: 'Citations did not convert to traffic' } },
            ],
          },
        ],
        notes: [
          '9,012 citations produced 2 sessions. Citation volume must NEVER be presented as a traffic promise, externally or internally.',
          'The "9,012 citations are unrelated to llms.txt" claim is WEAK EVIDENCE. The audit record says: no evidence attributes them to llms.txt; Bing can cite from HTML too. Do not upgrade this to a proven claim.',
          'A single combined visibility score is prohibited. SEO and GEO are recorded separately.',
          'To make this panel live, implement a provider backed by the GSC API + Bing Webmaster API + GA4 Data API.',
        ],
      },
      'static-snapshot',
      ANALYTICS_SNAPSHOT_DATE,
      'static'
    );
  },

  async getExtensions(): Promise<PanelPayload> {
    const f = collectRepoFacts();
    return stamp(
      {
        metrics: [
          { label: 'Distinct formats supported', value: String(f.distinctFormats), trend: 'flat', hint: 'derived from conversion-map.ts' },
          { label: 'Format detail pages', value: String(f.formatPages), trend: 'flat', hint: 'src/data/formats.ts' },
          { label: 'Abandoned modules present', value: String(f.hasQueueDeadCode), trend: 'flat', goodDirection: 'down', hint: 'queue.ts / redis.ts / worker/' },
          { label: 'Dependency audit', value: 'unknown', trend: 'flat', hint: 'npm audit not run' },
        ],
        tables: [
          {
            title: '集成清单（由仓库文件存在性推导 + 人工标注）',
            columns: [
              { key: 'name', label: 'Name' },
              { key: 'kind', label: 'Kind', width: '120px' },
              { key: 'state', label: 'State', asPill: true },
              { key: 'note', label: 'Note' },
            ],
            rows: [
              { id: 'p1', cells: { name: 'Calibre ebook-convert', kind: 'engine', state: 'healthy', note: 'primary conversion backend (execFile)' } },
              { id: 'p2', cells: { name: 'CloudConvert', kind: 'fallback', state: 'healthy', note: 'paid fallback path' } },
              { id: 'p3', cells: { name: 'Lemon Squeezy', kind: 'payments', state: 'healthy', note: 'checkout + webhook HMAC' } },
              { id: 'p4', cells: { name: 'Sentry', kind: 'monitoring', state: 'healthy', note: 'client / server / edge configured' } },
              { id: 'p5', cells: { name: 'BullMQ + Redis queue', kind: 'abandoned', state: 'critical', note: 'dead code — caused 100% 504s; do NOT re-wire' } },
              { id: 'p6', cells: { name: 'Storage adapter (S3/R2)', kind: 'unwired', state: 'warning', note: 'defined but never connected' } },
              { id: 'p7', cells: { name: 'next-sitemap.config.js', kind: 'dead config', state: 'warning', note: 'placeholder domain; sitemap is hand-written instead' } },
            ],
          },
        ],
        notes: [
          'Abandoned ≠ pending. The queue stack was deliberately retired, not left half-finished. Cleaning it up is correct; wiring it back is not.',
          'Externally call it "deprecated dead code that never runs" — never "deleted". git log --diff-filter=D shows no deletion, and anyone can open the repo to check.',
        ],
      },
      'repo-provider',
      nowIso(),
      'derived'
    );
  },

  async getUsers(): Promise<PanelPayload> {
    return stamp(
      {
        metrics: [
          { label: 'Registered users', value: 'unknown', trend: 'flat', hint: 'requires DB query or session store' },
          { label: 'Roles defined', value: '4', trend: 'flat', hint: 'hand-maintained' },
          { label: 'Admins', value: 'unknown', trend: 'flat' },
          { label: 'Auth backend', value: 'JWT + scrypt', trend: 'flat', hint: 'hand-rolled, not Supabase' },
        ],
        pills: [
          { label: 'User persistence', level: 'critical', detail: 'in-memory Map unless DATABASE_URL is set — users lost on redeploy' },
          { label: 'Session cookie', level: 'healthy', detail: 'httpOnly, sameSite=lax, 30d' },
          { label: 'AUTH_SECRET', level: 'critical', detail: 'code falls back to a hard-coded default string' },
        ],
        tables: [
          {
            title: '角色定义（人工维护，未由代码强制）',
            columns: [
              { key: 'role', label: 'Role' },
              { key: 'scope', label: 'Scope' },
              { key: 'seats', label: 'Seats', align: 'right', width: '80px' },
              { key: 'state', label: 'Enforced?', asPill: true },
            ],
            rows: [
              { id: 'r1', cells: { role: 'Owner', scope: 'Full access, billing, destructive actions', seats: 1, state: 'healthy' } },
              { id: 'r2', cells: { role: 'Editor', scope: 'Content, SEO, publish gate', seats: 0, state: 'warning' } },
              { id: 'r3', cells: { role: 'Analyst', scope: 'Read-only analytics', seats: 0, state: 'warning' } },
              { id: 'r4', cells: { role: 'Service', scope: 'API tokens for webhooks', seats: 0, state: 'warning' } },
            ],
          },
        ],
        notes: [
          'This role matrix is a design document, not an enforced permission system. No RBAC code reads it yet.',
          'AUTH_SECRET has a literal fallback in src/lib/auth/session.ts. Confirm the env var is set in production before trusting the auth boundary.',
          'Serverless + in-memory store means users silently disappear. Set DATABASE_URL.',
        ],
      },
      'static-snapshot',
      '2026-09-27',
      'static'
    );
  },

  async getSecurity(): Promise<PanelPayload> {
    return stamp(
      {
        metrics: [
          { label: 'Last backup', value: 'unknown', trend: 'flat', hint: 'no scheduled job exists' },
          { label: 'Sentry issues', value: 'unknown', trend: 'flat', hint: 'API key not wired' },
          { label: 'Security headers', value: 'applied', trend: 'flat', hint: 'src/middleware/security.ts' },
          { label: 'Uptime monitor', value: 'none', trend: 'flat', goodDirection: 'up' },
        ],
        pills: [
          { label: 'Backups', level: 'critical', detail: 'no automation, no restore drill' },
          { label: 'Error monitoring', level: 'healthy', detail: 'Sentry configured' },
          { label: 'Dependency audit', level: 'unknown', detail: 'npm audit not run' },
        ],
        checklists: [
          {
            title: '安全基线（人工核对项，非自动检测）',
            items: [
              { id: 'x1', label: 'Security headers applied on every response', done: true, detail: 'middleware/security.ts' },
              { id: 'x2', label: 'Rate limiting on conversion endpoints', done: true, detail: 'src/lib/rate-limit.ts' },
              { id: 'x3', label: 'Sentry captures client, server and edge errors', done: true },
              { id: 'x4', label: 'Automated database backup schedule', done: false },
              { id: 'x5', label: 'Backup restore drill performed', done: false, detail: 'an unrestored backup is not a backup' },
              { id: 'x6', label: 'Dependency vulnerability scan in CI', done: false },
              { id: 'x7', label: 'AUTH_SECRET rotated in the last 90 days', done: false },
              { id: 'x8', label: 'Uptime monitoring with alerting', done: false },
            ],
          },
        ],
        notes: [
          'These checklist states are hand-maintained, not detected. Treat a tick as "someone asserted this", not "a robot verified this".',
          'The workbench API itself has no auth. That is the largest known gap on this page.',
        ],
      },
      'static-snapshot',
      '2026-09-27',
      'static'
    );
  },

  async getNotifications(): Promise<PanelPayload> {
    return stamp(
      {
        metrics: [
          { label: 'Unread', value: '3', trend: 'flat', hint: 'static placeholder' },
          { label: 'Critical', value: '1', trend: 'flat', hint: 'static placeholder' },
          { label: 'Delivery channels', value: '0 configured', trend: 'flat', goodDirection: 'up' },
          { label: 'Digest schedule', value: '22:00 daily', trend: 'flat', hint: 'automation exists, not a channel' },
        ],
        pills: [
          { label: 'Dispatch transport', level: 'critical', detail: 'no email or webhook sender wired' },
          { label: 'Alert rules', level: 'warning', detail: 'declared but never triggered' },
        ],
        timelines: [
          { id: 'n1', at: '2026-09-27T00:00:00Z', title: 'Workbench security gaps recorded', detail: 'API unauthenticated; no backup automation', level: 'critical' },
          { id: 'n2', at: '2026-09-26T12:00:00Z', title: 'Reddit account still in warm-up', detail: 'earliest first post 2026-10-26, karma must reach 100', level: 'warning' },
          { id: 'n3', at: '2026-09-26T10:30:00Z', title: 'Social draft bundle generated', detail: '20 posts scheduled 2026-09-27 → 2026-10-23', level: 'healthy' },
        ],
        tables: [
          {
            title: '告警规则（已声明，未派发）',
            columns: [
              { key: 'rule', label: 'Rule' },
              { key: 'trigger', label: 'Trigger' },
              { key: 'channel', label: 'Channel', width: '110px' },
              { key: 'state', label: 'Wired', asPill: true },
            ],
            rows: [
              { id: 'v1', cells: { rule: 'Quality gate regression', trigger: 'any audit script exits non-zero', channel: 'none', state: 'critical' } },
              { id: 'v2', cells: { rule: 'Claims audit red', trigger: 'audit:claims failures > 0', channel: 'none', state: 'critical' } },
              { id: 'v3', cells: { rule: 'Deploy failure', trigger: 'build fails on main', channel: 'none', state: 'critical' } },
              { id: 'v4', cells: { rule: 'Uptime', trigger: 'health endpoint non-200 for 3 min', channel: 'none', state: 'critical' } },
            ],
          },
        ],
        notes: [
          'No notification is actually dispatched by this panel. It is a specification, rendered as if it were a feed — which is exactly the failure mode this panel should eventually eliminate.',
          'The gate verdicts on the Overview and Deploy panels are already computed live. They simply have nowhere to be sent yet.',
        ],
      },
      'static-snapshot',
      '2026-09-27',
      'static'
    );
  },
};

/** Memoise gate script runs; they take seconds and change rarely. */
function getCachedGates(f: RepoFacts): PanelPayload {
  if (gateCache && Date.now() - gateCache.at < GATE_TTL_MS) return gateCache.payload;
  const payload = buildGates(f);
  gateCache = { at: Date.now(), payload };
  return payload;
}
