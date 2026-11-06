// src/lib/csp.ts
//
// Content-Security-Policy 构造（纯函数，可单测，不依赖运行时/浏览器）。
//
// 2026-11-06 P0 根因修复（GA4 每日巡检红队实证）：
//   R2 直传 PUT 的目标 URL 位于 https://<bucket>.<account>.r2.cloudflarestorage.com，
//   浏览器 fetch() 受 connect-src 约束。该 host 未列入 connect-src 时，请求在
//   **发出网络请求之前**就被浏览器拒绝，表现为 TypeError: Failed to fetch、
//   无 HTTP status、<1s 瞬时失败、navigator.onLine=1 —— 与 11-05 GA4 诊断前缀
//   PUT:NETWORK:on=1:<1s 完全吻合，也解释了「30 天内 0 个 >4MB 的 file_upload」。
//
//   实测证据（真实 Chromium，2026-11-06）：
//     A 线上原 CSP → TypeError: Failed to fetch，2ms
//     B connect-src 加 R2 host → PUT 200
//     C 同源负对照 → 200
//   Node/无 CSP 视角下 1~65MB PUT 全部 200、R2 CORS 预检 204（正/负对照齐全），
//   故服务端 CORS 与 R2 本身均健康 —— 单机/无 CSP 视角会系统性误导，必须浏览器复现。
//
// ⚠️ 纪律：R2_ENDPOINT 在 build 期可能为空（.env.production 留空、值在 Vercel env）。
//   因此**恒包含**服务域通配 https://*.r2.cloudflarestorage.com，env 存在时再叠加
//   推导出的精确 host。禁止只依赖 build 期 env 推导，否则会静默复发（本地绿≠线上绿）。

/** R2 直传 PUT 的服务域通配源（恒定包含，防 build 期 env 缺失导致静默复发）。 */
export const R2_CONNECT_WILDCARD = "https://*.r2.cloudflarestorage.com";

/**
 * 生成 connect-src 允许的 R2 上传源列表。
 * 纯函数：r2Endpoint 无效/缺失时仍返回通配源，绝不返回空数组。
 */
export function r2ConnectSources(r2Endpoint?: string | null): string[] {
  const sources = new Set<string>([R2_CONNECT_WILDCARD]);
  const raw = (r2Endpoint || "").trim();
  if (raw) {
    try {
      const host = new URL(raw).hostname;
      if (host) {
        sources.add(`https://${host}`); // path-style endpoint 本身
        sources.add(`https://*.${host}`); // virtual-hosted: <bucket>.<account>...
      }
    } catch {
      // 非法 URL → 保留通配源，不臆断、不抛错
    }
  }
  return [...sources];
}

/** 产出与历史逐字一致的 CSP（仅新增 connect-src 的 R2 源）。 */
export function buildContentSecurityPolicy(
  corsOrigins: string[],
  r2Endpoint?: string | null,
): string {
  const imgHosts = corsOrigins.map((o) => o.replace(/^https?:\/\//, "")).join(" ");
  const connect = [
    "'self'",
    ...corsOrigins,
    ...r2ConnectSources(r2Endpoint),
    "https://www.google-analytics.com",
    "https://stats.g.doubleclick.net",
    "https://*.sentry.io",
  ];
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.sentry.io",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${imgHosts}`,
    "font-src 'self' data:",
    `connect-src ${connect.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ") + ";";
}

/**
 * CSP connect-src 是否允许给定 URL（用于门禁反向验证，非完整 CSP 实现，
 * 仅覆盖本项目用到的 host-source 精确值 + `*.` 前缀通配）。
 */
export function connectSrcAllows(csp: string, targetUrl: string): boolean {
  const m = csp.match(/(?:^|;\s*)connect-src\s+([^;]+)/i);
  if (!m) return false; // 无 connect-src → fallback default-src，R2 不被允许
  const sources = m[1].trim().split(/\s+/);
  let host: string;
  try {
    host = new URL(targetUrl).hostname;
  } catch {
    return false;
  }
  for (const s of sources) {
    if (s === "'self'" || s === "*") continue;
    const hm = s.match(/^https?:\/\/(\*\.|[*])?(.+)$/i);
    if (!hm) continue;
    const wildcard = hm[1];
    const base = hm[2].replace(/\/$/, "");
    if (!wildcard && host === base) return true;
    if (wildcard === "*." && host.endsWith("." + base)) return true;
    if (wildcard === "*" && host.endsWith(base)) return true;
  }
  return false;
}
