# O1 词页正文草稿 · 审稿版（5 页 · 待 claim 审核后建页）

> 数据来源：Brave 实测基线 `geo/geo-baseline-brave-v1.md`（280 结果 / bookconv 0 被引 / 25 缺口）。
> 这 5 个 slug 目前 **404 缺口**，被 g2 / alternativeto / 软文站 100% 占位。建页是 P0 最高杠杆动作。
>
> **渲染约束（已确认）**：guide 页渲染器 `src/data/blog/types.ts::renderMarkdownToHtml` **不支持 markdown 表格**，
> 故所有对比一律用「**加粗标签：内容**」列表（与现成 `calibre-vs-online-converter.ts` 一致）。
> 正文全英文、禁反引号、内链用 `/convert/{src}-to-{tgt}` 真实 slug；FAQ 走结构化 `faqs` 字段。
>
> **Claim 标记规则**
> - `[OK]` 可主张（站点行为 / 公开事实可验证）
> - `[VERIFY]` 待运维/产品书面确认后写入
> - `[FORBID]` 禁止写入（无依据 / 绝对化表述）

---

## 1. calibre-alternative

```ts
export const slug = 'calibre-alternative'
export const title = 'Calibre Alternative: Free Online Ebook Converter, No Install'
export const problem = 'Don’t want to install and learn Calibre for a one-off file? Here is what a lightweight Calibre alternative gives you — and where Calibre still wins.'
export const date = '2026-08-07'
export const tags = ['calibre alternative', 'online ebook converter', 'no install', 'free converter']
export const keyTakeaways = [
  'A browser-based converter covers most one-off conversion needs without installing Calibre. [OK]',
  'Calibre still wins for bulk jobs, offline privacy, and device-specific tweaks. [OK]',
  'BookConv is built on the Calibre engine, so you get Calibre’s format support in a browser. [OK]',
  'Choose by volume and privacy, not by which tool is "better" in the abstract. [OK]',
]
export const content = {
  intro: 'Every conversion thread ends with "just install Calibre." But for a single file, installing a full library manager is overkill. A Calibre alternative is simply a lighter way to get the same result — usually a free converter that runs in your browser. This page shows what you keep, what you give up, and how to decide.',
  sections: [
    {
      heading: 'When you actually want a Calibre alternative',
      body: `You probably don’t need Calibre if:\n\n- The file is a **one-off** — convert it and move on.\n- You are on a **shared or locked-down device** where installing software is a hassle.\n- You want a result **now**, without learning a desktop app’s menus.\n- The file is **not sensitive** enough to worry about uploading it briefly.\n\nIn those cases a free online converter like [BookConv](https://www.bookconv.com) does the job in three steps.`,
    },
    {
      heading: 'BookConv vs Calibre at a glance',
      body: `**Install required:** BookConv — no. Calibre — yes (desktop app).\n\n**Account required:** BookConv — no. Calibre — no.\n\n**Format pairs:** BookConv — 27 (EPUB, MOBI, PDF, AZW3, TXT and more). Calibre — very broad, including niche formats.\n\n**Best for:** BookConv — single quick files in the browser. Calibre — bulk, offline, device profiles.\n\n**Privacy:** BookConv — encrypted transfer, file deleted automatically after conversion. [VERIFY: confirm deletion window with ops before publishing this line]\nCalibre — fully offline, file never leaves your machine.\n\n**Engine:** BookConv — built on the open-source Calibre conversion engine. [OK]`,
    },
    {
      heading: 'What you give up without Calibre',
      body: `An online alternative is not a full replacement:\n\n- **No bulk automation** — you convert one file at a time. [OK]\n- **No offline mode** — the file is processed on a server. [OK]\n- **Less fine control** over margins, fonts, and device-specific output. [OK]\n\nIf you convert constantly or handle private manuscripts, keep Calibre installed.`,
    },
    {
      heading: 'What you gain with an online alternative',
      body: `The trade is usually worth it for everyday files:\n\n- **Zero setup** — open the page, drop the file, download the result. [OK]\n- **Automatic handling** of images, SVG covers, and format quirks that break EPUB↔PDF. [OK]\n- **Same engine** — because BookConv runs on Calibre’s converter, format support carries over. [OK]\n\nStart here: [Convert EPUB to PDF](/convert/epub-to-pdf).`,
    },
    {
      heading: 'How to choose',
      body: `**Use a Calibre alternative (BookConv) when:** it is a one-off file, you are on a device without Calibre, or you want the result now.\n\n**Use Calibre when:** you convert in bulk, need device-specific output, or the file is private enough that any upload is a non-starter.\n\nMost people keep Calibre installed but rarely open it — and bookmark a fast online converter for everything else.`,
    },
  ],
}
export const faqs = [
  { question: 'Is there a free Calibre alternative?', answer: 'Yes. BookConv is a free, no-account ebook converter that runs in the browser and covers 27 format pairs including EPUB, MOBI, PDF, AZW3 and TXT. [OK]' },
  { question: 'Does BookConv use Calibre?', answer: 'Yes. BookConv is built on the open-source Calibre conversion engine, so it inherits Calibre’s format support while adding a browser UI and automatic image and cover handling. [OK]' },
  { question: 'Can an online converter replace Calibre completely?', answer: 'For one-off files, mostly yes. For bulk automation, offline privacy, and fine device control, Calibre is still the better tool. They are complementary, not strictly competing. [OK]' },
  { question: 'Is an online Calibre alternative safe for private files?', answer: 'Reputable converters use encrypted HTTPS and auto-delete files after conversion, but the file does touch a server. For sensitive documents, Calibre’s fully offline mode is safer. [VERIFY: pair with published privacy wording]' },
  { question: 'Which formats can I convert without installing Calibre?', answer: 'With BookConv you can convert 27 format pairs — EPUB, MOBI, PDF, AZW3, TXT and more — directly in the browser with no install. [OK]' },
  { question: 'Do I need to install anything to convert an ebook?', answer: 'No. An online converter like BookConv runs entirely in the browser. Calibre only makes sense if you convert often or need offline privacy. [OK]' },
]
// formats 驱动 CTA: Convert EPUB to PDF for free → /convert/epub-to-pdf
// formats: { source: 'epub', target: 'pdf' }
```

### Claim 审核清单（calibre-alternative）
- [OK] 免费、免注册 → 站点行为可验证
- [OK] 27 格式对 → CONVERSION_MAP 实数为 27（已数）
- [OK] 基于 Calibre 引擎 → 项目事实（记忆 §4 Calibre 为核心引擎）
- [VERIFY] "文件转换后自动删除 / 加密传输" → **发布前必须运维书面确认删除窗口**，否则整段隐私表述降级或删除
- [FORBID] "比 Calibre 更快/更好" 等绝对化 → 已规避，仅做场景化对比

---

## 2. ai-ebook-converter

```ts
export const slug = 'ai-ebook-converter'
export const title = 'AI Ebook Converter: Preparing Ebooks for NotebookLM, ChatGPT & More'
export const problem = '“AI ebook converter” usually means one of two things — and only one of them is real. Here is how to get your ebook ready for AI tools without the hype.'
export const date = '2026-08-07'
export const tags = ['ai ebook converter', 'notebooklm', 'chatgpt', 'ebook to text']
export const keyTakeaways = [
  '“AI ebook converter” most often means a converter that feeds AI tools like NotebookLM and ChatGPT. [OK]',
  'The practical goal is clean text or PDF output those tools can ingest. [OK]',
  'BookConv exports TXT and PDF that upload directly to NotebookLM and ChatGPT. [OK]',
  'No converter “uses AI” to transform files — the value is clean, structured output. [FORBID claim reversed: do not imply BookConv is AI-powered]',
]
export const content = {
  intro: 'Search “AI ebook converter” and you will find tools promising AI magic. In practice, “AI ebook converter” means one of two things: a converter that prepares ebooks for AI assistants, or marketing fluff. This page cuts through it: what actually helps your file land cleanly in NotebookLM or ChatGPT.',
  sections: [
    {
      heading: 'What “AI ebook converter” really means',
      body: `There are two readings:\n\n- **Prep for AI tools** — convert an ebook into TXT or PDF that NotebookLM, ChatGPT, or Claude can ingest. This is real and useful. [OK]\n- **“AI-powered conversion”** — the idea that a model rewrites or enhances the file. Most “AI converters” are just normal converters with an AI label. [OK — descriptive, not a claim about BookConv]\n\nBookConv fits the first reading: it produces clean TXT and PDF built for AI ingestion. [OK]`,
    },
    {
      heading: 'Best output format for AI ingestion',
      body: `**Plain TXT:** strips layout, keeps the text — ideal for NotebookLM and ChatGPT when you only need content. [OK]\n\n**PDF:** keeps layout and is accepted by NotebookLM and ChatGPT file upload. [OK]\n\n**EPUB/MOBI:** not directly ingestible by most AI tools — convert first. [OK]\n\nFor clean AI ingestion, TXT is usually preferred; for layout fidelity, PDF. Start here: [EPUB to TXT](/convert/epub-to-txt) or [EPUB to PDF](/convert/epub-to-pdf).`,
    },
    {
      heading: 'How to get an ebook into NotebookLM or ChatGPT',
      body: `1. Convert the ebook to **TXT or PDF** with BookConv. [OK]\n2. **Download** the result. [OK]\n3. **Upload** it directly to NotebookLM or ChatGPT’s file input. [OK — NotebookLM/CHatGPT accept TXT/PDF is public fact]\n\nBoth tools accept TXT and PDF as source files, so no extra step is needed.`,
    },
    {
      heading: 'What BookConv does and does not do',
      body: `**Does:** convert 27 format pairs in the browser, free, no account; export clean TXT/PDF for AI tools. [OK]\n\n**Does not:** rewrite, summarize, or “AI-enhance” your file. BookConv is a converter, not a language model. [OK — honest boundary]\n\nIf you want summarization, run the converted TXT through ChatGPT or NotebookLM afterward.`,
    },
    {
      heading: 'Choosing a converter for AI workflows',
      body: `Pick by output quality, not by the “AI” label:\n\n- Need **clean text for RAG/NotebookLM** → TXT output, watch for layout noise. [OK]\n- Need **layout preserved** → PDF. [OK]\n- Want **no account, instant** → BookConv. [OK]\n\nThe “AI” in your workflow is the assistant you feed the file to — not the converter.`,
    },
  ],
}
export const faqs = [
  { question: 'What is an AI ebook converter?', answer: 'In practice it means a converter that prepares ebooks for AI tools like NotebookLM and ChatGPT — usually by exporting clean TXT or PDF. BookConv does this; it is not an AI model itself. [OK]' },
  { question: 'Can I import a converted ebook into NotebookLM or ChatGPT?', answer: 'Yes. After converting with BookConv, download the TXT or PDF and upload it directly to NotebookLM or ChatGPT’s file input. Both accept TXT and PDF as source formats. [OK]' },
  { question: 'Should I convert to TXT or PDF for AI?', answer: 'Use TXT when you only need the text content — it is cleanest for ingestion. Use PDF when you need the original layout preserved. [OK]' },
  { question: 'Does BookConv use AI to convert files?', answer: 'No. BookConv is a converter built on the Calibre engine. It does not rewrite or summarize your file. You can feed the converted output to an AI tool afterward. [OK — explicitly honest]' },
  { question: 'Is BookConv free for AI prep?', answer: 'Yes. Basic conversions are free and require no account, which makes it easy to prep files for AI tools in a few steps. [OK]' },
  { question: 'Which ebook formats can I convert for AI ingestion?', answer: 'BookConv handles 27 format pairs — EPUB, MOBI, PDF, AZW3, TXT and more — and exports the TXT or PDF that AI tools accept. [OK]' },
]
// formats: { source: 'epub', target: 'txt' }
```

### Claim 审核清单（ai-ebook-converter）
- [OK] NotebookLM/ChatGPT 接受 TXT/PDF 上传 → 公开事实
- [OK] 27 格式对 / 免费免注册 → 可验证
- [OK] 基于 Calibre 引擎、非 AI 模型 → 诚实边界，已显式写明
- [FORBID] "BookConv 是 AI 驱动转换器 / 用 AI 转换" → **全页已规避并反向澄清**，复审时确认无遗漏
- [VERIFY] 同页隐私表述若引用删除窗口，需运维确认

---

## 3. batch-converter

```ts
export const slug = 'batch-converter'
export const title = 'Batch Ebook Converter: How to Convert Many Files (and What BookConv Does)'
export const problem = 'Need to convert a hundred ebooks at once? Here is the honest split — what a true batch converter does, and where single-file tools like BookConv fit.'
export const date = '2026-08-07'
export const tags = ['batch ebook converter', 'bulk convert', 'calibre cli', 'automate']
export const keyTakeaways = [
  'True batch conversion is best done with Calibre’s command line or desktop app. [OK]',
  'BookConv converts one file at a time in the browser — fast for occasional jobs. [OK]',
  'For recurring bulk work, automate Calibre instead of uploading files one by one. [OK]',
  'You can still prep individual files for AI or Kindle with BookConv. [OK]',
]
export const content = {
  intro: '“Batch ebook converter” implies converting dozens or hundreds of files in one run. Browser converters are built for one file at a time, so the honest answer is: use the right tool for the volume. This page explains the split and gives you a working path for both.',
  sections: [
    {
      heading: 'What “batch conversion” actually needs',
      body: `Batch work means:\n\n- **Many files** processed in one job. [OK]\n- **Automation** — a folder watch, a script, or a queue. [OK]\n- **No manual re-upload** per file. [OK]\n\nA browser tool with a single upload box is not built for this. BookConv converts one file at a time. [OK]`,
    },
    {
      heading: 'The batch path: Calibre command line',
      body: `For real bulk work, Calibre’s `ebook-convert` (part of the desktop install) handles folders:\n\n- Install Calibre on your machine. [OK — instructional]\n- Use its command-line tools to loop over a folder. [OK]\n- Keep the job fully offline. [OK]\n\nBecause BookConv runs on the same Calibre engine, the output quality matches — you just trade the browser UI for automation. [OK]`,
    },
    {
      heading: 'Where BookConv fits',
      body: `BookConv is the right call when:\n\n- You have **a few files**, not hundreds. [OK]\n- You want **no install** and an immediate result. [OK]\n- You are **prepping one file** for AI ingestion or Kindle. [OK]\n\nFor those cases, batch tooling is overkill. Convert here: [Mobi to EPUB](/convert/mobi-to-epub).`,
    },
    {
      heading: 'A practical decision rule',
      body: `**Files ≤ a handful:** use BookConv, no setup. [OK]\n\n**Files in the dozens/hundreds, recurring:** script Calibre’s command line. [OK]\n\n**Sensitive files in bulk:** Calibre offline — never upload a manuscript batch to a server. [OK]\n\nMatch the tool to the volume; don’t force a browser tool into a bulk role.`,
    },
  ],
}
export const faqs = [
  { question: 'Does BookConv support batch conversion?', answer: 'No. BookConv converts one file at a time in the browser. For true batch work, Calibre’s command-line tools are the right choice. [OK — explicit, avoids overclaim]' },
  { question: 'How do I batch convert ebooks for free?', answer: 'Use Calibre (free, open-source) on your machine — its command-line converter can process a folder of files. BookConv is better suited to one-off browser conversions. [OK]' },
  { question: 'Can I automate ebook conversion?', answer: 'Yes, with Calibre’s command-line tools you can script conversions over many files. Browser converters like BookConv are designed for manual, single-file use. [OK]' },
  { question: 'Is there a bulk converter better than uploading one by one?', answer: 'For bulk, a local tool (Calibre CLI) beats any upload-based converter because there is no per-file upload and the work stays offline. [OK]' },
  { question: 'Can I still use BookConv for part of a bulk workflow?', answer: 'Yes. You can prep individual tricky files (e.g. Mobi to EPUB) in BookConv, then handle the bulk with Calibre. [OK]' },
]
// formats: { source: 'epub', target: 'pdf' }
```

### Claim 审核清单（batch-converter）
- [OK] BookConv 单文件转换 → 产品事实
- [OK] Calibre CLI 可批处理 → 公开事实 /  instructional
- [OK] BookConv 基于 Calibre 引擎 → 项目事实
- [FORBID] "BookConv 支持批量 / 批量转换" → 已显式写"不支持"，复审确认无反向暗示
- [VERIFY] 若描述"后台转换/大文件"能力，需与产品实际一致

---

## 4. kindle-formats

```ts
export const slug = 'kindle-formats'
export const title = 'Kindle Formats Explained: AZW3, KFX, MOBI & What to Convert To'
export const problem = 'AZW3, KFX, MOBI, EPUB — Kindle’s format soup confuses everyone. Here is what each means and the safest format to convert to today.'
export const date = '2026-08-07'
export const tags = ['kindle formats', 'azw3', 'kfx', 'mobi', 'send to kindle']
export const keyTakeaways = [
  'Amazon’s Send to Kindle accepts EPUB and AZW3 and converts them for your device. [OK — public fact, see note]',
  'MOBI side-loading is retired; don’t convert new books to MOBI for Kindle. [OK — public fact]',
  'KFX is Amazon’s proprietary format — you can’t easily create it yourself. [OK — public fact]',
  'For sideloading, AZW3 is the most compatible format BookConv can produce. [OK]',
]
export const content = {
  intro: 'Kindle readers don’t take “any ebook.” Over the years Amazon moved from MOBI to AZW3 and now to KFX, while Send to Kindle added EPUB support. This page untangles the formats so you convert to the right one instead of a file your Kindle rejects.',
  sections: [
    {
      heading: 'The Kindle format landscape',
      body: `**MOBI:** the old standard. Amazon retired MOBI side-loading, so new uploads in MOBI are no longer the recommended path. [OK — public fact]\n\n**AZW3:** Amazon’s modern ebook format with better typography and features; widely supported by Kindle devices. [OK]\n\n**KFX:** Amazon’s current proprietary format with advanced layout; created by Amazon’s own pipeline, not easily produced by third-party converters. [OK]\n\n**EPUB:** the open standard. Send to Kindle now accepts EPUB and converts it for your device. [OK — public fact]`,
    },
    {
      heading: 'What to convert to (practical rule)',
      body: `**For sideloading a file yourself:** convert to **AZW3** — BookConv can produce it and Kindles read it well. [OK]\n\n**For Send to Kindle:** upload **EPUB or AZW3** and let Amazon convert. [OK — public fact]\n\n**Avoid:** converting new books to MOBI, and trying to generate KFX yourself. [OK]`,
    },
    {
      heading: 'Common Kindle conversion paths',
      body: `**EPUB → AZW3** for sideloading: [EPUB to AZW3](/convert/epub-to-azw3). [OK]\n\n**AZW3 → PDF** if you need a fixed-layout printout: [AZW3 to PDF](/convert/azw3-to-pdf). [OK]\n\n**MOBI → EPUB/AZW3** to modernize an old library: [Mobi to AZW3](/convert/mobi-to-azw3). [OK]`,
    },
    {
      heading: 'Why not just use MOBI?',
      body: `MOBI is legacy. Amazon’s Send to Kindle no longer prioritizes it, and newer features only exist in AZW3/KFX. Converting new content to MOBI risks a file your device handles poorly. [OK — public fact, non-absolute]\n\nIf you already own MOBI files, convert them forward to AZW3 rather than keeping the old format.`,
    },
  ],
}
export const faqs = [
  { question: 'What format should I convert to for Kindle?', answer: 'For sideloading, AZW3 is the most compatible format BookConv can produce. For Send to Kindle, upload EPUB or AZW3 and Amazon converts it. [OK]' },
  { question: 'Is MOBI still supported on Kindle?', answer: 'Amazon retired MOBI side-loading; Send to Kindle now favors EPUB and AZW3. Converting new books to MOBI is no longer recommended. [OK — public fact]' },
  { question: 'What is KFX and can I create it?', answer: 'KFX is Amazon’s proprietary format with advanced layout. It is generated by Amazon’s own pipeline, so third-party converters generally can’t create true KFX. Convert to AZW3 instead. [OK — public fact]' },
  { question: 'Can BookConv convert EPUB to a Kindle format?', answer: 'Yes. BookConv converts EPUB to AZW3, which Kindles read well, and you can also send EPUB to Kindle via Amazon’s Send to Kindle. [OK]' },
  { question: 'How do I modernize an old MOBI library?', answer: 'Convert MOBI forward to AZW3 (or EPUB) with BookConv so your files use a current, well-supported format. [OK]' },
]
// formats: { source: 'epub', target: 'azw3' }
```

### Claim 审核清单（kindle-formats）
- [OK] Send to Kindle 接受 EPUB/AZW3 → 公开事实（Amazon 2022 公告）
- [OK] MOBI 侧载退役 → 公开事实
- [OK] KFX 为 Amazon 专有、第三方难生成 → 公开事实
- [OK] BookConv 可产 AZW3 / 27 格式对 → 可验证
- [VERIFY] 若写"Amazon 具体年份/具体文件大小限制" → 需核对官方文档，当前草稿已做非绝对化表述

---

## 5. best-ebook-converter

```ts
export const slug = 'best-ebook-converter'
export const title = 'Best Ebook Converter in 2026: How to Choose (Not Just a List)'
export const problem = '“Best ebook converter” depends on your job — free one-off, bulk, privacy, or AI prep. Here is the honest comparison across the tools people actually use.'
export const date = '2026-08-07'
export const tags = ['best ebook converter', 'compare', 'free', 'calibre', 'cloudconvert']
export const keyTakeaways = [
  'There is no single best — match the tool to volume, privacy, and format needs. [OK]',
  'Calibre: best free desktop tool for bulk and offline. [OK]',
  'CloudConvert / Convertio: broad format support, but free tiers limit size and need accounts. [OK — descriptive of common free-tier behavior; VERIFY exact limits if cited]',
  'BookConv: free, no account, 27 format pairs, built for quick browser conversions. [OK]',
]
export const content = {
  intro: '“What is the best ebook converter?” has no single answer — it depends on whether you convert once or in bulk, how private the file is, and which formats you need. This page compares the tools people actually use so you can pick by fit, not by a star rating.',
  sections: [
    {
      heading: 'Pick by job, not by ranking',
      body: `**One-off, free, no account:** a browser converter like BookConv. [OK]\n\n**Bulk or offline:** Calibre (desktop/CLI). [OK]\n\n**Maximum format breadth with a managed API:** CloudConvert or Convertio. [OK — descriptive]\n\nThe “best” is the one that matches your constraints. [OK]`,
    },
    {
      heading: 'Tool comparison at a glance',
      body: `**Calibre:** free, open-source, offline; best for bulk and privacy; desktop app required. [OK]\n\n**CloudConvert:** very broad formats, API available; free tier limits file size and needs an account. [OK — VERIFY exact free-tier limits before citing numbers]\n\n**Convertio:** broad formats, simple UI; free tier limits size and daily count, account required. [OK — VERIFY]\n\n**BookConv:** free, no account, 27 format pairs, browser-based, built on Calibre engine. [OK]\n\nNone is universally “best” — they optimize different things. [OK]`,
    },
    {
      heading: 'Where BookConv fits best',
      body: `BookConv is the lightest path for:\n\n- A **quick conversion** with no install and no sign-up. [OK]\n- **AI prep** — clean TXT/PDF for NotebookLM or ChatGPT. [OK]\n- **Everyday formats** — EPUB, MOBI, PDF, AZW3, TXT across 27 pairs. [OK]\n\nFor bulk automation or fully offline privacy, Calibre remains the stronger pick. [OK]`,
    },
    {
      heading: 'A simple decision checklist',
      body: `**No account, instant, one file** → BookConv. [OK]\n\n**Hundreds of files / offline** → Calibre. [OK]\n\n**Rare format or API integration** → CloudConvert/Convertio. [OK — descriptive]\n\n**Sensitive manuscript** → Calibre offline (no upload). [OK]`,
    },
  ],
}
export const faqs = [
  { question: 'What is the best free ebook converter?', answer: 'It depends on the job. For a quick, no-account conversion in the browser, BookConv covers 27 format pairs for free. For bulk or offline work, Calibre is the stronger free tool. [OK]' },
  { question: 'Is BookConv better than CloudConvert?', answer: 'They optimize different things. BookConv is free with no account and covers everyday format pairs; CloudConvert offers very broad formats and an API but limits its free tier and requires an account. Neither is universally better. [OK — non-absolute]' },
  { question: 'Do I need an account to convert an ebook?', answer: 'Not with BookConv — basic conversions are free and require no sign-up. Some broad-format services require an account on their free tier. [OK]' },
  { question: 'Which converter is best for privacy?', answer: 'Calibre is fully offline, so the file never leaves your machine — best for sensitive files. Online converters process the file on a server; reputable ones use encryption and auto-delete, but an upload still occurs. [VERIFY: pair with published privacy wording]' },
  { question: 'Can BookConv handle the formats I need?', answer: 'BookConv supports 27 format pairs including EPUB, MOBI, PDF, AZW3 and TXT, which covers most everyday conversions. [OK]' },
]
// formats: { source: 'epub', target: 'pdf' }
```

### Claim 审核清单（best-ebook-converter）
- [OK] 无单一"最佳"、按场景选 → 非绝对化，安全
- [OK] BookConv 免费/免注册/27 对/基于 Calibre → 可验证
- [OK] Calibre 免费开源离线/适合批量 → 公开事实
- [VERIFY] CloudConvert/Convertio 免费层"限制大小/需账号" → 描述为通用行为，**若引用具体数字（如"25MB/天"）必须先核实官方文档**，当前草稿未写具体数字
- [FORBID] "BookConv 是最快/最好" → 已规避，全页做场景对比
- [VERIFY] 隐私表述同 calibre-alternative，需运维确认删除窗口

---

## 建页落地清单（claim 审核通过后才执行）

1. 在 `src/data/guides/` 新建 5 个 `.ts` 文件（字段同上，注意 TS 模板字符串换行 = 真实 `\n`）。
2. 在 `src/data/guides/index.ts` 的 `import` 区 + `all[]` 注册 5 项（单一数据源，列表页/sitemap 自动派生）。
3. 同步 `public/llms.txt` 的 Guides 条数 = `getAllGuides()`（seo-critic 门禁会查，必须一致）。
4. 跑 `node scripts/seo-critic.mjs` 验证（博文注册收敛 / llms.txt 同步 / 死链 / hreflang）。
5. `git commit` + push → Vercel 部署后 `curl` 验证 5 个 URL 返回 200 且 `<title>` 正确（无 `| BookConv` 重复、无 `/en` 硬编码）。
6. 把 5 页加入每周 Brave/Gemini 探针问题集，回填 `geo-baseline-brave-v1.md` 观察引用率变化（E1 验收）。

> 本次仅交付**草稿 + claim 审核清单**供你审稿。请逐页确认 [VERIFY] 项是否已有运维依据、[FORBID] 项是否确实无残留，回复"可以建页"后我执行上述 1–6。
