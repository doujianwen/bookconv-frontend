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

### 2.4 竞品真实曝光（`exposure-report.md`，用户手动测）
- **真实数据替代旧「模拟表」**。bookconv.com 已被 Gemini 引用（如 `lit-to-epub`），证明现网 GEO 基础开始生效。
- 探针受配额限制：Gemini 免费层额度 / OpenAI 需充值解锁 web search。脚本退避已加但治标不治本（账户侧问题）。

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
