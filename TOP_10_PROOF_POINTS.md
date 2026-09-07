# BookConv Top 10 Proof Points (Upwork-ready Evidence Pack)

> 产出日期：2026-09-07。来源：`events/growth_evidence.csv` 中 44 条候选证据筛选而成。
> 分级标准：A = 可直接对外宣传（口径清晰、前后可比）；B = 可作为案例证据但须保留 caveat；C = 仅内部参考。

| # | Line of business | Classification | Evidence ID | Event date | Before → After |
|---|---|---|---|---|---|
| 1 | GEO — AI Search Visibility | **A** | EV-01 | 2026-08-08 | 0 (2026-07-27~08-07 all zero where prese → 4.0 |
| 2 | GEO — AI Search Visibility | **A** | EV-02 | 2026-08-25 | 38 (2026-08-24) → 147 (2026-08-25) |
| 3 | GEO — Query Intent → Citation Share | **B** | EV-07 | 2026-08-28->2026-09-07 | 6 (share 19.35%) → 52 (share 46.02%) |
| 4 | GEO — Page-level AI Visibility | **B** | EV-09 | 2026-08-28->2026-09-07 | 47 → 519 |
| 5 | GEO — Page-level AI Visibility + Indexing | **B** | EV-10 | 2026-08-28->2026-09-07 | 114 → 304 |
| 6 | Automation — Intent System | **A** | SYSTEM-1 | 2026-08-15 | N/A → 267 questions / 20 clusters / 131 monito |
| 7 | SEO — GSC Query Appearance | **B** | EV-37 | 2026-07-30 | not present before 2026-07-30 → total 72 impressions over 21 sampled day |
| 8 | SEO — Bing Keyword Coverage | **B** | EV-41 | 2026-08-30->2026-09-07 | 119 (2026-08-30) → 233 (2026-09-07) |
| 9 | SEO + GEO — Indexing Velocity | **B** | EV-18 | 2026-08-09 | published 2026-08-09 → discovered 2026-08-09 (lag 0 day(s)) |
| 10 | GEO — Google GenAI First Signal | **C** | EV-42 | 2026-09-05 | no prior GenAI export exists → 10 impressions |

---

## #1 · EV-01 [A]

**Problem**
New site has no AI Search visibility

**Action**
Created and published ebook-conversion-oriented content; monitored Bing AI performance exports weekly

**Evidence**
ai_search/normalized_bing_ai.csv <- AIPerformanceOverviewStats_2026_8_28..9_7.csv

**Result**
Site Bing AI citations grew from 0 to 4 on 2026-08-08 (first non-zero day in the daily series)

**Caveat**
series contains additional zero days (8/10, 8/13, 8/14) - kept as-is

---

## #2 · EV-02 [A]

**Problem**
Bing AI citations need continued growth after first appearance

**Action**
Continued content publication; targeted long-tail conversion queries; tracked AI export weekly

**Evidence**
ai_search/normalized_bing_ai.csv

**Result**
+109 citations on 2026-08-25 (38 → 147, largest single-day jump in the 7-export merged series); peak reached 219 on 2026-09-04

**Caveat**
(none)

---

## #3 · EV-07 [B]

**Problem**
Citation share by query needed to identify high-value intent clusters

**Action**
Exported AISearchQueriesReport across 6 snapshots (Aug 28–Sep 7) and tracked per-query share

**Evidence**
ai_search/normalized_bing_ai.csv <- AISearchQueriesReport_*.csv

**Result**
query 'transfer ebooks between devices' grew citation share from 19.35% (6 citations) to 46.02% (52 citations) — near-doubling of relative AI visibility for a core user-intent cluster

**Caveat**
report is cumulative over its own window; window length not stated in export

---

## #4 · EV-09 [B]

**Problem**
A single content page needs measurable AI visibility growth

**Action**
Published /blog/best-ebook-reader-apps targeting high-volume reader-query intent; tracked via AIPageStatsReport weekly exports

**Evidence**
ai_search/normalized_bing_ai.csv <- AIPageStatsReport_*.csv

**Result**
AI citations grew from 47 to 519 across the same snapshot period (+472) — the highest page-level increase in the dataset

**Caveat**
cumulative window not stated in export

---

## #5 · EV-10 [B]

**Problem**
Another page in a related cluster also showed strong growth

**Action**
Published /blog/sync-reading-across-devices on 2026-08-15; discovered by Bing on the same day; tracked via AIPageStatsReport

**Evidence**
ai_search/normalized_bing_ai.csv <- AIPageStatsReport_*.csv

**Result**
AI citations grew from 114 to 304 across the snapshot period (+190); publish-to-discovery lag 0 days

**Caveat**
cumulative window not stated in export

---

## #6 · SYSTEM-1 [A]

**Problem**
No systematic way to connect user intent to content output to AI visibility

**Action**
Built User Intent System (geo-intent-system): 267 questions, 20 clusters, 131 active monitors, 18 briefs, 129 recorded citations (cited / brand_only / not_found three-state)

**Evidence**
user_intent/table_questions.csv, normalized_monitors.csv, normalized_citations.csv

**Result**
Full closed-loop record from intent discovery → brief → publication → monitored AI result; 267 structured questions and 131 weekly monitors documented with evidence traceability

**Caveat**
(none)

---

## #7 · EV-37 [B]

**Problem**
New site needs organic search queries to appear in GSC over time

**Action**
Published blog and convert pages; submitted sitemap via IndexNow; monitored GSC API daily query×date snapshots

**Evidence**
google/normalized_google_search.csv <- _gsc_query_daily_2026-09-03/04.json

**Result**
query 'mobi to epub' appeared first on 2026-07-30; accumulated 72 impressions across 21 sampled days with peak 11 on 2026-08-13

**Caveat**
GSC API sampling + only 2 pull snapshots; days without rows omitted

---

## #8 · EV-41 [B]

**Problem**
Bing visibility needs broadening beyond a few keywords

**Action**
Continued content creation; tracked Bing KeywordReport exports periodically

**Evidence**
bing/normalized_bing_search.csv <- KeywordReport_2026_8_30/9_3/9_7.csv

**Result**
Unique queries recorded in Bing KeywordReport grew from 119 (2026-08-30 snapshot) to 233 (2026-09-07 snapshot), +114 covering queries

**Caveat**
cumulative window not stated in export

---

## #9 · EV-18 [B]

**Problem**
Fast indexing is critical for new content to be discoverable by both search engines and AI crawlers

**Action**
Published multi-page batch on 2026-08-24/25 (epub-to-docx, epub-to-text, etc.); used IndexNow for proactive URL submission

**Evidence**
content/normalized_content.csv + bing/normalized_bing_url_index_state.csv

**Result**
17 pages showed publish→Bing discovery lag ≤ 1 day; earliest example: /blog/epub-vs-mobi published and discovered on the same day (2026-08-09)

**Caveat**
(none)

---

## #10 · EV-42 [C]

**Problem**
Site needed Google Generative AI Features visibility as a signal of emerging AI Search presence

**Action**
Launched content targeting reader/conversion intent; monitored GSC 'Generative AI Features' export when available

**Evidence**
google/normalized_google_search.csv <- Performance-on-Search-Generative-AI-Features-2026-09-05/网页.csv

**Result**
Single point on 2026-09-05 showed /es/blog/azw3-vs-mobi with 10 impressions in the GSC GenAI export — first observable proof that the site appears in Google's AI answer layer

**Caveat**
single time point; no trend provable

---

## 使用说明

- **Proposal**：调用单个 A 级证据（Problem→Evidence→Result 三段式）。
- **Portfolio**：组合 2–3 个相关证据展示系统能力。
- **Profile headline**：引用单条最强 A 级结果（#2 或 #5）。
- **C 级证据**：仅供内部案例库，不建议写入对外文案。
- 所有证据的完整字段（含 before/after/delta/source_files/caveat）见 `TOP_10_PROOF_POINTS.csv`。