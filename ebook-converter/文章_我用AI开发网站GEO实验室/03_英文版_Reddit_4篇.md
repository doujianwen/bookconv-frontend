# I Used AI to Build a Website, and Turned It Into a GEO Lab — Reddit Series (4 Parts)

> **发布前自检（发之前对照）：** 正文零链接 / 零裸域名 / 每篇结尾问句 / 显式点出 AI 三段 / 数字取自真实 GSC 8/16 快照 / 不编造 AI 引用。

---

# Part 1 — I let an AI build my website

I'm a solo developer. About three weeks ago I started an ebook format converter — supports EPUB, AZW3, MOBI, PDF and 28+ other formats. Nothing revolutionary as a product. What's interesting is *how* it got built: almost entirely by me and an AI working together, and I deliberately turned it into a lab for something I'd been wanting to test — GEO, Generative Engine Optimization (the SEO-equivalent for getting cited by ChatGPT/Claude/Perplexity/Gemini instead of just ranking on Google).

This isn't a "I used AI and 10x'd my revenue" post. It's a build log. Including the part where, three weeks in, I have 0 clicks and 0 confirmed AI citations. I think that's more useful to read than another hype post.

**The stack.** Next.js 16 + React 19 + Tailwind v4 + next-intl (bilingual, English + Spanish). The conversion engine is *supposed* to be Calibre's `ebook-convert`, but here's the catch — Calibre doesn't exist on Vercel's serverless runtime. So EPUB→TXT and EPUB→ZIP are pure JS, and the rest fall back to a CloudConvert API. The AI happily wrote code that assumed Calibre was available. It wasn't.

One detail that saved me repeatedly: I put a line at the top of my AGENTS.md that says **"This is NOT the Next.js you know."** Next.js 16 is a breaking release — the APIs don't match what's in the AI's training data (Next 14/15). Without that warning the AI kept writing outdated patterns.

**Scale.** 30 conversion pages + 36 blog posts + 20 guides ≈ 87 pages, 185 editorial internal links. All AI-drafted, all human-reviewed by me.

**The workflow.** I use an autonomous agent framework. Each task opens an issue, and the AI reads the requirement, edits code, runs validation, and closes the issue itself. To keep it honest I built **three critic gates**, each a hard CI fail (exit 1):

1. `seo-critic` — blog post registered? llms.txt in sync? dead links? Spanish i18n keys present? hreflang correct?
2. `code-critic` — duplicate code blocks, stray .mdx files that shouldn't exist.
3. `conversion-verifier` — validates the *output* file: magic bytes, content loss, garbled text, missing images. CRITICAL = one-strike veto.

I later added a fourth, `git-sync-check`, because of a deployment accident I'll cover in part 2.

**The division of labor.** The AI writes code, writes content, runs ops audits, writes data-analysis scripts, even drafts my daily social posts. My job is mostly *review and decide* — every line that goes to prod gets read by me, every architecture call is mine, every "did this actually deploy" check is mine.

That last part sounds trivial. It isn't. In part 2 I'll walk through six real failures the AI caused — including one that froze my Google indexing for a week and another where the deployment target pointed at the wrong repo entirely.

For now, a question for fellow solo builders: when you let an AI drive an autonomous agent loop, what's your guardrail for catching the "it runs but it's wrong" failures — the ones that don't throw?

> **Key takeaway from Part 1:** The AI didn't fail at coding — it succeeded at coding things that *look* right but run in the wrong environment. Your job isn't prompting; it's knowing your runtime constraints (Vercel has no Calibre) and writing guardrails (critic gates + explicit version warnings) that catch those mismatches.

*(Part 2 — the failures — next.)*

---

# Part 2 — Where the AI screwed up

Part 1 was the happy path. This is the part that actually teaches you something. Six real failures, each told as **what the AI did → where it screwed up → how I fixed it**.

**1. Production 100% 500, site dead.**
The AI designed a "proper" architecture: BullMQ + Redis + a Worker queue. Looked professional. On Vercel, every conversion request 504'd. Root cause: BullMQ's `maxRetriesPerRequest: null` makes the Promise never resolve in a serverless context. *Fix:* I ripped out the queue, extracted a `conversion.ts`, and ran the conversion synchronously inside the request (maxDuration=60s). A utility site does not need a queue. The AI optimized for "looks like a real backend" instead of "fits the runtime."

**2. Fixed #1, still 500.**
Synchronous version up, EPUB→PDF still broken. Because Calibre isn't on Vercel (see part 1) and I'd forgotten to set `CLOUD_CONVERT_API_KEY` in the Vercel dashboard. *Fix:* set the key, redeploy, EPUB→PDF returns `%PDF-1.4`. Alive. Lesson: the AI's code assumed an environment that didn't exist, and the error wasn't obvious.

**3. Ghost pages / soft-404 — froze my indexing for a week.**
27 conversion pages silently rendered the default template. The content data was a module namespace object, and the page did `contentData.content` without unpacking — so it tried to render an object as a string. Worse, invalid slugs didn't 404; Google treated them as soft-404 and **froze my indexing for a full week**. *Fix:* `dynamicParams=false` + `notFound()`, and made sitemap + generateStaticParams derive from the same CONTENT_MAP. This was the most painful one. AI code that "runs" isn't code that's "correct," and SEO silent failures are the deadliest because nothing throws.

**4. The deployment target pointed at the wrong repo (still not closed).**
This is the dramatic one. My Vercel project's Git connection pointed at an *old* repo, while my real code lives in a *different* repo — two independent GitHub repos. Consequence: pushing to the correct repo triggered no Vercel build, and if anyone hit Redeploy in the dashboard, Vercel would pull a stale July snapshot and **overwrite the Pro-subscription bug fix I'd just shipped**. *Fix:* I can trigger one-off deploys with a project-level token, but I can't change the Git association without human access to the Vercel dashboard. This is a hole the AI cannot close on its own.

**5. The Pro gate was permanently locked.**
After launching paid subscriptions, Pro users couldn't unlock the batch feature. Root cause: a string comparison. My env var held `v_1947491` (with a `v_` prefix); the payment webhook actually sent the integer `1947491`. They're never equal, so the subscription saved fine but `getPlanByEmail` always returned "free." *Fix:* a single `normalizeVariantId` function that strips the prefix on both sides, plus an end-to-end check script that runs 8/8 green in production. The scary part: this bug never errors. It just silently makes you think the feature works.

**6. "I pushed it" — except I didn't.**
On Windows, `git rev-list HEAD..origin/main` reported `behind=0`, so I assumed I was synced. In reality the remote was an orphan branch from July 26 with no shared history. `behind=0` was a lie. *Fix:* tagged a backup, force-pushed to correct it, and made a hard rule: after every push, run `git ls-remote origin main` and compare the real remote SHA to local HEAD. Never trust `behind=0`. This became my fourth critic gate, `git-sync-check`.

The meta-lesson across all six: **the AI's failures cluster around silent correctness** — string-vs-int, wrong repo, orphan branch, soft-404. None of them throw. They just quietly make you wrong. If you're building with an autonomous agent, your real job isn't prompting — it's building the tripwires that catch "runs but wrong."

> **Key takeaway from Part 2:** Every one of these bugs was *silent* — no error message, no crash, just "it works but the result is wrong." The common pattern: the AI assumed an environment or data type that didn't exist. Your defense isn't better prompting; it's test coverage + deploy verification + always checking the output file, not just the HTTP status code.

Part 3 flips from failures to the actual experiment: I turned this site into a GEO lab. Question for the room: which of these failure modes have bitten you — the silent ones, or the loud ones?

*(Part 3 — the GEO lab setup — next.)*

---

# Part 3 — I turned it into a GEO lab

GEO = Generative Engine Optimization. Quick framing: SEO competes for a *position* in search results; GEO competes for a *cited snippet* inside an AI answer (ChatGPT, Claude, Perplexity, Gemini). Different game, different signals.

I wanted to test one question on a brand-new site: **if I max out the GEO infrastructure, will AI engines actually cite me?** Here's what I built — presented as a comparison to show the gap between SEO and GEO thinking:

| Layer | SEO does this | GEO does this |
|---|---|---|
| Who you target | Google's crawler | AI models' training pipeline |
| Key file | `sitemap.xml` | `llms.txt` (AI-readable index) |
| Permission | `robots.txt` → Googlebot | `robots.txt` → GPTBot, ClaudeBot, PerplexityBot, etc. |
| Structure | JSON-LD for rich snippets | JSON-LD + **visible** structured HTML (FAQs, tables) |
| Content strategy | Rank for keywords | Write **quotable sentences** (numbers + sources + years) |
| Trust signals | E-E-A-T through backlinks | Explicit trust statements + security FAQ |

This is the core difference: SEO optimizes for a crawler that reads your HTML. GEO optimizes for an AI that reads your HTML *and* your llms.txt *and* your structured data — and then decides whether to cite you in its answer.

Here's the detailed breakdown of what I actually implemented:

**1. `llms.txt` — an index for machines.**
A plain-text file at the site root that lists everything: 30 conversion pages, ~50 blog/guide entries, all as absolute URLs, plus a trust statement (no signup, HTTPS, auto-delete within 1 hour, no DRM, no watermarks). The pitfall: `llms.txt` is a *static* file — it doesn't auto-update when I add a page. I once had sitemap and llms.txt counts diverge after publishing new posts. Hard rule now: sitemap is auto-generated, llms.txt is manual, and every new page must keep three counts (sitemap / llms.txt / listing page) identical.

**2. `robots.txt` — explicitly allow the AI crawlers.**
GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, cohere-ai, AI2Bot — all `Allow: /`. Only `/api/`, `/auth/`, `/_next/` are disallowed.

**3. Page-level structured data.**
Each of the 30 conversion pages emits a JSON-LD `@graph` with six types: BreadcrumbList, HowTo, WebPage, Article, SoftwareApplication, FAQPage. I also added a *security-trust fallback*: if a page's custom FAQs don't mention security/privacy, I force-inject a "Is my file safe?" FAQ so the trust signal is always present.

**4. Quotable content.**
Blog prose is deliberately written as "quotable sentences" — concrete numbers, named sources, years. FAQs use a structured field, not prose "Q:/A:". The goal is to hand the AI a ready-made citation.

**The reversal that mattered most.** I assumed JSON-LD was the backbone of GEO. Then I caught Gemini *not seeing* the JSON-LD I'd already shipped, and suggesting I "add JSON-LD." That told me: **JSON-LD is not the main carrier of GEO signal.** The visible, structured HTML is — direct-answer blocks, visible FAQ text, comparison tables. JSON-LD is an enhancement layer, not the foundation. If you're doing GEO and only shipping schema, you're probably under-building.

So the infrastructure is done. The honest part — did any of it work? — is part 4. Question for the SEO folks: are you seeing AI engines actually *respect* JSON-LD, or are they mostly reading the visible HTML like I found?

> **Key takeaway from Part 3:** GEO isn't about schema markup — it's about making your content *quotable*. The most important thing you can do is write sentences with concrete numbers, named sources, and years that an AI can copy-paste directly into its answer. JSON-LD is nice-to-have; visible structured HTML is essential. And llms.txt is mandatory if you want to be found — but it won't auto-update, so you have to maintain it manually.

*(Part 4 — the honest numbers — next.)*

---

# Part 4 — The honest numbers

Three weeks of real data from Google Search Console (as of August 16):

| Metric | Value | Meaning |
|---|---:|---|
| Ranked keywords (cumulative) | **250** | Google indexed and showing your content |
| Impressions in window | **1,266** | Times users saw your result |
| Clicks | **0** | ⚠️ Nobody clicked |
| CTR | **0.0%** | 100% drop-off from impression to visit |
| Weighted avg position | **48.7** | Most keywords on page 5+ |

### Keyword growth curve (7/26 → 8/14, 20 days)

| Phase | Dates | Cumulative change | Key event |
|---|---|---:|---|
| Slow start | Jul 26 – Aug 7 | 3 → 79 (+2,533%) | AI generates content, Google slowly indexes |
| Acceleration | Aug 8 – Aug 11 | 90 → 162 (+80%) | Batch blog/guide launch, +40/day |
| Explosion | Aug 12 – Aug 14 | 204 → 250 (+22%) | Homepage backlink round + GSC latency catch-up |

> *Source: GSC API, `query` dimension deduped union. 0 clicks throughout, but keyword count kept growing.*

**Two switches drive growth:**
- **Publish content** → expands keyword coverage (3 to 250)
- **Build backlinks** → pushes existing keywords higher (#69 toward #10)

The two jumps in the curve map exactly to these two actions.

### Top 16 high-impression queries (all 0 clicks)

| Query | Impressions | Known position | Clicks |
|---|---:|---:|---:|
| `mobi to epub` | 50 | — | 0 |
| `azw3 vs mobi` | 33 | #10.24 | 0 |
| `convert mobi to epub` | 19 | — | 0 |
| `epub to zip` | 18 | — | 0 |
| `lit to epub` | 17 | — | 0 |
| `mobi vs azw3` | 17 | #8.31 | 0 |
| `epub to txt` | 14 | — | 0 |
| `epub to azw3` | 14 | — | 0 |
| `mobi epub` | 9 | — | 0 |
| `mobi to epub converter` | 9 | — | 0 |
| `epub para doc` | 9 | — | 0 |
| `ebook converter` | 8 | — | 0 |
| `azw3 to mobi` | 7 | — | 0 |
| `docx to epub` | 7 | — | 0 |
| `azw3` | 7 | — | 0 |
| `kFX to epub` | 6 | — | 0 |

> **These 16 queries eat most impressions but convert zero.** They're the "only pool that can generate clicks" — raising CTR from 0 to just 2–5% here would immediately break the zero-click streak.

### Spanish surprise

| Page | Language | Impressions | Position |
|---|---|---:|---:|
| `/es/blog/azw3-vs-mobi` | Spanish | **117** | **14.34** |
| `/blog/azw3-vs-mobi` | English | 2 | — |

Spanish version beat English 58x! I didn't expect this — **don't just focus on your main language, lower-competition languages can rank faster**.

Now the honest part — the two zeros:

**Zero clicks.** 16 keywords are already in the top 20 (83 combined impressions) and I still have zero clicks. The bottleneck isn't ranking; it's the title and meta description CTR. Next move: richer rich results and better copy. A page ranking well with no clicks is a copywriting problem, not an SEO problem.

**Zero confirmed AI citations.** I ran a baseline test: 28 high-intent queries through Brave's API, 280 results total. My site was cited **0 times (0%)**. Competitors occupied 29%. I then tried to probe Gemini (grounding) and OpenAI (web_search) directly, but free-tier quotas ran out before I got clean data. So the only honest statement I can make is "infrastructure is in place, monitoring ongoing." I will **not** say "an AI engine recommended me," because I can't prove it. That's the lab posture: record, hypothesize, verify, don't oversell.

**What's next.** Fix the CTR/title problem, chase rich results, and — the real lever for a new site — build backlinks. Position 60–80 on a new domain is an *authority* problem, not a page problem; on-page optimization has a ceiling around position 30–40, and the front page requires links. I'll also re-run the AI-citation probes once quotas reset, because that's the actual experiment.

**Why I'm writing all this up.** This site isn't just a product to me — it's the real case study behind an AI-assisted development course I'm building. I'm not selling it on "look at my revenue." I'm selling it on "look at how many holes I fell into and how I climbed out," because that's what people who actually want to build with AI need to see. The honest lab report *is* the marketing.

Question to close: if you've run a GEO experiment on a new site, how long did it take before you saw your first confirmed AI citation — and how did you even measure it?

> **Key takeaway from Part 4:** 1,266 impressions with 0 clicks means people *see* your site in search but aren't convinced by the title/description to click. That's a copywriting problem, not an SEO problem. And zero AI citations yet doesn't mean GEO failed — it means the infrastructure is built and the real test hasn't had time to compound. The experiment is still running; report back when there's data.

*(End of series. Happy to go deeper on any part in the comments.)*
