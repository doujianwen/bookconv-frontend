# Weekly Guide Loop — Next-Week Execution SOP (from 2026-08-10)

> Applies to: bookconv.com's steady-state growth operations (find keywords → build pages → verify + backlinks)
> Compiled: 2026-08-09 based on `今日复盘-2026-08-09.md` + `geo/长尾内容生产规划-2026-08-09.md` + memory 6.1 backlink convention
> Previous version: `docs/weekly-guide-loop.md` (2026-08-02, greenfield mode); this version is **upgraded to dual-track + backlink-first** per this week's retrospective

---

## 0. Key conclusions from this week's retrospective (driving this SOP)

1. **Scale is no longer the bottleneck**: 87 pages (36 blog + 21 guide + 30 convert) are already in place.
2. **Root cause of 0 clicks = domain authority**: GSC 90-day 66 words / 148 impressions / 0 clicks / position ~60. `geo/长尾内容生产规划` §1: positions 60-80 are driven by **backlinks**, not pages. → **This week's lever: backlinks > new pages**.
3. **Highest single-page leverage**: `/convert/mobi-to-epub` cluster alone has 61 impressions (position ~69); deepening it has the best ROI.
4. **Backlink iron rule (memory 6.1)**: homepage first; until homepage backlinks are wrapped up, don't internally push inner-page backlinks.
5. **GSC re-test discipline**: only judge trends after accrual ≥10 impressions; don't over-conclude from 1-2 impressions.
6. **Next-step priorities** (retrospective §5): ① homepage backlinks ② international multilingual matrix (Spanish first) ③ GSC re-test ④ Upstash/Pro E2E.

---

## 1. Four-step loop overview (this week's cadence)

```
[Step 1 Find] → [Step 2 Build] → [Step 3 Gate] → [Step 4 Verify]
   Monday         Tue~Thu         pre-commit        ~90s after push + 2~4 wks GSC
   Backlinks in parallel: homepage first, ongoing (see §5 / docs/外链提交报告_20260809.md)
```

> ⚠️ Difference from the 08-02 version: this version **defaults to dual-track** (A = deepen old pages / B = build validated gap pages), and **backlinks are a first-class citizen** in the weekly cadence.

---

## 2. Step 1 — Find keywords (Monday, ~30min)

### Seed sources (by priority)
1. `geo/关键词URL排名追踪表-2026-08-09.md` (real impressions/positions, sets A-track targets)
2. `geo/GSC长尾词全景-2026-08-08.md` + `geo/用户意图作战映射表.md` (GSC-validated real gaps → B-track)
3. `src/lib/conversion-map.ts` (ensure new `/convert/*` has real backend capability, preventing soft 404s)
4. `竞品外链分析与推广计划.md` §2.1 high-opportunity words (KD=0 blue-ocean, supplementary only)

### Dual-track decision (stop blindly adding new pages)
- **A-track (default priority)**: deepen pages that already get impressions (no new pages). `geo/长尾内容生产规划` §2 has A0–A4 scheduled.
- **B-track (only GSC-validated gaps)**: before building, **first verify the backend can actually convert** (this project has been burned by hard 404s). See §3 batches.

### Scoring filter (carried over)
| Dimension | Weight | Standard |
|------|------|------|
| Impressions / position | 3 | higher GSC-measured impressions = higher priority (A-track); B-track weighs gap certainty |
| Backend feasibility | 3 | CONVERSION_MAP has matching capability (else 0 points, forbidden to build) |
| Internal-link ecosystem | 2 | existing related blog/guide for reciprocal links |
| Intent purity | 2 | single clear intent |

---

## 3. Step 2 — Build pages (Tue~Thu)

### Single data source (unchanged)
Create `src/data/guides/{slug}.ts` or blog `src/data/blog/{slug}.ts`, with required fields (guides follow `src/data/guides/mobi-to-epub-keep-formatting.ts`):
```ts
export const slug = '{slug}'
export const title = '...'
export const problem = '...'        // above-the-fold pain hook
export const date = 'YYYY-MM-DD'
export const tags = [...]
export const formats = { source: 'x', target: 'y' }  // if present, CTA /convert/x-to-y
export const keyTakeaways = [4 items]
export const content = { intro: '...', sections: [ 5 × { heading, body } ] }
export const faqs: BlogFaq[] = [ 6 × { question, answer } ]
```

### Hard rules (user + validated pitfalls)
- ✅ **All body copy in English** (hard user constraint, blogs and guides alike)
- ❌ **No backticks** (renderMarkdownToHtml doesn't support inline code)
- CTA: with `formats` → `/convert/{source}-to-{target}`; without → `/convert`
- ⚠️ **CTA must include `to`** (`lit-to-epub` not `lit-epub`; missing `to` → `target=undefined` → 500)
- Internal links go through the `src/lib/internal-links.ts` helper, not hand-written URLs
- B-track new `/convert/*` pages: **verify backend can actually convert before building** (prevents soft 404s)

### Register + sync (both required, else seo-critic CRITICAL)
1. `src/data/guides/index.ts` or `src/data/blog/index.ts`: import + add to `all`/`posts`
2. `public/llms.txt`:
   - Guides → `## Troubleshooting Guides` section count **= `getAllGuides().length`**
   - Blogs → keep consistent with `getAllPosts()` (seo-critic validates)
3. Spanish: if new content goes into `/es`, confirm `messages/es.json` is synced (Spanish falls back to English; missing es field doesn't error)

### Recommended execution order this week (from long-tail content plan §5)
- **A-track first**: A0 `/convert/mobi-to-epub` (61 impressions, add comparison table / DRM / migration scenarios / batch entry / privacy section) → A1/A2/A3/A4.
- **Then B batch 1** (pure content pages, safest): B1 `/blog/mobi-to-kobo`, B2 `/blog/epub-vs-mobi`, B3 `/blog/batch-converter`.
- **B batch 2 deferred**: `zip-to-epub`/`lit-to-mobi`/`azw-to-mobi`/`chm-to-mobi` need backend verification first (azw-to-mobi has the highest impressions but the biggest AZW risk).

---

## 4. Step 3 — Gate (must run before commit)
```bash
node scripts/seo-critic.mjs     # must be 0 critical / 0 warn
node_modules/.bin/tsc --noEmit  # must be 0 type errors
```
> ⚠️ Local Windows `next build --webpack` may crash environmentally (worker 0xC0000409), unrelated to code; Vercel/Linux is the real build source, verify via live curl.

---

## 5. Step 4 — Verify (~90s after push + GSC re-test)

Push: `git push origin main` (Vercel auto-deploys, ~40-90s).

### 5.1 Immediate deploy verification (curl, assert after stripping `<script>`)
| Check | Expected |
|--------|------|
| New `/guide|/blog|/convert/{slug}` status code | 200 |
| canonical count | **1** (only generateMetadata, root layout must not hand-write) |
| Guide FAQPage JSON-LD | present, Question = 6 |
| CTA `/convert/*` (with to) | 200 (no dangling) |
| `sitemap.xml` | includes new slug (en + es) |
| `llms.txt` | corresponding section +1 |

### 5.2 Backlink portion (separate cadence, see dedicated doc)
- **This week's backlinks point only to the homepage**, see `docs/外链提交报告_20260809.md`.
- Memory 6.1: until homepage backlinks wrap up, don't internally push inner-page backlinks; A-track pages can be deepened in content, but backlink actions only serve homepage authority.

### 5.3 GSC re-test discipline
- Don't judge trends from 1-2 impressions; analyze position changes only after **accrual ≥10 impressions**.
- Backlink effect shows in **domain-authority metrics** (referring-domain count / DR) + GSC position 2-4 weeks later, not same-day clicks.

---

## 6. Commit discipline (unchanged)
- Only `git add` related files (data + index + llms.txt + possibly messages/es.json), **never `git add -A`** (repo root has stray junk files `f2148*.txt`/`sitemap-urls.txt`/`gefei_articles.json` etc., not part of this project).
- Commit message: `feat(guides|blog): add Px ...` / `fix(convert): ...`
- Push via HTTPS + Git Credential Manager (SSH port 22 closed).

---

## 7. This week's candidate word pool (rolling, approved)

**A-track (deepen, no new pages)** — from `geo/长尾内容生产规划` §2:
| Target page | Impressions | Position | Action |
|--------|-----:|-----:|------|
| /convert/mobi-to-epub | 61 | 68.9 | A0 add comparison/DRM/migration/batch/privacy |
| /convert/epub-to-txt | 10 | 72.0 | A1 pure-JS speed / privacy differentiators |
| /convert/epub-to-mobi | 13 | 70.6 | A2 H1 explicitly hits "online" |
| /convert/azw3-to-mobi | 6 | 42.8 | A3 scenario FAQ / Kindle migration |
| /es/convert/mobi-to-epub | 4 | ~66 | A4 Spanish long-tail section |

**B-track batch 1 (new, pure content, safest)**:
`/blog/mobi-to-kobo`, `/blog/epub-vs-mobi`, `/blog/batch-converter`

**B-track batch 2 (verify backend before building)**:
`/convert/lit-to-mobi` (low risk), `/convert/azw-to-mobi` (high impressions, high risk), `/convert/chm-to-mobi` (depends on CloudConvert), `/convert/zip-to-epub` (needs code path)

---

## 8. Backlinks (dedicated doc)
- **This week's backlink strategy & execution plan**: `docs/外链提交报告_20260809.md`
- Iron rule: homepage first; until homepage backlinks wrap up, don't internally push inner-page backlinks; backlinks = long-term resources, only do genuine contribution-style placements (reddit/quora/askubuntu/linuxmint and other forum weak-domains).

---

## 9. Todo handoff (from retrospective §4/§5)
| Item | Status | Relation to loop |
|----|------|------------|
| #4 user-storage persistence (storage.ts in-memory Map) | ⏸ large refactor | not in loop, separately scheduled |
| #5 Pro-link E2E (needs `REDIS_URL`/Upstash) | ⏸ awaiting env var | not in loop, but affects paid-conversion metric |
| International multilingual matrix (Spanish first) | planning | new content must sync `messages/es.json` (§3) |
| GSC re-test | this week | §5.3 discipline |
