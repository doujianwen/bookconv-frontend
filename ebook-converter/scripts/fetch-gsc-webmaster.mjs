/**
 * fetch-gsc-webmaster.mjs — Pull Google Search Console data via service account.
 *
 * Why this exists:
 *   GSC has no CSV-export automation, and the local snapshots under
 *   bookconv_data_asset/google/ are stale (latest 2026-09-06). This script
 *   pulls live data so Bing-vs-Google comparisons run on aligned windows.
 *
 * Auth: service account JWT (RS256) signed with Node's built-in crypto.
 *   No `googleapis` / `google-auth-library` dependency needed.
 *   Credential: scripts/gsc-service-account.json  (git-tracked, it is a
 *   service-account key with readonly scope — do NOT swap in a broader key)
 *
 * Usage:
 *   node scripts/fetch-gsc-webmaster.mjs
 *   node scripts/fetch-gsc-webmaster.mjs --days 90
 *   node scripts/fetch-gsc-webmaster.mjs --dimension page
 *
 * Output: 数据分析/GSC_API_<Dimension>_<endDate>.json
 *
 * Known limits:
 *   - GSC data lags ~2 days; script defaults endDate to today-2.
 *   - rowLimit max 25000 per request. This script does NOT paginate; if
 *     rows === rowLimit, raise it or add pagination before trusting totals.
 *   - Only web searchType. Discover/News not covered.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const DEFAULT_SITE = 'https://www.bookconv.com/'
const SA_PATH = path.join(ROOT, 'scripts', 'gsc-service-account.json')

// ---- proxy support -------------------------------------------------------
// Google (googleapis.com / oauth2.googleapis.com) is unreachable from the
// mainland without a proxy, and Node's global `fetch` does NOT honour
// *_proxy env vars on Node 22 (that needs NODE_USE_ENV_PROXY=1).
//
// MEASURED 2026-11-02 on this machine:
//   - the ambient system proxy (127.0.0.1:62030) reaches Baidu fine but
//     TIMES OUT on googleapis.com → it is not a working route to Google;
//   - a local tunnel proxy on 127.0.0.1:12450 reaches googleapis.com
//     (401 without auth = network OK).
// So we try each candidate proxy and use the first that actually answers,
// rather than assuming whichever proxy env var happens to be set works.
//
// Override with GSC_PROXY (e.g. GSC_PROXY=http://127.0.0.1:7890), or with the
// usual HTTPS_PROXY / https_proxy / HTTP_PROXY / http_proxy variables.
const PROXY_CANDIDATES = [
  process.env.GSC_PROXY,
  process.env.HTTPS_PROXY,
  process.env.https_proxy,
  process.env.HTTP_PROXY,
  process.env.http_proxy,
  'http://127.0.0.1:12450',
].filter(Boolean)

async function proxyWorks(proxy) {
  try {
    const { setGlobalDispatcher, ProxyAgent } = await import('undici')
    setGlobalDispatcher(new ProxyAgent(proxy))
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 12000)
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=invalid',
        signal: ctl.signal,
      })
      // Any HTTP answer proves the route works; 400 is the expected reply for
      // a deliberately invalid grant.
      return res.status > 0
    } finally {
      clearTimeout(timer)
    }
  } catch {
    return false
  }
}

async function setupProxy() {
  const tried = []
  for (const proxy of PROXY_CANDIDATES) {
    if (await proxyWorks(proxy)) {
      console.log(`proxy : ${proxy} (验证通过)`)
      return proxy
    }
    tried.push(proxy)
  }
  console.error('⚠ 所有候选代理均无法连通 Google：')
  for (const p of tried) console.error(`    - ${p}`)
  console.error('  本轮 GSC 数据标记为不可用。请开启代理/VPN 后重跑。')
  return null
}

function argOf(flag, fallback) {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const SITE = argOf('--site', DEFAULT_SITE)
const DAYS = Number(argOf('--days', '30'))

// `--end YYYY-MM-DD` — override the export's end date.
//
// 🔴 MEASURED 2026-11-02: on that date a `--days 10` run overwrote the same
// day's `--days 90` export, destroying the 90-day snapshot (397 rows → 20).
// GSC serves historical ranges, so the lost window IS recoverable — but only
// if the recovery uses the SAME date arithmetic as the original run.
//
// ⚠ The window length is derived from the dates, not from `--days`:
//   start = end - DAYS*864e5   →  inclusive span = DAYS + 1 calendar days
// So `--days 90` yields a 91-day window (e.g. 2026-08-02 → 2026-10-31).
// Computing the start date by hand (e.g. with DAYS-1) produces a 90-day
// window instead — one day off — and the builder then refuses to pair it
// with the other 91-day snapshots (it matches `previous` by window length).
// NEVER hand-roll this math; always go through this script.
//
// Format must be YYYY-MM-DD. Invalid input fails loudly (exit 1) rather than
// silently falling back to today-2.
const END_OVERRIDE = argOf('--end', '')

// Accepts one dimension or several, comma-separated:
//   --dimension query            → ["query"]            (default, unchanged)
//   --dimension query,page       → ["query","page"]     (M17: landing-page map)
//
// Why two dimensions matter: `query` alone tells you a query's average position
// but NOT which URL earned it. `["query","page"]` is the only GSC shape that
// answers "this query ranks THIS page" — verified live 2026-10-13 (489 rows,
// every one carrying a landing URL). Bing's GetPageStats is page-level only and
// cannot substitute; see scripts/build-page-series.mjs for that distinction.
//
// A single dimension keeps the historical output filename and shape, so existing
// snapshots in 数据分析/ stay valid.
const DIMENSIONS = argOf('--dimension', 'query')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean)
// Filename token: comma would break the GSC_API_query_page_*.json matchers that
// build-keyword-series.mjs and build-page-attribution.mjs use, so join with '_'.
const DIMENSION = DIMENSIONS.join('_')

if (!fs.existsSync(SA_PATH)) {
  console.error(`Missing service account: ${SA_PATH}`)
  process.exit(1)
}
const SA = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

/** Exchange a signed JWT for an OAuth2 access token (2-legged / server flow). */
async function getAccessToken() {
  const iat = Math.floor(Date.now() / 1000)
  const unsigned =
    base64url({ alg: 'RS256', typ: 'JWT' }) +
    '.' +
    base64url({
      iss: SA.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat,
      exp: iat + 3600,
    })
  const sig = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(SA.private_key, 'base64url')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: unsigned + '.' + sig,
    }),
  })
  const json = await res.json()
  if (!json.access_token) {
    throw new Error(`token exchange failed: ${JSON.stringify(json)}`)
  }
  return json.access_token
}

async function main() {
  // Reach Google through a proxy that actually works before we try to talk to
  // the API — otherwise the failure looks like a script bug instead of a
  // network route problem.
  const proxy = await setupProxy()
  if (!proxy) {
    console.error('FAILED: 无可用代理，GSC 数据本轮未取到（网络不可达，非脚本缺陷）')
    process.exit(1)
  }

  const token = await getAccessToken()
  // GSC publishes with ~2 day lag; asking for today returns an empty tail.
  // `--end` overrides the end date for backfilling a lost historical export.
  let end;
  if (END_OVERRIDE) {
    const parsed = Date.parse(END_OVERRIDE + 'T00:00:00Z');
    if (!Number.isFinite(parsed)) {
      console.error(`FAILED: --end 格式非法：${END_OVERRIDE}（应为 YYYY-MM-DD）`);
      process.exit(1);
    }
    end = new Date(parsed);
  } else {
    end = new Date(Date.now() - 2 * 864e5);
  }
  // ⚠ start = end - DAYS*864e5 ⇒ inclusive span = DAYS+1 days (91 for --days 90).
  // The builder matches `previous` by window length, so an off-by-one here
  // silently makes a snapshot unpairable. Never "fix" this to DAYS-1.
  const start = new Date(end.getTime() - DAYS * 864e5)
  const fmt = (d) => d.toISOString().slice(0, 10)
  const startDate = fmt(start)
  const endDate = fmt(end)

  console.log(`site : ${SITE}`)
  console.log(`window: ${startDate} -> ${endDate} (${DAYS}d, GSC 2-day lag applied)`)
  console.log(`dim   : ${DIMENSION}`)

  const url =
    'https://www.googleapis.com/webmasters/v3/sites/' +
    encodeURIComponent(SITE) +
    '/searchAnalytics/query'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: DIMENSIONS,
      rowLimit: 25000,
      type: 'web',
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error(`API error ${res.status}: ${JSON.stringify(json).slice(0, 400)}`)
    process.exit(1)
  }

  const rows = json.rows || []
  const ROW_LIMIT = 25000
  if (rows.length >= ROW_LIMIT) {
    console.warn(
      `WARN: rows hit rowLimit (${ROW_LIMIT}). Totals are truncated — add pagination.`
    )
  }

  const totClicks = rows.reduce((a, r) => a + (r.clicks || 0), 0)
  const totImpr = rows.reduce((a, r) => a + (r.impressions || 0), 0)
  console.log(`rows=${rows.length} clicks=${totClicks} impressions=${totImpr}`)

  const outDir = path.join(ROOT, '数据分析')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  // 🔴 The file name must carry the WINDOW LENGTH, not just the end date.
  // MEASURED 2026-11-02: the name used to be `GSC_API_<dim>_<endDate>.json`,
  // so a `--days 10` run and a `--days 90` run on the same day wrote the SAME
  // file and silently overwrote each other (a 20-row 10-day snapshot replaced
  // a 397-row 90-day one). The series builder then stitched the short window
  // and reported 3 607 rows instead of 3 984 — a silent data-loss that looked
  // like a normal rebuild.
  //
  // The window is part of the datum: GSC's `position` is an average over the
  // window, so a 10-day export and a 90-day export are NOT interchangeable.
  // Both must coexist. Historical files (named without the window) are still
  // read by build-keyword-series.mjs, so they keep working.
  const outFile = path.join(outDir, `GSC_API_${DIMENSION}_${endDate}_d${DAYS}.json`)
  fs.writeFileSync(outFile, JSON.stringify({ startDate, endDate, windowDays: DAYS, rows }, null, 2))
  console.log(`wrote: ${outFile}`)
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
