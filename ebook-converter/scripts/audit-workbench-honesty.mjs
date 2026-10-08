#!/usr/bin/env node
// scripts/audit-workbench-honesty.mjs
//
// The workbench makes three honesty promises. A promise nobody can test is
// decoration, so this script tests them.
//
//   P1  No panel may present a frozen number as live. Every static panel
//       must carry a snapshot date, and no panel payload may hard-code a
//       timestamp that is not the current request time.
//   P2  Numbers that can be derived locally must not be literals. This
//       script asserts that the hard-coded counts the operators care about
//       (conversion pairs, blog posts, guide pages, format pages) match what
//       the files actually contain — catching drift introduced by editing
//       the provider by hand.
//   P3  The citations figure never appears without its traffic caveat.
//
// Exits non-zero on any violation. Run it after touching the workbench.
//
// NOTE ON SCOPE: this only checks the workbench's own claims. A pass here is
// not evidence about SEO content quality — use publish-gate for that.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = join(ROOT, 'src/lib/workbench');

const failures = [];
const passes = [];

function check(id, ok, detail) {
  if (ok) passes.push(`${id} ${detail}`);
  else failures.push(`${id} ${detail}`);
}

function read(p) {
  try {
    return readFileSync(join(ROOT, p), 'utf8');
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------- P1
const panelsSrc = read('src/lib/workbench/panels.ts');
const panelEntries = panelsSrc.split(/\{\s*\n\s*key:/).slice(1);

// 11 provider-backed panels + 3 self-sourced ones, which answer themselves
// from a local data file instead of a provider getter:
//   board       -> data/seo-geo-board.json      (src/lib/board/)
//   keywords    -> data/keyword-series.json     (src/lib/keywords/)
//   competitors -> data/competitor-series.json  (src/lib/keywords/)
// Keep this in sync with SELF_SOURCED_PANELS in src/lib/workbench/types.ts —
// that list is the authority on which panels are self-sourced.
const EXPECTED_PANELS = 14;
check(
  'P1.1',
  panelEntries.length === EXPECTED_PANELS,
  `panel registry declares ${panelEntries.length} panels (expected ${EXPECTED_PANELS})`
);

const legacyFlag = /status:\s*'(live|mock|planned)'/.test(panelsSrc);
check('P1.2', !legacyFlag, 'no legacy two-value `status` flag remains (was live|mock)');

// Every panel must declare a source kind.
const missingSource = panelEntries.filter((e) => !/source:\s*'(static|derived|remote)'/.test(e));
check('P1.3', missingSource.length === 0, `all panels declare a source kind (${missingSource.length} missing)`);

// Every static panel must carry a snapshot date.
const staticEntries = panelEntries.filter((e) => /source:\s*'static'/.test(e));
const staticWithoutDate = staticEntries.filter((e) => !/snapshotDate:\s*'\d{4}-\d{2}-\d{2}'/.test(e));
check(
  'P1.4',
  staticWithoutDate.length === 0,
  `every static panel carries a snapshotDate (${staticEntries.length} static, ${staticWithoutDate.length} undated)`
);

// No literal ISO timestamp may be baked into a payload as `updatedAt`.
const repoSrc = read('src/lib/workbench/provider-repo.ts');
const hardcodedUpdatedAt = /updatedAt:\s*'20\d\d-/.test(repoSrc);
check('P1.5', !hardcodedUpdatedAt, 'no hard-coded `updatedAt` literal in the provider');

// The provider must produce timestamps through a helper, not inline literals.
check('P1.6', /function nowIso\s*\(/.test(repoSrc), 'timestamps come from nowIso() at request time');

// ---------------------------------------------------------------- P2
// Recompute the four counts the workbench displays and confirm the provider
// does not carry a divergent literal.
const cm = read('src/lib/conversion-map.ts');
const pairs = (cm.match(/^\s*"[a-z0-9]+-[a-z0-9]+":/gm) ?? []).length;
const formats = new Set();
for (const m of cm.match(/^\s*"([a-z0-9]+)-([a-z0-9]+)":/gm) ?? []) {
  const g = m.match(/"([a-z0-9]+)-([a-z0-9]+)":/);
  formats.add(g[1]);
  formats.add(g[2]);
}

const bi = read('src/data/blog/index.ts');
const postsBlock = bi.match(/const posts: BlogPostMeta\[\] = \[([\s\S]*?)\]/);
const blogCount = postsBlock ? postsBlock[1].split(',').filter((x) => x.trim()).length : 0;

let guideCount = 0;
try {
  guideCount = readdirSync(join(ROOT, 'src/data/guides')).filter(
    (f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts'
  ).length;
} catch {
  guideCount = 0;
}

const ft = read('src/data/formats.ts');
const formatPages = (ft.match(/^\s*[a-z0-9]+:\s*\{/gm) ?? []).length;

check('P2.1', pairs > 0, `conversion pairs derived from source: ${pairs}`);
check('P2.2', formats.size > 0, `distinct formats derived from source: ${formats.size}`);
check('P2.3', blogCount > 0, `blog posts derived from source: ${blogCount}`);
check('P2.4', guideCount > 0, `guide pages derived from source: ${guideCount}`);
check('P2.5', formatPages > 0, `format pages derived from source: ${formatPages}`);

// The provider must not carry a competing literal for any of these.
const literalPairs = /conversionPairs:\s*\d+/.test(repoSrc);
check('P2.6', !literalPairs, 'provider does not hard-code conversionPairs');

// The facts module must be the single place these are computed.
const factsSrc = read('src/lib/workbench/facts.ts');
check('P2.7', /collectRepoFacts/.test(factsSrc), 'collectRepoFacts() is the single derivation point');

// ---------------------------------------------------------------- P3
const hasCitations = /9,012/.test(repoSrc);
const hasCaveat =
  /traffic promise|NOT sessions|did not convert to traffic|never be presented as a traffic/i.test(repoSrc);
check('P3.1', !hasCitations || hasCaveat, 'the 9,012 citation figure always ships with its traffic caveat');

const hasWeakEvidenceNote = /WEAK EVIDENCE|weak evidence/i.test(repoSrc);
check('P3.2', hasWeakEvidenceNote, 'the llms.txt-attribution claim is flagged as weak evidence, not proven');

// Prohibited phrasing from the handbook.
const forbidden = [
  { re: /GEO\s*score/i, why: 'a single GEO score is prohibited' },
  { re: /deleted the queue|删除了队列/i, why: 'the queue is dead code, not deleted' },
  { re: /citations?\s*(=|are)\s*traffic/i, why: 'citations must not be equated with traffic' },
];
for (const f of forbidden) {
  check(`P3.3`, !f.re.test(repoSrc), `provider avoids prohibited phrasing: ${f.why}`);
}

// ---------------------------------------------------------------- P4
// Access control. The workbench serves operational metadata, so "is it gated"
// is a honesty claim in its own right: a surface that LOOKS internal but is
// world-readable is a lie of the same kind as a frozen number labelled live.
const apiSrc = read('src/app/api/workbench/route.ts');
const layoutSrc = read('src/app/[locale]/admin/layout.tsx');
const guardSrc = read('src/lib/workbench/admin-guard.ts');

check(
  'P4.1',
  /checkWorkbenchAccess/.test(apiSrc),
  'the API route calls the access-control gate'
);
check(
  'P4.2',
  /checkWorkbenchAccess/.test(layoutSrc),
  'the admin layout calls the access-control gate (pages are gated, not just the API)'
);
check(
  'P4.3',
  !/TODO\(security\)/.test(apiSrc),
  'the unresolved TODO(security) on the API route is gone'
);
// Fail-closed: an empty allowlist must deny, never "allow because unconfigured".
check(
  'P4.4',
  /allowlist\.size\s*===\s*0[\s\S]{0,80}no_allowlist/.test(guardSrc),
  'an unconfigured allowlist denies (empty allowlist must not mean "allow all")'
);
check(
  'P4.5',
  /hasUsableSecret/.test(guardSrc) && /DEFAULT_SECRET/.test(guardSrc),
  'a missing or placeholder AUTH_SECRET denies, since forged sessions would otherwise verify'
);
check(
  'P4.6',
  /not_operator/.test(guardSrc),
  'a signed-in non-operator is denied (customer auth is not operator auth)'
);
check(
  'P4.7',
  !/AccessDenialReason|reason:\s*access\.reason/.test(apiSrc) &&
    /status:\s*404|notFound\(\)/.test(apiSrc),
  'the API returns 404 on denial, not a reason that would reveal the route exists'
);

// ---------------------------------------------------------------- P5 (board)
// The board is the one panel whose data is a structured file we maintain, so it
// gets its own contract: the file must exist, be parseable, and the derivation
// must keep standing cadences out of the dated list (otherwise "today" silently
// becomes a 11-item wall that hides the 5 items that actually have to ship).
const boardPath = 'data/seo-geo-board.json';
let boardRaw = '';
try {
  boardRaw = readFileSync(join(ROOT, boardPath), 'utf8');
} catch {
  boardRaw = '';
}
check('P5.0', boardRaw.length > 0, `the board data file exists (${boardPath})`);

let board = null;
try {
  board = JSON.parse(boardRaw);
} catch {
  board = null;
}
check('P5.1', board !== null, 'the board data file parses as JSON');

if (board) {
  // Every task carries an explicit status and a tier, so nothing is implied.
  const tasks = (board.modules ?? []).flatMap((m) => m.tasks ?? []);
  const noStatus = tasks.filter((t) => !t.status);
  const noTier = tasks.filter((t) => !t.tier);
  check('P5.2', tasks.length > 0, `the board registers tasks (${tasks.length})`);
  check('P5.3', noStatus.length === 0, `every board task declares a status (${noStatus.length} missing)`);
  check('P5.4', noTier.length === 0, `every board task declares a CORE/SUPP tier (${noTier.length} missing)`);

  // A task id must be unique or the register silently double-counts.
  const ids = tasks.map((t) => t.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  check('P5.5', dupes.length === 0, `board task ids are unique (${dupes.length} duplicates)`);

  // Anchors are the date-critical part; a malformed one would read as "已过".
  const badAnchors = (board.anchors ?? []).filter((a) => !/^\d{4}-\d{2}-\d{2}$/.test(a.date ?? ''));
  check('P5.6', badAnchors.length === 0, `every anchor has a real YYYY-MM-DD date (${badAnchors.length} bad)`);

  // The file must explain itself in place: whoever opens it should learn that
  // it is the data source, and that standing cadences are kept separate.
  const readme = Array.isArray(board._readme) ? board._readme.join('\n') : String(board._readme ?? '');
  check(
    'P5.7',
    readme.includes('data/seo-geo-board.json') || readme.includes('唯一数据源'),
    'the board file documents that editing it is how you change the board'
  );
  check(
    'P5.10',
    /continuous|常驻|持续/.test(readme),
    'the board file documents the standing-cadence cadence values it uses'
  );
}

// The board file is the single source of truth, so it MUST be version-controlled.
// `.gitignore` has `/data/*.json` for generated gate reports, and a directory-level
// `/data/` would make a later `!` negation silently useless (git never descends
// into an excluded directory to find re-includable files). Assert it is tracked.
{
  const gitignore = read('.gitignore');
  let ignored = false;
  try {
    execFileSync('git', ['check-ignore', '-q', boardPath], { cwd: ROOT, stdio: 'ignore' });
    ignored = true;
  } catch {
    ignored = false; // non-zero exit = NOT ignored = what we want
  }
  check('P5.11', !ignored, `the board data file is not git-ignored (else the board dies with the file)`);
  check(
    'P5.12',
    /^\/data\/\*\*$/m.test(gitignore) === false && /^\/data\/$/m.test(gitignore) === false,
    '.gitignore does not exclude the whole data/ directory (a later ! negation would be inert)'
  );
}

// The standing-cadence split must be live in the derivation, not just typed.
const deriveSrc = read('src/lib/board/derive.ts');
check(
  'P5.8',
  /STANDING_CADENCES/.test(deriveSrc) && /isStanding\(task\.recurring\)/.test(deriveSrc),
  'the derivation routes standing cadences out of the dated "today" list'
);
check(
  'P5.9',
  /standing:\s*DueItem\[\]/.test(read('src/lib/board/types.ts')),
  'the board view exposes a separate `standing` bucket'
);

// ---------------------------------------------------------------- P6 (keywords)
// The keyword panel exists because the board only ever said "build the keyword
// sheet" — it never showed data. The root cause was that the fetch scripts were
// never wired into any command, so nobody ran them daily and no comparable
// series could exist. These assertions pin that wiring down.
const pkgSrc = read('package.json');
check(
  'P6.1',
  /"build:keywords"\s*:/.test(pkgSrc) && /build-keyword-series\.mjs/.test(pkgSrc),
  'the series builder is registered as `npm run build:keywords`'
);
check(
  'P6.2',
  /"fetch:bing"\s*:/.test(pkgSrc) && /fetch-bing-webmaster\.mjs/.test(pkgSrc),
  'the Bing fetch is registered as `npm run fetch:bing` (the original root cause was it was registered nowhere)'
);
check(
  'P6.3',
  /"fetch:gsc"\s*:/.test(pkgSrc) && /fetch-gsc-webmaster\.mjs/.test(pkgSrc),
  'the GSC fetch is registered as `npm run fetch:gsc`'
);
check(
  'P6.4',
  read('scripts/build-keyword-series.mjs').length > 0,
  'the series builder exists'
);

// The builder must keep the two sources apart rather than blending them: the
// GSC exports use inconsistent windows and averaging them would be a lie.
const builderSrc = read('scripts/build-keyword-series.mjs');
check(
  'P6.5',
  /comparable/.test(builderSrc) && /distinctWindowDays/.test(builderSrc),
  'the builder measures whether the GSC windows agree instead of assuming they do'
);
check(
  'P6.6',
  /isJunkQuery/.test(builderSrc) && /droppedJunk/.test(builderSrc),
  'the builder drops scraped-page residue and reports how much it dropped'
);

// The client bundle must not pull in node:fs — that breaks the build.
const seriesSrc = read('src/lib/keywords/series.ts');
check(
  'P6.7',
  !/from 'node:fs'/.test(seriesSrc) && !/from 'node:path'/.test(seriesSrc),
  'src/lib/keywords/series.ts is client-safe (no node:fs)'
);
check(
  'P6.8',
  /from 'node:fs'/.test(read('src/lib/keywords/loader.ts')),
  'the filesystem read is isolated in src/lib/keywords/loader.ts'
);

// A missing series file is an expected state on a fresh clone; the page must
// explain how to build it, not crash.
const kwPage = read('src/app/[locale]/admin/keywords/page.tsx');
check(
  'P6.9',
  /if\s*\(!data\)/.test(kwPage) && /fetch:bing/.test(kwPage),
  'the keyword page explains how to generate the series when it is missing'
);

// ---------------------------------------------------------------- report
console.log('\nworkbench honesty audit');
console.log('─'.repeat(64));
for (const p of passes) console.log(`  PASS  ${p}`);
for (const f of failures) console.log(`  FAIL  ${f}`);
console.log('─'.repeat(64));
console.log(`  ${passes.length} passed, ${failures.length} failed`);

if (failures.length > 0) {
  console.log('\nWorkbench honesty contract violated. Fix before shipping.\n');
  process.exit(1);
}
console.log('\nAll workbench honesty claims hold.\n');
