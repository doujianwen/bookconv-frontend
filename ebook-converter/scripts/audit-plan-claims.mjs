/**
 * Plan-claim audit for bookconv content files.
 *
 * Why this exists: the storefront advertised capabilities the pipeline does not
 * implement, and the same false figures were copied into blog posts, convert
 * pages and guides. They were removed on 2026-09-17 (offer layer: PLANS,
 * /pricing, openapi.json, messages/*) and again on 2026-09-21 (content layer:
 * 20 data files, 64 sentences).
 *
 * Removing them twice was necessary because a second session twice "restored"
 * the values in good faith -- commit 16cacfc ("restore file-size fact") and
 * 540bd74 ("add verified file-size limits") -- believing the 50 MB Pro cap was
 * real. Text edits cannot prevent that. This gate can: it fails the build if
 * any of those figures come back.
 *
 * Verified truth baseline (checked against the code, not the docs):
 *   file size   src/lib/convert-handler.ts:16  MAX_FILE_SIZE_MB || 10, and
 *               .env.production sets MAX_FILE_SIZE_MB=10. No plan branch and
 *               convertAndStream() takes no user argument -> 10 MB for everyone.
 *   rate limit  src/app/api/convert/route.ts:30 uses the "convertApi" strategy,
 *               defined in src/lib/rate-limit.ts:49 as 20 requests / 60 s keyed
 *               by IP. No plan is consulted -> 20 req/min per IP.
 *   priority    ConversionJobData.priority is declared in the type and assigned
 *               nowhere -> no such feature.
 *   batch       genuinely plan-gated (src/app/[locale]/batch/page.tsx:80,128)
 *               -> this one is REAL and must not be flagged.
 *
 * Detection rule: a sentence is a violation when it (a) makes a checkable claim
 * about file size or throughput, (b) attaches it to a BookConv plan, and
 * (c) does not name a third party as the owner of that limit.
 *
 * Deliberately NOT flagged (these are true, or describe somebody else):
 *   - "Kindle sometimes rejects files larger than 50MB"      -> Amazon's limit
 *   - "desktop Calibre ... process files past 100 MB"        -> Calibre's limit
 *   - "a scanned 300-page book is 20-100 MB"                 -> file-size fact
 *   - the CloudConvert / Convertio / Zamzar columns of the comparison tables
 *
 * Usage:  node scripts/audit-plan-claims.mjs
 * Exit:   0 = clean, 1 = at least one ERROR
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['src/data/blog', 'src/data/content', 'src/data/guides'];
// Reachable-from-nowhere archive: kept out of the ERROR count (it cannot ship)
// but still reported, so a future un-archive cannot resurrect the wording
// unnoticed.
const WARN_ONLY_DIRS = ['src/data/_archived'];

/** A checkable promise about limits. */
const CLAIM = new RegExp(
  [
    '50\\s?MB',
    '100\\s?MB',
    'unlimited conversions?',
    'unlimited batch',
    'unlimited hourly',
    'conversiones ilimitadas',
    '\\d+\\s*(?:conversions?|files?)\\s*per\\s*(?:hour|minute)',
    '\\d+\\s*(?:conversiones?|archivos?)\\s*por\\s*(?:hora|minuto)',
    'five conversions per hour',
    'cinco conversiones por hora',
    'priority (?:queue|queueing|queueing|processing)',
    'cola prioritaria',
  ].join('|'),
  'i'
);

/** The sentence attaches that claim to one of OUR plans. */
const TIER =
  /(\bPro\b|\bAPI\b|paid plan|free tier|free plan|free users?|paid tier|\bplan\b|premium (?:plan|tier)|de pago|gratuito|nivel|usuarios? gratuitos?|capa gratuita)/i;

/** The limit belongs to someone else. */
const THIRD_PARTY =
  /Kindle|Amazon|Send to Kindle|Apple Books|Kobo|Google Play Books|Nook|Calibre|Adobe|Dropbox|Idpf|EPUBCheck|Wikipedia|Librivox|Project Gutenberg/i;

/** A competitor comparison table row — our column is on the same line. */
const COMPARISON_ROW = /^\s*\|.*\|.*\|/;

function sentencesOf(line) {
  return line
    .replace(/\*\*/g, '')
    .split(/(?<=[.!?:])\s+|\s+—\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function scan(dirs, severity) {
  const hits = [];
  for (const dir of dirs) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.ts')) continue;
      const rel = `${dir}/${f}`;
      const lines = fs.readFileSync(path.join(abs, f), 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (/^\s*(\/\/|\*)/.test(line)) return;              // comment
        if (COMPARISON_ROW.test(line)) return;                // competitor table
        if (!CLAIM.test(line)) return;
        for (const s of sentencesOf(line)) {
          if (!CLAIM.test(s)) continue;
          if (THIRD_PARTY.test(s)) continue;
          if (!TIER.test(s)) continue;
          hits.push({ rel, line: i + 1, severity, text: s.replace(/\s+/g, ' ') });
        }
      });
    }
  }
  return hits;
}

const errors = scan(SCAN_DIRS, 'ERROR');
const warnings = scan(WARN_ONLY_DIRS, 'WARN');

for (const h of [...errors, ...warnings]) {
  console.log(`${h.severity.padEnd(6)} ${h.rel}:${h.line}  ->  false plan claim: ${h.text.slice(0, 130)}`);
}

if (errors.length) {
  console.log('');
  console.log('These claims contradict the implementation. Either fix the copy, or');
  console.log('implement the feature first — see src/lib/convert-handler.ts:16 and');
  console.log('src/lib/rate-limit.ts:49 for the real limits. Do not "restore" them.');
}

console.log(
  `plan claims scanned | ${errors.length} error(s) | ${warnings.length} warning(s)`
);
process.exit(errors.length > 0 ? 1 : 0);
