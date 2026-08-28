# GEO 工作学习参考与结论

> 整理自 2026-08-02 ~ 2026-08-08 的 GEO 实战。目的：把散落的结论集中，方便以后接手/复盘/培训。
>
> **📁 约定（重要）**：所有 GEO 相关工作——作战映射、审计、竞品曝光、探针脚本、增长计划、学习笔记——统一放 `ebook-converter/geo/` 文件夹，便于管理。本文件即放在此处作为总索引。

---

## 0. 一句话结论

bookconv.com 的 GEO 基础（llms.txt 全量、GPTBot/ClaudeBot/CCBot 放行、实体结构化数据、27 个转换页、FAQPage JSON-LD、安全信任信号）**已就位**。当前真正的杠杆是：

1. **外链建设（域名权威）** —— 当前最大瓶颈（93 展示/0 点击/均排名 ~57）
2. **AI 场景段增强**（NotebookLM 导入、CLI 代码段、安全承诺）
3. **持续监测 AI 引擎引用**（而非重复铺工具页）

> 原稿建议的「90% 待建工具页」现网已存在，真实增量只有 6 个硬 404 缺口页 + AI 场景段。

---

## 1. 可用工具 / Skill / SaaS 分层（2026-08 调研）

### 1.1 本环境已装 GEO 相关 Skill（直接可用）
| Skill | 干什么 |
|---|---|
| `ai-search-diagnostics` | 诊断品牌在 AI 引擎的提及/推荐/引用 |
| `competitive-intelligence` | 竞品定位/内容/引用对比 |
| `content-optimizer` | 内容 brief / FAQ / Schema 优化 |
| `qingflow-handoff` | 4/7 分流与闭环门禁（未连接轻流时仅能做诊断段） |

### 1.2 本会话新装互补 Skill
- **`seo-ops`**（用户级 `~/.workbuddy/skills/seo-ops`）：传统 SEO 运营自动化——GSC 快赢词、竞品差距→内容攻击简报、趋势侦察。与 GEO 流程拼成「GSC 快赢 + AI 引擎可见性」双轨。
  - 前置：GSC OAuth（`gsc_auth.py`）、可选 `AHREFS_TOKEN` / `BRAVE_API_KEY`
  - 运行需 `pip install -r requirements.txt`（建议锁版本，原稿用 `>=` 未锁）

### 1.3 外部 SaaS（跨引擎长期趋势，按需订阅）
| 工具 | 覆盖引擎 | 价格 | 适合 |
|---|---|---|---|
| **Otterly.AI** | ChatGPT/Gemini/Perplexity 等 6 个 | $29/月起 | SMB/代理首选，全周期 |
| **Peec AI** | 10+（含 DeepSeek/Llama/Grok/Claude） | 按引擎+提示量 | prompt 级分析、覆盖最广 |
| **Profound** | 多引擎 | 高价企业版 | 企业级深度情报 |
| **Scrapeless** | 自建 | 按量 | 最接近自建探针思路（LLM Chat Scraper API） |

### 1.4 自建（已在 `geo/`）
- `geo-exposure-probe.py`：Gemini `googleSearch` groundingChunks + OpenAI `web_search_preview` annotations 抓引用。受配额限制（Gemini 免费层额度 / OpenAI 需充值解锁 web search）。

---

## 2. 本项目 GEO 实战结论

### 2.1 作战映射表（`用户意图作战映射表.md`）
- 原稿（`用户意图规划-模版.md` / `竞品用户意图.md`）含 AI 幻觉：URL 缺 `/convert/` 前缀、流量数字为推测、竞品曝光表自述为「模拟推演」。已交叉核对现网 sitemap 修正，未照搬。
- **核心发现**：原稿 90% 的「待建工具页」现网已存在。真实增量 = **6 个硬 404 缺口页** + **AI 场景段增强**。
- 竞品 Gemini 曝光表按用户决定留为空白模板（由用户手动实测填）。

### 2.2 二次审计（`用户意图作战映射表-二次审计.md`）
- 文档干净可信，无照搬幻觉；现网底账一致（Convert 27 / Guide 16 / Blog 21）。
- **证实 3 处「部分覆盖」实为软 404**：`/blog/epub-vs-mobi`、`/blog/best-ebook-converter`、`/guide/epub-vs-azw3` —— HTTP 200 但兜底标题、不在 sitemap。对照真实博文有专页标题，确为路由兜底。

### 2.3 已落地的代码修复（均已推 origin/main + 线上验证）
| 提交 | 修复 | 验证 |
|---|---|---|
| `c909d78` | 软 404 硬化：`blog/[slug]`、`guide/[slug]` 未知 slug 改 `notFound()` 返真 404 | `next build` 通过；seo/code-critic 0 critical；线上 3 个软 404 → 404 |
| `7d14b41` | 安全 FAQ 修复：转换页自定义 FAQ 覆盖默认 FAQ，致「Is my file secure?」信任信号在 27 个 Money Page 漏掉。新增共享常量 `SECURITY_FAQ`（含 256-bit TLS 话术），可见 FAQ + JSON-LD 始终带安全承诺 | 同上；线上 `/convert/azw3-to-mobi` JSON-LD 含安全问答 |

> 根因细节：转换页 FAQ 逻辑「有自定义 faq 就用自定义、否则用默认」，安全提问只在默认里 → 27 个内容文件全有自定义 faq 且 0 个含安全提问 → 全部漏掉。

### 2.4 曝光探针脚本与数据状态（geo/geo-exposure-probe.py）
- **脚本已就绪**：支持 `probe`（Gemini + ChatGPT 抓引用）、`expand`（Gemini 自动扩词）、`brave`（Brave 搜索）三模式，含 429 退避、`.env` 加载、`--demo` 兜底。
- **关键纠偏**：`exposure-report.md` 实为 `--demo` 产物（表头"问题数 28 / 引用 4 条"，4 条与 `demo_rows()` 硬编码样例逐字一致，**非真实 API 返回**）。据此得出的"bookconv 已被 Gemini 引用"等结论不成立。
- **真实运行未产出有效数据**：Gemini 免费层当日配额耗尽（全 429）；ChatGPT 免费层 `web_search_preview` 需 Tier≥1（全 429）+ 沙箱网络对 OpenAI 出站有 SSL 截断。脚本调用/收尾逻辑本身已验证完好（单问题隔离实跑 exit 0）。
- 待配额解锁（Gemini 等重置 / OpenAI 充值升 Tier≥1）后实跑，方有真实曝光数据。

---

## 3. 后续杠杆（按 ROI 排序）

1. **外链建设**（域名权威，当前最大瓶颈）→ `docs/` 外链作战中心执行
2. **6 个硬 404 缺口页建设**：`calibre-alternative` / `ai-ebook-converter` / `batch-converter` / `kindle-formats` / `epub-file-not-opening` / `ebook-formatting-problems`
3. **AI 场景段增强**：NotebookLM 导入指引、CLI 代码段（epub→txt/mobi 等）、安全承诺（已做）
4. **跨引擎长期监测**：Otterly($29)/Peec 订阅，或配额解锁后跑自建探针

---

## 4. 数据安全 / 诚实边界（角色铁律）

- AI 引擎提及/引用/竞品表现的结论**必须来自实际采样或授权工具**，不可编造。
- 本沙箱出站受限（multipart 被掐、JSON 可通），探针须**用户本机**跑。
- 真实 API key **勿贴对话**（曾发生 Gemini/OpenAI key 暴露，建议吊销重生成）。
- 未连接轻流时仅能做诊断段（前 4 段），不输出完整路线图/FAQ 草稿。

---

## 5. 文件索引（geo/ 文件夹现状）

### 5.1 GEO（AI 引擎可见性）
| 文件 | 内容 |
|---|---|
| `用户意图规划-模版.md` | 原稿（AI 生成意图+执行稿，含幻觉需核对） |
| `竞品用户意图.md` | 原稿（竞品分析+提示词讨论+模拟曝光表） |
| `用户意图作战映射表.md` | 整合映射表（意图→页面→状态→动作→优先级） |
| `用户意图作战映射表-二次审计.md` | 数据审计（诊断段） |
| `exposure-report.md` | 竞品 Gemini 真实曝光报告（手动测） |
| `geo-growth-plan-5-7.md` | 5–7 段全量增长计划 |
| `geo-exposure-probe.py` | 自建曝光探针（Gemini+OpenAI） |
| `.env.example` | 探针密钥占位模板 |
| `GEO-学习参考与结论.md` | 本文件（总索引+结论） |

### 5.2 传统 SEO / GSC 轨（2026-08-08 新增）
| 文件 | 内容 |
|---|---|
| `GSC快赢报告-2026-08-08.md` | 首份 GSC 真实数据报告（90 天窗口，7 个位置 4-20 快赢词 + 页面/设备/国家/趋势） |
| `GSC长尾词全景-2026-08-08.md` | **全量 59 词分簇分析**——快赢报告的补充，含缺口词与优先级总表 |
| `GSC快赢词改写方案-2026-08-08.md` | 7 个快赢词的页面改写方案（标题/H1/FAQ/内链） |
| `GSC报告操作说明.md` | seo-ops 技能运行手册（授权→取数→出报告） |

> 新人培训类文档不在此处：Google Cloud / OAuth / GSC 属性配置见 `ebook-converter/docs/新人培训-Google-Cloud与GSC授权.md`。

---

## 6. GSC 首份数据的核心结论（2026-08-08）

- **全站 59 词 / 130 展示 / 0 点击 / 加权位置 ~58**（90 天）。索引在 2026-07-25 才真正苏醒。
- **最大流量池不是快赢词**：`mobi→epub` 簇 61 展示（占 47%）但位置 68.9；7 个快赢词合计仅 13 展示（10%）。
  → **P0 是深化 `/convert/mobi-to-epub` 并把外链主攻此页**，而非继续铺新页。
- **建新页 ROI 低于优化老页**：所有缺口词（lit-to-mobi / zip-to-epub / mobi-to-kobo / azw-to-mobi / chm-to-mobi）合计仅 10 展示。
- **位置 60-80 的词是权威度问题不是页面问题**——页面优化天花板约到位置 30-40，上首页必须靠外链。这与第 3 节「外链是最大杠杆」的结论互相印证。
- **样本极小**：单次展示词（位置 8.0/10.0 等）不具统计意义，勿据此做重大决策。

---

## 7. GEO 名词卡片（术语速查，2026-08-09 新增）

> 入门/培训用。每个词条含：定义 + 本项目真实实例 + 作用 + 踩坑点 + 代码出处。

### 7.1 hreflang —— 多语言版本「指路牌」
- **定义**：HTML 属性（`href` + `lang`），写在 `<head>` 的 `<link rel="alternate">` 里，告诉搜索引擎「这个页面有哪几个语言/地区版本，互相是对应的」。
- **本项目实例**（bookconv `/convert/epub-to-pdf` live 抓到）：
  - `en` → `https://www.bookconv.com/convert/epub-to-pdf`
  - `es` → `https://www.bookconv.com/es/convert/epub-to-pdf`
  - `x-default` → 兜底版本（谁都不匹配时用）
- **作用**：避免多语言页被 Google 当成「重复内容」互殴；让西语用户搜到西语页；利好国际 SEO + GEO（AI 知道内容覆盖哪些语言区）。
- **⚠️ 踩坑**：Next.js 把属性序列化成 `hrefLang`（大写 L）。用脚本抓取时 regex 要匹配大小写，否则会误报「缺失」——我们 8-09 实战踩过这坑，一度错判全站缺 hreflang。
- **代码出处**：`src/app/[locale]/convert/[slug]/page.tsx` 的 `generateMetadata` → `alternates.languages`（en/es/x-default）全局配置，改一处覆盖全部 30 个转换页。

### 7.2 JSON-LD 块 —— 写给机器的「内容摘要」
- **定义**：JSON for Linked Data，一种用 `<script type="application/ld+json">` 把网页「含义」结构化的标准格式。人看渲染后的页面，机器先读这块秒懂「这页到底是啥、有啥结构」。
- **本项目实例**（epub-to-pdf 抓到 4 个块，`@type` 含）：`FAQPage` / `SoftwareApplication`+`Offer` / `HowTo`+`HowToTool(Calibre)` / `Article` / `WebPage` / `WebSite` / `BreadcrumbList` / `Organization`。
- **作用**：让 Google / AI 引擎更稳地抽取和引用内容（FAQ、步骤、工具属性），是 GEO 的页面级底层信号。
- **⚠️ 踩坑**：部分 AI 引擎对 `<script>` 内 schema 解析不稳（Gemini 曾没「看到」我们已有的 JSON-LD，反而建议「补 JSON-LD」——前提错，勿当缺失去重加，会覆盖/破坏已生效 schema）。**可见 HTML 结构化内容**（Quick Answer 直答块 / 可见 FAQ 文本 / 对比表格）才是真正扛 GEO 信号的载体，别迷信 JSON-LD 包打天下。
- **代码出处**：`src/lib/seo/schema.ts` 统一生成；转换页由 `ToolPageClient.tsx` 渲染；安全问答由共享常量 `SECURITY_FAQ` 兜底。

### 7.3 两者共性
- 都是**「页面级、不靠堆词」的底层信号**——改一处模板（如 `ToolPageClient`、`page.tsx` 的 metadata）即可铺满全站，属于低成本高确定性的 GEO 基建。
- 都靠 `curl` + 原始 HTML 头核验（而非肉眼看渲染页），核验时注意属性大小写与 `<script>` 块剥离。

### 7.4 Slug —— URL 中的「友好标识符」
- **定义**：URL 路径段中用于唯一标识页面的文本片段，通常由标题派生、全小写、空格用连字符 `-` 分隔。
- **本项目实例**（bookconv.com）：
  | 元素 | 值 | 说明 |
  |---|---|---|
  | Slug | `batch-converter` | URL 中的标识符 |
  | 完整 URL | `https://bookconv.com/blog/batch-converter` | slug 拼接路径 |
  | Title | `Batch Ebook Conversion API / Tool` | 页面标题（显示给用户） |
  | Query | `"What is the best Calibre alternative?"` | AI 检测时的搜索词 |
- **作用**：
  - URL 简洁可读（`/blog/batch-converter` 优于 `/blog?id=3`）；
  - SEO 友好（Google 能从 URL 识别页面主题）；
  - 一致性（slug 通常与标题关键词关联，如 "Best Free Calibre Alternative" → `calibre-alternative`）。
- **⚠️ 踩坑**：
  - **不含空格和特殊字符**（用连字符 `-` 分隔），写 data 文件时必须手动 slugify；
  - **不能表达完整意图**（只是关键词压缩），AI 检测时需用 Query 而非 slug 匹配用户提问；
  - **软 404 风险**（已修复）：未知 slug 的路由会 HTTP 200 兜底（3 个历史缺口 `/blog/epub-vs-mobi`、`/blog/best-ebook-converter`、`/guide/epub-vs-azw3`），现已改 `notFound()` 返真 404；
  - **slug ≠ title ≠ query** 三者分工不同：slug 给机器看（路径），title 给人类看（显示），query 给 AI 看（意图匹配）。
- **代码出处**：博客 `src/data/blog/*.ts`、指南 `src/data/guides/*.ts`、转换 `src/data/content/*.ts` 的 `slug` 字段；路由 `src/app/[locale]/blog/[slug]/page.tsx`、`src/app/[locale]/guide/[slug]/page.tsx`、`src/app/[locale]/convert/[slug]/page.tsx`。

### 7.5 三层分工：Slug / Title / Query
三个概念共同构成 GEO 的「可读 → 可搜 → 可答」链路：

| 层 | 名称 | 用途 | 示例 |
|---|---|---|---|
| **路径层** | Slug | URL 路径，给搜索引擎和机器 | `batch-converter` |
| **显示层** | Title | 页面标题、meta 标签，给人类 | `Batch Ebook Conversion API / Tool` |
| **意图层** | Query | AI 引擎的检测词、用户提问 | `"What is the best Calibre alternative?"` |

- **Slug → Title**：SEO 的「从 URL 到主题」的第一印象，影响点击率（CTR）。
- **Title → Query**：GEO 的核心——AI 把用户的自然语言 Query 映射到页面 Title 的语义，若匹配则抽取引用。
- **Query → 页面内容**：AI 最终引用的是 FAQ、对比表、Quick Answer 等结构化内容，而非 Slug 本身。

> 实务口诀：**Slug 管路径、Title 管展示、Query 管意图**——三者要一致对齐，否则 AI 抽不到。
