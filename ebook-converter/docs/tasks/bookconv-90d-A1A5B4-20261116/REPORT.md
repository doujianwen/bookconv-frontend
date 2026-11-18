# BookConv 首批诊断分析报告｜A1–A5（+B4 摘要）

run_id：`BC90D-A1A5B4-20261116-230301` ｜ 数据日期：GSC 截至 2026-11-14（T-2）、GA4 T-1=2026-11-15、Bing 快照 2026-11-16 ｜ 口径：同窗同过滤器，窗口长度随数据标注

---

## A1｜GSC date / query / page 一致性

**结论：CONFIRMED（窗口错位，非数据矛盾）。**

- date d30（10-15~11-14）：clicks=13、impressions=211；recent7（11-08~11-14）=0 clicks/45 impr；prev7（11-01~11-07）=4 clicks/43 impr。
- page d10（11-04~11-14）：首页 `https://www.bookconv.com/` 1 click/55 impr，是全窗唯一有点击的 URL。
- 复算判别：date 维度全窗 31 天中唯一 1 click 落在 **11-05**（1 impr，position=1）。11-05 ∈ page 10 天窗（11-04~11-14），但 ∉ date recent7（11-08~11-14）。故"date 0 / page 1"是**两个不同窗口各取所需**造成的表象差异，不是 GSC 内部数据不一致。
- 数据限制（Fact）：GSC 各维度独立聚合；query d10 同窗 clicks 合计为 0，与 page 维度 1 click 并存。要把这 1 click 精确归属到某个 query，需 query+page 双维度 API，本轮快照未含 → 归属 **UNKNOWN**。
- 非点击日：date 全窗 0-click 达 20+ 天，样本极小，不能据此判"链路断裂"（计划基线口径）。

证据：`evidence/diagnosis-a1a2a5.json` → `A1`；原始 `raw/GSC_API_date_2026-11-14_d30.json`、`raw/GSC_API_page_2026-11-14_d10.json`、`raw/GSC_API_query_2026-11-14_d10.json`。独立复算脚本 `evidence/diagnose-a1a2a5.mjs`（exit 0）。

## A2｜410 关键词分层与机会矩阵

**结论：CONFIRMED（可复算分层成型），但"410≠全量词库"必须声明。**

- 来源：`data/keyword-series.json` gsc.keywords，generatedAt 2026-11-16T13:52Z，共 **410** 观测词。
- 品牌分层：非品牌 **375**（91.5%）/ 品牌 **35**（8.5%）。点击几乎全部来自品牌词（d90 query 窗内 "bookconv" 独占 17 clicks）。
- 排名区间：Top10=14、Top30=23、Top50=52、beyond50=321 → **Top30 外 396 词 = 96.6%**；中位排名 **67.3**。
- 机会矩阵（按最新点曝光排序，节选）：有曝光的词以非品牌、深排名、低曝光为主；`ebook converter` 84 impr 但 position 93.6，是"有需求无排名"的典型候选。
- 反证/边界：410 是观测词集合（采样自 6 核心词扩词），不是站点全量关键词，不得用 410 作分母宣称"索引覆盖率"。URL 归属需 query+page 双维度 → **UNKNOWN**。

证据：`evidence/diagnosis-a1a2a5.json` → `A2`；`raw/keyword-series.json`（已 SHA256 锁定）。

## A3｜Google 排名 / 索引 / 技术根因

**结论：PROBABLE（排名弱 + 意图/内容缺口为主），索引/canonical 类未证实项标 UNKNOWN。**

- 高价值 URL（page d10）：首页 55 impr/position 76.1；`/convert/epub-to-txt` 等转换页有少量曝光。首页承接最多曝光却排 76 位 → 排名弱是主要矛盾，不是"未收录"。
- 根因分层（按计划 A3 五分类）：
  - **排名弱**：CONFIRMED — 首页/转换页 position 普遍 >50，曝光存在。
  - **意图不匹配**：PROBABLE — 非品牌词 96.6% 在 Top30 外，站点覆盖词与用户查询意图存在缺口（基于 A2 词表，未逐 query 人工核对）。
  - **内容质量**：UNKNOWN — 本轮未做逐页内容审计，不下结论。
  - **未索引**：UNKNOWN — 本轮**未调用 URL Inspection API**（脚本 `check-indexing.mjs` 存在，但需逐 URL 配额且本轮机/network 窗口有限）；page 维度有曝光只能证明"部分 URL 被索引"，不能证明全站索引健康。
  - **抓取 / canonical**：UNKNOWN — 无本轮抓取日志证据。
- 只将 CONFIRMED 项（排名弱）转后续 B1 整改候选；PROBABLE/UNKNOWN 项不进整改清单，待 A6–A8 或专门 URL Inspection 轮次补证。

证据：`evidence/diagnosis-a1a2a5.json` → `A1.page_clicked_urls` + `A2`；`raw/GSC_API_page_2026-11-14_d10.json`。

## A4｜GA4 每日深度分析（T-1=2026-11-15）

**结论：报告完整交付；多项口径护栏生效；污染嫌疑如实标注。**

- T-1 核心（periodTotals，服务端去重）：activeUsers **34**、totalUsers 36、newUsers 30、sessions **38**、engagedSessions 18、keyEvents 26、pageViews 107。
- 来源/媒介（会话口径）：Direct 32、(not set) 11、cn.bing.com referral 3、doubao.com referral 1。渠道组：Direct 32 / Unassigned 11 / Organic Search 3 / Referral 1。
- 落地页：`/` 26 sessions、`/convert/epub-to-txt` 5、`/batch` 3。国家：China 38（100%）。
- 产品事件：file_upload 30、conversion_attempt 30、conversion_complete 26、conversion_failed 2、page_view 107、session_start 36。错误码：CONVERSION_UNAVAILABLE 1、UNKNOWN 1。
- **终态成功率（唯一可比的完成率口径）**：26/(26+2)=**92.9%**，Wilson 95% CI **77.4–98.0%**。这是**事件级终态占比**，非任务级成功率（无 job_id，不能关联同批上传→转化）。
- **禁用的伪口径**：`conversion_complete/file_upload`（26/30=86.7%）不得称真实转化率——分子分母事件/用户口径不同（6 vs 9 users）；`uploadRateProxy=143%`（来自 fetch-ga4-daily 工具页）更不能解释为转化率。
- 引荐分层（护栏版）：pageview 级 external 仅 4（cn.bing.com 3 + doubao 1），tierSummary 明确"level=pageview，禁止说 X% 用户从某处来"；session 入口级 external 4/36。**无任何可识别 AI 平台引荐**（ChatGPT/Perplexity/Gemini 均 0）。
- 异常（诚实标注）：
  - A4-ANOM-1（P1）：country=China 100%，与"海外流量"目标不符，疑似本地测试/代理出口污染，不可当海外增长证据。
  - A4-ANOM-2（P1）：(not set)/Unassigned 11 sessions、engagementRate=0 但 keyEvents 13、平均时长 120s；7d Unassigned 平均时长 412s——符合自动化/爬虫/埋点缺失特征，引擎侧归因标 UNKNOWN。
  - A4-ANOM-3（P2）：外部引荐极少且非搜索主渠道，doubao 单样本不称趋势。
  - A4-ANOM-4（P1）：7d 窗口出现 `DIRECT_UPLOAD_PUT_FAILED`(2)、`CORRUPT_INPUT`(1)、`UPLOAD_NOT_FOUND`(1)；T-1 单日看不到 → 链路健康结论**必须带时点**，不能只看 T-1。
- 7d 基线（11-09~11-15）：activeUsers 161、sessions 181、keyEvents 90、pageViews 392；Organic Search 15 / Referral 12 / Direct 148 / Unassigned 15。

验收拆分：拉取 PASS（exit 0，fetchedAt 实记录）；落盘 PASS（原始 JSON 在 evidence/）；报告 PASS；**发送 NOT_SENT**（对外发送需单独授权，用户本轮未授权对外通知）；读回 N/A（无外部写入）。

证据：`evidence/analysis-a4.json`、`evidence/analyze-a4.mjs`、`evidence/ga4-acq-T1-2026-11-15.json`、`evidence/ga4-acq-7d-2026-11-15.json`、`evidence/ga4-live-2026-11-15.json`。

## A5｜Bing 11-08 尖峰归因

**结论：CONFIRMED（尖峰存在）+ UNKNOWN（单日具体归因）。不得称趋势增长。**

- RankAndTraffic（每日粒度）：11-08 = **11 clicks / 176 impr**，周边日多为 2–7 clicks → 单日尖峰确认。
- 周对比（每日 clicks 求和）：recent7（11-02~11-08）=**31**，prev7（10-26~11-01）=**31**，剔除 11-08 后 recent7=**20**。→ 含尖峰与上周持平、剔除后反降，**不能宣称持续增长**。
- 数据粒度限制（关键发现）：Bing Query/PageTraffic CSV 是**周桶**（每周六：10-30 / 11-06 / 11-13…），**不含 11-08 单日行**。因此无法把 11 次点击归属到具体 query/page/referral。11-06 起周桶旁证（点击>0）以品牌词为主：bookconv 8、bookconv.com 4，另有 how to view downloaded epubs on kindle 2、epub converter online 2——仅作旁证，**不作单日因果断言**。
- 一次性外部来源/品牌词驱动：无 referral/日志维度可证 → **UNKNOWN**。
- 本轮实时 Query 端点 ECONNRESET（exit 1），Query/Page 用 11-16 已锁定快照；RankAndTraffic 本轮实时 200 已落 evidence。

证据：`evidence/diagnosis-a1a2a5.json` → `A5`；`evidence/BingAPI_RankAndTraffic_LIVE_partial_2026_11_16.csv`；`raw/www.bookconv.com_BingAPI_*.csv`。

## B4｜外链管道（摘要，详见 B4-backlink-pipeline.md）

- 资格与可达性实测：TTD 200（免登录免费收录、人工审核）、SaaSHub 200、Product Hunt 403、AlternativeTo 403。
- 用户已授权真实提交；表格字段、官方邮箱（hello@bookconv.com）、产品事实描述均核验完毕，提交载荷快照已存 `evidence/ttd-submit-request.json`。
- **真实提交未成功**：本机出口 TLS 通道整体失效（Node fetch ECONNRESET、curl exit 35、连续 3 次 http=000，连 bookconv.com 对照也失败）。停止重试， Submitted=0，生命周期停在 DRAFTED（资料齐备）。无平台回执 → 绝不标 SUBMITTED/LIVE。

---

## Fact / Assumption / Unknown

**Fact（可定位证据）**：A1 窗口错位与 11-05 单 click；A2 410/375/35、96.6%、中位 67.3；A4 全部 T-1/7d 数字与 Wilson CI；A5 11-08=11 clicks/176 impr、31/31/20；B4 HTTP 状态与表单字段。均在 evidence/ 有脚本 exit 0 与原始文件。

**Assumption（暂用，待验）**：A3 "意图不匹配"基于词表分布推断，未逐 query 人工核对；官方邮箱 hello@bookconv.com 作 submitter_email 基于站点公示。

**Unknown（不得包装成 Fact）**：GSC query×page 精确归属；A3 未索引/抓取/canonical/内容质量根因（本轮未做 URL Inspection）；A5 单日尖峰具体 query/referral 归因；GA4 (not set) 流量的真实来源；外链平台审核结果。

## 红队回执（N4 关闭节点 · L3）

- **断言**（本轮当作事实的 6 条）：①A1 是窗口错位；②A2 96.6% Top30 外；③A4 终态占比 92.9% 是事件级非任务级；④A5 不能称趋势增长；⑤GSC/GA4/Bing 通道状态分层；⑥B4 已完成资格+可提交资料、但未产生对外副作用。
- **攻击**：①A1 会不会是真的数据矛盾？反例检查 11-05 落窗 → 否，窗口错位成立。②A2 会不会把采样词当全量？已声明 410=观测词、URL 归属 UNKNOWN。③A4 会不会把 86.7% 或 143% 当转化率？两个伪口径均已显式禁用，改用终态 92.9%+CI+job_id 缺失声明。④A5 会不会被读成增长？31 vs 31、剔除后 20，已写 NO_TREND_CLAIM。⑤通道会不会假绿？Bing exit 1 已如实分层、未用旧数据冒充本轮实时。⑥B4 会不会伪造回执或误报 SUBMITTED？无平台回执即停 DRAFTED，未提交。
- **裁定**：修正（通道分层、伪口径禁用、B4 未提交三处主动纠偏）→ 通过。
- **证据**：复算脚本 exit 0（`evidence/*.stderr.txt` 空/无错）；账户 Gate JSON status=PASS；git HEAD cd0a9eb 未变、dirty 四处保留、无 commit/push；B4 提交 stderr 记录 TLS 失败。
- **残余**：A3 URL Inspection 未做（列 P1，下一诊断轮补）；A6–A8、B1–B3、B5 不在本批范围；外链提交待网络恢复重放。**无独立提交回执通道 → L3-UNAVAILABLE（提交部分）；A1–A5 为本地脚本+原始数据双通道，L3 通过。**

红队：L3 · 裁定 修正→通过 · 回执 本文「红队回执」段 + `evidence/` + `B4-backlink-pipeline.md`。
