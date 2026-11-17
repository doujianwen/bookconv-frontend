#!/usr/bin/env node
// Verify a Production deployment exists for the target SHA — READ-ONLY.
// 生产链路唯一 = Vercel GitHub Integration（vercel[bot]）。本脚本只验证，不部署。
//
// Exit codes:
//   0 PASS                  — Production deployment for SHA = success + live HTTP 200
//   1 FAIL                  — wrong env / SHA mismatch / wrong creator / failure|error state / API permission / HTTP check fail
//   2 SUPERSEDED_NEUTRAL    — target SHA deployment was superseded/inactive（不伪报 PASS）
//   3 TIMEOUT               — deadline reached without a terminal success
//   4 CONFIG_ERROR          — bad input configuration
//
// Env:
//   VPD_SHA, VPD_REPO, GITHUB_TOKEN/VPD_TOKEN, VPD_BASE_URL, VPD_CHECK_PATH,
//   VPD_POLL_INTERVAL_MS (default 20000), VPD_DEADLINE_MS (default 600000),
//   VPD_MAX_CONSECUTIVE_ERRORS (default 5), VPD_EXPECTED_CREATOR (default vercel[bot]),
//   VPD_MOCK (test-only profile name; ignored in production use)
const rawFetch = globalThis.fetch

const REPO = process.env.VPD_REPO || 'doujianwen/bookconv-frontend'
const SHA = (process.env.VPD_SHA || process.env.GITHUB_SHA || '').trim()
const TOKEN = (process.env.VPD_TOKEN || process.env.GITHUB_TOKEN || '').trim()
const BASE_URL = (process.env.VPD_BASE_URL || 'https://www.bookconv.com/').replace(/\/+$/, '')
const CHECK_PATH = process.env.VPD_CHECK_PATH || ''
const INTERVAL = clampInt(process.env.VPD_POLL_INTERVAL_MS, 10, 120000, 20000)
const DEADLINE = clampInt(process.env.VPD_DEADLINE_MS, 5000, 3600000, 600000)
const MAX_CONSECUTIVE_ERRORS = clampInt(process.env.VPD_MAX_CONSECUTIVE_ERRORS, 1, 50, 5)
const EXPECTED_CREATOR = process.env.VPD_EXPECTED_CREATOR || 'vercel[bot]'
const MOCK = process.env.VPD_MOCK || ''
const START = Date.now()

function clampInt(v, lo, hi, dflt) {
  const n = parseInt(v || '', 10)
  if (!Number.isFinite(n)) return dflt
  return Math.min(hi, Math.max(lo, n))
}
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- mock transport（仅测试剖面；生产路径不经过）----
const MOCKS = {
  normal: {
    deployments: [{ id: 9000000001, sha: SHA, environment: 'production', creator: { login: EXPECTED_CREATOR } }],
    statuses: [{ id: 9100000001, state: 'success', created_at: '2026-01-01T00:00:00Z', description: 'Deployment has completed' }],
    http: { status: 200, finalUrl: BASE_URL + '/' },
  },
  'fake-sha': { deployments: [], statuses: [], http: { status: 200, finalUrl: BASE_URL + '/' } },
  'wrong-env': {
    deployments: [{ id: 9000000002, sha: SHA, environment: 'Preview', creator: { login: EXPECTED_CREATOR } }],
    statuses: [{ id: 9100000002, state: 'success', created_at: '2026-01-01T00:00:00Z', description: 'Preview ok' }],
    http: { status: 200, finalUrl: BASE_URL + '/' },
  },
  'failure-state': {
    deployments: [{ id: 9000000003, sha: SHA, environment: 'production', creator: { login: EXPECTED_CREATOR } }],
    statuses: [{ id: 9100000003, state: 'failure', created_at: '2026-01-01T00:00:00Z', description: 'Deployment failed' }],
    http: { status: 200, finalUrl: BASE_URL + '/' },
  },
  'api-403': { status: 403, body: { message: 'Not authorized' } },
  'api-429-recover': { rateLimitTimes: 2, deployments: [{ id: 9000000004, sha: SHA, environment: 'production', creator: { login: EXPECTED_CREATOR } }], statuses: [{ id: 9100000004, state: 'success', created_at: '2026-01-01T00:00:00Z', description: 'ok' }], http: { status: 200, finalUrl: BASE_URL + '/' } },
  'api-429-forever': { rateLimitAlways: true },
  'api-network-error': { networkErrorAlways: true },
  'deploy-timeout': {
    deployments: [{ id: 9000000005, sha: SHA, environment: 'production', creator: { login: EXPECTED_CREATOR } }],
    statuses: [{ id: 9100000005, state: 'queued', created_at: '2026-01-01T00:00:00Z', description: 'queued forever' }],
    http: { status: 200, finalUrl: BASE_URL + '/' },
  },
  'sha-mismatch': {
    deployments: [{ id: 9000000006, sha: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', environment: 'production', creator: { login: EXPECTED_CREATOR } }],
    statuses: [{ id: 9100000006, state: 'success', created_at: '2026-01-01T00:00:00Z', description: 'ok' }],
    http: { status: 200, finalUrl: BASE_URL + '/' },
  },
  'http-fail': {
    deployments: [{ id: 9000000007, sha: SHA, environment: 'production', creator: { login: EXPECTED_CREATOR } }],
    statuses: [{ id: 9100000007, state: 'success', created_at: '2026-01-01T00:00:00Z', description: 'ok' }],
    http: { status: 503, finalUrl: BASE_URL + '/' },
  },
  superseded: {
    deployments: [{ id: 9000000008, sha: SHA, environment: 'production', creator: { login: EXPECTED_CREATOR } }],
    statuses: [{ id: 9100000008, state: 'inactive', created_at: '2026-01-01T00:00:00Z', description: 'Deployment was superseded by a newer one' }],
    http: { status: 200, finalUrl: BASE_URL + '/' },
  },
}
let mockState = { rateLimitSeen: 0, deploymentsCalls: 0 }
async function transport(url, opts) {
  if (!MOCK) return rawFetch(url, opts)
  const m = MOCKS[MOCK]
  if (!m) throw new Error(`unknown mock profile: ${MOCK}`)
  if (m.status === 403) return { ok: false, status: 403, json: async () => m.body, text: async () => JSON.stringify(m.body) }
  const isRateLimited =
    m.rateLimitAlways || (m.rateLimitTimes !== undefined && mockState.rateLimitSeen < m.rateLimitTimes && url.includes('/deployments'))
  if (isRateLimited) {
    mockState.rateLimitSeen++
    return { ok: false, status: 429, json: async () => ({}), text: async () => '{}' }
  }
  if (m.networkErrorAlways) throw new Error('mock network failure')
  if (url.includes('/deployments/') && url.includes('/statuses')) return { ok: true, status: 200, json: async () => m.statuses, text: async () => '[]' }
  if (url.includes('/deployments?')) {
    mockState.deploymentsCalls++
    return { ok: true, status: 200, json: async () => m.deployments, text: async () => '[]' }
  }
  if (url.startsWith(BASE_URL)) return { ok: m.http.status === 200, status: m.http.status, url: m.http.finalUrl, text: async () => '<html></html>', headers: new Map() }
  return { ok: false, status: 500, json: async () => ({}), text: async () => '' }
}

// ---- GitHub API（只读 GET，最小头集；不回显 token）----
async function apiGet(path) {
  const url = `https://api.github.com/repos/${REPO}/${path}`
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'bookconv-verify-production-deploy',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  const res = await transport(url, { headers, redirect: 'follow' })
  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }
  return { status: res.status, body }
}

function classify(res) {
  const msg = (res.body && typeof res.body.message === 'string' ? res.body.message : '').toLowerCase()
  if (res.status === 429) return 'RATE_LIMIT'
  // GitHub 对匿名主限额超限返回 403（message 含 rate limit），必须与真权限 403 区分，否则限流会被误报为权限错误
  if (res.status === 403 && /rate limit/.test(msg)) return 'RATE_LIMIT'
  if (res.status === 403) return 'PERMISSION'
  if (res.status === 404) return 'NOT_FOUND'
  if (res.status >= 500) return 'SERVER'
  if (res.status === 200) return 'OK'
  return 'OTHER'
}

function fail(code, reason) {
  log(`FAIL(${code}): ${reason}`)
  process.exit(1)
}

if (!/^[0-9a-f]{40}$/i.test(SHA)) {
  console.error(`CONFIG_ERROR: target SHA invalid: '${SHA}'`)
  process.exit(4)
}

async function checkLiveHttp() {
  const target = BASE_URL + (CHECK_PATH || '/')
  try {
    const res = await transport(target, { redirect: 'follow', headers: { 'User-Agent': 'bookconv-verify-production-deploy' } })
    const status = res.status
    const finalUrl = res.url || target
    log(`live HTTP check: GET ${target} -> ${status} finalUrl=${finalUrl}`)
    if (status !== 200) {
      fail('HTTP_CHECK', `production HTTP check returned ${status}, expected 200`)
    }
  } catch (e) {
    fail('HTTP_CHECK', `production HTTP check network error: ${e.message}`)
  }
}

let consecutiveErrors = 0
let pollCount = 0
log(`verify start: repo=${REPO} sha=${SHA} deadline=${DEADLINE}ms interval=${INTERVAL}ms mock=${MOCK || 'off'}`)

while (Date.now() - START < DEADLINE) {
  pollCount++
  let res
  try {
    res = await apiGet(`deployments?sha=${SHA}&environment=production&per_page=5`)
  } catch (e) {
    consecutiveErrors++
    log(`poll#${pollCount} NETWORK_ERROR: ${e.message} (consecutive=${consecutiveErrors})`)
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) fail('API_NETWORK', `${consecutiveErrors} consecutive API/network errors`)
    await sleep(INTERVAL)
    continue
  }
  const kind = classify(res)
  if (kind !== 'OK') {
    consecutiveErrors++
    log(`poll#${pollCount} API ${kind} HTTP=${res.status} (consecutive=${consecutiveErrors})`)
    if (kind === 'PERMISSION') fail('API_PERMISSION', `GitHub API 403 Forbidden — token lacks read access to deployments (审查 GITHUB_TOKEN 权限，最小只读 deployments:read)`)
    if (kind === 'NOT_FOUND') fail('API_NOT_FOUND', `GitHub API 404 — repo not found or path wrong`)
    if (kind === 'OTHER') fail('API_OTHER', `GitHub API unexpected HTTP ${res.status}`)
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS && kind !== 'RATE_LIMIT' && kind !== 'SERVER') fail('API_ERROR', `${consecutiveErrors} consecutive API errors`)
    await sleep(INTERVAL)
    continue
  }
  consecutiveErrors = 0
  const deps = Array.isArray(res.body) ? res.body : []
  if (deps.length === 0) {
    log(`poll#${pollCount}: no Production deployment for ${SHA} yet`)
    await sleep(INTERVAL)
    continue
  }
  const dep = deps[0]
  if ((dep.environment || '').toLowerCase() !== 'production') {
    fail('WRONG_ENV', `deployment ${dep.id} environment='${dep.environment}' is not Production — Preview 不得冒充 Production`)
  }
  if ((dep.sha || '').toLowerCase() !== SHA.toLowerCase()) {
    fail('SHA_MISMATCH', `deployment ${dep.id} sha=${dep.sha} != target ${SHA}`)
  }
  const creator = dep.creator && dep.creator.login
  if (creator !== EXPECTED_CREATOR) {
    fail('CREATOR_MISMATCH', `deployment ${dep.id} creator='${creator}' != expected '${EXPECTED_CREATOR}'（Vercel GitHub Integration）`)
  }
  let sres
  try {
    sres = await apiGet(`deployments/${dep.id}/statuses`)
  } catch (e) {
    consecutiveErrors++
    log(`poll#${pollCount} statuses NETWORK_ERROR: ${e.message}`)
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) fail('API_NETWORK', 'statuses fetch network error')
    await sleep(INTERVAL)
    continue
  }
  if (classify(sres) !== 'OK') {
    consecutiveErrors++
    log(`poll#${pollCount} statuses API ${classify(sres)} HTTP=${sres.status}`)
    if (classify(sres) === 'PERMISSION') fail('API_PERMISSION', 'statuses 403')
    await sleep(INTERVAL)
    continue
  }
  consecutiveErrors = 0
  const statuses = Array.isArray(sres.body) ? sres.body : []
  const latest = statuses[0]
  if (!latest) {
    log(`poll#${pollCount}: deployment ${dep.id} has no status yet`)
    await sleep(INTERVAL)
    continue
  }
  const st = (latest.state || '').toLowerCase()
  log(`poll#${pollCount}: deployment=${dep.id} state=${st} desc='${latest.description || ''}'`)
  if (st === 'success') {
    await checkLiveHttp()
    log(`PASS: Production deployment ${dep.id} for ${SHA} verified (creator=${creator}) + live HTTP 200`)
    process.exit(0)
  }
  if (st === 'inactive' || /superseded/i.test(latest.description || '')) {
    log(`NEUTRAL: deployment ${dep.id} for ${SHA} was superseded/inactive（后续 SHA 已替代本次部署，不伪报 PASS）`)
    process.exit(2)
  }
  if (st === 'failure' || st === 'error' || st === 'canceled') {
    fail('DEPLOY_STATE', `deployment ${dep.id} terminal state='${st}' — Production deployment failed`)
  }
  // queued / pending / in_progress / waiting → 继续轮询
  await sleep(INTERVAL)
}

log(`TIMEOUT: no successful Production deployment for ${SHA} within ${DEADLINE}ms (polls=${pollCount})`)
process.exit(3)
