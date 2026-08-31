# bookconv.com Content Generation Standards

> Consolidated from real-world practice and existing docs as the unified standard for content production (blog / guides / conversion pages) and the onboarding reference for new contributors.
> Last updated: 2026-08-09 | Maintained in sync with `英文博客写作指南.md`, `内部链接审计报告-2026-08-08.md`, and `scripts/seo-critic.mjs`.

## Authoritative Sources

| Topic | Source |
|---|---|
| Writing / SEO / GEO / De-AI | `英文博客写作指南.md` (v1.0) |
| Internal-link rules v1 (16 rules) | `内部链接审计报告-2026-08-08.md` + `src/lib/internal-links.ts` |
| Submission gate | `scripts/seo-critic.mjs` + `scripts/code-critic.mjs` |
| Rendering capabilities | `src/data/blog/types.ts` (blog) / `src/app/[locale]/convert/[slug]/ToolPageClient.tsx` (conversion pages) |

---

## 1. Content System Architecture (Single Source of Truth)

Three isomorphic subsystems. Lists / sitemap / RSS are all auto-derived. **Register new content in exactly one place:**

| Subsystem | Data directory | Registration entry | Detail page | Current size |
|---|---|---|---|---|
| Blog | `src/data/blog/*.ts` | `posts[]` | `[locale]/blog/[slug]` | 36 |
| Guide | `src/data/guides/*.ts` | `all[]` | `[locale]/guide/[slug]` | 21 |
| Convert | `src/data/content/*.ts` | `CONVERSION_MAP` | `[locale]/convert/[slug]` | 30 |

- Global nav lives in root `src/app/layout.tsx` (Home / Pricing / **Convert** / **Guide** / Blog + LocaleSwitcher / LoginButton); the home page must also expose `/blog` and `/guide` entries.
- Scale snapshot (2026-08-09): 36 blog + 21 guide + 30 convert = 87 content pages.

## 2. Content Strategy Baseline

- **One page = one long-tail keyword, start with small keywords**; before building a new page, **verify the backend can actually convert** (prevent soft-404 ghost pages).
- **One page absorbs a whole cluster** (merge same-intent keyword variants into a single page): comparison / choice / question variants (X vs Y / X or Y / does X work) **merge into the strongest keyword's page**. Do NOT build a separate page per variant (content duplication + authority dilution). See `docs/content/一页吃整簇策略.md` for criteria and validation.
- When a gap keyword's combined impressions are very small, **do not spin up a new page** — prioritize deepening already-indexed pages + backlinks (positions 60–80 are a domain-authority problem; on-page optimization ceiling is ~30–40; reaching the first page depends on backlinks).

## 3. Writing Standards (Body)

- **All English** (hard constraint); body convention is to **avoid backticks** (keep pure prose; use `**bold**` for emphasis).
- **Use real slugs for internal links** — never hand-write dead URLs.
- Exactly **one H1 per page**; H1 → H2 → H3 without skipping levels.
- **Key Takeaways required** (3–6 extractable bullets, GEO-friendly).
- **FAQ uses the structured `faqs` field** (`BlogFaq` type) → auto-emits `FAQPage` JSON-LD; **do NOT put prose FAQ sections in body `sections`**.
- **Renderer capabilities (verified)**: both blog and conversion pages support **bold / italic / inline-code / links / H2–H3 / lists / tables**; **neither supports fenced code blocks**.
- **Citability (GEO)**: concrete numbers + named sources (research / organization / expert) + dates; name entities explicitly (e.g. "ISBN", "FDA", "Calibre").
- **De-AI** (must pass before publish): remove `leverage / utilize / delve / landscape / realm / facilitate / robust / comprehensive / cutting-edge / game-changer / navigate` and filler like "in today's world" / "it is important to note"; vary sentence and paragraph length; add abbreviations, dashes, rhetorical questions; read it aloud — it should sound human.

## 4. Internal-Link Standards (must use helper, never hand-write URL)

All internal links go through helpers in `src/lib/internal-links.ts` to guarantee real slugs, relevance scoring, and dilution control:

| Scenario | Call |
|---|---|
| Blog ↔ blog | `getRelatedPosts(slug, 3)` |
| Convert → blog | `getRelatedBlogPostsForConversion(src, tgt, 3)` |
| Convert → guide | `getRelatedGuidesForConversion(src, tgt, 3)` |
| Blog → guide | `getRelatedGuidesForBlogPost(slug, 3)` |
| Guide → blog | `getRelatedBlogPostsForGuide(formats, tags, 3)` |
| Guide ↔ guide | `getRelatedGuides(slug, 5)` (top 5 only, prevent R15 dilution) |

- **Triangular loop**: blog ↔ guide ↔ convert interlink; dev/infra posts (e.g. `sitemap-seo-guide`) do not enter "related guides".
- Anchor text has zero generic words (R6 compliant).

## 5. SEO / Technical Standards

- Canonical domain `www.bookconv.com`; GSC uses the domain property `sc-domain:bookconv.com`.
- **canonical**: `locale === 'es' ? '/es' : ''`, **never** `${'/' + locale}`; emitted only by per-page `generateMetadata`, not by root layout.
- **Title template** auto-appends `| BookConv`; per-page title **does not carry its own suffix**; after changes, `curl` to verify `<title>`.
- **localePrefix as-needed**: English has no prefix, Spanish is `/es`; middleware 301-redirects `/en/*` to no-prefix → **hreflang / canonical / alternates must NEVER hardcode `/en`** (historical incident).
- Home = `[locale]/page.tsx`, **no** root `src/app/page.tsx`; **do NOT place `.mdx` files under `src/app/**`** (500 error).
- sitemap auto-derived; `public/llms.txt` is hand-written → after every addition run the **three-number consistency check** (sitemap / llms.txt / list pages).

## 6. GEO Standards

- `public/llms.txt` **in full**: blog count == registered blog count; convert count == `CONVERSION_MAP`; guide count == `getAllGuides()`.
- `robots.txt` allows AI crawlers `GPTBot / ClaudeBot / CCBot`, etc.
- Blog `faqs` emit `FAQPage` JSON-LD; add structured data for `Organization.areaServed / availableLanguage` and `WebSite.inLanguage`.
- Key Takeaways + FAQ are **required blocks** (core GEO extraction targets).

## 7. Registration & Sync Rules

- New guide, three steps: write data → register in `index.ts` → the Guides count in `public/llms.txt` must equal `getAllGuides()`.
- New blog / convert follows the same `index.ts` path, and `llms.txt` stays in sync; `seo-critic.mjs` blocks "registration not converged / llms.txt out of sync".

## 8. i18n Standards

- Bilingual via **next-intl v4**: server uses `getTranslations`, client uses `useTranslations`; `messages/en.json` and `es.json` **add same-named keys in sync** (missing translation → seo-critic warns).
- Blog Spanish uses the `BlogPostLocalized.es` field; all UI copy goes through messages, never hardcoded.

## 9. CTA URL Rule

- Write **`/convert/{src}-to-{tgt}`** (with `to`), **not** the `CONVERSION_MAP` key `{src}-{tgt}`; missing `to` → 500.

## 10. Quality Gate (run before submit)

- `node scripts/seo-critic.mjs`: **exit code 1 = gate failure**. Checks: blog/guide registration convergence, llms.txt sync, internal dead links, ES key alignment, hreflang wrongly pointing to `/en`.
- `node scripts/code-critic.mjs`: dup-block / stray-root / `.mdx` in app dir (CRITICAL) / stray scripts.
- `tsc --noEmit` 0 errors + `next build --webpack` (Windows requires `--webpack`; if the safe-delete shim blocks deletion use `NODE_OPTIONS="--use-system-ca" npx next build --webpack`).
- After deploy, `curl` to verify key pages (including `<title>`, canonical).

## 11. Known Pitfalls / No-Go Zones

- Ghost-page soft-404 (fixed via `CONVERSION_MAP` derivation + `dynamicParams=false` + `notFound()`); `/api/health` hitting Redis timeout is known noise.
- Dead config `next-sitemap.config.js` (no dependency, no postbuild; sitemap driven by `sitemap.ts`, can be cleaned up).
- File-size copy must align to **10 / 50 / 100** (free 10 / Pro 50 / API 100); do not make unverified claims that contradict the real backend limit (`MAX_FILE_SIZE=10MB`).
- **Next.js has breaking changes** (AGENTS.md): read `node_modules/next/dist/docs/` before coding.

---

## Appendix: New-Contributor Self-Check List

**Before writing**
- [ ] Keyword / intent / competitors confirmed; backend can actually convert (conversion pages)
- [ ] Internal-link plan drafted (blog ↔ guide ↔ convert triangle) and `faqs` (FAQPage JSON-LD)
- [ ] Key Takeaways and 5–7 FAQs planned

**While writing**
- [ ] All English, no backticks; single H1, no skipped levels
- [ ] Internal links via `internal-links.ts` helper (no hand-written URLs)
- [ ] CTA uses `/convert/{src}-to-{tgt}`
- [ ] De-AI: remove filler, vary length, sound human

**Before publishing**
- [ ] Data registered in `index.ts`; `llms.txt` three-number consistency holds
- [ ] `messages/en.json` and `es.json` share keys (if UI copy involved)
- [ ] `node scripts/seo-critic.mjs` exit code 0; `node scripts/code-critic.mjs` no CRITICAL
- [ ] `tsc --noEmit` + `next build --webpack` pass
- [ ] After deploy, `curl` verifies `<title>` / canonical / key assertions
