// scripts/pro-e2e-check.mjs
// End-to-end verification of the Pro subscription link on the LIVE site:
//   Lemon Squeezy webhook  ->  Redis (Upstash) persistence  ->  /batch gate opens
//
// Network note: this dev machine cannot reach external HTTPS directly (443 reset),
// so every HTTP call is shelled out to `curl -x <proxy>`. The live server reaches
// Upstash on its own (it reads REDIS_URL from Vercel), so we only need the webhook
// signing secret locally to drive the inbound half.
//
// Usage:
//   node scripts/pro-e2e-check.mjs
// Optional env:
//   REDIS_URL        Upstash rediss:// URL for direct read-back confirmation (skips if unset)
//   BOOKCONV_BASE    default https://www.bookconv.com
//   TEST_EMAIL       default e2e-probe@bookconv.com
//   PROXY            default http://127.0.0.1:7897
//   LEMON_SQUEEZY_WEBHOOK_SECRET  (falls back to .env.production)

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import crypto from 'node:crypto';

const BASE = process.env.BOOKCONV_BASE || 'https://www.bookconv.com';
const PROXY = process.env.PROXY || 'http://127.0.0.1:7897';
const TEST_EMAIL = (process.env.TEST_EMAIL || 'e2e-probe@bookconv.com').toLowerCase();
const WEBHOOK = `${BASE}/api/payments/webhook`;

let SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';
if (!SECRET) {
  try {
    const txt = readFileSync(join(process.cwd(), '.env.production'), 'utf8');
    const m = txt.match(/LEMON_SQUEEZY_WEBHOOK_SECRET=(.*)/);
    if (m) SECRET = m[1].trim();
  } catch { /* ignore */ }
}
if (!SECRET) {
  console.error('✗ LEMON_SQUEEZY_WEBHOOK_SECRET not found (env or .env.production)');
  process.exit(2);
}

const tmp = mkdtempSync(join(tmpdir(), 'pro-e2e-'));
const cookieJar = join(tmp, 'cookies.txt');
const REDIS_URL = process.env.REDIS_URL || '';

function curl(args, opts = {}) {
  const base = ['-sS', '-x', PROXY, '--cookie', cookieJar, '--cookie-jar', cookieJar];
  const out = execFileSync('curl', [...base, ...args], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, ...opts });
  return out;
}
function curlJson(args) {
  const raw = curl(args);
  const body = raw.replace(/\nHTTP_STATUS:\d+$/, '');
  try { return JSON.parse(body); } catch { return body; }
}

function sign(payloadStr) {
  return crypto.createHmac('sha256', SECRET).update(payloadStr, 'utf8').digest('hex');
}

function postWebhook(eventName, attrs) {
  const payload = {
    meta: { event_name: eventName, custom_data: attrs.custom_data || {} },
    data: { id: `e2e-${eventName}-${Date.now()}`, attributes: attrs },
  };
  const payloadStr = JSON.stringify(payload);
  const sig = sign(payloadStr);
  const f = join(tmp, 'payload.json');
  writeFileSync(f, payloadStr);
  // Send raw file bytes so the signed string === received string.
  const out = curl([
    '-X', 'POST', WEBHOOK,
    '-H', 'Content-Type: application/json',
    '-H', `X-LemonSqueezy-Signature: ${sig}`,
    '--data', `@${f}`,
    '-w', '\nHTTP_STATUS:%{http_code}',
  ]);
  const status = (out.match(/HTTP_STATUS:(\d+)/) || [])[1] || '?';
  return { status, body: out.replace(/HTTP_STATUS:\d+$/, '') };
}

function batchLocked() {
  // The /batch HTML is large; this dev machine's proxy occasionally drops the
  // TLS connection (schannel close_notify) on big responses. Retry with HTTP/1.1.
  let html = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      html = curl(['-L', '--http1.1', '--retry', '2', `${BASE}/batch`]);
      if (html && html.length > 100) break;
    } catch { /* retry */ }
  }
  if (!html) return { locked: true, error: 'fetch failed' };
  // Strip <script> blocks before matching (RSC flight would otherwise duplicate text).
  const clean = html.replace(/<script[\s\S]*?<\/script>/g, '');
  const locked = clean.includes('Batch conversion is a Pro feature');
  return { locked, hasProUploader: html.includes('Already a member?') === false && !locked };
}

// ---- Upstash REST read-back (optional) ----
function upstashGet(key) {
  if (!REDIS_URL) return null;
  try {
    const m = REDIS_URL.match(/rediss?:\/\/:?([^@]+)@([^:/]+)/);
    if (!m) return null;
    const password = m[1]; const host = m[2];
    const out = execFileSync('curl', [
      '-sS', '-x', PROXY,
      '-H', `Authorization: ${password}`,
      `https://${host}/get/${encodeURIComponent(key)}`,
    ], { encoding: 'utf8', maxBuffer: 1 * 1024 * 1024 });
    return JSON.parse(out || '{}');
  } catch { return null; }
}

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
}

console.log(`\n=== Pro link E2E @ ${BASE} ===`);
console.log(`test email: ${TEST_EMAIL}\n`);

// 1) Signature verification is live (bad sig must be rejected)
{
  const f = join(tmp, 'bad.json');
  writeFileSync(f, JSON.stringify({ meta: { event_name: 'subscription_created' }, data: { attributes: {} } }));
  const r = curl(['-X', 'POST', WEBHOOK, '-H', 'Content-Type: application/json', '-H', 'X-LemonSqueezy-Signature: deadbeef', '--data', `@${f}`, '-w', '\nHTTP_STATUS:%{http_code}']);
  const status = (r.match(/HTTP_STATUS:(\d+)/) || [])[1];
  record('webhook rejects bad signature (401 expected)', status === '401', `got ${status}`);
}

// 2) Register a test account -> session cookie
{
  const r = curlJson(['-X', 'POST', `${BASE}/api/auth/register`, '-H', 'Content-Type: application/json', '--data', JSON.stringify({ email: TEST_EMAIL, password: 'E2eTestPassword123' }), '-w', '\nHTTP_STATUS:%{http_code}']);
  const status = (JSON.stringify(r).match(/HTTP_STATUS:(\d+)/) || [])[1];
  record('register test account', typeof r === 'object' && (r.success || r.authenticated) , `status ${status}`);
}

// 3) /batch is LOCKED before subscription
{
  const s = batchLocked();
  record('[pre] /batch locked for free user', s.locked, s.locked ? 'lock card shown' : 'UNEXPECTED: already unlocked');
}

// 4) Fire a real subscription_created webhook (mimic Lemon Squeezy integer variant_id)
{
  const renewsAt = Math.floor(Date.now() / 1000) + 30 * 86400;
  const r = postWebhook('subscription_created', {
    status: 'active',
    variant_id: 1947491, // numeric, as Lemon Squeezy actually sends it
    renews_at: renewsAt,
    custom_data: { email: TEST_EMAIL },
    customer_id: 999999,
  });
  record('webhook subscription_created accepted (200 expected)', r.status === '200', `got ${r.status}`);
}

// 5) Upstash read-back (only if REDIS_URL provided)
if (REDIS_URL) {
  const got = upstashGet(`sub:${TEST_EMAIL}`);
  const ok = got && got.result && JSON.parse(got.result).status === 'active';
  record('Upstash: sub persisted with status=active', !!ok, got ? JSON.stringify(got) : 'no REDIS_URL read-back');
} else {
  console.log('• (skipped) Upstash read-back — set REDIS_URL to confirm persistence');
}

// 6) /batch UNLOCKED after subscription
{
  const s = batchLocked();
  record('[post] /batch UNLOCKED for Pro user', !s.locked, !s.locked ? 'BatchUpload shown' : 'STILL LOCKED → link broken');
}

// 7) Cancel -> cleanup
{
  const r = postWebhook('subscription_cancelled', {
    variant_id: 1947491,
    custom_data: { email: TEST_EMAIL },
    customer_id: 999999,
  });
  record('webhook subscription_cancelled accepted', r.status === '200', `got ${r.status}`);
  const s = batchLocked();
  record('[cleanup] /batch locked again after cancel', s.locked, s.locked ? 'lock restored' : 'WARN: still unlocked');
}

const failed = results.filter((r) => !r.ok);
console.log(`\n=== SUMMARY: ${results.length - failed.length}/${results.length} passed ===`);
if (failed.length) {
  console.log('FAILED:');
  failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
}
process.exit(failed.length ? 1 : 0);
