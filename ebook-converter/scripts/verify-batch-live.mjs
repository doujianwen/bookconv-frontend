/**
 * Live verification for the browser-side batch pipeline.
 *
 * Mirrors exactly what src/components/tools/BatchUpload.tsx does:
 *   - loop over N files at CONCURRENCY 2
 *   - POST each one to the synchronous /api/convert endpoint
 *   - retry on 429 honouring Retry-After
 *   - package every returned blob into a single ZIP with JSZip
 *
 * Usage: node scripts/verify-batch-live.mjs [baseUrl]
 */
import fs from 'node:fs'
import path from 'node:path'
import JSZip from 'jszip'

const BASE = process.argv[2] || 'https://www.bookconv.com'
const TARGET = 'txt' // pure-JS path on the server, does not burn CloudConvert quota
const CONCURRENCY = 2
const MAX_RETRIES = 3

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const fixtures = [
  'tests/fixtures/valid.epub',
  'tests/fixtures/test-content.epub',
  'tests/e2e/fixtures/test.epub',
]

async function convertOne(filePath, attempt = 0) {
  const buf = fs.readFileSync(filePath)
  const name = path.basename(filePath)
  const fd = new FormData()
  fd.append('file', new Blob([buf], { type: 'application/epub+zip' }), name)
  fd.append('source_format', 'epub')
  fd.append('target_format', TARGET)

  const res = await fetch(`${BASE}/api/convert`, { method: 'POST', body: fd })

  if (res.status === 429 && attempt < MAX_RETRIES) {
    const ra = parseInt(res.headers.get('Retry-After') || '0', 10)
    const wait = ra > 0 ? ra * 1000 : Math.min(30000, 5000 * 2 ** attempt)
    console.log(`  [429] ${name} -> retry in ${wait}ms`)
    await sleep(wait)
    return convertOne(filePath, attempt + 1)
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch {}
    throw new Error(msg)
  }

  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

;(async () => {
  console.log(`Base: ${BASE}  |  epub -> ${TARGET}  |  concurrency ${CONCURRENCY}`)
  const collected = []
  let cursor = 0
  let ok = 0
  let failed = 0

  const worker = async () => {
    while (cursor < fixtures.length) {
      const f = fixtures[cursor++]
      const t0 = Date.now()
      try {
        const buf = await convertOne(f)
        const out = path.basename(f).replace(/\.[^.]+$/, '') + '.' + TARGET
        collected.push({ name: out, buf })
        ok += 1
        console.log(`  OK   ${path.basename(f)} -> ${out}  ${buf.length}B  ${Date.now() - t0}ms`)
      } catch (e) {
        failed += 1
        console.log(`  FAIL ${path.basename(f)}: ${e.message}`)
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, fixtures.length) }, () => worker())
  )

  console.log(`\nconverted=${ok} failed=${failed}`)
  if (collected.length === 0) {
    console.log('RESULT: FAIL — nothing converted, no ZIP produced')
    process.exit(1)
  }

  const zip = new JSZip()
  const used = new Set()
  for (const c of collected) {
    let n = c.name
    let i = 2
    while (used.has(n)) n = c.name.replace(/(\.[^.]+)$/, `-${i++}$1`)
    used.add(n)
    zip.file(n, c.buf)
  }
  const zipBuf = await zip.generateAsync({ type: 'nodebuffer' })
  const outPath = path.join(process.cwd(), 'batch-verify.zip')
  fs.writeFileSync(outPath, zipBuf)

  // Read it back to prove the archive is valid
  const reread = await JSZip.loadAsync(fs.readFileSync(outPath))
  const entries = Object.keys(reread.files)
  console.log(`ZIP: ${outPath}  ${zipBuf.length}B  entries=${entries.length}`)
  for (const e of entries) {
    const content = await reread.file(e).async('string')
    console.log(`  - ${e}  ${content.length} chars  preview="${content.slice(0, 60).replace(/\s+/g, ' ')}"`)
  }
  console.log(`\nRESULT: ${failed === 0 ? 'PASS' : 'PARTIAL'} — ZIP is readable with ${entries.length} converted file(s)`)
})()
