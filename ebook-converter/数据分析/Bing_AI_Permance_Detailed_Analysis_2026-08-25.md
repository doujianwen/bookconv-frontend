# Bing AI Performance 详细分析报告（审计修订版）

> 数据来源：Bing Webmaster Tools，2026-8-25 导出（原始 CSV 见 `geo/bing数据/`）
> 统计区间：2026-7-27 ~ 2026-8-23（28天）
> **审计修订**：2026-08-25 苏格拉底审计发现 section 一/二所引用的"份额/share"列在原始导出中不存在，属子报表二级指标未被留存。本修订保留原始数字但标注可信度，冻结依赖 share 列的行动项。
> 完整审计：`geo/苏格拉底审计-BingAI分析-2026-08-25.md`

---

## 可核验数据（已验证）

### 总览

| 指标 | 数值 | 来源 | 可信度 |
|------|------|------|--------|
| 总 citations | 249 | AIPerformanceOverviewStats | ✅ 已核验 |
| 首日 citation | 8/8 | 同上 | ✅ 已核验 |
| 单日峰值 | 8/23：43 citations / 6 被引用页 | 同上 | ✅ 已核验 |
| 最近 7 天日均 | 29.3 citations | 同上 | ✅ 已核验 |
| Sync 博客页 citation | 97（39.3%） | AIPageStatsReport | ⚠️ 来自子报表，未核对原始明细 |
| W3 日率 vs W2 日率 | 30 > 24.3（持平微升） | AIPerformanceOverviewStats 日序列 | ✅ 已核验 |
| Bing 搜索累计 | 152 imp / 4 click | SearchPerformanceOverview_All | ✅ 已核验 |
| 相关系数 +0.747 | citation vs search impressions | 人工计算 | ⚠️ 仅 n=28 天，样本极脆 |

### 关键结论（仅基于可核验数据）

1. ✅ **Sync 博客页是最大单一 citation 来源**（97 citations / 39.3%），强化品牌提及可继续 ✅
2. ✅ **W3 日率 30 > W2 日率 24.3，持平微升**——此前报告"W3 较 W2 下滑"是分桶天数不一致造成的假象（W3 仅 2 天）
3. ✅ **AI 引用早于搜索 5 天**（首 citation 8/8，首 click 8/13）——Bing AI 确实是新兴渠道，但量级极小
4. ⚠️ **"AI 是当前主要曝光渠道"——措辞过强**，152 imp / 4 click 说明搜索量仍远低于 citation 体量
5. ⚠️ **citation → 点击 → 转化链路未打通**，GA4 关键事件未标定，难以判定 249 citations 是否为虚荣指标

---

## 一、Query 维度（Top 8 搜索词）

> ⚠️ **数据可信度警告**：该表来自 Top Queries 子报表，原始导出未留存该子报表。share 列（份额）在两份 Overview 导出中均不存在，无法独立核验。后续决策须等重导子报表后再做。

| 排名 | 搜索词 | Citations | 份额（⚠️未核验） | Intent | Topic |
|------|--------|-----------|------|--------|-------|
| 1 | epub to mobi | 25 | 2.55% | Utility | E-Books & Kindle |
| 2 | Harry Potter digital books multiple devices | 18 | 58.06% | Commercial | E-Books & Kindle |
| 3 | epub to mobi converter free | 18 | 10.29% | Utility | E-Books & Kindle |
| 4 | djvu to pdf | 12 | 2.88% | - | - |
| 5 | apps for romance books sync across devices | 8 | 47.06% | Informational | Books |
| 6 | ebook syncing virtual reading groups | 6 | 42.86% | Informational | Reading |
| 7 | transfer ebooks between devices | 6 | 19.35% | - | - |
| 8 | convert from epub to mobi | 5 | 26.32% | - | - |

**share 列矛盾证据**：同表反推分母差 31 倍（Q1=980，Q2=31），说明 share 根本不是"占比"类指标——**不可用于战略决策**。

---

## 二、Page 维度（Top 15 被引用页面）

> ⚠️ 同 section 一：来自 Top Pages 子报表，原始导出未留存。

| 排名 | 页面 URL | Citations | 占比（⚠️未核验） |
|------|----------|-----------|------|
| 1 | /blog/sync-reading-across-devices | 97 | 39.3% |
| 2 | /guide/epub-to-mobi-keep-formatting | 35 | 14.2% |
| 3 | / | 25 | 10.1% |
| 4 | /guide/kindle-formats | 18 | 7.3% |
| 5 | /guide/djvu-to-pdf | 14 | 5.7% |
| 6 | /guide/mobi-vs-azw3 | 13 | 5.3% |
| 7 | /blog/can-kindle-read-azw3 | 9 | 3.6% |
| 8 | /blog/epub3-vs-epub2 | 9 | 3.6% |
| 9 | /guide/docx-to-epub-self-publish | 7 | 2.8% |
| 10 | /guide/fix-epub-to-pdf-formatting | 7 | 2.8% |
| 11 | /guide/mobi-to-epub-keep-formatting | 6 | 2.4% |
| 12 | /guide/cbr-to-pdf | 3 | 1.2% |
| 13 | /es/blog/ebook-formats-explained | 2 | 0.8% |
| 14 | /es | 1 | 0.4% |
| 15 | /es/blog/epub-to-mobi-guide | 1 | 0.4% |

---

## 三、核心洞察（修订版）

### ✅ 可执行洞察

1. **Sync 博客内容占 39% citations**（97/249）——维持并强化该页的品牌提及
2. **首页独立引用 25 citations**——品牌词表现良好
3. **西语页（/es/*）共 4 citations**——占比极低，与同日 GEO 审计语言错配结论互证

### ⚠️ 悬置洞察（依赖 share 列）

| 原洞察 | 状态 | 原因 |
|--------|------|------|
| Utility 意图词占主导 → 主攻 epub to mobi 类着陆页 | **悬置** | share 列不可信，实际可能反转（utility 恰是最弱项） |
| Harry Potter 商业查询 58% share → 复合需求机会 | **悬置** | share 列数值无定义，58% 不可信 |
| Conversion 页面未被引用 = 最大机会窗口 | **降级为假设** | 缺少 intent 对照 + share 列不可信，不能据此建 tool 页 |

---

## 四、行动建议（修订版）

| 优先级 | 行动项 | 依据 | 状态 |
|--------|--------|------|------|
| P0 | 在 sync 相关内容中强化品牌提及 | 97 citations / 39% ✅ 已核验 | ✅ 继续 |
| P0 | **重导 Bing AI Performance 子报表**（Top Queries + Top Pages 明细） | 当前分析缺子报表 | 🚨 阻断下一步 |
| P1 | 查 /convert/* 索引状态 + query 意图偏好 | Q1 遗留验证 | 待子报表重导后 |
| P2 | 创建「Harry Potter digital books」格式指南 | 原 P1，share 列不可信 | 降级 P2 |
| P2 | 创建「djvu to pdf converter」着陆页 | 原 P1，share 列不可信 | 降级 P2 |
| P2 | 西语版内容本地化 | 原 P2 | 维持 P2 |
| ⛔ | 创建/优化「epub to mobi converter」着陆页 | 原 P0，依赖 share 列 | **冻结** |

---

## 五、后续动作清单

- [ ] **R6（阻断性）**：重导 Bing AI Performance Top Queries + Top Pages 子报表，定义 share 列义
- [ ] **R1 跟进**：核查 /convert/* 是否在 Bing 索引 + 对应 query 的 SERP/AI 答案偏好
- [ ] **R5 跟进**：核查 Bing 西语页收录数 vs 英语页（与同日语言错配结论交叉）
- [ ] **GA4 标定**：完成 file_upload / conversion_complete 事件标定，建立 citation→点击→转化链路
- [ ] **SOP 固化**：今后此类分析导出必须包含：① Overview ② Top Queries 明细 ③ Top Pages 明细 ④ 日期范围；分析文档头部显式列出引用子报表文件，否则不得形成战略结论

---

*生成时间：2026-08-25 22:40（初版）*
*审计修订时间：2026-08-25 23:35*
*审计文档：`geo/苏格拉底审计-BingAI分析-2026-08-25.md`*
