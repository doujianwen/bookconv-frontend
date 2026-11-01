# Topic Portfolio 快照 SOP v2（合并版）

> 编制：2026-11-01。合并来源：本日两轮红队审计（`审计_Bing_TopicPortfolio快照红队复核与深度分析_2026-11-01.md`，含 A1-A10）与并行会话文档（`docs/规划红队审计-2026-11-01.md` R01-R17、`docs/TopicPortfolio月度复核与增长规划-2026-11-01.md` §六）。执行载体：自动化 M11-6/M11-8（每月 1 日 10:00）。本 SOP 是唯一快照作业规范，替代散落在各报告中的过程性描述。

## 1. 触发与窗口纪律（承接 R11）

1. 运行时**先读窗口标签**（1M/2M/3M 及括号内月份），核实 `is-selected`。
2. **窗口未切换（如 1M 仍是上月）⇒ 只记录「源未更新」并结束**：不重抓同月全表、不产出"零增长/无变化"结论、不写新深度报告。
3. 窗口切换后：抓完整新月快照，与上一份**等长自然月**快照对比；引用趋势同时报总量与**周桶日均**（防天数不等，A1 教训）。
4. 月度分析结论并入**周一联合评审**（不单独出第三份报告，执行计划 11/5 替代栏约束）。

## 2. 抓取技术纪律（A 轮红队沉淀）

1. 路由：`/webmasters/aiperformance?siteUrl=https%3A%2F%2Fwww.bookconv.com%2F`，`activeTab=Topic`（Topic 表）或 `=AISearchQueriesReport`（Citations & Pages）。`/webmasters/ai` 不渲染。
2. 数据为 Fluent UI DetailsList（非语义 table）：用 `.ms-DetailsList` + `.ms-DetailsList-headerWrapper` 匹配表头关键词（`Topic Size` / `Opportunity Query` / `Grounding Query`），行用 `.ms-DetailsRow-cell`。
3. 分页：`button[aria-label="转到下一页面"]` 翻页至 disabled，行去重后须等于页面宣称数（如 "50 results found" / "263 results found"）。
4. **对比必须按名匹配，禁止按行序**（实证：同窗口两次抓取 Technology / Productivity Apps 行序互换）。
5. 大返回值（>20KB）经 tabbit resource 通道取回；单次脚本受 60s 硬性限制，长轮询拆多次调用。

## 3. 双通道验证（A10 沉淀，2026-11-01 实测通过）

1. 页面两张「下载」按钮分别导出：`AITopicsOverallPortfolio`（7 主题）与 `AITopicsTopOpportunityQueries`（50 词）。文件落浏览器下载目录，命名含日期。
2. 导出文件**必须用引号感知 CSV 解析**——naive `split(',')` 会被含逗号查询词（如 `kindle vs kobo, which is the best`）破坏（实测踩坑）。
3. 导出与 DOM 抓取逐格互证通过后才归档两者；不一致时以导出为准并在报告登记差异。
4. 归档原件到 `bookconv_data_asset/bing/BWT_export_*_<日期>.csv`。

## 4. 归档清单（每份快照必齐）

| 产物 | 路径模式 |
|---|---|
| 快照 JSON+CSV（原样字符串，含多语词，禁翻译改写） | `bookconv_data_asset/bing/TopicPortfolio_snapshot_<YYYY-MM-DD>.json/.csv` |
| BWT 原生导出 ×2 | `bookconv_data_asset/bing/BWT_export_AITopics{OverallPortfolio,TopOpportunityQueries}_<日期>.csv` |
| 日度引用序列 + KPI（3M 视图图表行） | `bookconv_data_asset/bing/AIPerformance_daily-citations_<日期>.json` |
| Grounding Queries 全量 | `bookconv_data_asset/bing/AIPerformance_grounding-queries_<日期>.json` |
| 对比/分析 | `数据分析/`（并入周一评审，不另立深度报告） |

KPI 交叉验证：图表序列总和须与 KPI 显示值吻合（容差 ~1%，K 缩写展开）；不符则记录差异，禁止硬凑。

## 5. 判读口径（A1/A2/A10 确认）

1. **语义已判定**（2026-11-01，UI 导语 + 算术判别双证）：Grounding「Citations」列 = **本站被引次数**；Citation Share = 本站份额。由此：
   - 查询池估算 = `citations / share`；份额提升增量 = `citations × (目标份额 − 现份额) / 现份额`。
   - ~~`缺口 = citations × (1 − share)`~~ 作废（该式隐含 Citations=池总量，已证伪）。
   - 残余不确定性：263 条列表外长尾约占全站 33%（22,468/33,445），池估算是下界近似。
2. Opportunity Queries = 相关主题下**其他站被引而本站未被引**的查询（页面帮助原文）。
3. 数字纪律：显示缩写（K）原样保留；全站 KPI、序列总和、列总和分开报告；一切百分比标注窗口与长度（等长窗口 + 周桶为主口径）。
4. delta=0 如实记录且注明「同窗口数据固化 ≠ 无变化」。

## 6. 边界

- 快照与对比仅供人工审阅，绝不自动修改 board.json、代码或站点内容。
- BETA 功能 UI 可能变化：字段对不上按 BLOCKED 如实报告，不猜不补。
- 不重复创建自动化（R15）；登录失效不做自动登录，直接 BLOCKED。
