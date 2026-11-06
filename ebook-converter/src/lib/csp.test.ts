// src/lib/csp.test.ts
//
// 2026-11-06 P0 根因（CSP connect-src 漏 R2 host）门禁 + 反向验证。
// 纪律：注入事故（移除 R2 源）⇒ 判据必须 FAIL；恢复 ⇒ PASS。
// 只测不变量，不硬编码完整 CSP 清单（防「清单对了但能力没变」的假门禁）。

import {
  buildContentSecurityPolicy,
  r2ConnectSources,
  connectSrcAllows,
  R2_CONNECT_WILDCARD,
} from "@/lib/csp";

const CORS = ["https://www.bookconv.com", "https://bookconv.com"];
const ENDPOINT = "https://28f140233aafb5ea6b1198584e2a1658.r2.cloudflarestorage.com";
// 真实 presign 产出形态（virtual-hosted style）：<bucket>.<account>.r2.cloudflarestorage.com
const R2_PUT_URL =
  "https://ebook-temp.28f140233aafb5ea6b1198584e2a1658.r2.cloudflarestorage.com/uploads/x.epub?X-Amz-Algorithm=AWS4-HMAC-SHA256";

// 事故态：修复前的线上 CSP（复刻 2026-11-06 实测响应头）
const BROKEN_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self'; " +
  `img-src 'self' data: blob: www.bookconv.com bookconv.com; font-src 'self' data:; ` +
  `connect-src 'self' ${CORS.join(" ")} https://www.google-analytics.com https://stats.g.doubleclick.net https://*.sentry.io; ` +
  "frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

describe("R2 直传 CSP connect-src（P0 根因修复）", () => {
  test("r2ConnectSources：env 缺失仍恒含通配源（防 build 期 env 空导致静默复发）", () => {
    expect(r2ConnectSources(undefined)).toContain(R2_CONNECT_WILDCARD);
    expect(r2ConnectSources("")).toContain(R2_CONNECT_WILDCARD);
    expect(r2ConnectSources("not-a-url")).toContain(R2_CONNECT_WILDCARD);
    expect(r2ConnectSources(null).length).toBeGreaterThan(0);
  });

  test("r2ConnectSources：env 有效时额外推导精确 host + bucket 通配", () => {
    const s = r2ConnectSources(ENDPOINT);
    expect(s).toContain(R2_CONNECT_WILDCARD);
    expect(s).toContain(ENDPOINT);
    expect(s).toContain("https://*.28f140233aafb5ea6b1198584e2a1658.r2.cloudflarestorage.com");
  });

  test("生成的 CSP 允许真实 R2 PUT host（修复态）", () => {
    const fixed = buildContentSecurityPolicy(CORS, ENDPOINT);
    expect(connectSrcAllows(fixed, R2_PUT_URL)).toBe(true);
  });

  test("build 期 R2_ENDPOINT 缺失时生成的 CSP 仍允许 R2 PUT（本地绿≠线上绿防线）", () => {
    const fixed = buildContentSecurityPolicy(CORS, undefined);
    expect(connectSrcAllows(fixed, R2_PUT_URL)).toBe(true);
  });

  test("🔴 反向验证：移除 R2 源（复刻修复前线上 CSP）⇒ 判据必须 FAIL", () => {
    expect(connectSrcAllows(BROKEN_CSP, R2_PUT_URL)).toBe(false);
  });

  test("🔴 反向验证：把修复态 CSP 的 R2 源逐个删掉 ⇒ 判据 FAIL；恢复 ⇒ PASS", () => {
    const fixed = buildContentSecurityPolicy(CORS, ENDPOINT);
    const injected = fixed.replace(/\s+https:\/\/\*\.r2\.cloudflarestorage\.com/g, "")
      .replace(/\s+https:\/\/\*\.28f140233aafb5ea6b1198584e2a1658\.r2\.cloudflarestorage\.com/g, "")
      .replace(/\s+https:\/\/28f140233aafb5ea6b1198584e2a1658\.r2\.cloudflarestorage\.com/g, "");
    expect(connectSrcAllows(injected, R2_PUT_URL)).toBe(false); // 事故态能抓到
    expect(connectSrcAllows(fixed, R2_PUT_URL)).toBe(true); // 恢复态不误报
  });

  test("负对照：非 R2 域不被放行（通配不得扩到任意域）", () => {
    const fixed = buildContentSecurityPolicy(CORS, ENDPOINT);
    expect(connectSrcAllows(fixed, "https://evil.example.com/put")).toBe(false);
    expect(connectSrcAllows(fixed, "https://r2.cloudflarestorage.com.evil.com/put")).toBe(false);
  });

  test("原有能力不回归：connect-src 仍保留 CORS_ORIGINS / GA / Sentry", () => {
    const fixed = buildContentSecurityPolicy(CORS, ENDPOINT);
    for (const s of [
      "https://www.bookconv.com",
      "https://bookconv.com",
      "https://www.google-analytics.com",
      "https://stats.g.doubleclick.net",
    ]) {
      expect(fixed).toContain(s);
    }
    expect(fixed).toContain("frame-ancestors 'none'");
    expect(fixed).toContain("default-src 'self'");
  });

  test("connectSrcAllows：无 connect-src（fallback default-src）⇒ 不允许 R2，判 UNKNOWN 而非放行", () => {
    expect(connectSrcAllows("default-src 'self';", R2_PUT_URL)).toBe(false);
  });
});
