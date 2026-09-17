/**
 * Post-deploy assertion for the 2026-09-17 markup-leak fixes.
 *
 * Vercel keeps serving the LAST GOOD deploy when a build fails, so "site is up"
 * proves nothing. This polls production until the new markup is actually
 * observable, and fails loudly if it never arrives.
 *
 * Checks (script blocks stripped first -- RSC flight payload poisons greps):
 *   /convert/epub-to-mobi   must have "Device Compatibility Report" heading and
 *                           must NOT contain the bogus fragment
 *                           "structure. Open in Calibre"
 *   /convert/epub-to-azw3   must NOT emit a <nav epub:type="toc">
 *   /blog/azw3-to-mobi      must be 200 (regression guard for the 404 fix)
 *
 * Usage: node scripts/verify-markup-fix.mjs [--max-wait-seconds=240]
 * Exit:  0 = all assertions pass, 1 = failed or timed out
 */
const MAX_WAIT = Number(
  (process.argv.find((a) => a.startsWith('--max-wait-seconds=')) || '').split('=')[1] || 240
);
const POLL_MS = 15000;
const BASE = 'https://www.bookconv.com';

async function fetchStripped(path) {
  const res = await fetch(BASE + path, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; bookconv-deploy-verify)' },
    redirect: 'follow',
  });
  const raw = await res.text();
  const html = raw.replace(/<script[\s\S]*?<\/script>/g, '');
  return { status: res.status, html, bytes: raw.length };
}

function h2s(html) {
  return [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
  );
}

function evaluate(snap) {
  const results = [];

  const mobi = snap['/convert/epub-to-mobi'];
  const mobiH2 = h2s(mobi.html);
  results.push([
    'epub-to-mobi: no bogus heading fragment',
    !mobiH2.some((t) => t.startsWith('structure. Open in Calibre')),
  ]);
  results.push([
    'epub-to-mobi: "Device Compatibility Report" heading present',
    mobiH2.some((t) => t.includes('Device Compatibility Report')),
  ]);
  results.push([
    'epub-to-mobi: no literal <h1> escaping into DOM outside prose',
    !/<h1[^>]*>\s*\/?\s*<h2/i.test(mobi.html),
  ]);

  const azw3 = snap['/convert/epub-to-azw3'];
  results.push([
    'epub-to-azw3: no leaked <nav epub:type="toc">',
    !/epub:type/.test(azw3.html),
  ]);

  const blog = snap['/blog/azw3-to-mobi'];
  results.push(['azw3-to-mobi blog 200', blog.status === 200]);

  return results;
}

const PATHS = ['/convert/epub-to-mobi', '/convert/epub-to-azw3', '/blog/azw3-to-mobi'];
const deadline = Date.now() + MAX_WAIT * 1000;

let attempt = 0;
let lastResults = null;

while (Date.now() < deadline) {
  attempt++;
  const snap = {};
  for (const p of PATHS) {
    try {
      snap[p] = await fetchStripped(p);
    } catch (e) {
      snap[p] = { status: 0, html: '', bytes: 0, err: e.message };
    }
  }

  lastResults = evaluate(snap);
  const failed = lastResults.filter(([, ok]) => !ok);
  const stamp = new Date().toISOString().slice(11, 19);
  console.log(`[${stamp}] attempt ${attempt}: ${lastResults.length - failed.length}/${lastResults.length} passing`);

  if (failed.length === 0) {
    console.log('\nALL ASSERTIONS PASS');
    for (const [name] of lastResults) console.log('  PASS  ' + name);
    process.exit(0);
  }

  if (Date.now() + POLL_MS >= deadline) break;
  await new Promise((r) => setTimeout(r, POLL_MS));
}

console.log('\nTIMED OUT -- not all assertions satisfied');
for (const [name, ok] of lastResults) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
process.exit(1);
