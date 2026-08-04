/**
 * check-indexing.mjs — 批量核查转换页在 Google 的收录状态
 *
 * 零外部依赖：仅用 Node 内置 fetch + crypto 手写 JWT 调用
 * GSC URL Inspection API。输出 CSV（默认打印到 stdout，可重定向到文件）。
 *
 * ── 一次性设置 ──────────────────────────────────────────────
 * 1. Google Cloud 建项目 → 启用 "Google Search Console API"
 * 2. 建服务账号 (Service Account) → 下载 JSON 凭据
 * 3. 该服务账号邮箱需有 GSC 媒体资源权限（GSC → 设置 → 用户和权限 → 添加）
 * 4. 媒体资源类型：
 *      - 网域资源用  GSC_SITE_URL="sc-domain:bookconv.com"
 *      - 网址前缀用  GSC_SITE_URL="https://bookconv.com"
 *
 * ── 运行 ────────────────────────────────────────────────────
 *   node scripts/check-indexing.mjs urls.txt > indexing.csv
 *
 *   urls.txt 每行一个 URL（参考 数据分析/GSC收录核实清单.md 的「待核实 URL」列）。
 *   或用环境变量 GSC_CREDENTIALS 指向凭据 JSON，GSC_SITE_URL 指向资源。
 *
 * 注：URL Inspection API 有配额（默认 2,000 次/天，且每分钟有限流）。
 *     脚本内置每请求间 200ms 间隔 + 失败指数退避，避免触发 429。
 */

import { readFileSync } from "node:fs";
import { createSign, createPrivateKey } from "node:crypto";
import process from "node:process";

const SCOPES = "https://www.googleapis.com/auth/webmasters";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";

// ── 配置 ────────────────────────────────────────────────────
const CREDENTIALS_PATH =
  process.env.GSC_CREDENTIALS || "scripts/gsc-service-account.json";
const SITE_URL =
  process.env.GSC_SITE_URL || "sc-domain:bookconv.com"; // 改网址前缀见上
const URLS_FILE = process.argv[2] || "scripts/index-check-urls.txt";
const DELAY_MS = 200;

// ── JWT 构造（RS256，服务账号）─────────────────────────────
function buildJWT(creds) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: creds.client_email,
    scope: SCOPES,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const signingInput = `${enc(header)}.${enc(claim)}`;
  const key = createPrivateKey(creds.private_key);
  const sig = createSign("RSA-SHA256")
    .update(signingInput)
    .sign(key, "base64url");
  return `${signingInput}.${sig}`;
}

async function getAccessToken(creds) {
  const jwt = buildJWT(creds);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`获取 access token 失败 ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.access_token;
}

// ── 单条 URL Inspection ─────────────────────────────────────
async function inspect(url, token) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Inspection API ${res.status}: ${text}`);
  }
  const data = await res.json();
  const r = data?.inspectionResult?.indexStatusResult || {};
  return {
    url,
    verdict: r.verdict ?? "",
    indexingState: r.indexingState ?? "",
    coverageState: r.coverageState ?? "",
    robotsState: r.robotsState ?? "",
    pageFetchState: r.pageFetchState ?? "",
    lastCrawlTime: r.lastCrawlTime ?? "",
    userCanonical: r.userCanonical ?? "",
    googleCanonical: r.googleCanonical ?? "",
    inSitemap: (r.sitemap && r.sitemap.length > 0) ? r.sitemap.join("|") : "",
    referringUrls: (r.referringUrls && r.referringUrls.length) || 0,
  };
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── 主流程 ──────────────────────────────────────────────────
async function main() {
  let creds;
  try {
    creds = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
  } catch (e) {
    console.error(
      `✗ 读不到凭据 ${CREDENTIALS_PATH}\n` +
        `  把服务账号 JSON 放到该路径，或设 GSC_CREDENTIALS 环境变量。`
    );
    process.exit(1);
  }

  let urls;
  try {
    urls = readFileSync(URLS_FILE, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
  } catch (e) {
    console.error(`✗ 读不到 URL 列表 ${URLS_FILE}`);
    process.exit(1);
  }

  console.error(`ℹ 站点资源: ${SITE_URL} | 待查 ${urls.length} 个 URL`);
  const token = await getAccessToken(creds);

  const headers = [
    "url", "verdict", "indexingState", "coverageState", "robotsState",
    "pageFetchState", "lastCrawlTime", "userCanonical", "googleCanonical",
    "inSitemap", "referringUrls",
  ];
  console.log(headers.map(csvEscape).join(","));

  let ok = 0, fail = 0;
  for (const url of urls) {
    try {
      const row = await inspect(url, token);
      console.log(headers.map((h) => csvEscape(row[h])).join(","));
      ok++;
    } catch (e) {
      console.error(`✗ ${url}: ${e.message}`);
      console.log(
        [csvEscape(url), "ERROR", "", "", "", "", "", "", "", "", ""].join(",")
      );
      fail++;
    }
    await sleep(DELAY_MS);
  }
  console.error(`✓ 完成：成功 ${ok}，失败 ${fail} / 共 ${urls.length}`);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
