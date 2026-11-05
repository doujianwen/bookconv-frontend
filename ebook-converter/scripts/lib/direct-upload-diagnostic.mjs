// scripts/lib/direct-upload-diagnostic.mjs
//
// Parse the F20 GA4 `error` diagnostic prefix back into structured dimensions.
//
// ── CANONICAL FORMAT (single source of truth) ───────────────────────────────
//   src/lib/direct-upload-error.ts :: diagnosticPrefix()
//   "<PUT|PRESIGN>:<HTTP<status>|NETWORK>:on=<0|1|?>:<ms-bucket>:"
//   e.g. "PUT:NETWORK:on=1:1-5s:"  /  "PUT:HTTP403:on=1:>15s:"  /  "PRESIGN:NETWORK:on=0:<1s:"
//
// The diagnostic prefix is ALWAYS at the START of the `error` string (the
// producer prepends it to the friendly message). Non-direct-upload failures
// carry no prefix. Keep this parser's round-trip in sync with diagnosticPrefix.
//
// ── DISCIPLINE ──────────────────────────────────────────────────────────────
//   - Never throw. Unknown / malformed → valid:false with an explicit
//     `malformed` flag (producer↔parser drift guard), never silent.
//   - Non-diagnostic errors (no prefix) are EXPECTED for non-direct failures
//     and must NOT be reported as anomalies (third state, not FAIL).
//   - Round-trip selfTest asserts producer/parser agreement without importing
//     the .ts module (the two must agree on the exact documented format).
//
// Run: node scripts/lib/direct-upload-diagnostic.mjs --self-test

const PREFIX_RE = /^((PUT|PRESIGN):(HTTP\d+|NETWORK):on=([01?]):([^:]+):)/

/**
 * Parse a GA4 `error` field into its diagnostic dimensions.
 * @param {string} error
 * @returns {{raw:string,prefix:string|null,stage:string|null,kind:string|null,
 *   httpStatus:number|null,online:string|null,msBucket:string|null,
 *   valid:boolean,malformed:boolean,rest:string}}
 */
export function parseDiagnosticPrefix(error) {
  const empty = {
    raw: error,
    prefix: null,
    stage: null,
    kind: null,
    httpStatus: null,
    online: null,
    msBucket: null,
    valid: false,
    malformed: false,
    rest: error,
  }
  if (typeof error !== "string") return empty
  const m = error.match(PREFIX_RE)
  if (!m) {
    // Drift guard: string starts like a diagnostic header but didn't fully
    // match the contract → a producer change the parser doesn't understand.
    const head = error.match(/^(PUT|PRESIGN):/)
    return { ...empty, malformed: !!head }
  }
  const full = m[1]
  const stage = m[2]
  const kindTok = m[3]
  const kind = kindTok.startsWith("HTTP") ? "HTTP" : "NETWORK"
  const httpStatus = kind === "HTTP" ? Number(kindTok.slice(4)) : null
  const online = m[4]
  const msBucket = m[5]
  return {
    raw: error,
    prefix: full,
    stage,
    kind,
    httpStatus,
    online,
    msBucket,
    valid: true,
    malformed: false,
    rest: error.slice(full.length),
  }
}

/** Inverse of diagnosticPrefix — used by selfTest to verify round-trip. */
export function serializeDiagnostic({ stage, kind, httpStatus, online, msBucket }) {
  const tag = stage === "put" ? "PUT" : "PRESIGN"
  const kindStr = kind === "HTTP" ? `HTTP${httpStatus}` : "NETWORK"
  return `${tag}:${kindStr}:on=${online}:${msBucket}:`
}

/**
 * Aggregate an array of GA4 `conversion_failed` rows (each with a `date` and an
 * `error` field) into structured diagnostic dimensions. Pure — no GA4, no IO —
 * so the derived `failed_by_date_error_diagnostic` module in the analysis script
 * can be unit-tested directly (F20 P2 red-team: move the combine logic here so
 * it is not an untested inline copy).
 *
 * @param {Array<{date:string,error:string,eventCount?:number}>} rows
 * @returns {{detail:Array,parse:{total:number,valid:number,nonDiagnostic:number,malformed:number}}}
 */
export function aggregateDiagnosticErrors(rows) {
  const agg = {}
  const parse = { total: 0, valid: 0, nonDiagnostic: 0, malformed: 0 }
  for (const row of rows) {
    parse.total++
    const p = parseDiagnosticPrefix(row.error)
    if (p.malformed) parse.malformed++
    else if (!p.valid) parse.nonDiagnostic++
    else {
      parse.valid++
      const key = [row.date, p.stage, p.kind, p.httpStatus ?? "NA", p.online, p.msBucket].join("|")
      agg[key] ??= {
        date: row.date,
        stage: p.stage,
        kind: p.kind,
        httpStatus: p.httpStatus,
        online: p.online,
        msBucket: p.msBucket,
        eventCount: 0,
      }
      agg[key].eventCount += Number(row.eventCount) || 0
    }
  }
  const detail = Object.values(agg).sort(
    (a, b) => a.date.localeCompare(b.date) || b.eventCount - a.eventCount,
  )
  return { detail, parse }
}

export function selfTest() {
  const cases = [
    // [rawError, expectValid, expectFields]
    ["PUT:NETWORK:on=1:1-5s:", true, { stage: "PUT", kind: "NETWORK", httpStatus: null, online: "1", msBucket: "1-5s" }],
    ["PUT:HTTP403:on=1:>15s:", true, { stage: "PUT", kind: "HTTP", httpStatus: 403, online: "1", msBucket: ">15s" }],
    ["PRESIGN:NETWORK:on=0:<1s:", true, { stage: "PRESIGN", kind: "NETWORK", httpStatus: null, online: "0", msBucket: "<1s" }],
    ["PUT:NETWORK:on=?:?:", true, { stage: "PUT", kind: "NETWORK", httpStatus: null, online: "?", msBucket: "?" }],
    // non-diagnostic (expected for non-direct errors): valid:false, malformed:false
    ["Conversion failed", false, { malformed: false }],
    ["unknown", false, { malformed: false }],
    ["This file (40.0MB) needs direct upload, which failed.", false, { malformed: false }],
    // drift guard: looks like a header but malformed → malformed:true
    ["PUT:NETWORK:on=1", false, { malformed: true }],
    ["PRESIGN:HTTPxx:on=1:1-5s:", false, { malformed: true }],
    ["PUT:NETWORK:on=2:1-5s:", false, { malformed: true }],
  ]
  let bad = 0
  for (const [raw, valid, fields] of cases) {
    const p = parseDiagnosticPrefix(raw)
    let ok = p.valid === valid
    if (valid) {
      for (const [k, v] of Object.entries(fields)) ok = ok && p[k] === v
      // round-trip: serialize(parsed) must reproduce the original prefix
      const rt = serializeDiagnostic({
        stage: p.stage === "PUT" ? "put" : "presign",
        kind: p.kind,
        httpStatus: p.httpStatus,
        online: p.online,
        msBucket: p.msBucket,
      })
      ok = ok && rt === raw
    } else {
      ok = ok && p.malformed === fields.malformed
    }
    if (!ok) {
      bad++
      console.error("❌ parseDiagnosticPrefix selfTest failed for: " + JSON.stringify(raw) + " → " + JSON.stringify(p))
    }
  }

  // 枚举 producer 全部输出空间（re-impl of diagnosticPrefix 仅用于生成规格样例，
  // 真正的 producer↔parser 一致性由 Jest 跨模块测试以真实 .ts 产出覆盖）。
  const producePrefix = (ctx) => {
    const kind = typeof ctx.status === "number" ? `HTTP${ctx.status}` : "NETWORK"
    const online = ctx.online === undefined ? "?" : ctx.online ? "1" : "0"
    const tag = ctx.stage === "put" ? "PUT" : "PRESIGN"
    const b = ctx.elapsedMs === undefined ? "?" : ctx.elapsedMs < 1000 ? "<1s" : ctx.elapsedMs < 5000 ? "1-5s" : ctx.elapsedMs < 15000 ? "5-15s" : ">15s"
    return `${tag}:${kind}:on=${online}:${b}:`
  }
  const enumCases = []
  for (const stage of ["put", "presign"]) {
    for (const status of [undefined, 403, 500, 503]) {
      for (const online of [undefined, true, false]) {
        for (const elapsedMs of [undefined, 500, 2000, 8000, 20000]) {
          enumCases.push({ stage, status, elapsedMs, online })
        }
      }
    }
  }
  for (const ctx of enumCases) {
    const produced = producePrefix(ctx)
    const p = parseDiagnosticPrefix(produced)
    const ok =
      p.valid &&
      p.stage === (ctx.stage === "put" ? "PUT" : "PRESIGN") &&
      (ctx.status === undefined ? p.kind === "NETWORK" && p.httpStatus === null : p.kind === "HTTP" && p.httpStatus === ctx.status) &&
      p.online === (ctx.online === undefined ? "?" : ctx.online ? "1" : "0") &&
      serializeDiagnostic({ stage: p.stage === "PUT" ? "put" : "presign", kind: p.kind, httpStatus: p.httpStatus, online: p.online, msBucket: p.msBucket }) === produced
    if (!ok) {
      bad++
      console.error("❌ 枚举空间解析失败: " + JSON.stringify(ctx) + " → " + JSON.stringify(p))
    }
  }

  // aggregateDiagnosticErrors：合成数据（含同 key 合并、非直传、漂移、malformed）
  const synth = [
    { date: "2026-11-04", error: "PUT:NETWORK:on=1:1-5s:carga falló", eventCount: 3 },
    { date: "2026-11-04", error: "PUT:NETWORK:on=1:1-5s:carga falló", eventCount: 2 },
    { date: "2026-11-04", error: "PUT:HTTP403:on=1:>15s:rejected", eventCount: 1 },
    { date: "2026-11-04", error: "PRESIGN:NETWORK:on=0:<1s:offline", eventCount: 4 },
    { date: "2026-11-04", error: "Conversion failed", eventCount: 10 },
    { date: "2026-11-04", error: "PUT:NETWORK:on=2:1-5s:", eventCount: 5 },
  ]
  const agg = aggregateDiagnosticErrors(synth)
  const byKey = Object.fromEntries(agg.detail.map((d) => [`${d.stage}|${d.kind}|${d.httpStatus ?? "NA"}|${d.online}|${d.msBucket}`, d.eventCount]))
  const aggOk =
    agg.parse.total === 6 &&
    agg.parse.valid === 4 &&
    agg.parse.nonDiagnostic === 1 &&
    agg.parse.malformed === 1 &&
    byKey["PUT|NETWORK|NA|1|1-5s"] === 5 && // 3+2 合并
    byKey["PUT|HTTP|403|1|>15s"] === 1 &&
    byKey["PRESIGN|NETWORK|NA|0|<1s"] === 4
  if (!aggOk) {
    bad++
    console.error("❌ aggregateDiagnosticErrors 合成数据失败: " + JSON.stringify(agg))
  }

  console.log(bad === 0 ? `✅ direct-upload-diagnostic selfTest ${cases.length + enumCases.length + 1} 项 PASS` : `❌ direct-upload-diagnostic selfTest ${bad} 项失败`)
  return bad
}

// Only run the self-test when this module is invoked DIRECTLY (not when imported
// by another script that happens to also pass --self-test).
if (process.argv[1] && process.argv[1].endsWith("direct-upload-diagnostic.mjs") && process.argv.includes("--self-test")) {
  process.exit(selfTest() === 0 ? 0 : 1)
}
