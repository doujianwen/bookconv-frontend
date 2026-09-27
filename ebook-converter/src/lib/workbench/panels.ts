// src/lib/workbench/panels.ts
// Panel registry — the single source of truth for navigation, routing and
// the dashboard grid. Adding a module = adding one entry here plus one
// provider getter. Nothing else in the UI needs to change.
//
// `source` is deliberately three-valued and is rendered as a badge:
//   static  — frozen constants, with the date they were verified
//   derived — recomputed from local files on every render
//   remote  — fetched from an external API
// An earlier version used `live | mock`, which mislabelled frozen snapshots
// as live. See DataSourceKind in ./types.ts.
import type { PanelKey, PanelMeta } from './types';

export const PANELS: PanelMeta[] = [
  {
    key: 'board',
    labelZh: 'SEO/GEO 作战台',
    labelEn: 'SEO/GEO Board',
    icon: 'Target',
    group: 'Content & SEO',
    source: 'derived',
    href: '/admin/board',
  },
  {
    key: 'keywords',
    labelZh: '关键词排名',
    labelEn: 'Keyword Rankings',
    icon: 'TrendingUp',
    group: 'Content & SEO',
    source: 'derived',
    href: '/admin/keywords',
  },
  {
    key: 'competitors',
    labelZh: '竞品关键词',
    labelEn: 'Competitor Keywords',
    icon: 'Swords',
    group: 'Content & SEO',
    source: 'derived',
    href: '/admin/competitors',
  },
  {
    key: 'overview',
    labelZh: '站点概览',
    labelEn: 'Site Overview',
    icon: 'LayoutDashboard',
    group: 'Overview',
    source: 'derived',
    href: '/admin',
  },
  {
    key: 'domain',
    labelZh: '域名与服务器',
    labelEn: 'Domain & Server',
    icon: 'Globe',
    group: 'Infrastructure',
    source: 'static',
    snapshotDate: '2026-09-27',
    href: '/admin/domain',
  },
  {
    key: 'deploy',
    labelZh: '部署与版本',
    labelEn: 'Deploy & Releases',
    icon: 'GitBranch',
    group: 'Infrastructure',
    source: 'derived',
    href: '/admin/deploy',
  },
  {
    key: 'content',
    labelZh: '内容与文章',
    labelEn: 'Content & Posts',
    icon: 'FileText',
    group: 'Content & SEO',
    source: 'derived',
    href: '/admin/content',
  },
  {
    key: 'seo',
    labelZh: 'SEO 设置',
    labelEn: 'SEO Settings',
    icon: 'Search',
    group: 'Content & SEO',
    source: 'derived',
    href: '/admin/seo',
  },
  {
    key: 'analytics',
    labelZh: '数据统计',
    labelEn: 'Analytics',
    icon: 'BarChart3',
    group: 'Content & SEO',
    source: 'static',
    snapshotDate: '2026-09-26',
    href: '/admin/analytics',
  },
  {
    key: 'extensions',
    labelZh: '插件与主题',
    labelEn: 'Plugins & Themes',
    icon: 'Puzzle',
    group: 'Governance',
    source: 'derived',
    href: '/admin/extensions',
  },
  {
    key: 'users',
    labelZh: '用户与权限',
    labelEn: 'Users & Roles',
    icon: 'Users',
    group: 'Governance',
    source: 'static',
    snapshotDate: '2026-09-27',
    href: '/admin/users',
  },
  {
    key: 'security',
    labelZh: '备份与安全',
    labelEn: 'Backup & Security',
    icon: 'ShieldCheck',
    group: 'Governance',
    source: 'static',
    snapshotDate: '2026-09-27',
    href: '/admin/security',
  },
  {
    key: 'notifications',
    labelZh: '消息通知',
    labelEn: 'Notifications',
    icon: 'Bell',
    group: 'Governance',
    source: 'static',
    snapshotDate: '2026-09-27',
    href: '/admin/notifications',
  },
];

export const PANEL_GROUPS: PanelMeta['group'][] = [
  'Overview',
  'Infrastructure',
  'Content & SEO',
  'Governance',
];
export const SOURCE_LABEL: Record<PanelMeta['source'], { short: string; zh: string }> = {
  static: { short: 'snapshot', zh: '快照（人工核对，非实时）' },
  derived: { short: 'derived', zh: '实时计算（读本地仓库）' },
  remote: { short: 'live', zh: '实时接口（外部 API）' },
};

export function getPanel(key: PanelKey): PanelMeta {
  const found = PANELS.find((p) => p.key === key);
  if (!found) throw new Error(`Unknown workbench panel: ${key}`);
  return found;
}

/** Resolves a pathname such as '/admin/seo' or '/es/admin/seo' to a panel. */
export function panelFromPath(pathname: string): PanelMeta {
  const segments = pathname.split('/').filter(Boolean);
  const adminIdx = segments.indexOf('admin');
  const slug = adminIdx >= 0 ? segments[adminIdx + 1] : undefined;
  if (!slug) return getPanel('overview');
  return PANELS.find((p) => p.href === `/admin/${slug}`) ?? getPanel('overview');
}
