#!/usr/bin/env node
// Reverse-injection test harness for scripts/verify-production-deploy.mjs (T1–T10 + superseded).
// 全部走 mock 传输（VPD_MOCK），不打真实 GitHub/生产 API，不破坏任何真实部署。
// 记录真实退出码；判据未真正执行的测试视为失败。
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCRIPT = path.join(__dirname, 'verify-production-deploy.mjs')
const FAKE_SHA = 'a'.repeat(40)

const CASES = [
  { id: 'T1', desc: '正常：SHA+Production+success+HTTP200', mock: 'normal', sha: FAKE_SHA, expect: { code: 0 }, expectLog: ['PASS'] },
  { id: 'T2', desc: '假 SHA（不存在部署）', mock: 'fake-sha', sha: FAKE_SHA, expect: { code: 3 }, expectLog: ['TIMEOUT'] },
  { id: 'T3', desc: '错误环境（Preview）', mock: 'wrong-env', sha: FAKE_SHA, expect: { code: 1 }, expectLog: ['WRONG_ENV', 'Preview'] },
  { id: 'T4', desc: 'failure 终态', mock: 'failure-state', sha: FAKE_SHA, expect: { code: 1 }, expectLog: ['DEPLOY_STATE', 'failure'] },
  { id: 'T5', desc: 'API 403 权限', mock: 'api-403', sha: FAKE_SHA, expect: { code: 1 }, expectLog: ['API_PERMISSION', '403'] },
  { id: 'T6a', desc: 'API 429×2 后恢复', mock: 'api-429-recover', sha: FAKE_SHA, expect: { code: 0 }, expectLog: ['PASS'] },
  { id: 'T6b', desc: 'API 429 持续→按截止时间失败', mock: 'api-429-forever', sha: FAKE_SHA, expect: { code: 3 }, expectLog: ['TIMEOUT'] },
  { id: 'T7', desc: '网络故障持续→不误报成功', mock: 'api-network-error', sha: FAKE_SHA, expect: { code: 1 }, expectLog: ['API_NETWORK'] },
  { id: 'T8', desc: 'Deployment queued 超时', mock: 'deploy-timeout', sha: FAKE_SHA, expect: { code: 3 }, expectLog: ['TIMEOUT'] },
  { id: 'T9', desc: 'SHA 不匹配', mock: 'sha-mismatch', sha: FAKE_SHA, expect: { code: 1 }, expectLog: ['SHA_MISMATCH'] },
  { id: 'T10', desc: '生产 HTTP 非 200', mock: 'http-fail', sha: FAKE_SHA, expect: { code: 1 }, expectLog: ['HTTP_CHECK'] },
  { id: 'T11', desc: 'superseded/inactive→neutral 不伪报 PASS', mock: 'superseded', sha: FAKE_SHA, expect: { code: 2 }, expectLog: ['NEUTRAL'] },
]

const results = []
for (const c of CASES) {
  const r = spawnSync(process.execPath, [SCRIPT], {
    encoding: 'utf8',
    timeout: 120000,
    env: {
      ...process.env,
      VPD_MOCK: c.mock,
      VPD_SHA: c.sha,
      VPD_REPO: 'doujianwen/bookconv-frontend',
      VPD_POLL_INTERVAL_MS: '10',
      VPD_DEADLINE_MS: '2000',
      VPD_MAX_CONSECUTIVE_ERRORS: '5',
      VPD_TOKEN: '',
      GITHUB_TOKEN: '',
      GITHUB_SHA: '',
    },
  })
  const out = (r.stdout || '') + (r.stderr || '')
  const code = r.status === null ? -1 : r.status
  const codeOk = code === c.expect.code
  const logOk = (c.expectLog || []).every((s) => out.includes(s))
  const pass = codeOk && logOk
  results.push({ id: c.id, desc: c.desc, mock: c.mock, expectCode: c.expect.code, actualCode: code, logOk, pass })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${c.id} (${c.desc}) expect=${c.expect.code} actual=${code} logOk=${logOk}`)
  if (!pass) {
    console.log('--- output ---')
    console.log(out.slice(0, 2000))
  }
}

const failed = results.filter((r) => !r.pass)
console.log(`\n汇总: ${results.length - failed.length}/${results.length} 通过`)
if (failed.length) {
  process.exit(1)
}
console.log('ALL_REVERSE_INJECTION_TESTS_PASS')
process.exit(0)
