# Authority 与 Internal Link 审计（INTERNAL_LINK_REPORT）· V2

> 生成：2026-10-07 17:24 · **V2 修订**
> 内链数据源：`_wb_tmp/_audit_links.json`（复刻 `src/lib/internal-links.ts` 打分逻辑，判据自检通过）
> 曝光数据源：`_wb_tmp/_v2_data.json`

## 〇、V1 错误纠正

| V1 表述 | V2 |
|---|---|
| 「guide 24 页全部零曝光，无一进入 Seed List」 | **3 页有曝光**：`/guide/calibre-vs-online-converter`、`/guide/epub-to-txt-extract`、`/guide/mobi-to-epub-keep-formatting`。V1 的「不投 guide 外链」结论**方向错误** |
| 「Top20 仅 1 页」 | 全站 5 / 资产 4 |

## 一、guide 页曝光实况（V2 修正 V1 的错误结论）

| URL | 曝光 | Pos | 桶 | 含义 |
|---|---|---|---|---|
| `/guide/ai-ebook-converter` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/azw3-to-epub-keep-formatting` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/azw3-to-mobi-keep-formatting` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/azw3-vs-mobi` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/batch-converter` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/best-ebook-converter` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/calibre-alternative` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/calibre-alternatives-online` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/calibre-vs-online-converter` | 43 | 48.7 | Top31-50 | **guide 类型能被 Google 认可** |
| `/guide/cbr-to-pdf` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/djvu-to-pdf` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/docx-to-epub-self-publish` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/epub-to-azw3-for-kindle` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/epub-to-mobi-keep-formatting` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/epub-to-txt-extract` | 1 | 71 | Top51+ | **guide 类型能被 Google 认可** |
| `/guide/epub-vs-mobi` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/fb2-to-epub-keep-formatting` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/fix-epub-to-pdf-formatting` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/how-to-read-epub-on-kindle` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/kindle-formats` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/lit-to-epub-keep-formatting` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | Top51+ | **guide 类型能被 Google 认可** |
| `/guide/pdf-to-epub-keep-formatting` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |
| `/guide/txt-to-epub-build-ebook` | 0 | — | 零曝光 | 需逐页排查（收录/内容/需求） |

| guide 分组 | 页数 | 曝光合计 |
|---|---|---|
| 有曝光 | 3 | 137 |
| 零曝光 | 21 | 0 |

🔴 **V1 说「guide 零曝光 ⇒ 不投外链」是错的。** `/guide/mobi-to-epub-keep-formatting` 93 曝光是**全站第 4**，且 pos 48.7 已在 Top31–50。

## 二、内链结构（沿用 V1 实测，判据未变）

| 指标 | 值 |
|---|---|
| Convert 页出站内链 | 恒为 6 条（3 blog + 3 guide），31 页一致 |
| Convert 零出站 | 0 页 |
| 零 Convert 入站的 blog | 32 / 63 |
| 零 Convert 入站的 guide | 7 / 24 |
| 入站最高 guide | `/guide/epub-to-mobi-keep-formatting`（12 页指向）|
| **反例** | `/convert/epub-to-zip` 无 guide 内链却 pos 14.8 ⇒ **内链非曝光必要条件** |

## 三、Evidence Validation Gate（本报告）

| # | 结论 | 表格可反查的数 | 反查方式 | 状态 |
|---|---|---|---|---|
| guide 有曝光 = 3 | 3 | 数表一「曝光>0」行 | ✅ PASS |
| guide 零曝光 = 21 | 21 | = 24 − 3 | ✅ PASS |
| guide 曝光合计 = 137 | 137 | Σ 表一曝光列 | ✅ PASS |

> **门禁：PASS（3/3）**
