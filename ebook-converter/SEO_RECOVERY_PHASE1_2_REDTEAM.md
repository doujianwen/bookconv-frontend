# Phase 1.2 Red Team（SEO_RECOVERY_PHASE1_2_REDTEAM）

> 阶段: Phase 1.2 · 攻击常见假设
> 每项标记: FACT / ASSUMPTION / UNKNOWN / VALIDATION

## H1: Search Volume = True Demand

| 项目 | 内容 |
|---|---|
| **假设** | Search Volume 高 = 有真实需求 |
| **裁决** | **ASSUMPTION** |
| **证据** | constants.ts 无 fetchedAt；注释自述虚高 30-70 pts |
| **验证** | 需 Google Ads Keyword Planner 或 Ahrefs 验证 |
| **风险** | 可能基于过时/虚高数据做决策 |

## H2: Search Volume = Traffic Potential

| 项目 | 内容 |
|---|---|
| **假设** | Search Volume = 潜在流量 |
| **裁决** | **ASSUMPTION** |
| **证据** | 本项目 31 页共 633 曝光 0 点击 |
| **验证** | CTR 取决于 position + snippet，非仅 search volume |
| **风险** | 高搜索量页面可能因排名差而无流量 |

## H3: Zero Impressions = Poor Content

| 项目 | 内容 |
|---|---|
| **假设** | 零曝光 = 内容质量差 |
| **裁决** | **REJECTED** |
| **证据** | `/convert/epub-to-zip` 零点击但 pos 14.8（全站最佳）|
| **验证** | 已收录 3 页零曝光可能是 niche 格式 |
| **风险** | 可能因 ranking/snippet 问题，非内容质量 |

## H4: Discovered-not-indexed = Authority Problem

| 项目 | 内容 |
|---|---|
| **假设** | 14 页未抓取 = 外链/权威不足 |
| **裁决** | **UNPROVEN** |
| **证据** | 无因果证据支持该 chain |
| **验证** | 可能: crawl prioritization / internal linking / authority / freshness / technical / Google scheduling |
| **风险** | 错误归因可能导致错误优化方向 |

## H5: Description Optimization = CTR Improvement

| 项目 | 内容 |
|---|---|
| **假设** | 优化 description 一定提升 CTR |
| **裁决** | **UNPROVEN** |
| **证据** | 81/121 页 description >160 字符是事实缺陷 |
| **验证** | 但 position 34-75 无展示位 ⇒ 无从测 CTR |
| **风险** | 优化后可能仍无展示机会 |

## H6: Title Optimization = Ranking Improvement

| 项目 | 内容 |
|---|---|
| **假设** | 优化 title 一定提升排名 |
| **裁决** | **UNPROVEN** |
| **证据** | 标题已包含关键词但排名仍差 |
| **验证** | 排名受多因素影响（内容质量/外链/用户体验）|
| **风险** | 单改 title 可能无效 |

## H7: Sitemap Inclusion = Indexing Guarantee

| 项目 | 内容 |
|---|---|
| **假设** | 在 sitemap 中 = 会被收录 |
| **裁决** | **REJECTED** |
| **证据** | 17/18 零曝光页在 sitemap 但 14 页未抓取 |
| **验证** | sitemap 是提交机制，非收录保证 |
| **风险** | 错误依赖 sitemap 作为收录指标 |

## H8: Backlink Growth = Crawl Guarantee

| 项目 | 内容 |
|---|---|
| **假设** | 增加外链 = 提高抓取率 |
| **裁决** | **UNPROVEN** |
| **证据** | U5 = UNKNOWN（无外链数据）|
| **验证** | 无因果证据证明该关系 |
| **风险** | 可能无效，浪费资源 |

---

## 统计

| 裁决 | 数量 |
|---|---|
| FACT | 0 |
| ASSUMPTION | 2 |
| UNPROVEN | 5 |
| REJECTED | 2 |

**关键洞察**: 5/9 假设无法证实，2/9 已被推翻。**当前数据不足以支持任何优化决策**。
