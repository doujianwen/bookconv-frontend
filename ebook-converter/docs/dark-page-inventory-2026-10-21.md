# M2-4 暗页治理 · 分类型暗页清单 + 处置记录（2026-10-21）

> 任务：M2-4（P1，due 2026-10-20）。验收：30 天内 convert 暗页率下降 ≥10 个百分点（90% → ≤80%）——该 30 天窗口自本清单基线日起算。
> 数据源：`数据分析/GSC_API_page_2026-10-19.json`（GSC 页面级，窗口 2026-09-21 → 2026-10-19，28 天，含 2 天滞后；rows=26 有曝光页 / 248 曝光 / 6 点击）。
> 暗页定义（本清单口径）：**近 28 天 GSC 曝光 = 0** 的站内存量页。
> 审计脚本：`_wb_tmp/audit-dark-pages.mjs`（_wb_tmp 不入库，本文件为唯一持久记录）。

## 一、总览（10-21 实测 vs 板基线）

| 类型 | 板基线（拆解表 9-27） | 本清单实测（28d 窗口） | 差异说明 |
|---|---|---|---|
| convert | 90% 暗页 | **18/31 = 58%** | 口径/窗口差异，见下方诚实性说明 |
| blog | 72% | **63/68 = 93%** | 同上 |
| guide | 20% | **24/25 = 96%** | 同上（差异最大，guide 板基线疑为更长窗口或含 Bing 数据口径） |
| 核心页（/、/convert、/blog、/guide、/formats/*） | — | 8/9 = 89% | 仅首页有曝光 |

**唯一真相声明**：板基线（90/72/20）在本次 28 天 GSC 曝光口径下**不可复现**。两者必有一处口径不同（窗口长度 / 曝光 vs 点击 / 是否含 Bing PageTraffic）。本清单自即日起为 M2-4 验收基线（58%），30 天后同口径复测。**建议**：后续暗页率统一以「GSC 28 天曝光=0」口径计算并登记到板，避免基线漂移。

## 二、convert 暗页 18/31（处置优先级最高）

azw3-to-mobi, azw3-to-pdf, cbr-to-pdf, chm-to-mobi, djvu-to-pdf, doc-to-epub, epub-to-html, epub-to-jpg, epub-to-pdf, epub-to-png, epub-to-zip, fb2-to-epub, html-to-epub, lit-to-mobi, mobi-to-azw3, mobi-to-pdf, mobi-to-txt, txt-to-epub

**处置记录**：
1. 其中 13 页已挂在 **M2-8**（零抓取差异化，现 blocked——受制于 Google 抓取配额，复评 2026-11-20）。M2-4 与 M2-8 共享处置路线，**不另开工作量**。
2. M1-E 复评（10-20）实测：差异化+内链在发现层有真实但有限进展（4 页进入 Discovered），crawl 增量=0 ⇒ 暗页主因是**抓取配额未被分配**，非内容质量。
3. 新增可执行项（低工作量、站方可控）：**内链入度补强**——从有曝光的 8 个亮页（首页、/convert、/blog、/guide、/formats/*、/guide/calibre-alternative、/convert/epub-to-mobi、/convert/epub-to-azw3 等）向暗页补内链，每批 ≤3 页，随 M11-3 批次顺带执行。
4. epub-to-zip 本日已完成 title+方法对比表强化（M2-13），待 GSC 2 周复跑观察。

## 三、blog 暗页 63/68

**处置记录**：
1. 63 页差异化走 **M2-8 Batch 14 逐篇路线**（M3-10 已确认无法单会话批量完成，见其 blocked note）。
2. 4 个 IP 页（harry-potter / narnia / lord-of-the-rings / twilight / marvel）Google 全暗但 **Bing AI 引用活跃**（哈利波特 58% Citation Share）⇒ 处置方向不是删改，而是**等待 Google 抓取配额 + 内链补强**，与 M2-8 同路线。
3. 工具类暗页（env-variables-setup / background-workers / sitemap-seo-guide 等 3-5 篇工程向内容）建议评估**归档或 noindex**（对目标读者无搜索价值，占用抓取配额）——**需用户拍板**，本清单只提议不执行。

## 四、guide 暗页 24/25

**处置记录**：
1. guide 板块为 9 月新建，25 页中 24 页 28 天零曝光——**新站冷启动正常形态**，且 Google 抓取配额未覆盖。
2. 唯一亮页：/guide/calibre-alternative。暗页中 how-to-send-epub-to-kindle 本日已完成 M11-3 强化（新增 Send to Kindle 服务定义块，承接 2 条 P0 机会词），待观察。
3. 处置与 M11-3 机会词分发批次合并推进（每批 ≤3 页 + Gate B + 人工审稿），不单开管线。

## 五、30 天验收路径

- 基线日：2026-10-21（convert 暗页率 58%）。
- 复测日：**2026-11-20**（与 M2-8 复评同日，合并跑 `audit-dark-pages` 同口径脚本 + GSC 新窗口数据）。
- 达标线：convert ≤48%（58% - 10pp）。
- 前置依赖：Google 抓取配额（站外不可控）如实记录；若复测未达标但抓取增量仍为 0，按 M2-8 先例诚实转 blocked，不虚报。

*清单生成：2026-10-21 20:05。处置执行进度见作战板 M2-4 / M2-8 / M11-3 状态行。*
