// Verify the offer-layer corrections are actually live on production.
//
// Background: Vercel keeps serving the previous successful deploy when a build
// fails, so "the site loads" says nothing about whether a push shipped. This
// script polls until the corrected copy is observable, and exits non-zero if it
// never arrives (see docs/seo-geo-execution-plan-2026-09-17.md, risk R1/R7).
//
// Usage: node scripts/verify-offer-claims.mjs [--max-wait-seconds=300]

const BASE = 'https://www.bookconv.com';
const MAX_WAIT = Number(
  (process.argv.find((a) => a.startsWith('--max-wait-seconds=')) || '').split('=')[1] || 300,
);

/** Strip <script> blocks so the RSC flight payload can't produce false hits. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

async function fetchText(path) {
  const res = await fetch(BASE + path, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; BookConvVerify/1.0)' },
    redirect: 'follow',
  });
  const html = await res.text();
  return { status: res.status, text: visibleText(html) };
}

async function snapshot() {
  const [pricing, home] = await Promise.all([fetchText('/pricing'), fetchText('/')]);
  return { pricing, home };
}

/** Each entry: [label, (snap) => boolean]. */
const ASSERTIONS = [
  ['pricing: no "Up to 50MB file size"', (s) => !/Up to 50MB/i.test(s.pricing.text)],
  ['pricing: no "Up to 100MB file size"', (s) => !/Up to 100MB/i.test(s.pricing.text)],
  ['pricing: no "Priority queue" row', (s) => !/Priority queue/i.test(s.pricing.text)],
  ['pricing: no "Unlimited" conversions claim', (s) => !/Unlimited conversions/i.test(s.pricing.text)],
  ['pricing: still shows the truthful 10MB tier', (s) => /Up to 10MB file size/i.test(s.pricing.text)],
  ['pricing: Pro card no longer promises a bigger file', (s) => !/50 MB file|100 MB file/i.test(s.pricing.text)],
  ['pricing: batch conversion still advertised', (s) => /Batch conversion/i.test(s.pricing.text)],
  ['home: FAQ no longer claims "5 conversions per hour"', (s) => !/5 conversions per hour/i.test(s.home.text)],
  ['pricing: HTTP 200', (s) => s.pricing.status === 200],
];

function run(snap) {
  return ASSERTIONS.map(([label, fn]) => {
    let ok = false;
    try {
      ok = !!fn(snap);
    } catch {
      ok = false;
    }
    return [label, ok];
  });
}

const deadline = Date.now() + MAX_WAIT * 1000;
let attempt = 0;
let results = [];

while (Date.now() < deadline) {
  attempt++;
  try {
    const snap = await snapshot();
    results = run(snap);
  } catch (err) {
    results = [['fetch failed: ' + err.message, false]];
  }
  const passed = results.filter(([, ok]) => ok).length;
  console.log(`attempt ${attempt}: ${passed}/${results.length} passed`);
  if (passed === results.length) break;
  await new Promise((r) => setTimeout(r, 20_000));
}

console.log('');
results.forEach(([label, ok]) => console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`));
const failed = results.filter(([, ok]) => !ok);
const passed = results.length - failed.length;
console.log('');
console.log(`${passed}/${results.length} assertions passed (after ${attempt} attempt(s))`);
process.exit(failed.length ? 1 : 0);
