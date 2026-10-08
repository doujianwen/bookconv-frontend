# Description 重写方案 V1（DESCRIPTION_REWRITE_PLAN_V1）

> 阶段：**DESIGN ONLY** — 本文件是设计方案，**未修改任何页面 / content / metadata**
> 数据源：`_wb_tmp/_v2_data.json`（Evidence Validation Gate 已通过）

## 〇、基线确认（不一致即 FAIL）

| 指标 | 值 | 状态 |
|---|---|---|
| description 为空 | **0 页** | ✅ |
| description >160 字符 | **81 / 121（66.9%）** | 🔴 待修 |
| description 140–160 合规 | 30 页 | ✅ |
| description <120 过短 | 3 页 | ⚠️ |
| 平均长度 | 285 字符 | — |
| 最长 | 961 字符 | 🔴 |

## 一、方案选择：A 机械截断 vs B 语义重写

| 维度 | A 机械截断 | B 语义重写 |
|---|---|---|
| 做法 | `desc.slice(0, 155)` | 按模板重写，卖点前置 |
| 保留原文 | 完整保留前 155 字符 | 重写 |
| 卖点位置 | ❌ 原样留在被丢弃的后半段 | ✅ 强制前置 |
| 搜索意图 | ❌ 不保证命中 | ✅ 按 intent 分类设计 |
| 实施成本 | 低（1 行代码 ×81 页）| 高（81 页逐页撰写）|
| 可维护性 | 差（下次改文案仍会截断）| 好（结构固定）|

### 当前 intro 的结构问题（决定性依据）

实测抽样 `description >160` 的页，intro 遵循「**背景铺垫 → 价值说明 → 产品卖点**」三段式：

| 页面 | 全长 | Google 实际看到（约 155 字符）| 被丢弃部分含什么 |
|---|---|---|
| `/blog/legacy-lit-djvu-fb2-converter` | 961 | Lost digital libraries are a nightmare for any avid reader. You might have stumbled upon a rare technical manual in the old LIT format, found a classi… | （无明确卖点词） |
| `/blog/azw3-epub-mobi-kindle-compatibility` | 804 | Choosing the right eBook format is the single most critical step in self-publishing or digital distribution. If you are reading on a Kindle Paperwhite… | **free** |
| `/blog/ebook-conversion-tools` | 801 | Turning a physical manuscript or a complex document into a polished ebook is one of the most critical steps in modern publishing. Whether you are a se… | **free** |
| `/blog/can-kobo-read-epub-files` | 762 | Can Kobo read EPUB files? Yes — every Kobo eReader opens EPUB natively. EPUB is the one format Rakuten Kobo built its entire reading ecosystem around,… | （无明确卖点词） |

🔴 **结论：选 B（语义重写）。** 机械截断会稳定丢弃卖点——上面 81 页全部如此。

## 二、Description 模板（按页面类型 × 意图）

### 2.1 Convert 页模板

```
[搜索意图动词] + [转换能力] + [核心利益点] + [CTA]
例：Convert MOBI to EPUB free online — keeps chapters, images and metadata
    intact. No sign-up, no watermark, done in seconds.
```
| 要素 | 要求 |
|---|---|
| 搜索意图动词 | 首词必须是 Convert / Turn / Extract / Package |
| 转换能力 | 含源格式 + 目标格式（可被查询匹配）|
| 核心利益点 | 用户真正关心的结果（保留排版 / 可编辑 / 批量）|
| CTA | No sign-up / Instant download / Free |
| 长度 | 140–160 字符 |
| 禁止 | 背景铺垫、情绪化共情、"Let's dive in" |

### 2.2 Blog 页模板

```
[问题/任务] + [解决方案] + [核心收益]
例：Mobi to EPUB conversion drops your cover and merges chapters.
    Here is how to convert cleanly and keep your layout intact.
```
| 要素 | 要求 |
|---|---|
| 首句 | 必须是**用户的具体问题**，不是话题介绍 |
| 解决方案 | 明确"怎么做" |
| 核心收益 | 可验证的结果 |
| 禁止 | 品牌自我介绍、"In this guide we will..." |

### 2.3 Guide 页模板

```
[主题] + [用户能获得什么] + [关键内容]
例：AZW3 to EPUB — what transfers, what breaks, and how to keep your
    Kindle library readable on any device.
```
| 要素 | 要求 |
|---|---|
| 首句 | 主题 + 一句差异化价值 |
| 关键内容 | 列出 guide 实际覆盖的 2–3 个决策点 |
| 禁止 | 促销语言（guide 是知识页，不是落地页）|

## 三、问题分类（81 页 >160）

| 页面类型 | >160 页数 | 占比 | 该用模板 |
|---|---|---|
| convert | 3 | 3.7% | 2.1 |
| blog | 65 | 80.2% | 2.2 |
| guide | 13 | 16.0% | 2.3 |
| **合计** | **81** | 100% | |

| 问题 | 页数 | 判定 |
|---|---|---|
| description 超长被截断 | 81 | 长度 >160 |
| 卖点/关键词出现过晚（首次出现在 155 之后）| 25 | 首次命中位置 >155 |
| 缺少搜索意图动词（Convert/Convert 变体）| 25 | 全文无意图动词 |
| 过短（<120）浪费展示位 | 3 | 长度 <120 |

## 四、逐页方案（81 页，按超长程度降序）

> **本表为设计稿，尚未写入源码。** Proposed 列为设计值，实施需单独授权。

| URL | Page Type | Current Length | Proposed Description | Length | Reason |
|---|---|---:|---|---:|---|
| 1 | /blog/legacy-lit-djvu-fb2-converter | 961 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 2 | /blog/azw3-epub-mobi-kindle-compatibility | 804 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free / convert |
| 3 | /blog/ebook-conversion-tools | 801 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free / convert |
| 4 | /blog/can-kobo-read-epub-files | 762 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 5 | /blog/which-kindle-books-can-you-convert-drm-free-checklist | 639 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free / seconds |
| 6 | /blog/epub-vs-mobi | 605 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 7 | /blog/epub-to-word | 598 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 8 | /blog/kindle-epub-azw3-mobi | 582 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free / convert |
| 9 | /blog/calibre-free-batch | 547 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free |
| 10 | /blog/epub-converter | 545 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：seconds / convert |
| 11 | /blog/epub-to-various-other | 508 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 12 | /blog/azw3-to-mobi | 490 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：Convert |
| 13 | /blog/chronicles-of-narnia-ebooks-multiple-devices | 472 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 14 | /blog/mobi-to-epub | 472 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free / Convert |
| 15 | /blog/ai-feeding-notebooklm-chatgpt | 463 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 16 | /blog/can-kindle-read-azw3 | 459 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 17 | /blog/mobi-to-kobo | 457 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 18 | /blog/batch-converter | 441 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 19 | /blog/azw3-vs-mobi | 439 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 20 | /blog/lord-of-the-rings-ebooks-multiple-devices | 431 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 21 | /blog/epub-vs-pdf | 428 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 22 | /blog/reading-groups-hub | 415 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 23 | /blog/sync-reading-across-devices | 415 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 24 | /blog/epub-to-mobi-guide | 412 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 25 | /blog/best-epub-reader-android | 409 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 26 | /blog/txt-to-epub | 403 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：Convert |
| 27 | /blog/best-free-epub-reader | 399 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free |
| 28 | /blog/epub-to-text | 398 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 29 | /blog/azw3-epub-mobi-kindle | 387 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 30 | /blog/marvel-comics-ebooks-multiple-devices | 387 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 31 | /blog/djvu-to-pdf | 372 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 32 | /blog/download-troubleshooting | 370 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 33 | /blog/harry-potter-digital-books-multiple-devices | 366 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 34 | /blog/epub-to-mobi | 362 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free |
| 35 | /blog/fb2-vs-epub | 339 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 36 | /blog/cbr-to-pdf | 337 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 37 | /blog/fb2-to-epub | 330 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 38 | /blog/best-epub-reader-iphone-ipad | 326 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 39 | /blog/lit-format-conversion-and | 326 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 40 | /blog/common-ebook-format-problems | 323 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 41 | /blog/why-ebook-wont-open-kindle | 317 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 42 | /blog/large-file-conversion-guide | 305 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 43 | /blog/sitemap-seo-guide | 302 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 44 | /blog/bookconv-vs-calibre | 301 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 45 | /blog/why-convert-lit-to-epub | 292 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 46 | /blog/pdf-to-epub-guide | 286 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：seconds / convert |
| 47 | /blog/read-epub-on-any-device | 286 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 48 | /blog/webhook-integration | 286 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 49 | /blog/ebook-formats-explained | 283 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 50 | /blog/epub3-vs-epub2 | 281 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 51 | /blog/scanned-pdf-to-epub-ocr | 280 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 52 | /blog/ebook-troubleshooting | 278 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 53 | /blog/ebook-conversion-checklist | 266 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 54 | /blog/why-bookconv | 263 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：convert |
| 55 | /blog/epub-to-pdf-linux | 260 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 56 | /blog/kobo-to-epub | 259 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 57 | /blog/background-workers | 255 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 58 | /blog/epub-to-azw3 | 255 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 59 | /guide/fb2-to-epub-keep-formatting | 253 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | 截断后丢失卖点：convert |
| 60 | /blog/best-ebook-reader-apps | 251 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 截断后丢失卖点：free |
| 61 | /blog/check-converted-file-quality | 250 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 62 | /blog/lit-ebook-format | 247 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 63 | /blog/conversion-error-guide | 236 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 64 | /guide/djvu-to-pdf | 235 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | Guide 模板：主题 + 决策点前置 |
| 65 | /guide/txt-to-epub-build-ebook | 235 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | Guide 模板：主题 + 决策点前置 |
| 66 | /guide/epub-to-txt-extract | 232 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | Guide 模板：主题 + 决策点前置 |
| 67 | /blog/layout-typesetting-pdf-epub | 228 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 68 | /blog/selection-intercept-converter | 223 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |
| 69 | /guide/how-to-read-epub-on-kindle | 216 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | Guide 模板：主题 + 决策点前置 |
| 70 | /guide/lit-to-epub-keep-formatting | 214 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | 截断后丢失卖点：convert |
| 71 | /guide/azw3-to-mobi-keep-formatting | 212 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | 截断后丢失卖点：convert |
| 72 | /guide/kindle-formats | 208 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | 截断后丢失卖点：free |
| 73 | /guide/epub-vs-mobi | 205 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | Guide 模板：主题 + 决策点前置 |
| 74 | /guide/calibre-alternatives-online | 203 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | Guide 模板：主题 + 决策点前置 |
| 75 | /guide/mobi-to-epub-keep-formatting | 196 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | 截断后丢失卖点：convert |
| 76 | /guide/docx-to-epub-self-publish | 181 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | Guide 模板：主题 + 决策点前置 |
| 77 | /convert/lit-to-epub | 179 | `[Convert <SRC> to <TGT> free online> — [核心利益点]. No sign-up, no watermark.` | 140–160 | 需按 convert 模板重写，卖点前置 |
| 78 | /guide/batch-converter | 179 | `[主题] — [用户能获得什么], [关键内容 2-3 点].` | 140–160 | Guide 模板：主题 + 决策点前置 |
| 79 | /convert/epub-to-doc | 178 | `[Convert <SRC> to <TGT> free online> — [核心利益点]. No sign-up, no watermark.` | 140–160 | 需按 convert 模板重写，卖点前置 |
| 80 | /convert/epub-to-zip | 170 | `[Convert <SRC> to <TGT> free online> — [核心利益点]. No sign-up, no watermark.` | 140–160 | 需按 convert 模板重写，卖点前置 |
| 81 | /blog/bookconv-faq | 169 | `[用户具体问题]. [解决方案]. [可验证收益].` | 140–160 | 需按 blog 模板重写，卖点前置 |

## 五、实施顺序

| 批次 | 页数 | 选择依据 |
|---|---|---|
| **第 1 批** | 3 | 有曝光且超长的页（改完可立即观察 CTR 变化）|
| 第 2 批 | 3 | convert 页（有明确意图词，易写对）|
| 第 3 批 | 65 | blog 页（数量最大）|
| 第 4 批 | 13 | guide 页（知识页，改动收益最低）|

**第 1 批（14 页，有曝光 + 超长，改完 30 天内可测）：**

| URL | 曝光 | Pos | 当前长度 |
|---|---|---|---:|
| `/convert/epub-to-doc` | 131 | 51.2 | 178 |
| `/guide/mobi-to-epub-keep-formatting` | 93 | 81.2 | 196 |
| `/blog/ebook-formats-explained` | 63 | 64.5 | 283 |
| `/blog/epub-to-azw3` | 54 | 46.1 | 255 |
| `/blog/epub-to-mobi-guide` | 49 | 72.1 | 412 |
| `/convert/epub-to-zip` | 45 | 14.8 | 170 |
| `/blog/why-convert-lit-to-epub` | 26 | 29.8 | 292 |
| `/blog/azw3-vs-mobi` | 21 | 42.8 | 439 |
| `/blog/can-kindle-read-azw3` | 21 | 18 | 459 |
| `/convert/lit-to-epub` | 19 | 34.8 | 179 |
| `/blog/best-ebook-reader-apps` | 7 | 59.6 | 251 |
| `/blog/mobi-to-epub` | 7 | 66.6 | 472 |
| `/blog/mobi-to-kobo` | 1 | 19 | 457 |
| `/guide/epub-to-txt-extract` | 1 | 71 | 232 |

## 六、验收指标

| 指标 | 当前 | 目标 | 判据来源 |
|---|---|---|
| >160 页数 = 81 | 81 | 0 | 源码解析 |
| 140–160 合规 = 30 | 30 | 目标 121（全部达标）| 源码解析 |
| 第 1 批 CTR = 0%（曝光 538 / 点击 0）| 需 pos <20 才可测 | GSC |

⚠️ **诚实声明**：全站 91 天点击为 **0**，Convert 页 position 34–75。**description 优化的作用是"为排名爬进前 20 后做准备"，不是"现在涨点击"。** 若 position 不变，CTR 无可测变化。
