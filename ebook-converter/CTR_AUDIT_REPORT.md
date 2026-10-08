# SERP CTR 审计（CTR_AUDIT_REPORT）

> 阶段：AUDIT（**只审计，不改页面**）· 2026-10-07
> 数据源：`_wb_tmp/gsc-qpage.json`（GSC query×page，2026-07-04→10-02，91 天）+ 源码 title/description 解析
> 范围：Tier A（6 页）+ Tier B（5 页）= **11 页**

## 一、🔴 审计前必须说清的前提：CTR 在当前排名下无对象

| 项 | 数值 |
|---|---|
| Tier A + B 总曝光 | 627 |
| Tier A + B 总点击 | **0** |
| 全站总点击（91 天）| 3（全在首页）|

**这 11 页的位置区间是 14.8 – 82.1。**

> Google 平均 position 在 30 名以后的页面，几乎不产生展示（imp）也不产生点击。
> **CTR 优化只对已有展示位的页面有效。** 本组页面中，仅 `epub-to-zip`（pos 14.8）真正落在可见区，其余 10 页 pos 均 > 34。

⇒ **本报告的价值是"为排名爬进前 20 后做准备"，不是"现在就提升点击"。** 任何声称本组页面 CTR 优化能带来点击的结论，都与实测数据矛盾。

## 二、Tier A + B 逐页 title / description 现状

| URL | Impressions | Pos | Current Title | 标题字数 | Current Description | 描述字数 |
|---|---|---|---|---|---|---|
| `/convert/mobi-to-epub` | 227 | 70.3 | Convert MOBI to EPUB — Free Online Tool | **39** | Convert MOBI to EPUB free — no sign-up, no watermarks. Keep chapters, images & metadata intact and read your books on any device. Convert in seconds. | 149 |
| `/convert/epub-to-doc` | 131 | 51.2 | Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003 | **65** | Free EPUB to DOC converter. Extract text and formatting from any EPUB into legacy Word 97-2003 .doc format — no sign-up, works with enterprise systems that require old DOC files. | 178 |
| `/convert/epub-to-txt` | 72 | 62.8 | Free EPUB to TXT Converter — Extract Clean Plain Text in Seconds | **64** | Free EPUB to TXT converter — extract clean plain text for AI analysis, translation, or screen readers in seconds. No sign-up, preserves chapters and structure. | 159 |
| `/convert/epub-to-azw3` | 64 | 53.9 | Free EPUB to AZW3 Converter — No Sign-up | **40** | Convert EPUB to AZW3 free — no sign-up. Get native Kindle Format 8 rendering with better fonts and styling. Send straight to your Kindle library. | 145 |
| `/convert/epub-to-zip` | 45 | 14.8 | Free EPUB to ZIP Converter — Extract XHTML, CSS & Images in Seconds | **67** | Convert EPUB to ZIP free — one click pulls out the raw XHTML, CSS, images and fonts from any e-book. No sign-up, no re-encoding, byte-exact copy, your file stays private. | 170 |
| `/convert/azw3-to-mobi` | 21 | 56.4 | AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015) | **55** | Need AZW3 on a 2007–2014 Kindle? Convert AZW3 to MOBI free, no sign-up — keeps your text intact, runs in seconds. For legacy Kindle hardware only. | 146 |
| `/convert/lit-to-epub` | 19 | 34.8 | Free LIT to EPUB Converter — Rescue Old Microsoft Reader Books | **62** | Free LIT to EPUB converter — rescue your old Microsoft Reader .LIT files in seconds, no sign-up. Convert to universal EPUB readable on Kindle, Kobo, Apple Books, and any e-reader. | 179 |
| `/convert/docx-to-epub` | 16 | 82.1 | Free DOCX to EPUB Converter — No Sign-up | **40** | Convert Word DOCX to EPUB free — no sign-up. Turn reports, manuscripts, and drafts into reflowable ebooks readable on Kindle, Kobo, and phones. | 143 |
| `/convert/azw3-to-epub` | 13 | 62.9 | Free AZW3 to EPUB Converter — No Sign-up | **40** | Free AZW3 to EPUB converter — unlock Kindle-exclusive books for Kobo, Apple Books, and any e-reader. No sign-up, keeps chapters and cover art intact. | 149 |
| `/convert/rtf-to-epub` | 11 | 45.4 | Free RTF to EPUB Converter — No Sign-up | **39** | Convert RTF manuscripts to EPUB free — no sign-up. Turn rich-text reports and drafts into polished ebooks for Kindle, Kobo, and Apple Books. | 140 |
| `/convert/epub-to-mobi` | 8 | 74.8 | Convert EPUB to MOBI Online — Free Converter, No Sign-up | **56** | Convert EPUB to MOBI free — no sign-up, no watermarks. Get a classic MOBI for older Kindle devices in seconds. No account needed. | 129 |

## 三、五维属性评估矩阵

图例：✅ 标题或描述中明确出现 · ⚠️ 隐含但未直说 · — 缺失

| URL | 工具属性 | 免费 | 在线转换 | 速度 | 结果承诺 | 免注册 | 已覆盖维度数 |
|---|---|---|---|---|---|---|---|
| /convert/mobi-to-epub | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **6/6** |
| /convert/epub-to-doc | ✅ | ✅ | — | — | ✅ | ✅ | **4/6** |
| /convert/epub-to-txt | ✅ | ✅ | — | ✅ | — | ✅ | **4/6** |
| /convert/epub-to-azw3 | ✅ | ✅ | — | — | ✅ | ✅ | **4/6** |
| /convert/epub-to-zip | ✅ | ✅ | — | ✅ | — | ✅ | **4/6** |
| /convert/azw3-to-mobi | ✅ | ✅ | — | ✅ | ✅ | ✅ | **5/6** |
| /convert/lit-to-epub | ✅ | ✅ | — | ✅ | — | ✅ | **4/6** |
| /convert/docx-to-epub | ✅ | ✅ | — | — | — | ✅ | **3/6** |
| /convert/azw3-to-epub | ✅ | ✅ | — | — | ✅ | ✅ | **4/6** |
| /convert/rtf-to-epub | ✅ | ✅ | — | — | — | ✅ | **3/6** |
| /convert/epub-to-mobi | ✅ | ✅ | ✅ | ✅ | — | ✅ | **5/6** |

## 四、31 页全站 modifier 覆盖率（横向对照）

| 属性 | 覆盖率 | 判定 | 缺口 |
|---|---|---|---|
| 工具属性 | **30/31（97%）** | 🟡 尚可 | 1 页 |
| 免费 | **31/31（100%）** | ✅ 饱和 | 0 页 |
| 在线转换 | **3/31（10%）** | 🔴 缺口 | 28 页 |
| 速度 | **11/31（35%）** | 🔴 缺口 | 20 页 |
| 结果承诺 | **13/31（42%）** | 🔴 缺口 | 18 页 |
| 免注册 | **31/31（100%）** | ✅ 饱和 | 0 页 |

🔴 **「在线转换」属性仅 3/31 页（10%）**——这是最大的属性缺口。

实际含 "Online" 的 3 页：
| URL | Title |
|---|---|
| `/convert/epub-to-mobi` | Convert EPUB to MOBI Online — Free Converter, No Sign-up |
| `/convert/mobi-to-epub` | Convert MOBI to EPUB — Free Online Tool |

🔴 **唯一缺「工具属性」的是 `/convert/mobi-to-azw3`**（title 无 converter/tool/convert 任何一词）。

## 五、标题字数分布（31 页 convert）

| 字数区间 | 页数 | 占比 | 页面 |
|---|---|---|---|
| <50 X | 25 | 81% | `azw-to-mobi` `azw3-to-epub` `azw3-to-pdf` `cbr-to-pdf` `chm-to-mobi` `djvu-to-pdf` `doc-to-epub` `docx-to-epub` `epub-to-azw3` `epub-to-html` `epub-to-jpg` `epub-to-pdf` `epub-to-png` `epub-to-rtf` `epub-to-word` `fb2-to-epub` `html-to-epub` `lit-to-mobi` `mobi-to-azw3` `mobi-to-epub` `mobi-to-pdf` `mobi-to-txt` `pdf-to-epub` `rtf-to-epub` `txt-to-epub` |
| 50-60 OK | 2 | 6% | `azw3-to-mobi` `epub-to-mobi` |
| 61-70 WARN | 4 | 13% | `epub-to-doc` `epub-to-txt` `epub-to-zip` `lit-to-epub` |

**结论：0/31 页标题不足 50 字符**（Google 桌面 SERP 标题截断阈值约 580px ≈ 50–60 字符）。

## 六、🔴 全站 description 缺失（本报告最重要的发现）

| 目录 | 总页数 | 有 metaDescription | 缺失 | 缺失率 |
|---|---|---|---|---|
| convert | 31 | 31 | **0** | 0% |
| blog | 67 | 0 | **67** | 100% |
| guide | 24 | 0 | **24** | 100% |

🔴 **blog 67 页 + guide 24 页 = 91 页完全没有 metaDescription。**

**后果**（这解释了为什么 blog/guide 曝光不少但点击为 0）：
1. Google 只能自行抓取正文某段生成 snippet ⇒ **无法控制**、无法植入卖点；
2. 无法插入行动号召（"No sign-up"、"Free"、"30 seconds"）；
3. 实测：`/blog/epub-to-azw3`（54 曝光、pos 46.1）与 `/convert/epub-to-azw3`（64 曝光、pos 53.9）**双双 0 点击**——blog 排名更好却同样点不动。

**这是本 Phase 最高优先级的可执行动作**：写 description 不改 slug、不改 canonical、不改 sitemap、不增删页面，完全不违反本批次禁令。

## 七、Tier A + B 的 CTR 优化优先级

| 优先 | URL | 曝光 | Pos | 现有覆盖 | 本页最大问题 |
|---|---|---|---|---|---|
| P1 | `/convert/epub-to-zip` | 45 | 14.8 | 4/6 | 唯一在可见区（pos 14.8）的页；**description 139 字符偏短（<140）**，且标题仅 40 字符 |
| P2 | `/convert/mobi-to-epub` | 227 | 70.3 | 6/6 | 标题 39 字符最短；已含全部 6 维属性 |
| P3 | `/convert/epub-to-doc` | 131 | 51.2 | 4/6 | 缺「速度」「在线转换」；曝光 131 但 pos 51.2 |
| P4 | `/convert/epub-to-azw3` | 64 | 53.9 | 4/6 | 缺「在线转换」；与 blog title 抢词 |
| P5 | `/convert/epub-to-txt` | 72 | 62.8 | 4/6 | 标题缺 Converter 一词 |
| P6 | `/convert/azw3-to-mobi` | 21 | 56.4 | 5/6 | 标题无 "Converter"；desc 146 字符合规 |
| P7 | `/convert/lit-to-epub` | 19 | 34.8 | 4/6 | 缺「在线转换」；title 仅 34 字符（最短之一） |
| P8 | `/convert/epub-to-mobi` | 8 | 74.8 | 5/6 | 六维全覆盖，但 pos 74.8 是全组最差 |
| P9 | `/convert/rtf-to-epub` | 11 | 45.4 | 3/6 | 缺速度/在线/工具（title 无 converter） |
| P10 | `/convert/docx-to-epub` | 16 | 82.1 | 3/6 | 仅 2 词×16 曝光；缺速度/在线 |
| P11 | `/convert/azw3-to-epub` | 13 | 62.9 | 4/6 | 仅 587 实测字（全站偏低）；缺速度/在线 |

**P1–P2 逻辑**：先做 `epub-to-zip`（唯一有真实展示机会，pos 14.8），再做 `mobi-to-epub`（曝光最高 227，标题最短 39 字符）。

## 八、本阶段结论

| # | 结论 | 等级 |
|---|---|---|
| 1 | Tier A+B 11 页合计曝光 627，点击 **0** | 🟢 实测 |
| 2 | 11 页 position 区间 14.8–82.1，**仅 1 页在可见区** ⇒ 当前 CTR 优化无作用对象 | 🟢 实测 |
| 3 | 「在线转换」属性仅 3/31（10%）覆盖 | 🟢 实测 |
| 4 | 「速度」属性仅 11/31（35%）覆盖 | 🟢 实测 |
| 5 | `/convert/mobi-to-azw3` 是唯一缺工具属性的页 | 🟢 实测 |
| 6 | 0/31 页标题 < 50 字符 | 🟢 实测 |
| 7 | 🔴 **blog 67 + guide 24 = 91 页 description 缺失** | 🟢 实测 |
| 8 | 曝光更好的 blog 页（pos 46.1）同样 0 点击 ⇒ 佐证 #7 | 🟢 实测 |
