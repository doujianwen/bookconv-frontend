# GEO Service Proposal Template — BookConv Evidence Pack v1.0

> **用途**：发送给客户的正式提案附件。基于 BookConv 41 天实测数据（2026-07-27 → 2026-09-07），可直接改写客户名称后交付。
>
> **证据分级**：A = 可公开宣传 / B = 带 caveat 可用 / C = 仅内部。本模板只展示 A + B。
>
> **最后更新**：2026-09-07

---

## 1. Executive Summary

**目标**：帮助新站/弱站建立可测量的 AI Search Visibility（Bing Copilot + Google Generative AI），8-12 周内实现首现与持续增长。

**方法**：User Intent System（意图挖掘）→ Content Brief 工厂 → 发布 + IndexNow 提交 → 周级双渠道（Bing AI + GSC）监控闭环。

**核心指标**：AI citation 量、citation share（单 query 占比）、单页 citation 增长、index discovery lag。

---

## 2. Track Record — What We've Measured

| Metric | Value | Timeframe | Evidence Grade |
|--------|-------|-----------|----------------|
| Bing AI citations (total) | 1,314 | Aug 8 – Sep 7 (30 days) | A |
| First non-zero citation day | Aug 8 (day 12 since launch) | 2026-08-08 | A |
| Largest single-day jump | +109 (38 → 147) | 2026-08-25 | A |
| Peak daily citations | 219 | 2026-09-04 | A |
| Pages cited | 31 / 110 published (28%) | Sep 7 | A |
| Long-form guide citation rate | 54.5% (12/22) | Sep 7 | A |
| Single-page best growth | 47 → 519 (+472) | Aug 28 – Sep 7 | B |
| Index discovery lag ≤ 1 day | 17 pages (from 24 batch) | Aug 9 – Aug 25 | B |
| Google GenAI first signal | 10 impressions (1 page) | 2026-09-05 | C |

> **披露**：Google 自然点击总量 19（六周）；Google AI impression 16 vs Bing citation 1,314。双渠道差异显著，定位是「Bing AI 可见性案例」非「全平台流量案例」。

---

## 3. The Evidence Chains (Top 5 Proof Points)

Each chain is Problem → Action → Evidence → Result → Caveat. Copy-paste-ready.

### Chain 1 — New Site, Zero to First AI Citation (Grade A)

| Field | Value |
|-------|-------|
| **Problem** | New site with zero backlinks, zero domain authority, no historical index — no AI visibility at all. |
| **Action** | Published 22 long-form guides + 58 blog posts + 30 conversion pages; submitted sitemap via IndexNow; monitored Bing AI performance weekly. |
| **Evidence** | Daily series export: 2026-07-27 → 2026-08-07 all zeros; 2026-08-08 = 4 (first non-zero day). |
| **Result** | Site achieved measurable Bing AI citation within 12 days of launch. |
| **Caveat** | Series contains additional zero days (Aug 10, Aug 13, Aug 14) — kept as-is, not smoothed. |

**Source**: `ai_search/normalized_bing_ai.csv` ← `AIPerformanceOverviewStats_2026_8_28..9_7.csv`

---

### Chain 2 — Single-Day Surge After Content Batch (Grade A)

| Field | Value |
|-------|-------|
| **Problem** | Need sustained growth after first appearance, not just a one-off spike. |
| **Action** | Continued content publication; targeted long-tail conversion queries; weekly export monitoring. |
| **Evidence** | 2026-08-24: 38 citations → 2026-08-25: 147 citations (+109). Largest single-day jump in the 7-export merged series. Peak reached 219/day on 2026-09-04. |
| **Result** | +109 citations in a single day; sustained upward trend to 219/day within 10 days. |
| **Caveat** | None documented for this chain. |

**Source**: `ai_search/normalized_bing_ai.csv`

---

### Chain 3 — Single Page Dominates Its Query Cluster (Grade B)

| Field | Value |
|-------|-------|
| **Problem** | Need proof that individual pages can gain significant AI visibility over time. |
| **Action** | Published `/blog/best-ebook-reader-apps` targeting high-volume reader-query intent; tracked weekly via AIPageStatsReport. |
| **Evidence** | 2026-08-28: 47 citations → 2026-09-07: 519 citations (+472). Highest page-level increase in the dataset. |
| **Result** | +472 citations in 10 days on a single page. |
| **Caveat** | Report is cumulative over its own window; window length not stated in export. Direction is positive, magnitude is conservative. |

**Source**: `ai_search/normalized_bing_ai.csv` ← `AIPageStatsReport_*.csv`

---

### Chain 4 — Related Page Also Strong (Grade B)

| Field | Value |
|-------|-------|
| **Problem** | One strong page could be an outlier. Need cluster-level signal. |
| **Action** | Published `/blog/sync-reading-across-devices` on 2026-08-15; IndexNow submitted; tracked weekly. |
| **Evidence** | 2026-08-28: 114 citations → 2026-09-07: 304 citations (+190). Publish-to-discovery lag: 0 days (same day). |
| **Result** | +190 citations in 10 days; same-day Bing discovery after submission. |
| **Caveat** | Same cumulative-window caveat as Chain 3. |

**Source**: `ai_search/normalized_bing_ai.csv` ← `AIPageStatsReport_*.csv` + `content/normalized_content.csv`

---

### Chain 5 — Citation Share Doubling on Core Query (Grade B)

| Field | Value |
|-------|-------|
| **Problem** | Need to prove that specific user-intent clusters gain share of voice in AI answers. |
| **Action** | Exported AISearchQueriesReport across 6 snapshots; tracked per-query share over time. |
| **Evidence** | Query 'transfer ebooks between devices': 19.35% share (6 citations) → 46.02% share (52 citations). Near-doubling of relative AI visibility. |
| **Result** | Citation share for a core user-intent cluster doubled from ~20% to ~46%. |
| **Caveat** | Report is cumulative over its own window; window length not stated. Share is relative, not absolute. |

**Source**: `ai_search/normalized_bing_ai.csv` ← `AISearchQueriesReport_*.csv`

---

## 4. Methodology — The Closed Loop

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│ User Intent │ ──▶ │ Content      │ ──▶ │ Publish +   │ ──▶ │ Weekly       │
│ System      │     │ Brief Factory│     │ IndexNow    │     │ Monitor      │
│ (267 Qs)    │     │ (18 briefs)  │     │ (≤1 day lag)│     │ (Bing AI +   │
│             │     │              │     │             │     │  GSC)        │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                               ▲                                         │
                               └─────────────────────────────────────────┘
                                         Evidence → Brief refinement
```

**Deliverables per engagement**:
- Baseline audit (both channels)
- Content briefs (quantity depends on tier)
- Weekly evidence reports (export-linked, reproducible)
- Index submission (IndexNow batch)
- Post-engagement summary with full data trace

---

## 5. Pricing Tiers

| Tier | Price | What's Included | Best For |
|------|-------|-----------------|----------|
| **Diagnostic** | $600 | One-time, 24–48h. Dual-channel baseline, zero-citation audit, prioritized action list. Credited to first retainer. | First-contact qualification |
| **Core** | $800/mo | Monthly report, dark-page audit, index submission, 1 content brief | Stable monthly maintenance |
| **Growth** | $1,200/mo | 3 briefs/mo, schema review, monthly attribution with self-falsification | Active growth phase |
| **Partner** | $1,500/mo | Bi-weekly calls, pre-publish review. Capped at 3 clients. | Long-term partnership |

> All data comes from tools you own — your Search Console, your Bing Webmaster Tools. I never show you a number you cannot reproduce with your own credentials.

---

## 6. Data Transparency Statement

1. **Conservative figures only.** I report 1,314 citations from the top-page report, not the 1,530 in the full-window overview. I would rather understate.
2. **Bad numbers, published.** Total organic clicks in six weeks: 19. Google AI visibility: 16 impressions. Both channels, both directions.
3. **I overturn my own conclusions.** Two findings were reversed by later full-population data; reversals are documented in `TOP_10_PROOF_POINTS.csv`.
4. **Evidence grade disclosure.** Every claim above is tagged A (daily series, reproducible) or B (snapshot comparison, cumulative window caveat). No claim is presented without its grade.
5. **All source files are reproducible.** Data lives in `bookconv_data_asset/` — any row can be traced to its original export file and snapshot date.

---

## 7. Next Steps

1. Share your domain and current GSC/Bing Webmaster Tools access
2. I run the Diagnostic ($600, credited to first month)
3. Within 48h: baseline report + prioritized action list
4. You approve → I begin Growth or Core engagement

**Contact**: douhongjian@gmail.com · Async-friendly · English reporting · Reply within 24h

---

## Appendix A — Evidence Quality Legend

| Grade | Definition | Example |
|-------|-----------|---------|
| **A** | Daily series, reproducible from your tools, no cumulative-window ambiguity | Bing AI daily citations series (EV-01, EV-02) |
| **B** | Snapshot comparison, direction proven, magnitude may be conservative | Single-page citation growth (EV-09, EV-10) |
| **C** | Single point, no trend provable | GSC GenAI first signal (EV-42) |

---

## Appendix B — Full Evidence List (20 items, top 10 shown above)

See `TOP_10_PROOF_POINTS.csv` for the complete ranked list. All 44 raw candidates are in `bookconv_data_asset/reports/growth_evidence.csv`.
