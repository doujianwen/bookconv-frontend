import { execFileSync } from 'node:child_process'
import path from 'node:path'

/**
 * BookConv 增长经营三门禁的回归测试（2026-11-16，红队整改最小实现）。
 *
 * 门禁覆盖 R2 机会资格 / R3-R6 任务幂等 / R8 GEO 可比性。
 * 这里刻意跑真实子进程的 --self-test 并断言退出码，而不是 import 纯函数：
 *  - 自检模式内含反向注入（注入矛盾样本必须 FAIL），是判据可信的证据；
 *  - 子进程退出码是门禁在生产里真实的行为契约，比函数级 mock 更接近运行事实。
 *  - 若判据漂移导致自检失败，门禁会 exit 2 → 这里 FAIL，阻止静默退化。
 */
const ROOT = path.resolve(__dirname, '..')
const node = process.execPath

function selfTestExit(script: string): number {
  try {
    const out = execFileSync(node, [path.join(ROOT, 'scripts', script), '--self-test'], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
    expect(out).toMatch(/SELFTEST PASS/)
    return 0
  } catch (e: any) {
    return typeof e?.status === 'number' ? e.status : -1
  }
}

describe('增长经营门禁 self-test（判据反向注入）', () => {
  test('R2 机会资格门禁：自检 PASS / exit 0', () => {
    expect(selfTestExit('growth-opportunity-gate.mjs')).toBe(0)
  })
  test('R3/R6 任务幂等门禁：自检 PASS / exit 0', () => {
    expect(selfTestExit('growth-task-idempotency.mjs')).toBe(0)
  })
  test('R8 GEO 可比性守卫：自检 PASS / exit 0', () => {
    expect(selfTestExit('geo-comparability-guard.mjs')).toBe(0)
  })
  test('G06 增长实验注册表：自检 PASS / exit 0', () => {
    expect(selfTestExit('growth-experiment-registry.mjs')).toBe(0)
  })
})

/**
 * G07 运行锁的「防双跑」契约必须进测试通道：
 * 重复 acquire 只能是 3（安全跳过），不能是 0（真的跑了第二遍），也不能是 1（崩了）。
 * 用独立 state 文件，避免污染真实运行态。
 */
describe('G07 运行锁防双跑契约', () => {
  const state = path.join(ROOT, '_wb_tmp', 'jest-lock-state.json')
  const runLock = (args: string[]): number => {
    try {
      execFileSync(node, [path.join(ROOT, 'scripts', 'growth-task-idempotency.mjs'), ...args, '--state-file', state], {
        cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      })
      return 0
    } catch (e: any) {
      return typeof e?.status === 'number' ? e.status : -1
    }
  }

  test('首次 acquire=0、重复 acquire=3、已完成后再 acquire=3', () => {
    const key = `jest-${Date.now()}@2026-11-17`
    expect(runLock(['--lock-acquire', '--run-key', key, '--ttl-min', '90'])).toBe(0)
    expect(runLock(['--lock-acquire', '--run-key', key, '--ttl-min', '90'])).toBe(3)
    expect(runLock(['--lock-release', '--run-key', key, '--status', 'success'])).toBe(0)
    expect(runLock(['--lock-acquire', '--run-key', key, '--ttl-min', '90'])).toBe(3)
  })

  test('未持锁 release 必须拒绝（exit 1），防伪造完成', () => {
    expect(runLock(['--lock-release', '--run-key', `never-acquired-${Date.now()}@2026-11-17`, '--status', 'success'])).toBe(1)
  })
})
