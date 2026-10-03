# BookConv 历史数据资产库（bookconv_data_asset）

> 建库时间：2026-09-07。本库只做「发现 → 抽取 → 标准化」，**不做任何数据补造、平滑、异常值删除**。unknown 一律保留为空。

## 1. 找到了哪些数据源

| 数据源 | 形式 | 位置 | 标准化产物 |
|---|---|---|---|
| Google Search Console（UI 导出：查询/网页/国家/设备/日期/呈现） | CSV | `ebook-converter/数据分析/https___www.bookconv.com_-Performance-on-Search-*`（6 组）+ 散落 CSV | `google/normalized_google_search.csv` |
| GSC「Generative AI Features」导出（AI 展示） | CSV | 同上 `-Generative-AI-Features-2026-09-05` | 同上（`search_type=generative_ai`） |
| GSC API 拉取快照（date/query×date/page/dims/daily/unique_query_list） | JSON | `数据分析/_gsc_*.json`（约 50 个） | 同上（含 `snapshot_date`） |
| GSC 报告概况导出（含日期范围注释） | CSV | `数据分析/报告概况*.csv`（10 个） | `google/gsc_overview_misc.csv` |
| Bing WMT 传统搜索（Keyword / PageTraffic / SearchPerformanceOverview） | CSV | `数据分析/www.bookconv.com_*.csv` | `bing/normalized_bing_search.csv` |
| Bing WMT AI 引用（Overview / AIPageStats / AISearchQueries） | CSV | 同上 + `bing_archive/` | `ai_search/normalized_bing_ai.csv`（与传统搜索**分开保存**） |
| Bing URL 索引状态 / 提交清单 / 暗页清单 | CSV | `数据分析/bing-*.csv` | `bing/normalized_bing_url_index_state.csv`、`bing_dark_pages_*.csv` |
| SERP 观测（Brave 聚合、Ahrefs KD+SERP、人工竞品分析表） | MD | `brave_serp_report.md`、`电子书转换工具站 — Ahrefs关键词数据最终完整报告.md`、`geo/SERP竞品分析-第1~4批`、`数据分析/SERP审计-*` | `serp/normalized_serp.csv` |
| Reddit 信号 | CSV | `geo/reddit-signals.csv` | `reddit/normalized_reddit.csv` |
| 用户意图系统（geo-intent-system SQLite） | SQLite | `独立站/geoflow/geo-intent-system/geo_intent.db` | `user_intent/`（14 张表 + 5 个 normalized 文件） |
| 意图种子 | JSON | `geo/intent-seeds.json` | `user_intent/intent_seeds.json_normalized.csv` |
| 站点内容（blog/guides/convert 数据文件） | TS | `src/data/{blog,guides,content}/*.ts` | `content/normalized_content.csv` |
| 事件时间线（由上述数据可证明的事件） | 派生 | — | `events/event_timeline.csv` |

## 2-4. 各数据源时间范围 / 记录数 / 字段

详见 `reports/data_quality.csv`（逐文件 row_count / date_min / date_max / unique / null / duplicate）。速览：

| 数据集 | 行数 | 日期范围 |
|---|---|---|
| google/normalized_google_search.csv | 6,876 | 2026-07-23 → 2026-09-04（UI 导出快照日 2026-08-10~09-05） |
| bing/normalized_bing_search.csv | 1,065 | 日报 2026-07-26 → 2026-09-05；Keyword/PageTraffic 仅 8/30、9/3、9/7 三个快照 |
| ai_search/normalized_bing_ai.csv | 829 | 日报 2026-07-27 → 2026-09-05；AIPageStats/AISearchQueries 为 8/28~9/7 七个快照 |
| serp/normalized_serp.csv | 138 | 时点数据：2026-07-09（Ahrefs）/ 2026-08-01（Brave）/ 2026-08-09、08-11（人工观测） |
| reddit/normalized_reddit.csv | 17 | 无日期字段（原始数据即无） |
| user_intent/normalized_questions.csv | 267 | created_at 2026-08-15 |
| user_intent/normalized_clusters.csv | 20 | 2026-08-15 |
| user_intent/normalized_content_gaps.csv | 5 | 2026-08-15 |
| user_intent/normalized_monitors.csv | 131 | 2026-08-15 → 08-24 |
| user_intent/normalized_citations.csv | 129 | 2026-06-12 → 2026-08-26 |
| content/normalized_content.csv | 109 | 发布日 2026-07-12 → 2026-09-07（56/109 有日期） |
| events/event_timeline.csv | 996 | 2026-07-12 → 2026-09-07 |

字段定义见各 CSV 表头；每行均带 `source_file` 可回溯到原始文件。

## 5. 数据来源文件

每行 `source_file` 列 = 原始文件绝对路径。全量文件级清单见 `raw_inventory.csv`（2,130 个数据扩展名文件，含行数、字段嗅探、来源猜测）。

> ⚠️ **`raw_inventory.csv` 未入库，保留在本地**。该文件有两点不适合进公开仓库：
> ① `file_path` 列含本机绝对路径（`E:\一人公司\…`），会泄露目录结构；
> ② 整个文件是 GBK 编码，在 UTF-8 环境下读取会乱码（源数据抽取时未统一编码）。
> 需要查文件级清单时从本地取，不要依赖远端副本。

## 6. 标准化规则

- **query_key**：小写 + 空白折叠。原始值保留在 `query_raw`。
- **page_key**：https 统一、host 小写、去尾斜杠（根路径除外）、去 fragment、仅剔除 `utm_*` 参数，其余参数保留。原始 URL 保留在 `page_raw`。
- **date**：`2026/7/26 上午12:00:00` 类格式统一为 ISO `YYYY-MM-DD`（只取日期部分）。
- **snapshot_date**：导出/拉取快照日期（来自文件名或 JSON 内部字段）；`unknown` 表示原始文件无日期证据（散落 GSC UI 导出）。
- **数值**：CTR 百分比转为小数；不可解析值（如 `—`）留空，不补 0。
- **Bing AI 与传统搜索**：分属 `ai_search/` 与 `bing/` 两个数据集，字段不同（citations/citation_share vs clicks/impressions），**未做任何换算**。
- **`/es/` 页面**：不做区分，保留原始 URL，由 `page_key` 可辨。

## 7. 字段缺失（原始数据即缺失，非抽取遗漏）

- GSC GenAI 导出只有「展示」，**无 clicks/ctr/position**。
- Bing AIPageStats 无日期维度（快照制）；AISearchQueries 的 Intent/Topic 大量为空。
- Bing Keyword/PageTraffic 报告无日期维度（累计窗口未在导出中标注）。
- Reddit 信号无 thread 标题、无日期。
- 意图系统 questions 的 persona_id/scenario_id 大量为空（NULL）。
- 散落的 GSC UI 导出（`数据分析/查询数.csv` 等）无导出日期 → snapshot_date=unknown。
- GA4：**无原始导出数据**，只有 md 分析报告。

## 8. 可直接用于后续案例研究的数据

- 8/18 spam update 前后的 GSC 日级序列（`google/` 中 date 维度 + query×date）。
- Bing AI citations 日级序列 7/27→9/5（`ai_search/` overview_daily）。
- Google GenAI 展示导出（9/5）+ Bing AI 查询引用份额（7 快照）。
- 用户意图系统全库（questions/clusters/monitors/citations 三态）。
- 内容库 109 页与发布/更新时间线。

## 9. 不能直接用于商业宣传的数据

- 所有 **绝对流量数字**（自然点击总量极小，样本意义有限）。
- SERP 位置为「人工观测近似值」（`note=curated_observation_approx_position`），非排名追踪器。
- AI citation ≠ 访问；impression ≠ click（本库未做任何换算，使用时同理）。
- 意图系统 citations 为人工记录（sentiment/notes 主观）。
- 时间断层的快照数据（Bing Keyword 3 个快照日）不可外推趋势。

## 10. 明显缺口

1. GA4 原始导出数据缺失（仅分析报告 md）。
2. GSC query×date 仅来自 9/3、9/4 两次 API 快照；更早日期无逐日 query 数据。
3. Bing Keyword/PageTraffic 仅 3 个快照，无法构成时间序列。
4. SERP 无时间序列（4 个时点，来源与方法不统一）。
5. Reddit 数据无日期、无线程完整元数据。
6. GSC UI 散落导出缺导出日期。
7. 意图系统 monitors 的 last_checked 多数停在 2026-08 上旬。

## 目录结构

```
bookconv_data_asset/
├── raw_inventory.csv          # 2,130 个文件级清单
├── google/                    # GSC web + GenAI 标准化
├── bing/                      # Bing 传统搜索 + URL 索引状态
├── ai_search/                 # Bing AI 引用（独立保存）
├── serp/                      # Brave/Ahrefs/人工观测
├── reddit/                    # Reddit 信号
├── user_intent/               # SQLite 全表 dump + normalized_*
├── content/                   # 109 页内容清单
├── events/                    # event_timeline.csv（996 事件）
├── reports/                   # data_quality.csv / extraction_log.txt / 审计报告
├── _scripts/                  # 全部抽取脚本（可复跑）
└── README.md
```
