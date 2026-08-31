# Weekly Guide Loop — Find Keywords → Build Pages → Verify SOP

> Applies to:常态化运营 of bookconv.com's `/guide/*` pain-point long-tail pages
> Established: 2026-08-02 | Pattern source: Gefei's "2025 Website Competition Retrospective" + this site's validated single-data-source `/guide` architecture

---

## 0. Why this mechanism (metric discipline)

bookconv.com is a **tool/subscription site**, not an ad site. Growth comes from long-tail pain-point pages capturing search intent → funneling to `/convert/*` for conversion.

- **Core metrics**: signup rate / paid conversion rate / retention — **not** PV/UV (ad-site metrics don't apply)
- **Never show ads** (breaks tool-site trust)
- **One page, one keyword** (one page one keyword), templated batch production
- External links are treated as long-term resources, not one-off traffic bursts

---

## 1. Four-step loop overview

```
[Step 1 Find] → [Step 2 Build] → [Step 3 Gate] → [Step 4 Verify]
   Monday         Tue~Thu         pre-commit        ~90s after push
```

---

## 2. Step 1 — Find keywords (Monday, ~30min)

### Seed sources (by priority)

1. **`竞品外链分析与推广计划.md` §2.1 high-opportunity words** (KD=0, validated low competition, ready to use)
2. **`src/lib/conversion-map.ts`** — conversion pairs that actually exist (ensures no dangling CTA)
3. **`brave_serp_report.md`** PAA (People Also Ask) → directly becomes FAQ material
4. Interlinking from already-published `/guide` pages (related guides link to each other)

### Scoring filter (score each word, build pages for ≥8)

| Dimension | Weight | Standard |
|------|------|------|
| Traffic potential | 3 | Competitor report monthly traffic, or KD=0 high potential |
| Real CTA | 3 | `conversion-map.ts` has the matching key (else **0 points**, skip) |
| Internal-link ecosystem | 2 | Existing related blog/guide for reciprocal links |
| Intent purity | 2 | Single clear intent (transactional / informational) |

> Exclude already-published guides from the candidate pool (read the `all` array in `src/data/guides/index.ts`).

---

## 3. Step 2 — Build pages (Tue~Thu)

### Single data source (follow the pattern in `src/data/guides/mobi-to-epub-keep-formatting.ts`)

Create `src/data/guides/{slug}.ts` with these required fields:

```ts
export const slug = '{slug}'
export const title = '...'
export const problem = '...'        // above-the-fold pain hook
export const date = 'YYYY-MM-DD'
export const tags = [...]
export const formats = { source: 'x', target: 'y' }  // if present, CTA links /convert/x-to-y
export const keyTakeaways = [4 items]    // Key Takeaways box
export const content = {
  intro: '...',
  sections: [ 5 × { heading, body } ],
}
export const faqs: BlogFaq[] = [ 6 × { question, answer } ]  // written from PAA
```

### Hard rules (from user + validated pitfalls)

- ✅ **All body copy in English** (bookconv.com is an English SEO site, hard user requirement)
- ❌ **No backticks** (renderMarkdownToHtml does not support inline code)
- CTA: with `formats` → `/convert/{source}-to-{target}`; without → `/convert`
- Internal links use real slugs (blogs read `src/data/blog/*.ts`, guides read `index.ts`)

### Register + sync (both required, else seo-critic reports CRITICAL)

1. `src/data/guides/index.ts`: import and add to the `all` array
2. `public/llms.txt` `## Troubleshooting Guides` section: **count must = `getAllGuides().length`**

---

## 4. Step 3 — Gate (must run before commit)

```bash
node scripts/seo-critic.mjs     # must be 0 critical / 0 warn
node_modules/.bin/tsc --noEmit  # must be 0 type errors
```

> ⚠️ Local Windows `next build --webpack` may crash environmentally during static generation (worker exit 0xC0000409), **unrelated to code**. Vercel/Linux is the real build source — verify via live curl.

---

## 5. Step 4 — Verify (~90s after push)

```bash
git push origin main   # Vercel auto-deploys
```

Wait ~90s, then curl-verify each new page:

| Check | Expected |
|--------|--------|
| `/guide/{slug}` status code | 200 |
| canonical count | **1** (root layout must not hand-write canonical; rely only on generateMetadata) |
| FAQPage JSON-LD | present, Question = 6 |
| CTA `/convert/*` | 200 (no dangling links) |
| `sitemap.xml` | includes `/guide/{slug}` (en + es) |
| `llms.txt` | `## Troubleshooting Guides` section +1 |

es variant canonical **falls back to the en URL** (this site's established es→en convention, not a bug).

---

## 6. Commit discipline

- Only `git add` guide-related files (data files + index.ts + llms.txt), **never `git add -A`** (the repo root has stray junk files f2148…txt / sitemap-urls.txt / gefei_articles.json that don't belong to this project)
- Commit message: `feat(guides): add Px pain-point guides (...)`
- Push via HTTPS + Git Credential Manager (SSH port 22 is closed)

---

## 7. This week's candidate word pool (rolling list)

> Remaining high-opportunity candidates after 11 pages published (all have real CTAs, from competitor analysis §2.1 + conversion-map):

| Candidate | Traffic/KD | Real CTA (with `to`, else 500) | Existing internal-link blog | Score | Status |
|--------|---------|----------|--------------|------|------|
| lit to epub | 10.8K / 0 | /convert/lit-to-epub | why-convert-lit-to-epub, lit-ebook-format | 10 | ✅ ran this week |
| epub to txt | 6.5K / 2 | /convert/epub-to-txt | txt-to-epub | 9 | ✅ ran this week |
| fb2 to epub | 242 / 0 | /convert/fb2-to-epub | fb2-to-epub | 8 | scheduled |
| azw3 to mobi | 0 / 0 | /convert/azw3-to-mobi | azw3-vs-mobi | 8 | scheduled |
| txt to epub | 0 / 0 | /convert/txt-to-epub | txt-to-epub | 8 | scheduled |
| rtf to epub | 0 / 0 | /convert/rtf-to-epub | — | 7 | scheduled |
| html to epub | 0 / 0 | /convert/html-to-epub | — | 7 | scheduled |
| mobi to txt | 0 / 0 | /convert/mobi-to-txt | — | 7 | scheduled |
| epub to rtf | 0 / 0 | /convert/epub-to-rtf | — | 7 | scheduled |
| epub to html | 0 / 0 | /convert/epub-to-html | — | 7 | scheduled |
| epub to doc | — | /convert/epub-to-doc | — | 6 | scheduled |
| epub to jpg | — | /convert/epub-to-jpg | — | 6 | scheduled |
| doc to epub | — | /convert/doc-to-epub | — | 6 | scheduled |
| mobi to pdf | — | /convert/mobi-to-pdf | — | 6 | scheduled |
| azw3 to pdf | — | /convert/azw3-to-pdf | — | 6 | scheduled |
| epub to png | 0 / 0 | /convert/epub-to-png | — | 5 | weak intent, P3+ |

> ⚠️ **CTA format iron rule**: URLs use `{source}-to-{target}` (e.g. `lit-to-epub`), **not** the conversion-map key format `{source}-{target}` (e.g. `lit-epub`). `convert/[slug]/page.tsx` parses with `slug.split('-to-')`; missing `to` makes `target=undefined` → 500.

---

## 8. Automation / scheduled triggers

- **Target cadence**: every Monday auto-run "find keywords + generate this week's candidate weekly report" (**do not auto-push to main**; after human confirmation I execute build + gate + push), with steady production the rest of the time.
- **Current state**: the `automation_update` tool is unavailable this session, so scheduled tasks couldn't be created via tool. Fall back to **manual trigger + SOP-driven**: every Monday you (or I) run the keyword-finding from §2 seed sources → produce the candidate weekly report → after your confirmation I execute the build.
- **To add later**: when the tool is available, create a recurring automation (schedule: every Monday), prompt = "Read the `all` array in `src/data/guides/index.ts` + keys in `src/lib/conversion-map.ts` + `竞品外链分析与推广计划.md`, `brave_serp_report.md`, score against the §2 table to produce this week's page-build candidate report (excluding published slugs), without performing any git/push operations."
- **Safety boundary**: build + push always keeps human confirmation; never fully auto-push to production.
