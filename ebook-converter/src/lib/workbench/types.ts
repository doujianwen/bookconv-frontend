// src/lib/workbench/types.ts
// Workbench (网站工作台) — shared type contracts.
//
// Every panel the workbench renders is driven by one of the view models
// below. Panels never import a data source directly; they declare a
// WorkbenchPanel descriptor and receive data through the provider registry
// in ./provider.ts. That indirection is the extension seam: swapping the
// mock provider for a real one (GitHub / Vercel / GSC / Cloudflare ...)
// requires no panel changes.

export type PanelKey =
  | 'overview'
  | 'board'
  | 'keywords'
  | 'competitors'
  | 'domain'
  | 'deploy'
  | 'content'
  | 'seo'
  | 'analytics'
  | 'extensions'
  | 'users'
  | 'security'
  | 'notifications';

export type HealthLevel = 'healthy' | 'warning' | 'critical' | 'unknown';

/**
 * How a panel's data is actually obtained. This replaced a two-value
 * `live | mock` flag that lied: a panel whose numbers were hand-copied from a
 * repository script was labelled `live` even though it did no I/O at all.
 *
 * - `static`  — numbers are literal constants in the provider. They do not
 *               change when the site changes. Label shows an age warning.
 * - `derived` — computed at request time from local files (fs / child_process).
 *               Fresh on every render, but limited to what the local repo knows.
 * - `remote`  — fetched from an external API (GitHub, GSC, Cloudflare, ...).
 *               Genuinely live.
 */
export type DataSourceKind = 'static' | 'derived' | 'remote';

export interface PanelMeta {
  key: PanelKey;
  /** i18n-ready label key; the workbench renders labelZh/labelEn for now. */
  labelZh: string;
  labelEn: string;
  /** lucide-react icon name, resolved by the icon map in the layout. */
  icon: string;
  /** Group heading in the sidebar. */
  group: 'Overview' | 'Infrastructure' | 'Content & SEO' | 'Governance';
  /**
   * How this panel gets its numbers. Rendered as an explicit badge so an
   * operator can never mistake a frozen snapshot for a live feed.
   */
  source: DataSourceKind;
  /**
   * Date the static snapshot was taken. Required when source === 'static',
   * because a frozen number without a date is indistinguishable from a fresh
   * one. Omitted for derived/remote panels.
   */
  snapshotDate?: string;
  href: string;
}

/** A single headline number on a panel. */
export interface Metric {
  label: string;
  value: string;
  /** Optional delta vs the previous window, already formatted. */
  delta?: string;
  /** Direction drives the color. `up` is not automatically `good`. */
  trend?: 'up' | 'down' | 'flat';
  /** Which direction is the desirable one. Defaults to 'up'. */
  goodDirection?: 'up' | 'down';
  hint?: string;
}

export interface StatusPill {
  label: string;
  level: HealthLevel;
  detail?: string;
}

export interface TimelineEvent {
  id: string;
  at: string;
  title: string;
  detail?: string;
  level: HealthLevel;
  actor?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  /** Column width hint for the responsive grid. */
  width?: string;
  align?: 'left' | 'right' | 'center';
  /** Render as a status pill rather than plain text. */
  asPill?: boolean;
}

export interface TableRow {
  id: string;
  cells: Record<string, string | number | null>;
  /** Row-level action targets, e.g. an external URL or a panel route. */
  href?: string;
  actionLabel?: string;
}

export interface WorkbenchTable {
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
  emptyMessage?: string;
}

/** A checklist rendered as progress. Used by SEO / security panels. */
export interface Checklist {
  title: string;
  items: Array<{
    id: string;
    label: string;
    done: boolean;
    detail?: string;
    /** Where to fix it when not done. */
    fixHref?: string;
  }>;
}

/** Any panel payload. Panels narrow this by PanelKey. */
export interface PanelPayload {
  metrics?: Metric[];
  pills?: StatusPill[];
  tables?: WorkbenchTable[];
  timelines?: TimelineEvent[];
  checklists?: Checklist[];
  /** Free-form notes shown at the bottom of a panel. */
  notes?: string[];
  /** Real generation timestamp, produced at request time — never hard-coded. */
  updatedAt?: string;
  /** Which provider answered. */
  source?: string;
  /** How the numbers were obtained. Mirrors PanelMeta.source. */
  sourceKind?: DataSourceKind;
  /**
   * When the underlying numbers were measured. For generated panels this is
   * updatedAt; for snapshots it is the date a human last verified them.
   * Surfaced so a stale panel is visibly stale.
   */
  measuredAt?: string;
}

export type PanelPayloads = Partial<Record<PanelKey, PanelPayload>>;

/**
 * The extension contract. A provider is a plain object of async getters —
 * one per panel. Adding a real integration means adding one file that
 * implements this interface and registering it in provider.ts.
 */
export interface WorkbenchProvider {
  id: string;
  label: string;
  getOverview(): Promise<PanelPayload>;
  getDomain(): Promise<PanelPayload>;
  getDeploy(): Promise<PanelPayload>;
  getContent(): Promise<PanelPayload>;
  getSeo(): Promise<PanelPayload>;
  getAnalytics(): Promise<PanelPayload>;
  getExtensions(): Promise<PanelPayload>;
  getUsers(): Promise<PanelPayload>;
  getSecurity(): Promise<PanelPayload>;
  getNotifications(): Promise<PanelPayload>;
}

export type ProviderGetterName = Exclude<keyof WorkbenchProvider, 'id' | 'label'>;

/**
 * Panels that answer themselves from a local data file instead of a provider
 * getter. Adding a getter for these would imply a data source they do not have.
 *
 *   board    -> data/seo-geo-board.json      (src/lib/board/)
 *   keywords -> data/keyword-series.json     (src/lib/keywords/)
 *
 * Declared as one list so a new self-sourced panel only has to be added here.
 */
export const SELF_SOURCED_PANELS = ['board', 'keywords', 'competitors'] as const;

/** Panels whose payload comes from a provider getter. */
export type ProviderPanelKey = Exclude<PanelKey, (typeof SELF_SOURCED_PANELS)[number]>;

/** Maps a provider-backed panel key to the provider method that answers it. */
export const PANEL_TO_GETTER: Record<ProviderPanelKey, ProviderGetterName> = {
  overview: 'getOverview',
  domain: 'getDomain',
  deploy: 'getDeploy',
  content: 'getContent',
  seo: 'getSeo',
  analytics: 'getAnalytics',
  extensions: 'getExtensions',
  users: 'getUsers',
  security: 'getSecurity',
  notifications: 'getNotifications',
};
