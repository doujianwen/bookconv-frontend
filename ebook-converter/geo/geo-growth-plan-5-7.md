# bookconv.com GEO 增长计划（第 5–7 段 · 全量模式）

> 数据口径：采样日期 2026-08-07 ｜ 引擎 Gemini / ChatGPT / Claude ｜ 问题集 = 27 关键词展开的自然语言问题（高优 28 条见 `geo/questions-seed.json`）｜ 地区语言 = 全球 EN + ES ｜ 样本量 = **0 条真实引擎观测**（仅文档规划级证据，竞品曝光表为自述"模拟"）。
> ⚠️ 本计划所有"引用率/提及率"均为**规划假设或待采样值**，非实测排名。真实数据需你本机配 API key 跑 `geo/geo-exposure-probe.py` 后回填轻流。

---

## ⑤ 优先级排序的 GEO/SEO 内容机会

排序依据：用户价值 → 证据差距 → 竞品差距 → 实施成本 → 可测量性。

| ID | 机会 | 意图类 | 现有覆盖 | 竞品差距 | 实施成本 | 可测量性 | 优先级 |
|---|---|---|---|---|---|---|---|
| O1 | `CloudConvert alternative` 对比页 | 选型/替代 | **404 缺口** | 综合大站在 "best/alternative" 占位 | 中（新页） | 高（探针可测引用） | **P0** |
| O2 | `AI ebook converter` / `best ebook converter` 聚合页 | 选型 | **404 缺口** | 综合大站占位 | 中 | 高 | **P0** |
| O3 | NotebookLM / ChatGPT 导入 FAQ 段（txt/pdf 页） | AI 喂料 | 有页未增强 | 垂直站缺此段 | 低（加段） | 中 | **P1** |
| O4 | 安全/隐私承诺段（全转换页） | 信任 | 有页未增强 | 多数竞品有，我们缺 | 低 | 低 | **P1** |
| O5 | CLI/Python 代码段（epub-to-pdf-linux 博客） | 开发者 | 有博客未增强 | Reddit/开源被引 | 低 | 中（Gemini 偏好代码块） | **P1** |
| O6 | Kindle 格式科普页（azw3/kfx） | 设备适配 | **缺口/薄** | 垂直站占位 | 中 | 中 | **P1** |
| O7 | 扫描件/OCR、旧格式背景段（djvu/lit） | 旧格式 | 有页未增强 | 垂直站内容薄 | 低 | 低 | **P2** |

**杠杆判断**：O1/O2 是当前最高杠杆——它们正好对应 §3 留空表中"竞品被引、bookconv 未引"的高意图词，且实施形式是新页（一次投入、长期占位），可测量性最强（探针引用率直接验证）。O3–O5 是低风险快修，不动结构即可加段，适合本周就做。

---

## ⑥ 内容 brief 与草稿（content-optimizer 框架）

### 6.1 O1 — CloudConvert Alternative 对比页（P0）

- **页面目的**：在"CloudConvert 替代/最好用的电子书转换器"类问题上占位，承接高意图流量与 AI 引用。
- **首要意图**：用户想找 CloudConvert 的免费/无注册替代方案。
- **目标问题**：
  - "What is the best free CloudConvert alternative for ebook conversion?"
  - "CloudConvert vs free no-signup converter?"
  - "Free EPUB to PDF converter without account?"
- **核心实体**：bookconv.com（免费、免注册、27 种格式对、Calibre 引擎）。
- **已验证可主张的 claims**（需来源/复核标注）：
  - ✅ 免费、无需注册（站点行为可验证）
  - ✅ 27 种格式转换对（CONVERSION_MAP 可核对）
  - ⚠️ "文件自动删除 / 256-bit SSL" —— **需运维确认后写入，标注待复核**
  - ⚠️ "比 CloudConvert 更快" —— **禁止写入**，无实测对比数据
- **差异化**：免注册 + 专页长尾（epub-to-txt 等） + 本地化隐私姿态。
- **标题**：`CloudConvert Alternative: Free Ebook Converter, No Sign-up`
- **描述**：`A free, no-account ebook converter for 27 format pairs. Compare limits, privacy and supported formats vs CloudConvert.`
- **H1–H3 结构**：
  - H1: CloudConvert Alternative — Free Ebook Converter, No Sign-up
  - H2: Why look for a CloudConvert alternative
  - H2: bookconv vs CloudConvert (对比表：价格/注册/格式数/批量/隐私)
  - H2: Supported formats (链接到各 `/convert/*` 专页)
  - H2: Privacy & file handling (⚠️ 待运维确认段)
  - H2: FAQ
- **答案优先摘要**（页面首段直给）："bookconv.com is a free ebook converter that needs no account and handles 27 format pairs including EPUB, MOBI, PDF, AZW3 and TXT. Unlike CloudConvert's free tier, there is no login wall for basic conversions."
- **FAQ 草稿**：
  - Q: Is bookconv really free with no sign-up? A: Yes, basic conversions require no account. (✅ 可主张)
  - Q: Does bookconv support batch conversion? A: Single-file conversion is supported now; batch is on the roadmap. (⚠️ 避免声称已支持批量)
  - Q: How is my file handled? A: [待运维确认隐私条款后填写]
- **内链**：`/convert/epub-to-pdf`、`/convert/mobi-to-txt`、`/convert/azw3-to-pdf`
- **CTA**："Start converting — no account needed"
- **负责人**：内容 owner ｜ **复核日期**：发布前 Reviewer 审 claims
- **Claim 审核清单**：
  - [ ] 隐私/删除条款经运维书面确认
  - [ ] 对比表数据均有来源（不臆造 CloudConvert 数值）
  - [ ] 禁用"最快/最好"等绝对化表述
  - [ ] FAQ 中批量能力表述与产品实际一致

### 6.2 O3 — NotebookLM 导入 FAQ 段（P1，低风险，可直接加）

- **目标页**：`/convert/epub-to-txt`、`/convert/mobi-to-txt`、`/convert/epub-to-pdf`
- **FAQ 草稿**：
  - Q: Can I import the converted TXT/PDF into NotebookLM or ChatGPT? A: Yes. After conversion, download the file and upload it directly to NotebookLM or ChatGPT's file input. Plain TXT and PDF are both supported source formats.
  - Q: Will formatting survive for AI ingestion? A: TXT preserves text content; PDF keeps layout. For clean AI ingestion, TXT is often preferred.
- **审核**：✅ 主张可验证（NotebookLM 支持 TXT/PDF 上传为公开事实），无需待复核。

---

## ⑦ 实验日历、指标与验收闭环

| ID | 基线期 | 变更资产 | 假设 | 指标 | 观察窗 | 负责人 | 验收阈值 | 结果 | 复核日 |
|---|---|---|---|---|---|---|---|---|---|
| E1 | 2026-08-07 探针 0 引用 | 发布 O1 CloudConvert 替代页 | 占位高意图词后，该书conv 在对应问题的引用率 >0 | 探针引用率（bookconv 被引问题数/总问题数） | 4 周 | 内容 owner | 引用率 ≥ 1/问题集 或进入 Gemini 来源卡 | 待采样 | 发布后 +4w |
| E2 | 同上 | txt/pdf 页加 NotebookLM FAQ（O3） | AI 喂料类问题被引 + 注册转化上升 | 探针引用率 + 注册转化 | 4 周 | 内容 owner | 喂料类问题引用率 >0 且注册 +5% | 待采样 | +4w |
| E3 | 无基线 | 每周本机跑 `geo/geo-exposure-probe.py` 并回填轻流 | 建立可跨周对比的 AI 搜索基线 | 观测记录数 / 覆盖率 | 持续 | Analyst | 每周 ≥28 条观测入轻流 | 待执行 | 每周一 |
| E4 | 现状 | 全转换页加隐私承诺段（O4） | 信任类问题被引改善 | 探针引用率 | 4 周 | 内容 owner | 引用率非负向 + 停留时长 + | 待采样 | +4w |

**验收纪律**：所有"提升"结论必须基于 E3 建立的基线 + 文档化周期，禁止声称稳定排名或流量增长。

---

## 轻流应用蓝图（设计稿 · 未写入）

按 `qingflow-connector-contract.md` 的模型，建议在轻流建 4 个应用：

1. **AI Search Observation**（AI 搜索观测）：Observation ID / Brand / Engine / Model / Query / Market&Lang / Sample time / Brand mentioned / Recommendation included / Relative position / Answer excerpt / Citation URLs / Accuracy label / Reviewer
2. **Competitor Evidence**（竞品证据）：Competitor / Dimension / Observed claim / Source URL / Publisher / Capture date / Market / Confidence / Implication
3. **Content Opportunity**（内容机会）：Audience / Intent / Existing page / Evidence gap / Competitor gap / Priority / Format / Required sources / Claim reviewer / Owner / Due / Status
4. **Growth Experiment**（增长实验）：Baseline / Changed asset / Hypothesis / Metric / Window / Owner / Acceptance / Result / Review date

> 写入前会逐项展示 应用 / 记录 / 字段 / 旧值 / 新值 / 原因，经你确认后执行，并回读核验。当前环境未暴露轻流读写工具，故本蓝图为**设计稿**，未做任何实际写入。

---

## 数据缺口与适用边界

- **真实 AI 引擎提及数据 = 0**：全部结论基于 `geo/` 三份文档的规划级证据，竞品曝光表为自述"模拟"。任何引用率/提及率数字均为待采样假设。
- **沙箱限制**：本环境出站被代理掐断，我无法运行探针；真实采样需你本机配 `GEMINI_API_KEY` / `OPENAI_API_KEY` 后执行。
- **连接轻流 ≠ 实时 AI 数据**：轻流是管理层（记录/分配/追踪），数据源仍为探针脚本或你提供的证据。
- **需人工确认**：隐私条款、批量能力现状、CloudConvert 对比数值来源。
