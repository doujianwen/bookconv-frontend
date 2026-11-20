// scripts/lib/ga-attempt-closure.mjs
//
// B6 口径闭合判据（2026-11-15）：用量化不变量取代"看起来对"的目测对账。
//
// 背景（为什么需要这个文件）
// ─────────────────────────────────────────────────────────────────────
// 30 天累计实测 (完成 245 + 失败 108) = 353，而 file_upload 只有 299，缺口 +54。
// 2026-11-15 对账确认根因是**口径不对称**，不是数据损坏：
//   file_upload       在「上传成功、即将 POST /api/convert」时才发；
//   conversion_failed 在**上传之前**就会发（FILE_TOO_LARGE 客户端护栏 /
//                     直传 presign·PUT 失败 / 批量配额跳过 / 魔数嗅探之外的服务端 400）。
// 因此 (完成+失败) 会系统性多于 file_upload，且缺口随前置失败量波动。
//
// 修法（2026-11-15 落地）
//   前端在**每次用户发起的转换尝试开头**先发 `conversion_attempt`，再走守卫/上传/转换。
//   于是得到一条可机器验证的不变量：
//
//        终态数（完成 + 失败） ≤ 尝试数 + 容差
//
//   违反即「事件重复计数 / 1 次尝试发了多次终态 / 埋点顺序被改反」——物理不可能，
//   属 P0 数据错乱。历史窗口（attempt 上线前）无该事件 ⇒ 显式 UNKNOWN，
//   绝不 fallthrough 成 PASS（铁律：不可判定报 UNKNOWN，假门禁比没门禁更坏）。
//
// 容差说明
//   GA4 事件计数非精确事务，且跨零点尝试（23:5x 发起、00:0x 完成）会落到不同日期；
//   容差取 max(minTolerance, ceil(ratio × 终态数))，默认 2 / 2%。比例项随量级放大，
//   避免 30 天大窗口因零点跨界累积而假 FAIL。
//
// Run: node scripts/lib/ga-attempt-closure.mjs --self-test

/**
 * @param {{attempt?: number|string|null, complete?: number|string|null, failed?: number|string|null,
 *          toleranceRatio?: number, minTolerance?: number}} input
 * @returns {{verdict: 'PASS'|'FAIL'|'UNKNOWN', terminal: number|null, tolerance: number,
 *            gap: number|null, reason: string}}
 */
export function checkAttemptClosure({
  attempt,
  complete,
  failed,
  toleranceRatio = 0.02,
  minTolerance = 2,
} = {}) {
  const a = attempt === null || attempt === undefined || attempt === '' ? NaN : Number(attempt)
  const c = Number(complete)
  const f = Number(failed)

  if (!Number.isFinite(c) || !Number.isFinite(f)) {
    return { verdict: 'UNKNOWN', terminal: null, tolerance: 0, gap: null, reason: '完成/失败字段缺失或非数值，终态数不可算' }
  }
  const terminal = c + f

  // attempt 缺失 = 事件尚未上线（或该日窗口早于上线）。这里刻意不猜、不跳过：
  // 明确报告「判据不可执行」，由消费方决定是否降级说明，绝不静默当 PASS。
  if (!Number.isFinite(a)) {
    return {
      verdict: 'UNKNOWN',
      terminal,
      tolerance: 0,
      gap: null,
      reason: 'conversion_attempt 无数据（事件上线前的历史窗口或埋点未生效）→ 口径不对称不可闭环',
    }
  }

  // 两侧全零：当天没有尝试也没有终态，是一致而非缺失（缺失已被上面的分支拦掉）。
  if (a === 0 && terminal === 0) {
    return { verdict: 'PASS', terminal, tolerance: 0, gap: 0, reason: '尝试 0、终态 0，一致（非数据缺失）' }
  }

  // 有终态但零尝试：可能是上线当日边界（早于部署的失败无 attempt），也可能是埋点失灵。
  // 单日数据无法区分 → UNKNOWN（铁律：不可判定不报 FAIL）。
  if (a === 0) {
    return {
      verdict: 'UNKNOWN',
      terminal,
      tolerance: 0,
      gap: terminal,
      reason: `attempt=0 但终态 ${terminal} 次 → 上线边界（部署前失败）与埋点失灵不可区分，判据不可执行`,
    }
  }

  const tolerance = Math.max(minTolerance, Math.ceil(terminal * toleranceRatio))
  const gap = terminal - a
  if (gap > tolerance) {
    return {
      verdict: 'FAIL',
      terminal,
      tolerance,
      gap,
      reason: `终态 ${terminal} > 尝试 ${a}+容差 ${tolerance}（溢出 ${gap - tolerance}）→ 同一尝试重复发终态或埋点顺序错乱，物理不可能`,
    }
  }
  return {
    verdict: 'PASS',
    terminal,
    tolerance,
    gap,
    reason: `终态 ${terminal} ≤ 尝试 ${a}+容差 ${tolerance}（未闭环 ${Math.max(0, a - terminal)} 次；原因未验证，可能为放弃、前置拒绝或埋点缺失，不作推断）`,
  }
}

// ── 自检（含反向验证：注入"终态溢出"→FAIL，恢复→PASS）────────────────
export function selfTest() {
  const cases = [
    ['正常闭合 → PASS', () => checkAttemptClosure({ attempt: 21, complete: 15, failed: 5 }).verdict === 'PASS'],
    ['注入终态溢出 → FAIL', () => checkAttemptClosure({ attempt: 21, complete: 40, failed: 9 }).verdict === 'FAIL'],
    ['恢复原始数据 → PASS', () => checkAttemptClosure({ attempt: 21, complete: 15, failed: 5 }).verdict === 'PASS'],
    ['30 天量级（attempt 367 含前置失败）→ PASS', () => checkAttemptClosure({ attempt: 367, complete: 245, failed: 108 }).verdict === 'PASS'],
    ['拿 file_upload 当 attempt（299）→ FAIL（旧口径缺口 54 正是这样被误读）', () => checkAttemptClosure({ attempt: 299, complete: 245, failed: 108 }).verdict === 'FAIL'],
    ['attempt 缺失（上线前） → UNKNOWN 非 PASS', () => checkAttemptClosure({ attempt: null, complete: 15, failed: 5 }).verdict === 'UNKNOWN'],
    ['attempt 缺失不因零终态而假 PASS', () => checkAttemptClosure({ attempt: undefined, complete: 0, failed: 0 }).verdict === 'UNKNOWN'],
    ['attempt=0 但有终态（上线边界） → UNKNOWN 非 FAIL', () => checkAttemptClosure({ attempt: 0, complete: 3, failed: 2 }).verdict === 'UNKNOWN'],
    ['两侧全零 → PASS 且注明非缺失', () => {
      const r = checkAttemptClosure({ attempt: 0, complete: 0, failed: 0 })
      return r.verdict === 'PASS' && /非数据缺失/.test(r.reason)
    }],
    ['完成字段非数值 → UNKNOWN', () => checkAttemptClosure({ attempt: 10, complete: '—', failed: 2 }).verdict === 'UNKNOWN'],
    ['字符串数字可解析 → PASS', () => checkAttemptClosure({ attempt: '21', complete: '15', failed: '5' }).verdict === 'PASS'],
    ['未闭环原因不作无证据推断', () => { const r = checkAttemptClosure({ attempt: 21, complete: 14, failed: 6 }); return r.verdict === 'PASS' && r.reason.includes('原因未验证') && !r.reason.includes('方向正确') }],
  ]
  let bad = 0
  for (const [name, fn] of cases) {
    let ok = false
    try { ok = fn() === true } catch { ok = false }
    console.log(`${ok ? '✅' : '❌'} ${name}`)
    if (!ok) bad++
  }
  console.log(bad === 0 ? `✅ selfTest ${cases.length}/${cases.length} PASS` : `❌ selfTest ${bad} 项失败`)
  return bad === 0
}

if (process.argv[1] && process.argv[1].endsWith('ga-attempt-closure.mjs') && process.argv.includes('--self-test')) {
  process.exit(selfTest() ? 0 : 1)
}
