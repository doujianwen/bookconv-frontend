# SEO Recovery 最终决策（2026 Q4）

> 审计模式：**READ ONLY** · 2026-10-07 · 未修改任何源码
> 决策规则**全部可复算**，每条决策附实测依据（见各 Phase 报告）

## 一、决策分布

| 决策 | 页数 | 占比 | 曝光合计 |
|---|---|---|---|
| **ENHANCE** | 13 | 41.9% | 633 |
| **KEEP** | 17 | 54.8% | 0 |
| **REMOVE** | 1 | 3.2% | 0 |
| **MERGE** | 0 | 0.0% | 0 |

**关于 MERGE = 0**：本审计**不推荐任何合并**。理由：
1. 8-gram Jaccard 实测最高仅 0.026（阈值 0.40），**31 页对 blog/guide 无任何内容内耗**；
2. 9 组跨目录同名 slug（`mobi-to-epub` 等）的正文相似度 ≈ 0，合并会直接损失差异化而不解决任何已测问题；
3. 站内已有的 `epub-to-docx` → `epub-to-word` 301 证明"合并/去重"这条路项目已走过且有效，无需再扩大。

## 二、逐页决策表（31 页）

| URL | Tier | 曝光 | Pos | 实测字数 | 决策 | 原因（实测依据） |
|---|---|---|---|---|---|---|
| `/convert/mobi-to-epub` | A | 227 | 70.3 | 2486 | **ENHANCE** | Tier A（227 曝光 / pos 70.3）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/epub-to-doc` | A | 131 | 51.2 | 2879 | **ENHANCE** | Tier A（131 曝光 / pos 51.2）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/epub-to-txt` | A | 72 | 62.8 | 3088 | **ENHANCE** | Tier A（72 曝光 / pos 62.8）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/epub-to-azw3` | A | 64 | 53.9 | 1030 | **ENHANCE** | Tier A（64 曝光 / pos 53.9）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/epub-to-zip` | A | 45 | 14.8 | 739 | **ENHANCE** | Tier A（45 曝光 / pos 14.8）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/azw3-to-mobi` | A | 21 | 56.4 | 1661 | **ENHANCE** | Tier A（21 曝光 / pos 56.4）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/lit-to-epub` | B | 19 | 34.8 | 2203 | **ENHANCE** | Tier B（19 曝光 / pos 34.8）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/docx-to-epub` | B | 16 | 82.1 | 428 | **ENHANCE** | Tier B（16 曝光 / pos 82.1）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/azw3-to-epub` | B | 13 | 62.9 | 587 | **ENHANCE** | Tier B（13 曝光 / pos 62.9）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/rtf-to-epub` | B | 11 | 45.4 | 1156 | **ENHANCE** | Tier B（11 曝光 / pos 45.4）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/epub-to-mobi` | B | 8 | 74.8 | 2185 | **ENHANCE** | Tier B（8 曝光 / pos 74.8）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/epub-to-rtf` | C | 3 | 43 | 1112 | **ENHANCE** | Tier C（3 曝光 / pos 43）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/pdf-to-epub` | C | 3 | 58.7 | 1575 | **ENHANCE** | Tier C（3 曝光 / pos 58.7）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/azw-to-mobi` | D | — | — | 1127 | **KEEP** | 零曝光、内容 C 档（1127 字）；证据不足以判死，列入 90 天观察 |
| `/convert/azw3-to-pdf` | D | — | — | 973 | **KEEP** | 零曝光、内容 C 档（973 字）；证据不足以判死，列入 90 天观察 |
| `/convert/cbr-to-pdf` | D | — | — | 1568 | **KEEP** | 零曝光但内容达 B 档（1568 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/chm-to-mobi` | D | — | — | 1014 | **KEEP** | 零曝光、内容 C 档（1014 字）；证据不足以判死，列入 90 天观察 |
| `/convert/djvu-to-pdf` | D | — | — | 1435 | **KEEP** | 零曝光但内容达 B 档（1435 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/doc-to-epub` | D | — | — | 1222 | **KEEP** | 零曝光但内容达 B 档（1222 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/epub-to-html` | D | — | — | 1180 | **KEEP** | 零曝光、内容 C 档（1180 字）；证据不足以判死，列入 90 天观察 |
| `/convert/epub-to-jpg` | D | — | — | 1495 | **KEEP** | 零曝光但内容达 B 档（1495 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/epub-to-pdf` | D | — | — | 1631 | **KEEP** | 零曝光但内容达 B 档（1631 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/epub-to-png` | D | — | — | 1472 | **KEEP** | 零曝光但内容达 B 档（1472 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/epub-to-word` | D | — | — | 1522 | **KEEP** | 零曝光但内容达 B 档（1522 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/fb2-to-epub` | D | — | — | 1101 | **KEEP** | 零曝光、内容 C 档（1101 字）；证据不足以判死，列入 90 天观察 |
| `/convert/html-to-epub` | D | — | — | 1394 | **KEEP** | 零曝光但内容达 B 档（1394 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/lit-to-mobi` | D | — | — | 1130 | **KEEP** | 零曝光、内容 C 档（1130 字）；证据不足以判死，列入 90 天观察 |
| `/convert/mobi-to-azw3` | D | — | — | 1468 | **KEEP** | 零曝光但内容达 B 档（1468 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/mobi-to-pdf` | D | — | — | 1238 | **KEEP** | 零曝光但内容达 B 档（1238 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/mobi-to-txt` | D | — | — | 1089 | **KEEP** | 零曝光、内容 C 档（1089 字）；证据不足以判死，列入 90 天观察 |
| `/convert/txt-to-epub` | D | — | — | 528 | **REMOVE** | 实测 528 字（C/D 档）、零曝光、无 guide 内链—— 三重信号指向低价值 |

## 三、REMOVE 清单（需人工二次确认后才执行）

🔴 **本报告为 READ ONLY 审计，未删除任何页面。** 以下 4 页建议 REMOVE，但执行前必须先回答一个本数据集无法回答的问题：

> **这些格式组合是否真的没有搜索需求？** 
> 本审计只有 GSC 曝光数据（= Google 认为值得展示的次数），**没有搜索量数据**。
> "零曝光" 与 "没人搜" 是两件不同的事。

| # | URL | 实测字数 | 声明字数 | 曝光 | 无 guide 内链 | 旧清单中的月搜索量记载 |
|---|---|---|---|---|---|---|
| 1 | `/convert/txt-to-epub` | 528 | 750 | 0 | 有 | 2,900 |

⚠️ **内部矛盾必须先解决**：如果旧清单记的搜索量属实（`docx-to-epub` 3,600/月、`txt-to-epub` 2,900/月、`azw3-to-epub` 5,400/月），那这些页**不该被删，而该被推到 Google 面前**（请求索引 / 提权重 / 补内链）。

🔴 **而项目已有一条硬证据反对"删"**：`数据分析/转换页收录核对清单.md` 曾把 `epub-to-zip` 判为"伪需求、建议 noindex"，**结果该页现在是全站 Convert 曝光第 5（45 曝光、pos 14.8，全站最佳 position）**。
⇒ **同一个"伪需求"判断已经被现实验证为错。** 在没有搜索量数据的情况下再删 4 页，是重复同一类错误。

**修正后的建议**：把这 4 页从 REMOVE 降级为 **KEEP（观察）**，先用 Index Coverage + 搜索量数据确认，再于 90 天节点复评。

## 四、修正后的最终决策分布

| 决策 | 页数 | 占比 |
|---|---|---|
| **ENHANCE** | 13 | 41.9% |
| **KEEP** | 18 | 58.1% |
| **REMOVE** | 0 | 0.0% |
| **MERGE** | 0 | 0.0% |

## 五、修正后决策表

| URL | 决策 | 原因 |
|---|---|---|
| `/convert/mobi-to-epub` | **ENHANCE** | Tier A（227 曝光 / pos 70.3）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/epub-to-doc` | **ENHANCE** | Tier A（131 曝光 / pos 51.2）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/epub-to-txt` | **ENHANCE** | Tier A（72 曝光 / pos 62.8）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/epub-to-azw3` | **ENHANCE** | Tier A（64 曝光 / pos 53.9）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/epub-to-zip` | **ENHANCE** | Tier A（45 曝光 / pos 14.8）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/azw3-to-mobi` | **ENHANCE** | Tier A（21 曝光 / pos 56.4）—— 已被 Google 确认有需求，0 点击说明卡在展示层 |
| `/convert/lit-to-epub` | **ENHANCE** | Tier B（19 曝光 / pos 34.8）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/docx-to-epub` | **ENHANCE** | Tier B（16 曝光 / pos 82.1）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/azw3-to-epub` | **ENHANCE** | Tier B（13 曝光 / pos 62.9）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/rtf-to-epub` | **ENHANCE** | Tier B（11 曝光 / pos 45.4）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/epub-to-mobi` | **ENHANCE** | Tier B（8 曝光 / pos 74.8）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/epub-to-rtf` | **ENHANCE** | Tier C（3 曝光 / pos 43）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/pdf-to-epub` | **ENHANCE** | Tier C（3 曝光 / pos 58.7）—— 已有展示机会，缺 CTR 与深度 |
| `/convert/azw-to-mobi` | **KEEP** | 零曝光、内容 C 档（1127 字）；证据不足以判死，列入 90 天观察 |
| `/convert/azw3-to-pdf` | **KEEP** | 零曝光、内容 C 档（973 字）；证据不足以判死，列入 90 天观察 |
| `/convert/cbr-to-pdf` | **KEEP** | 零曝光但内容达 B 档（1568 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/chm-to-mobi` | **KEEP** | 零曝光、内容 C 档（1014 字）；证据不足以判死，列入 90 天观察 |
| `/convert/djvu-to-pdf` | **KEEP** | 零曝光但内容达 B 档（1435 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/doc-to-epub` | **KEEP** | 零曝光但内容达 B 档（1222 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/epub-to-html` | **KEEP** | 零曝光、内容 C 档（1180 字）；证据不足以判死，列入 90 天观察 |
| `/convert/epub-to-jpg` | **KEEP** | 零曝光但内容达 B 档（1495 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/epub-to-pdf` | **KEEP** | 零曝光但内容达 B 档（1631 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/epub-to-png` | **KEEP** | 零曝光但内容达 B 档（1472 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/epub-to-word` | **KEEP** | 零曝光但内容达 B 档（1522 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/fb2-to-epub` | **KEEP** | 零曝光、内容 C 档（1101 字）；证据不足以判死，列入 90 天观察 |
| `/convert/html-to-epub` | **KEEP** | 零曝光但内容达 B 档（1394 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/lit-to-mobi` | **KEEP** | 零曝光、内容 C 档（1130 字）；证据不足以判死，列入 90 天观察 |
| `/convert/mobi-to-azw3` | **KEEP** | 零曝光但内容达 B 档（1468 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/mobi-to-pdf` | **KEEP** | 零曝光但内容达 B 档（1238 字）且有 guide 内链支撑；无证据表明其无效，属"待观察" |
| `/convert/mobi-to-txt` | **KEEP** | 零曝光、内容 C 档（1089 字）；证据不足以判死，列入 90 天观察 |
| `/convert/txt-to-epub` | **KEEP** | [降级] 实测 528 字（C/D 档）、零曝光、无 guide 内链—— 三重信号指向低价值 —— 但旧清单记载该词月搜索量 2,900–5,400，且 epub-to-zip 的先例证明"零曝光=伪需求"判断已被证伪，故不删，列入观察 |
