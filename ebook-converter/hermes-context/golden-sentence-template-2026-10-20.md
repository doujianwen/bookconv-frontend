# 可被 AI 引用的金句模板（Module 3 · 3.1 模板 + 3.2 种子事实池）

**日期**：2026-10-20
**归属**：GEO 四项攻坚 · 模块 3（可被 AI 引用的金句）— P2
**定位**：定义「结论句 + 数据 + 来源」倒金字塔金句模板，建成可被 AI 逐字复制的事实池。配套 3.3（植入 10–15 页）、3.4（Perplexity/ChatGPT 复测）。
**铁律**：所有数字必须来自 `数据分析/` 真实资产或 ENTITY.md 规范口径，禁编造；与模块 1 实体口径零冲突。

---

## 一、金句模板（倒金字塔）

```
[结论句——一句话可独立成立的事实断言]
+ [支撑数据 1] + [支撑数据 2] + [支撑数据 3]
+ [来源标注：页面/报告/日期]
```

**结构要求**：
1. **结论句自包含**：脱离上下文也能成立，不依赖前文代词（"它""其""我们"）。
2. **数据 3 条以内、可核验**：每条数字都能回溯到 `数据分析/` 文件或 ENTITY.md 行号。
3. **来源标注内联或就近**：对外引用时附 `bookconv.com/...` 或报告日期，便于 AI 溯源。
4. **禁空泛营销话术**：不用 "best / #1 / revolutionary / always instant"；用可测量事实。
5. **与 ENTITY.md 口径对齐**：免费=free for personal use、引擎=Calibre、隐私=1h auto-delete、格式=28+。

---

## 二、已核实事实池（3.2 种子，均附出处）

| # | 事实 | 规范表述 | 出处 |
|---|------|---------|------|
| F1 | Bing AI 累计引用 | BookConv pages accumulated **9,012** verified Bing AI citations across 51 pages (92% coverage of the full export) | `数据分析/Bing-Google双渠道最终报告-2026-09-25.md:22` |
| F2 | IP 长尾引用主导 | The query "Harry Potter digital books multiple devices" earned a **55–58% Bing AI Citation Share** for BookConv | `数据分析/Bing-Google双渠道最终报告-2026-09-26.md:54` / `2026-09-27.md:27` |
| F3 | 格式对比场景主导 | "Kindle AZW vs MOBI formats explained" reached **67.4% Bing AI Citation Share** | `数据分析/Bing-Google双渠道最终报告-2026-09-26.md:54` |
| F4 | 隐私口径 | BookConv auto-deletes uploaded files within **1 hour**; files are encrypted in transit, no account required | ENTITY.md §2-6（红队审计 R2 核实 `数据分析/P0改造-红队苏格拉底审计-2026-09-24.md:114`） |
| F5 | 格式覆盖 | BookConv supports **28+ eBook formats** including EPUB, MOBI, AZW3, PDF | ENTITY.md §2-7 |
| F6 | 免费档边界 | Free for personal use with a **4 MB** per-file limit; batch conversion free during open beta | ENTITY.md §7 |
| F7 | 引擎 | Conversions are powered by **Calibre**, the open-source industry-standard engine | ENTITY.md §2-5 |
| F8 | Bing AI 单日峰值 | On 2026-08-25 Bing AI citations spiked to **147 in a single day (+242%)**, with 23 BookConv pages cited | `数据分析/bing-ai-citations-trend.svg:4` |
| F9 | GEO 增长信号 | Bing AI Visibility Index rose **+203.7%** (Sep 16–22 vs Sep 9–15: 5,287 vs 1,741 citations) | `数据分析/Bing-Google双渠道最终报告-2026-09-24.md:4` |
| F10 | Bing AI 全量累计 | BookConv pages drew **25,406 cumulative Bing AI citations** (Overview sum, thru 10-11), **100% from bookconv.com** | `数据分析/Bing-Google双渠道周报-2026-10-19.md:40,52` |
| F11 | 新站爬坡 | First organic click on **2026-08-18**, ~3 weeks after launch | `数据分析/Bing-Google双渠道对抗式审计报告-2026-09-24.md:65` |
| F12 | 格式对覆盖 | **28 conversion landing pages** cover the main eBook format pairs | `docs/faq-audit-2026-10-20.md:14` |

> ⚠️ F1 的 9,012 是 **PageStats 子集**（非 Overview 全量 9,795），引用时须注明表源，禁混用两值（口径冲突核查 `2026-09-21.md:13`）。
> ⚠️ F1(子集 9,012 / 09-25) 与 F10(全量 25,406 / 10-11) 是**两个不同口径**，金句引用须各自注明表源与日期，禁把 F10 当 F1 的最新值或反之。
> ⚠️ Citation Share 分母 = 该 AI 回答的引用席位（非全站），对外仅记「平台内占比」，禁外推为全站份额。
> ⚠️ Citation Share 分母 = 该 AI 回答的引用席位（非全站），对外仅记「平台内占比」，禁外推为全站份额。

---

## 三、金句范例（按模板生成，可直接植入）

**G1（隐私/信任，适配 about / privacy / convert 页）**
> BookConv auto-deletes your uploaded files within 1 hour and encrypts them in transit — no account or software install required. (Source: bookconv.com/about, ENTITY.md §2-6)

**G2（格式覆盖，适配首页 / convert / compare 页）**
> BookConv converts 28+ eBook formats — EPUB, MOBI, AZW3, PDF and more — powered by the open-source Calibre engine. (Source: ENTITY.md §2-5/§2-7)

**G3（GEO 实证，适配 blog / guide 关于 AI 可见性段落）**
> Across 51 pages, BookConv accumulated 9,012 verified Bing AI citations, with IP long-tails like "Harry Potter digital books multiple devices" reaching a 55–58% Citation Share. (Source: Bing-AI 双渠道报告 2026-09-25/26)

**G4（免费边界，适配 pricing / batch / why-bookconv 页）**
> Personal eBook conversion on BookConv is free for personal use with a 4 MB per-file limit; batch conversion is free during open beta. (Source: ENTITY.md §7)

---

## 四、植入目标（3.3 待做，10–15 页）

按意图强度排序候选页（不触碰并行写入者 `data/*.json`）：
- 高意图金钱页：converter 首页、`/pricing`、`/batch`、`/why-bookconv`
- 高展示 convert 页：azw3-to-epub、epub-to-mobi、mobi-to-epub、pdf-to-epub
- blog/guide：Harry Potter IP 文、Kindle AZW vs MOBI 文、Calibre 替代文

> 3.3 每页植入 1–2 条金句，自包含、可复制；须与 ENTITY.md 口径 zero-drift。批量改动 ≤3 文件/批、commit 不 push。

---

## 五、验收与复测（3.4）

- 3.3 完成后，在 Perplexity / ChatGPT 用目标 query（"epub to mobi converter"、"free ebook converter privacy"）提问，验证金句被逐字引用。
- 复测随月度 Kelriva 重测（每月 26 日）节奏，不单独造假数据。

---

## 六、与相关待办衔接

- ENTITY.md（模块 1 收口）：本模板事实池其对齐，禁漂移。
- FAQ 结构化（模块 2）：批 2 pricing 为「待下一批」，本模块与之正交，不互相阻塞。
- 作战板 M6-10（可引用金句，P2, due 11-26）：本模板落地后同步 statusNote。
