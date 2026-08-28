# GSC 诊断：/blog/epub-to-mobi-guide 展示骤增

> 日期：2026-08-11 ｜ 数据：GSC「Performance on Search」导出（过滤器已锁定该页）
> 对比窗口：2026/7/25–7/31 vs 2026/8/1–8/7

## 1. 现象（两周对比）

| 指标 | 7/25–7/31 | 8/1–8/7 | 变化 |
|---|---|---|---|
| 展示 | 0 | 62 | 0 → 62 |
| 点击 | 0 | 0 | — |
| 点击率 | 0% | 0% | — |
| 平均排名 | 0（未进前 100） | 49.89 | 首次进入前 100 |

## 2. 结论：健康，不是异常

站点 7/26 上线，该页 8 月初才**首次进入 Google 前 100**。0→62 是「新页被测试展现」的正常**索引成熟**过程，**不是流量异动、也不是机器人/作弊尖峰**。
0 点击是因为平均排名 ~50（结果第 5 页），CTR≈0 属正常，并非内容质量失败。

## 3. 驱动因素拆解

- **查询**：长尾 epub→mobi 变体为主；含西语「convertir en mobi」(3)、「epub en mobi」(1) → 西/欧需求信号。
- **设备**：桌面 29 / 移动 2（桌面主导）。
- **国家**：美国 16 主导；西班牙、英国、法国各 3；印度 2；其余（意大利/冰岛/捷克/保加利亚）各 1。
- **搜索结果呈现**：空——未捕获任何富媒体 / FAQ 片段等 SERP 特性。

## 4. 关键发现：意图错位 / 轻度 cannibalization

指南页以 ~50 名抢到了**交易意图**词：

| 查询 | 展示 |
|---|---|
| convert epub to mobi | 3 |
| epub to mobi online | 2 |
| convert to mobi | 2 |
| mobi converter | 2 |
| mobi file converter | 1 |

这些词本该由**钱页 `/convert/epub-to-mobi`** 承接。而钱页当前整体 ~67 名，**反而被指南压在下面** → 优先级颠倒：用户搜「convert」看到的是 how-to 指南而非转换工具。

## 5. 已确认（线上验证）

- 指南 `title="How to Convert EPUB to MOBI Online: The BookConv Guide"` —— 信息 / How-to 意图正确，未越界抢交易词表述。
- 内链已落地且存活（curl 验证 200）：→ `/convert/epub-to-mobi`、→ `/convert/mobi-to-epub`、→ `/blog/epub-vs-mobi`（Item 4 集权结果）。

## 6. 行动建议（按 ROI）

1. **不把这当成问题**——展示上升是健康信号，说明页面开始被索引展现。
2. **真正杠杆**：把 `/convert/epub-to-mobi` 权威做上去，使其反超指南、拿走交易词。这正是 **Task F 内页外链**（用户进行中）的目标页之一。
3. **核对钱页 title/meta** 是否独占「Convert EPUB to MOBI」交易意图（Item 4 已补 `metaDescription`，建议顺手核对 `title` 同为交易表述）。
4. **西语需求**：评估是否建 es 版指南或核对 hreflang，承接「convertir en mobi」长尾。
5. **仅 1 周数据（62 展示）**，按手册 `accrual ≥10` 再判趋势；8/24 自动化复测会覆盖本页。

## 7. 代码改动

无。纯诊断，等待用户决策。
