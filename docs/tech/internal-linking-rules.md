# Internal Linking Rules — Onboarding Guide (bookconv.com · v1)

> Audience: any collaborator who needs to **create or edit site content** (blog / guide / convert landing-page body copy).
> Version: v1 (2026-08-08, distilled from the internal-linking audit)
> Purpose: make every piece of content comply with SEO internal-linking standards from day one, avoiding bulk rework later.

---

## 0. First, understand the site's "three subsystems"

bookconv.com's content is composed of three **isomorphic subsystems**. The thing newcomers most often confuse is the cross-linking relationship between them:

| Subsystem | Path | Role | Example |
|---|---|---|---|
| Blog | `/blog/*` | Topic articles, tutorials, experience | `epub-to-word`, `rss` |
| Guide | `/guide/*` | Format hub, comparisons, deep dives | `azw3-vs-mobi`, `kindle-formats` |
| Convert | `/convert/*` | Conversion landing page (with tool CTA) | `mobi-to-epub`, `epub-to-zip` |

**The core triangle**: `Guide ↔ Blog ↔ Convert` should funnel traffic to each other. The Guide is the "knowledge hub", the Blog is the "topic entry", the Convert page is the "closing destination". The three link to each other naturally so link equity flows.

> Internal links you insert in body copy can only target these three slug types (or the three index pages `/blog`, `/guide`, `/convert`). Any other path (e.g. `/en/...`, `/tools/...`) is wrong.

---

## 1. Internal linking rules (v1 · 7 dimensions, 16 rules)

### 1.1 Structure & reachability
- **R1 Global navigation**: every page must have a stable global entry (header or footer) covering the three hubs `/convert`, `/blog`, `/guide`.
- **R2 Homepage hub links**: the homepage must link to the `/blog` and `/guide` index pages.
- **R3 Reachability depth**: any important page is ≤3 clicks from the homepage (including global nav + contextual links).

### 1.2 Relevance
- **R4 Link only if topically related**: only interlink within the same format cluster or same intent cluster; never force unrelated pages to link (e.g. 16 niche convert pages with no related blog should not get forced links).
- **R5 Bidirectional linking (when natural)**: if A is topically related to B, B should link back to A. Especially convert pairs (epub↔mobi) and the "Guide ↔ Blog ↔ Convert" triangle.

### 1.3 Anchor text
- **R6 Descriptive anchor text**: anchor text must be the target page's primary keyword; avoid generic words like "click here / here / more / read".
- **R7 Anchor matches intent**: convert-page anchors use "Convert X to Y"; guide anchors use the format name; blog anchors use the article title/topic.

### 1.4 Link-equity flow
- **R8 Flow equity to high-value pages**: core monetization pages (`mobi-to-epub` / `epub-to-mobi` / `azw3-to-mobi` / `pdf-to-epub`, i.e. GSC high-impression words) should get the most internal links, concentrated via the homepage `TOP_CONVERTERS` + blog CTAs + related components.
- **R9 Hub pages absorb equity**: format-hub guides under `/guide` (e.g. `kindle-formats`, `azw3-vs-mobi`) should be linked back from blogs and convert pages, becoming cluster hubs.

### 1.5 Orphan pages
- **R10 Zero orphans (except index/nav)**: every published page must have ≥1 contextual inbound link from another indexed page.
- **R11 dev/infra posts exempt**: pure technical posts (`rss`, `sitemap-seo-guide`, `webhook`, `env`, etc.) may have low inbound links and don't count as orphan defects.

### 1.6 Broken links & technical norms
- **R12 Zero broken links**: all internal links must resolve to 200; never link to deleted/renamed slugs, never to `-en` legacy copies, never to unlaunched convert pairs (`epub-to-docx` / `mobi-to-azw3` type 404s).
- **R13 Link to canonical URL**: link directly to the canonical, not to a URL that 301-redirects, and not to soft-404 thin pages.
- **R14 Multilingual consistency**: `/es` mirrors `/en` link structure; anchor text and href must not hardcode `/en`; hreflang must cross-reference.

### 1.7 Quantity & quality
- **R15 Avoid link dilution**: forbid "link to all other pages" indiscriminate stacking (the current guide's "More guides" linking 20 other guides is one such case). Related components should pick the Top 3–5 genuinely relevant items.
- **R16 Context > boilerplate**: natural contextual links inside body copy carry more weight than footer links; prefer inserting in body, not only via components.

---

## 2. Three things newcomers must do

### 2.1 Before writing new content
1. Confirm which of the three subsystems it belongs to (Blog / Guide / Convert).
2. Find 1–3 **same-format / same-intent** existing pages, and prepare to naturally interlink them in the body.
3. If it's a Guide, think about which blogs/convert pages should flow equity back to it (R9).

### 2.2 While writing body copy (how to insert links)
- Use real slugs, e.g.: `[Convert EPUB to ZIP](/convert/epub-to-zip)` (**note: CTA uses the `to` path**).
- Write the anchor as the target page's primary keyword, not "click here" / "more".
- Prefer natural appearance **inside body paragraphs**, not all stacked at the end.
- Spanish content mirrors the English structure; links also use `/es/...`, **never hardcode `/en`**.

### 2.3 Pre-publish self-check (must pass)
- [ ] All internal-link targets are real existing slugs (blog/guide/convert), no typos.
- [ ] **No links to unlaunched convert pairs** (common pitfall: `epub-to-docx` should be `epub-to-word`; `mobi-to-azw3` isn't launched).
- [ ] Anchor text is descriptive, no "click here / more / read" generic words.
- [ ] Same-topic pages do **bidirectional backlinks** (A links B, B also links A).
- [ ] No "link to all other same-type pages" stacking (pick Top 3–5 related).
- [ ] Don't force related links onto pure niche pages (R4 allows exceptions); dev/infra posts may have low inbound links (R11).

---

## 3. Most common pitfalls (hard-won list)

| Pitfall | Consequence | Correct approach |
|---|---|---|
| Writing `epub-to-word` as `/convert/epub-to-docx` | 404 broken link (R12) | docx is word, use `/convert/epub-to-word` |
| Linking to `mobi-to-azw3` | that convert pair isn't launched, 404 | use `/convert/mobi-to-epub` or `/convert/azw3-to-mobi` |
| Anchor text "click here" / "more" | wastes anchor equity (R6) | write the target page's primary keyword |
| Guide only links other guides, no backlink to blog/convert | guide excluded from equity flow | guide body links back related blogs + adds "Related blog" component |
| Forcing links onto unrelated niche pages | dilutes relevance (R4) | only link within cluster; don't force unrelated |
| Spanish content hardcodes `/en` links | multilingual inconsistency, wrong hreflang (R14) | Spanish content uses `/es/...` mirroring the structure |

---

## 4. Getting help & re-auditing

- Unsure whether a convert pair is launched: check `src/lib/conversion-map.ts` (`CONVERSION_MAP` is the single source of truth — if it's not there, it's not launched).
- Unsure whether a slug is blog/guide: check `src/data/blog/`, `src/data/guides/`, `src/data/content/` directories respectively.
- After publishing you can re-run the audit script `scripts/_audit_internal_links.mjs` to auto-catch broken links and zero-inbound pages.
- The full audit basis is the root-level `内部链接审计报告-2026-08-08.md`.
