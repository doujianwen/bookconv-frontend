# BookConv Growth Evidence Mining — 可证明增长事件挖掘（第二阶段）

> 执行日期：2026-09-07。方法：从已标准化的 `bookconv_data_asset/` 数据中自动挖掘「可证明的变化」，**只记录证据，不解释原因，不做因果声明**。
> 全量 44 条候选证据：`events/growth_evidence.csv`（含 evidence_id、before/after、source_files、caveat）。本报告为其中 20 条的策展版。

## 证据强度分级

| 等级 | 含义 | 对应 evidence_quality |
|---|---|---|
| ★★★ | 同口径日级序列（7 次导出合并） | daily_series_merged_7_exports |
| ★★ | 同报告类型跨快照两点对比（窗口长度未在导出中标注） | snapshot_pair / two_record_join / api_status_check |
| ★ | 单点或窗口不可比的记录（只登记，不可当趋势引用） | single_point / two_point_window_mismatch |

---

## 一、Bing AI Citations（★★★ 日级序列）

| # | Event | Date | Change | Evidence | Source |
|---|---|---|---|---|---|
| 1 | AI citation 首次出现 | 2026-08-08 | 0 → 4 | 日级序列首个非零日（此前 7/27~8/7 有记录日均为 0） | AIPerformanceOverviewStats 7 快照合并 |
| 2 | 日引用量最大跳升 | 2026-08-25 | 38 → 147（+109） | 日级序列，相邻两日 | 同上 |
| 3 | 日引用量创系列最高 | 2026-09-04 | 133 → 219（+86） | 日级序列峰值，9/5 回落至 157 | 同上 |

## 二、Query 级 Citation / Share（★★ 七快照对比，8/28 → 9/7）

| # | Event | Date | Change | Evidence | Source |
|---|---|---|---|---|---|
| 4 | djvu to pdf 引用增长 | 8/28→9/7 | 63（share 4.80%）→ 233（6.20%），+170 | AISearchQueriesReport 6 个快照首尾对比 | AISearchQueriesReport_2026_8_28/9_7.csv |
| 5 | transfer ebooks between devices 份额翻倍 | 8/28→9/7 | 6（19.35%）→ 52（46.02%） | 同上 | 同上 |
| 6 | ebook reader app 引用增长 | 8/28→9/7 | 8（9.88%）→ 84（12.59%），+76 | 同上 | 同上 |
| 7 | free reader apps platforms discover… 增长 | 8/28→9/7 | 6（22.22%）→ 38（25.85%），+32 | 同上 | 同上 |

⚠️ 该报告为累计窗口值，窗口长度未在导出中标注；对比的是「同报告类型两次导出的报告值变化」。

## 三、Page 级 AI Citations（★★ 七快照对比）

| # | Event | Date | Change | Evidence | Source |
|---|---|---|---|---|---|
| 8 | /blog/best-ebook-reader-apps 引用增长 | 8/28→9/7 | 47 → 519（+472，全站最大） | AIPageStatsReport 首尾快照 | AIPageStatsReport_2026_8_28/9_7.csv |
| 9 | /blog/sync-reading-across-devices 引用增长 | 8/28→9/7 | 114 → 304（+190） | 同上 | 同上 |
| 10 | /guide/djvu-to-pdf 引用增长 | 8/28→9/7 | 50 → 200（+150） | 同上 | 同上 |
| 11 | /guide/mobi-to-epub-keep-formatting 引用增长 | 8/28→9/7 | 6 → 115（+109） | 同上 | 同上 |
| 12 | /blog/mobi-to-kobo 引用增长 | 8/28→9/7 | 5 → 65（+60） | 同上 | 同上 |

## 四、收录证据链（★★ 状态记录）

| # | Event | Date | Change | Evidence | Source |
|---|---|---|---|---|---|
| 13 | 9/3 提交 → 发现 | 2026-09-06 | not_discovered → discovered+crawled 9/6 | /convert/epub-to-png 在 9/3 SubmittedUrls 集合内，9/4 状态检查时未发现、9/7 复查已发现 | bing-url-status-EN-09-04 + submitted16-09-07 |
| 14 | 9/3 提交 → 发现 | 2026-09-04 | not_discovered → discovered 9/4 | /terms 同上 | 同上 |
| 15 | 9/3 提交 → 发现 | 2026-09-03 | → discovered 9/3 | /blog/common-ebook-format-problems | 同上 |
| 16 | 发布当天被 Bing 发现 | 2026-08-09 | publish 8/9 → discovery 8/9（lag 0） | 内容库发布日期 × Bing discoveryDate 联表 | normalized_content + url_index_state |
| 17 | 发布当天被 Bing 发现且 AI 引用增长 | 2026-08-15 | publish 8/15 → discovery 8/15；AI citations 8/28 快照 114 → 9/7 快照 304 | 双源证据（EV-10 + EV-22） | 同上 + AIPageStatsReport |

（发布→发现 lag≤1 天的页面共 17 个，全量见 growth_evidence.csv EV-17~EV-36。）

## 五、Google 传统搜索（★★ API 快照日级）

| # | Event | Date | Change | Evidence | Source |
|---|---|---|---|---|---|
| 18 | query "mobi to epub" 首次出现并增长 | 2026-07-30 首现 | 0 → 21 个采样日共 72 次展示，峰值 11（8/13） | query×date 日级（2 次 API 拉取，GSC 采样） | _gsc_query_daily_2026-09-03/04.json |
| 19 | query "epub para doc"（西语）首现 | 2026-08-09 首现 | 0 → 23 个采样日共 44 次展示 | 同上 | 同上 |
| 20 | Bing 可见 query 数增长 | 8/30→9/7 | KeywordReport 唯一 query 数 119 → 233（+114） | 三份 KeywordReport 快照行数对比 | KeywordReport_2026_8_30/9_3/9_7.csv |

## 六、登记但不可当趋势引用（★）

| Event | Date | Change | Caveat |
|---|---|---|---|
| GSC GenAI 展示首证 | 2026-09-05 | /es/blog/azw3-vs-mobi 10 次展示 | 单时点，无前值可比 |
| 首页/mobi-to-epub 页 GSC UI 展示变化 | 8/10→8/30 | 6→272 / 70→311 | 各次 UI 导出回看窗口不同，**不可作趋势**（EV-43/44） |

## 使用纪律

1. 每条证据的完整字段（before/after/delta/source_files/caveat）在 `events/growth_evidence.csv`。
2. AI citation ≠ 访问；citation share 变化 ≠ 流量变化；本报告未做任何换算。
3. 快照对比类证据（二、三、五-20）的累计窗口未在 Bing 导出中标注，对外使用须保留此声明。
4. 13-15 号事件只证明「提交后发生 discovery」这一时间顺序，不声明因果。
5. GSC query 日级数据受 API 采样限制（仅 2 次拉取快照），缺日不代表零展示。
