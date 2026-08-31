# Onboarding Guide — SERP Competitor Analysis & Page Optimization Methodology (v2)

> **Version**: v2 (revised 2026-08-09; revision source = `docs/审计-SERP竞品分析方法论-2026-08-09.md`)
> **Purpose**: given a batch of keywords, how to query Google in batches, record competitors, analyze their ranking advantages, compare against our pages to find gaps, and produce improvement recommendations.
> **Use case**: any batch of words in the keyword ranking tracking table (`geo/关键词URL排名追踪表-*.md`).
> **Prerequisites**: first read the GSC auth/onboarding docs (to pull GSC data) + `docs/新人指导-内链优化规则.md` (to know internal-linking rules).

---

## 0. One-line flow (v2)

**Pick words → verify baseline → search (record params) → deep-dive Top 3 + scan Top 10 (incl. AI Overview / intent match / authority tiering) → compare (incl. E-E-A-T / UX) → score & prioritize → improvement list → implement → re-test**

> **Core philosophy (one line for newcomers)**: competitor analysis isn't to copy competitors, but to understand what kind of page Google / AI thinks best satisfies user intent — then do it better. But before acting, first confirm our own page isn't broken.

---

## 1. Batching strategy (don't search everything at once)

The keyword tracking table usually has 60-100 words. Searching all at once is slow and hard to focus; split into 3 batches by priority:

| Batch | Scope | Count | Purpose | Timing |
|---|---|---:|---|---|
| **Batch 1** | P0/P1 core tracking words | ~15 | biggest leverage first (mobi→epub / azw3 / zip / txt clusters) | immediately |
| **Batch 2** | P2 monitoring words + gap words | ~15 | see how competitors capture these intents, find direction for new pages/optimization | after Batch 1 |
| **Batch 3** | user-intent words (no GSC data yet) | ~20 | high-volume words (djvu-to-pdf / pdf-to-epub etc.), see SERP landscape | as needed |

**Word-selection principles**:
- Search words from the same cluster together (e.g. the 18 mobi→epub cluster words in one pass) for easy cross-comparison.
- Search words with existing GSC impressions first (data-backed), then pure intent words.
- Gap words (no page on our site) searched separately — purpose is to see SERP barrier, decide whether to build a page.
- **Multilingual**: this project's `/es` pages have real rankings (e.g. `es/blog/azw3-vs-mobi` position 15.1). Spanish target words need a **separate Spanish SERP search**, not just trusting the English SERP.
- **Record search parameters** (P2 item, required): record `locale` (e.g. en-US), `device` (desktop/mobile), `date`, `tool` for each batch to ensure reproducibility.

---

## 2. Analysis dimensions (fixed 10-item checklist)

Analyze every competitor page across these 10 items for standardized comparison (v1 had 6; v2 adds §2.1 AI Overview, §2.4 intent match, §2.7 E-E-A-T, §2.8 UX, §2.9 internal-link hub).

### 2.1 SERP features
- **AI Overview (🔴 new)**: in 2026 many informational / commercial-investigation queries already show an AI Overview at the top. Must record:
  - Does this word trigger an AI Overview?
  - Which domains/pages does it **cite** (these are the GEO competitors)?
  - Is our target page cited? If not, where's the gap (entity clarity? structured data? definition block concise enough)?
  - Action: if competitors are cited by AI and we aren't, add "improve probability of being AI-cited" to the improvement list (add FAQPage/HowTo schema, add a clear definition section, add entity markup, deploy/validate llms.txt).
- **Featured Snippet**: present? Whose? What format (paragraph/table/list)?
- **People Also Ask (PAA)**: note the top 3-4 questions (these are FAQ targets).
- **Image pack / Video pack / Knowledge panel**: ebook-conversion knowledge panels are usually N/A, don't wait for them.
- **Other classic features (fill in)**: sitelinks, review stars, People also search for, Top Stories, Local pack, Shopping — mark each as yes/no/N/A.
- **Action**: Featured Snippet present → we compete for it (same format, better content); PAA present → FAQ must cover; AI Overview present → compete for GEO citation.

### 2.2 Content depth
- **Word count**: roughly how many words is the competitor page? (tool page 500-1000 / content page 1500-3000 / comprehensive guide 3000+)
- **H2/H3 hierarchy**: which subtopics are covered? (note the heading outline)
- **Structured elements**: comparison table / step list / FAQ / code block / screenshot?
- **Action**: if competitor is 2000 words and we're 800 → content depth is the main gap.

### 2.3 Title strategy
- **title tag**: how is it written? keyword at which position? what modifiers (Free / Online / Best / No Install)?
- **H1**: same as title or different?
- **Meta description**: how written? any CTA?
- **Title-pattern alignment (P2 new)**: identify the Top 10's **modal title pattern** (e.g. "[SRC] to [TGT] Converter — Free Online"); our title should align with it — unless we have a differentiating angle (e.g. we lead with "No Sign-up").
- **Action**: if competitor title is "Free MOBI to EPUB Converter Online — No Install" and ours is "MOBI to EPUB" → title optimization is a quick win.

### 2.4 Content format (incl. intent-format match, P1 new)
- **Page type**: tool page (converter widget centered) / content page (long-form + CTA) / hybrid page (tool on top half, content on bottom half).
- **Intent-format match (🔴 P1 core judgment)**:
  1. First judge query intent: **T**=transactional (I want to convert) / **C**=commercial research (compare) / **I**=informational (I want to understand) / **N**=navigational.
  2. Then look at the Top 10 format distribution.
  3. Flag "**format mismatch = overtaking opportunity**":
     - Transactional word but all content pages → we have a chance with a tool page.
     - Informational word but all tool pages → we have a chance with a content page (blog/guide).
- **Action**: if Top 5 are all hybrid pages and we only have a tool page → missing content layer; if all tool pages and we have too much content → possibly over-doing it.

### 2.5 Differentiation selling points
What did competitors write that we don't? Record item by item:
- Privacy/security promises (SSL, auto-delete files, no server upload)
- Batch conversion entry
- CLI / API docs
- Device compatibility table (which Kindle / Kobo / Nook support what formats)
- Comparison table (vs Calibre / vs CloudConvert / vs Zamzar)
- User reviews / trust badges
- DRM explanation
- **Action**: list what competitors have that we don't, prioritize by cost-effectiveness to fill in.

### 2.6 URL structure
- **Subdomain** (converter.cloudconvert.com) or **subdirectory** (cloudconvert.com/mobi-to-epub) or **separate domain** (mobitoepub.com)?
- Path depth: how many levels?
- **Action**: record but usually don't change our URL structure — that's an architecture decision, not content optimization.

### 2.7 Trust & entity signals (E-E-A-T, P1 new)
For informational / commercial words Google weights expertise/trust; must assess:
- **Author byline**: is there an author? credentials/bio?
- **Citations & sources**: cites authoritative sources (Wikipedia / ISO / official docs)?
- **Update date**: does the page have Last updated?
- **Brand entity**: is the competitor a known entity (Amazon / Calibre) or an anonymous tool site?
- **About / editorial policy**: any verifiable entity endorsement?
- **Action**: if competitor has author + citations + date and we have none → E-E-A-T is the gap, prioritize filling it (this project builds trust via llms.txt + structured data + accurate format facts).

### 2.8 Page experience / technical (P2 new)
- **CWV**: LCP / INP / CLS (this project's Next.js is usually fast, can be a differentiator).
- **Mobile-friendly**: viewport / touch targets / font readability.
- **HTTPS**: site-wide encryption?
- **Action**: if our UX is clearly better than competitors, write "faster/lighter" into the trust pitch.

### 2.9 Internal-link hub observation (P2 new)
- Does the competitor cluster internal links around a "format hub" (e.g. azw3 page links to mobi/kfx/epub related pages)?
- **Action**: feed back into this project's `docs/新人指导-内链优化规则.md` — record hub patterns worth borrowing.

---

## 3. Operating steps (just follow along)

### Step 1: Search and record SERP (incl. params)

```
For each keyword:
1. Use WebSearch (English traffic → English SERP; Spanish target words → separate Spanish SERP)
2. Record search params: locale / device / date / tool
3. Record Top 10 organic results: position / URL / title / description
4. Record SERP features: AI Overview? who cited? Featured Snippet? PAA? Image pack? Video pack?
5. Flag whether our page appears, at what position
```

**Output format** (one line per keyword):

| Pos | URL | Domain | Title | Type | Intent | Ours? |
|---:|---|---|---|---|---|---|
| 1 | ... | ... | ... | tool/content/hybrid | T/C/I | ❌ |
| 2 | ... | ... | ... | ... | ... | ❌ |
| ... | | | | | | |
| 8 | bookconv.com/convert/mobi-to-epub | bookconv | ... | tool | T | ✅ |

### Step 2: Deep-dive Top 3 + scan Top 10

```
For Top 3 competitor pages:
1. Use WebFetch to grab page content
2. Analyze across the 10 dimensions in §2
3. Record into a competitor analysis card
For Top 4-10:
4. Use WebSearch results + selective WebFetch to scan, find landscape patterns (who dominates, what format leads)
```

**Competitor analysis card template** (one per competitor):

```markdown
### Competitor #[N]: [domain] — [URL]
- **Position**: #[N]
- **Type**: tool page / content page / hybrid page
- **Authority tier**: brand site / mid-size tool site / blog / UGC / anonymous tool site
- **Intent match**: query intent=T/C/I; Top 10 format distribution=__; format mismatch?__
- **Word count**: ~[X] words
- **Title**: [full title] (aligned with Top 10 modal pattern: __)
- **H1**: [full H1]
- **H2/H3 outline**:
  - H2: ...
- **Structured elements**: □ comparison table □ step list □ FAQ □ code block □ screenshot □ video
- **Schema**: □ FAQPage □ HowTo □ Article □ Breadcrumb □ none
- **Trust/entity signals**: □ author byline □ authoritative citations □ update date □ brand entity □ privacy promise
- **Differentiators**:
  - [differentiator 1]
- **SERP features**: □ AI Overview (cited __ / didn't cite us) □ Featured Snippet □ PAA □ Image pack □ Video pack
- **UX**: CWV≈__ / mobile__ / HTTPS__
- **What we're missing**: [specific gap]
```

### Step 2.5: Baseline health check (🔴 P0 prerequisite, required)

> This project has historically had rendering bugs and soft 404s (`/convert/epub-to-word` wrongly 404'd, `data/content` nesting not unwrapped caused 27 pages to use the default template). **Doing gap analysis on a broken baseline corrupts everything**, so before comparing we must verify our page is alive:

```
For each of our target pages:
1. GSC URL Inspection or site:bookconv.com/convert/xxx to confirm it's indexed
2. Confirm canonical points to itself (not wrongly to /en or homepage), no soft 404
3. After stripping <script>, confirm body actually renders (RSC flight payload pollutes grep — use html.replace(/<script[\s\S]*?<\/script>/g,'') before searching)
4. seo-critic.mjs gate = 0 critical
→ Fix unhealthy pages first, then compare gaps
```

### Step 3: Compare against our pages (incl. E-E-A-T / UX)

```
For our target page:
1. Use WebFetch to grab its rendered content (after Step 2.5 first)
2. Analyze across the same 10 dimensions in §2
3. Compare item by item against Top 3 competitors (focus: trust signals, UX, structured data)
4. List the gap checklist
```

### Step 4: Score & prioritize (go/no-go, P1 new)

Score each word to avoid newcomers prioritizing by gut feel:

```
Intent match (0-2) × difficulty gap (0-2) × authority gap (0-2) × content gap (0-2) → total (0-16)
- 12-16 = high priority (do now)
- 6-11  = medium priority (schedule)
- 0-5   = low priority (defer/drop, by ROI)
```

### Step 5: Implement & re-test (closed loop, P1 new)

```
1. Execute the improvement list (content / structured data / internal links / title)
2. Wait 2-4 weeks (let Google re-crawl + re-evaluate)
3. Re-run GSC, compare position/impressions/clicks
4. Update `geo/关键词URL排名追踪表-*.md`
5. Confirm movement → if none, return to Step 2 and re-analyze (competitors may have changed too)
```

---

## 4. Cross-analysis (find patterns across keywords, incl. authority tiering)

After analyzing a batch, do one cross-summary:

### 4.1 Competitor landscape (incl. authority tiering, P1 new)
- **Who dominates**? record repeatedly appearing domains.
- **What strategy do they use**? summarize by authority tier:
  - **Brand sites** (Amazon / CloudConvert / Calibre): rely on domain authority, content not necessarily deep.
  - **Mid-size tool sites** (AnyConv / FreeFileConvert / MegaConvert): rely on tool widget + content layer.
  - **Blog/UGC** (formatdrop / blog.fileformat): rely on content depth + long-tail.
- **DA threshold**: honestly — we can't get precise DA, but can infer from domain fame + page depth.

### 4.2 SERP feature patterns
- Which words have AI Overview? who cited? → GEO citation opportunities.
- Which words have Featured Snippet? what format? → snippet opportunities.
- Which words have PAA? what questions? → FAQ targets.
- Which words are all tool pages in SERP (no content pages)? → content page overtaking chance.
- Which words have format mismatch? → overtaking signal (see §2.4).

### 4.3 Content depth baseline
- What's the average word count of Top 5 competitors? → our target word count.
- Which subtopics are covered by multiple competitors? → must-have sections.
- Which subtopics only one competitor covers? → differentiation opportunity.

### 4.4 Our positioning (go/no-go)
- Which words do we have zero ranking for? → either build a page or drop (by ROI score §3 step 4).
- Which words do we rank poorly but competitors are weak? → optimization opportunity.
- Which words are all DA 80+ big sites? → don't attack short-term, wait for authority to build.

---

## 5. Tool capabilities & limits (honest version)

### Can do
- **WebSearch**: search Google, get SERP result lists (position / URL / title / description) + some AI Overview clues.
- **WebFetch**: deeply grab competitor/our page's actual rendered content, analyze 10-dimension structure.
- **GSC API**: pull our real impressions/positions/clicks (90-day window; can use "average" to approximate magnitude).

### Can't do (need external tools to supplement)
- **Backlinks / DA / DR**: need Ahrefs / SEMrush / Moz. Export data to enrich the analysis.
- **Precise search volume**: GSC only gives impressions (our own), not market totals. Need Keyword Planner / Ahrefs.
- **Personalized SERP**: varies by region/language/login state. English search approximates the US default SERP; Spanish words need a separate search.
- **Real-time rank tracking**: GSC data has 2-3 day lag; real-time ranking needs third-party tools.

---

## 6. Output document structure (one per batch, with re-test section)

After each batch, produce a report stored in the `geo/` directory:

```
geo/SERP竞品分析-第[N]批-[cluster]-[date].md
```

**Report structure**:
1. **SERP overview table**: keyword × Top 10 competitor URL × position × title × type × intent.
2. **Top 3 competitor deep-dive cards**: 10-dimension breakdown (incl. AI Overview / authority tier / E-E-A-T).
3. **Our page comparison**: baseline health results + gap list.
4. **Cross-analysis**: competitor landscape (authority tiering) / SERP feature patterns / content depth baseline.
5. **Improvement list**: executable actions ordered by score priority.
6. **Post-implementation re-test plan**: wait 2-4 weeks → re-run GSC → update tracking table.
7. **Appendix**: raw SERP params / competitor page archives (optional).

---

## 7. Common pitfalls (must-read for newcomers, incl. statistical-significance threshold)

1. **Don't only look at who's #1** — look at the whole Top 10 landscape. #1 may be a DA 90 site we can't beat short-term, but #5-10 may be DA 30 sites we can surpass. Hence "deep-dive Top 3 + scan Top 10".
2. **Don't analyze only tool pages** — for many words, content pages rank better than tool pages in SERP. Google thinks the user wants to "understand", not directly "convert".
3. **Don't ignore PAA / AI Overview** — PAA questions are FAQ targets; AI Overview citation sources are GEO competitors, covering them wins citations.
4. **Don't copy competitor content** — analyze structure and selling points, but write with our own data and angle. E-E-A-T demands originality.
5. **Statistical-significance threshold (positive definition)**: this project's GSC has only 66 words / 148 impressions, many words <10 impressions. **Qualification threshold: ≥10 impressions over 90 days OR ≥3 data points to count as a valid position; otherwise mark low-confidence, treat as a clue only, don't make major decisions on it.**
6. **Improvement list must be executable** — don't write "improve content quality". Write "add a 3-step operation list + 1 comparison table under the H2 'How to convert'".
7. **Don't skip the baseline health check (Step 2.5)** — comparing gaps on an unindexed/broken-rendering page guarantees wrong conclusions. This project has learned this the hard way.

---

## 8. Relationship to other docs

| Doc | Relationship |
|---|---|
| `geo/关键词URL排名追踪表-*.md` | Data source: pick words → analyze → update positions |
| `docs/审计-SERP竞品分析方法论-2026-08-09.md` | The v2 revision source (why changed, what changed) |
| `docs/新人指导-内链优化规则.md` | Rules: follow when improvement list involves internal links |
| `geo/` GEO ops docs / `public/llms.txt` | GEO dimension (AI Overview citations) countermeasure landing points |
| GSC auth/onboarding docs | Prerequisite: pull GSC data |

---

> **v2 revision quick reference**: vs v1, adds AI Overview/GEO dimension, baseline health-check prerequisite gate, intent-format match, competitor authority tiering, statistical-significance threshold, E-E-A-T dimension, go/no-go scoring, closed-loop re-test, plus CWV/internal-link hub/multilingual SERP/title-pattern alignment/search-param recording enhancements. Audit rating raised from B− to target A−.
