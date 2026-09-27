// Pull Bing Webmaster Tools stats via the official API.
//
// Scope note (verified 2026-09-19): the official API exposes ONLY the classic
// search data — rank/traffic, query stats, page stats, crawl, url submission.
// It does NOT expose AI Performance (Total Citations / Cited Pages /
// Grounding queries / Citation Share); those endpoints return 404.
// AI Performance still has to be exported by hand from the BWT dashboard:
//   Search Performance -> AI Performance -> set date range -> Export
//
// Usage:
//   node scripts/fetch-bing-webmaster.mjs
//   node scripts/fetch-bing-webmaster.mjs --site https://www.tjostrichink.com/
//
// There is deliberately NO --days flag: these endpoints take only siteUrl and
// return whatever window Bing still retains (they do not accept date filters).
// Do not add one back without verifying the API actually honours it.
//
// The API key is read from .env.local (git-ignored). Never hardcode it here.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT_DIR = resolve(ROOT, '数据分析')
const BASE = 'https://ssl.bing.com/webmaster/api.svc/json'

// ---------- args ----------
const argv = process.argv.slice(2)
const argOf = (flag, dflt) => {
  const i = argv.indexOf(flag)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt
}
const DEFAULT_SITE = 'https://www.bookconv.com/'
const SITE = argOf('--site', DEFAULT_SITE)

// ---------- key (never hardcoded) ----------
function loadKey() {
  if (process.env.BING_WEBMASTER_API_KEY) return process.env.BING_WEBMASTER_API_KEY
  const p = resolve(ROOT, '.env.local')
  if (!existsSync(p)) {
    console.error('No .env.local and no BING_WEBMASTER_API_KEY env var.')
    console.error('Get a key: bing.com/webmasters -> Settings -> API Access -> Generate API Key')
    process.exit(1)
  }
  const line = readFileSync(p, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith('BING_WEBMASTER_API_KEY='))
  if (!line) {
    console.error('BING_WEBMASTER_API_KEY not found in .env.local')
    process.exit(1)
  }
  return line.split('=').slice(1).join('=').trim()
}

const KEY = loadKey()

// ---------- helpers ----------
const toCsv = (rows, fields) => {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n')
}

const stamp = (d) => d.toISOString().slice(0, 10).replace(/-/g, '_')
const host = new URL(SITE).host

async function call(name, extra = {}) {
  const params = new URLSearchParams({ siteUrl: SITE, apikey: KEY, ...extra })
  const res = await fetch(`${BASE}/${name}?${params}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) return { ok: false, status: res.status, rows: [] }
  const json = await res.json().catch(() => null)
  const rows = json && Array.isArray(json.d) ? json.d : []
  return { ok: true, status: res.status, rows }
}

const sum = (rows, k) => rows.reduce((a, b) => a + (Number(b[k]) || 0), 0)

// ---------- main ----------
;(async () => {
  console.log(`site  : ${SITE}`)
  console.log(`window: RankAndTraffic = full retention; Query/PageTraffic endpoints appear 7-day-capped (measured 2026-09-25) - use UI exports for full-window page/keyword history`)

  const jobs = [
    ['GetRankAndTrafficStats', ['Date', 'Clicks', 'Impressions']],
    ['GetQueryStats', ['Date', 'Query', 'Clicks', 'Impressions', 'AvgClickPosition', 'AvgImpressionPosition']],
    ['GetPageStats', ['Date', 'Query', 'Clicks', 'Impressions', 'AvgClickPosition', 'AvgImpressionPosition']],
  ]

  const today = stamp(new Date())
  const written = []

  for (const [name, fields] of jobs) {
    const { ok, status, rows } = await call(name)
    if (!ok) {
      console.log(`  [${status}] ${name} -> SKIPPED`)
      continue
    }
    // Bing returns /Date(ms)/ — normalise to ISO date
    const clean = rows.map((r) => {
      const o = { ...r }
      delete o.__type
      if (typeof o.Date === 'string') {
        const m = o.Date.match(/\/Date\((\d+)\)\//)
        if (m) o.Date = new Date(Number(m[1])).toISOString().slice(0, 10)
      }
      return o
    })
    const out = toCsv(clean, fields)
    const isPage = name === 'GetPageStats'
    const fname = `${host}_BingAPI_${isPage ? 'PageTraffic' : name.replace('Get', '').replace('Stats', '')}_${today}.csv`
    const fp = resolve(OUT_DIR, fname)
    writeFileSync(fp, out, 'utf8')
    written.push(fp)
    console.log(
      `  [${status}] ${name} -> rows=${clean.length} clicks=${sum(clean, 'Clicks')} impressions=${sum(clean, 'Impressions')}`,
    )
    console.log(`        ${fname}`)
  }

  console.log(`\nWrote ${written.length} file(s) to 数据分析/`)
  console.log('NOTE: AI Performance (Citation Share etc.) is NOT available via API —')
  console.log('      export it manually from BWT -> Search Performance -> AI Performance.')
})()
