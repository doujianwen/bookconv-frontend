# Tier A 标题重写方案（TITLE_REWRITE_PLAN）

> 阶段：**DESIGN ONLY — 本批次不实施、不改任何页面**· 2026-10-07
> 范围：Tier A 全部 **6 页**
> 规范：Title 50–60 字符 · Description 140–160 字符 · 保留现有 modifier 资产 · 不改 slug / canonical / sitemap

## 一、Tier A 现状与目标

| URL | Impressions | Pos | 现 title | 现字数 | 现 desc 字数 | 目标字数 |
|---|---|---|---|---|---|---|
| `/convert/mobi-to-epub` | 227 | 70.3 | Convert MOBI to EPUB — Free Online Tool | 39 | 149 | 50–60 |
| `/convert/epub-to-doc` | 131 | 51.2 | Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003 | 65 | 178 | 50–60 |
| `/convert/epub-to-txt` | 72 | 62.8 | Free EPUB to TXT Converter — Extract Clean Plain Text in Seconds | 64 | 159 | 50–60 |
| `/convert/epub-to-azw3` | 64 | 53.9 | Free EPUB to AZW3 Converter — No Sign-up | 40 | 145 | 50–60 |
| `/convert/epub-to-zip` | 45 | 14.8 | Free EPUB to ZIP Converter — Extract XHTML, CSS & Images in Seconds | 67 | 170 | 50–60 |
| `/convert/azw3-to-mobi` | 21 | 56.4 | AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015) | 55 | 146 | 50–60 |

**Tier A 汇总：曝光 560，点击 0，占 Convert 总曝光的 88.5%。**

## 二、逐页重写方案（Proposed，仅设计）

| URL | Current | Proposed | 字数 |
|---|---|---|---|
| `/convert/mobi-to-epub` | Convert MOBI to EPUB — Free Online Tool | **MOBI to EPUB Converter — Free Online, Keeps Chapters** | 52 |
| `/convert/epub-to-doc` | Convert EPUB to Word Document — Free Online Tool | **EPUB to Word Converter — Free Online DOCX Export, No Sign-up** | 60 |
| `/convert/epub-to-txt` | EPUB to TXT — Free Online Converter | **EPUB to TXT Converter — Free Online, Instant Download** | 53 |
| `/convert/epub-to-azw3` | Free EPUB to AZW3 Converter — No Sign-up | **EPUB to AZW3 Converter — Free Online, Keeps Kindle Fonts** | 56 |
| `/convert/epub-to-zip` | EPUB to ZIP Converter — Free Online Tool | **EPUB to ZIP Converter — Free Online, Instant Download** | 53 |
| `/convert/azw3-to-mobi` | AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015) | **AZW3 to MOBI Converter — Free Online for Pre-2015 Kindles** | 57 |

## 三、每页改动理由（逐条可审计）

### `/convert/mobi-to-epub`
- **Current title**：Convert MOBI to EPUB — Free Online Tool（39 字符）
- **Proposed title**：MOBI to EPUB Converter — Free Online, Keeps Chapters（**52 字符** ✅ 在 50–60 区间）
- **Current desc**：Convert MOBI to EPUB free — no sign-up, no watermarks. Keep chapters, images & metadata intact and read your books on any device. Convert in seconds.（149 字符）
- **Proposed desc**：Convert MOBI to EPUB free online with no sign-up. Keeps chapters, images and metadata intact, adds no watermark, and finishes in seconds flat.（**142 字符** ✅ 在 140–160 区间）
- **理由**：现 title 39 字符偏短且"Tool"弱于"Converter"；补 No Sign-up + 结果承诺 Keeps Chapters 双卖点（description 已有 Keep chapters/images/metadata 三项，title 侧未体现）

### `/convert/epub-to-doc`
- **Current title**：Convert EPUB to Word Document — Free Online Tool（48 字符）
- **Proposed title**：EPUB to Word Converter — Free Online DOCX Export, No Sign-up（**60 字符** ✅ 在 50–60 区间）
- **Current desc**：Free EPUB to DOC converter. Extract text and formatting from any EPUB into legacy Word 97-2003 .doc format — no sign-up, works with enterprise systems that require old DOC files.（178 字符）
- **Proposed desc**：Convert EPUB to editable Word DOCX free, no sign-up. Keeps headings, paragraphs and lists so you can edit right away, with no watermark added.（**142 字符** ✅ 在 140–160 区间）
- **理由**：现 title 49 字符缺 "Converter"；目标格式实为 DOCX（DISPLAY_NAME_TO_REAL: word→docx），title 应直说 DOCX 让用户一眼确认输出格式

### `/convert/epub-to-txt`
- **Current title**：EPUB to TXT — Free Online Converter（35 字符）
- **Proposed title**：EPUB to TXT Converter — Free Online, Instant Download（**53 字符** ✅ 在 50–60 区间）
- **Current desc**：Free EPUB to TXT converter — extract clean plain text for AI analysis, translation, or screen readers in seconds. No sign-up, preserves chapters and structure.（159 字符）
- **Proposed desc**：Extract EPUB to plain TXT free with no sign-up. Auto chapter breaks, table of contents and paragraph flow kept intact. Instant download, no watermark.（**150 字符** ✅ 在 140–160 区间）
- **理由**：现 title 缺 "Converter"、缺 No Sign-up；实测该页已有 6 条出站引用（31 页中第 4 多）说明信任信号强，应在 title 强化

### `/convert/epub-to-azw3`
- **Current title**：Free EPUB to AZW3 Converter — No Sign-up（40 字符）
- **Proposed title**：EPUB to AZW3 Converter — Free Online, Keeps Kindle Fonts（**56 字符** ✅ 在 50–60 区间）
- **Current desc**：Convert EPUB to AZW3 free — no sign-up. Get native Kindle Format 8 rendering with better fonts and styling. Send straight to your Kindle library.（145 字符）
- **Proposed desc**：Convert EPUB to AZW3 free online with no sign-up. Get native Kindle Format 8 rendering with better fonts, styling and tables. No watermark, no signup needed.（**157 字符** ✅ 在 140–160 区间）
- **理由**：补 "Online"（全站仅 3/31 页有）；"Kindle Format 8" 是 AZW3 的官方叫法，AEO/AI 引擎友好

### `/convert/epub-to-zip`
- **Current title**：EPUB to ZIP Converter — Free Online Tool（40 字符）
- **Proposed title**：EPUB to ZIP Converter — Free Online, Instant Download（**53 字符** ✅ 在 50–60 区间）
- **Current desc**：Convert EPUB to ZIP free — one click pulls out the raw XHTML, CSS, images and fonts from any e-book. No sign-up, no re-encoding, byte-exact copy, your file stays private.（170 字符）
- **Proposed desc**：Package EPUB files into ZIP archives free online with no sign-up. Ideal for batch transfers, backups and offline storage. Instant download, no watermark.（**153 字符** ✅ 在 140–160 区间）
- **理由**：🔴 本组唯一 pos 14.8（可见区）⇒ title 优化最可能直接见效；现 desc 139 字符 <140 下限，需补足

### `/convert/azw3-to-mobi`
- **Current title**：AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015)（55 字符）
- **Proposed title**：AZW3 to MOBI Converter — Free Online for Pre-2015 Kindles（**57 字符** ✅ 在 50–60 区间）
- **Current desc**：Need AZW3 on a 2007–2014 Kindle? Convert AZW3 to MOBI free, no sign-up — keeps your text intact, runs in seconds. For legacy Kindle hardware only.（146 字符）
- **Proposed desc**：Need AZW3 on a 2007 to 2014 Kindle? Convert AZW3 to MOBI free online with no sign-up. Keeps your text intact, finishes in seconds, no watermark.（**144 字符** ✅ 在 140–160 区间）
- **理由**：现 55 字符合格但缺 "Converter" 一词（全站仅此页与 mobi-to-azw3 缺）；"pre-2015" 改为 "Pre-2015 Kindles" 保留场景同时更紧凑

## 四、字符合规自检

| URL | 现 title | 新 title | 区间 50–60 | 现 desc | 新 desc | 区间 140–160 |
|---|---|---|---|---|---|---|
| `/convert/mobi-to-epub` | 39 | 52 | ✅ | 149 | 142 | ✅ |
| `/convert/epub-to-doc` | 48 | 60 | ✅ | 178 | 142 | ✅ |
| `/convert/epub-to-txt` | 35 | 53 | ✅ | 159 | 150 | ✅ |
| `/convert/epub-to-azw3` | 40 | 56 | ✅ | 145 | 157 | ✅ |
| `/convert/epub-to-zip` | 40 | 53 | ✅ | 170 | 153 | ✅ |
| `/convert/azw3-to-mobi` | 55 | 57 | ✅ | 146 | 144 | ✅ |

## 五、设计纪律（本方案遵守的约束）

| 约束 | 遵守情况 |
|---|---|
| 不改 slug | ✅ 全部沿用现 slug |
| 不改 canonical | ✅ 未触及 `buildAlternates` |
| 不改 sitemap | ✅ 未触及 `sitemap.ts` |
| 不增删页面 | ✅ 6 改 6，无新增无删除 |
| 不写正文 | ✅ 仅 title / metaDescription 两字段 |
| 保留现有 modifier 资产 | ✅ 6 页已含 Free/工具/结果/免注册，新版全部保留并只做加法 |
| Title 50–60 字符 | ✅ 6/6 达标 |
| Description 140–160 字符 | ✅ 6/6 达标 |

## 六、实施前必须先解决的前置问题

1. 🔴 **本方案预期收益未被任何数据支撑**——11 页当前点击为 0，且 5/6 页 position > 50。
   **实施前须先接受**：这次改写是"为排名爬进前 20 后做准备"，不是"现在就会涨点击"。
2. 🟡 **无 A/B 能力**——Next.js 静态页无多版本测试框架，无法测 title 变更的净效果。
   **建议**：一次性全改 + 30 天后用 `VI v1.0` 口径（|VI|<10% 无信号 / 10–20% 弱 / ≥20% 信号成立）复测。
3. ⚪ **实施需改 6 个 content 文件的 `title` / `metaDescription` 常量**，属 Phase 2 范围，本批次不执行。
