# bookconv GEO 实测基线 v1（Brave 代理信号）

> 生成：2026-08-07 ｜ 数据源：`geo/exposure-report-brave.csv` + `exposure-report-brave.md`
> 性质：**代理信号**（Brave 搜索排名面 ≈ AI 引用面），非 Gemini/ChatGPT 直引。待两引擎配额恢复后升级为「AI 直引基线 v2」。

## 一、决策摘要

bookconv.com 页面侧 GEO 基建已就绪（27 个转换页 + FAQPage JSON-LD + llms.txt），但**真实曝光为 0**：对 28 个高意图自然语言问题、280 条 Brave 搜索结果，bookconv **一次都没出现**，而竞品/占位站占了 81 条、Reddit 社区占 17 条。最大短板不是内容厚度，而是**域名权威与"被引用证据"缺失**——页面存在但搜索引擎/AI 不引。

证据边界：Brave 是独立配额池，今晚可出数；Gemini `googleSearch` grounding 与 ChatGPT `web_search_preview` 因账户层 429（免费层限额/未开 web search）暂未采到。Brave 排名面与 AI 引用面**强相关但不等同**，本基线作为 GEO 周报的"占位缺口基线"。

## 二、数据口径

| 项 | 值 |
|---|---|
| 采样日期 | 2026-08-07 |
| 引擎 / 版本 | Brave Search API（代理信号，非 AI 直引） |
| 问题集 | 28 个自然语言问题，取自作战映射表 §2，映射真实 `/convert/*` slug |
| 地区语言 | 全球 EN |
| 样本量 | 280 条结果（每问题 10 条，min/avg/max = 10/10/10） |
| 证据来源 | `geo/exposure-report-brave.csv` |

## 三、真实指标（分子 / 分母）

| 指标 | 分子 | 分母 | 值 |
|---|---|---|---|
| 品牌提及率（被引问题数 / 总问题数） | 0 | 28 | **0%** |
| 推荐纳入率（进结果页问题数 / 总问题数） | 0 | 28 | **0%** |
| 竞品占位记录数 | 81 | 280 | 29% |
| 引用率（bookconv 被引 / 竞品占位） | 0 | 81 | **0%** |
| 缺口问题数（占位且 bookconv 未引） | 25（脚本告警）/ 21（聚焦高权重占位） | 28 | 75%–89% |
| 转换对页真实存在 | 27 | 27 | 100%（内容已就绪） |
| 高意图词页（404 缺口） | 5 | — | calibre-alternative / ai-ebook-converter / batch-converter / kindle-formats / best-ebook-converter |

## 四、原始查询与响应证据索引

- 全量明细：`geo/exposure-report-brave.md` §一（280 行：引擎 / 问题 / 被引域名 / URL / 类型）
- 结构化数据：`geo/exposure-report-brave.csv`（engine, question, intent, target_slug, domain, url, is_bookconv）
- 缺口告警：`geo/exposure-report-brave.md` §二（25 行）

## 五、竞品占位矩阵（Top 域名频次）

| 域名 | 占位次数 | 类型 | 拦截价值 |
|---|---|---|---|
| reddit.com | 17 | 社区 | 极高（覆盖 how/why/troubleshoot 类） |
| convertio.co | 10 | 在线转换站 | 高 |
| epubor.com | 8 | 软文站 | 中（部分标"其他"） |
| freeconvert.com | 6 | 在线转换站 | 高 |
| convertfiles.com | 5 | 在线转换站 | 高 |
| zamzar.com | 5 | 在线转换站（DR>80） | 高 |
| cloudconvert.com | 5 | 在线转换站（DR>80） | 高 |
| pdf.wondershare.com | 4 | 软件站 | 中 |
| github.com | 4 | 开源 | 中（batch/HTML/PDF 类） |
| ebook.online-convert.com | 4 | 在线转换站 | 高 |

**按意图类**（6 类全覆盖，bookconv 出现均为 0）：

| 意图 | 问题数 | bookconv 出现 | 主要占位 |
|---|---|---|---|
| device（Kindle/设备） | 4 | 0 | reddit, epubor, kindlepreneur |
| ai-feed（NotebookLM/AI 喂料） | 4 | 0 | reddit, epubor, notebooklm 软文 |
| legacy（旧格式 LIT/DJVU/FB2/RTF） | 5 | 0 | cloudconvert, convertio, zamzar, freeconvert |
| layout（排版/打印/扫描） | 4 | 0 | convertio, zamzar, adobe |
| efficiency（批量/安全/最快） | 4 | 0 | cloudconvert, convertio, reddit |
| intercept（Calibre替代/AI转换/词页） | 5 | 0 | alternativeto, g2, reddit, 软文站 |
| troubleshoot（报错/格式说明） | 6 | 0 | reddit, quora, superuser |

## 六、问题诊断

- **D1 — 零真实曝光**：280 条结果 bookconv 0 被引。不是"没排上前 10"，是"完全不在结果里"。根因 = 域名权威不足 + 外链缺口（与 2026-08-04 GSC 诊断"卡在域名权威"一致）。
- **D2 — 高意图词页 404**：5 个最高购买意图词（CloudConvert alternative / AI ebook converter / batch / Kindle formats / best converter）无对应页，竞品软文/聚合站（g2、alternativeto、saashub）直接占位。
- **D3 — Reddit 社区截流**：17 次占位，覆盖几乎所有"how/why/troubleshoot"长尾。Reddit 在 AI 训练语料与搜索结果权重极高，bookconv 无对应"社区讨论+官方答案"段。
- **D4 — 转换站密集占位长尾**：FB2→EPUB（8 占位域名）、RTF→EPUB（7）、EPUB→MOBI（7）、AZW3→PDF（6）被 CloudConvert/Convertio/Zamzar 等 DR>80 站包揽，bookconv 虽有专页但权威不够未被引。
- **D5 — 代理信号 ≠ AI 直引**：Brave 数据强相关但非 Gemini/ChatGPT 实测，第 2 段真实 AI 提及率仍需两引擎配额恢复后补采。

## 七、数据驱动的机会优先级（重排 O1–O7）

按"实测占位频次 × 意图价值 × 实施成本"重排（原规划假设版见 `geo-growth-plan-5-7.md`）：

| ID | 优先级 | 机会 | 实测依据 | 动作 |
|---|---|---|---|---|
| O1 | P0 | 建 5 个高意图词页 | 5 题 bookconv 无页，竞品软文/聚合站 100% 占位 | 新建 calibre-alternative / ai-ebook-converter / batch-converter / kindle-formats / best-ebook-converter |
| O2 | P0 | 拦截 Reddit 社区 | reddit.com 占位 17 次，全意图覆盖 | 在现有转换页底部加「社区常见问题 + 官方答案」段 |
| O3 | P1 | 增强 4 个被转换站占位的长尾转换页 | FB2→EPUB(8)/RTF→EPUB(7)/EPUB→MOBI(7)/AZW3→PDF(6) | 加对比表 + FAQ（vs CloudConvert/Convertio） |
| O4 | P1 | 增强 EPUB→HTML / EPUB→Word / DJVU→PDF | 被 convertio/freeconvert/zamzar 占位（4/3/4） | 加格式说明 + 安全承诺段 |
| O5 | P1 | NotebookLM 导入 FAQ 段 | ai-feed 意图 4 题 0 被引，epubor/reddit 占位 | epub-to-txt 页加「导入 NotebookLM/ChatGPT」段 |
| O6 | P2 | 隐私/安全承诺段 | azw3-to-pdf 等"safe/don't steal"类 6 占位 | 加 256-bit SSL / 自动删除声明（待运维确认） |
| O7 | P2 | CLI 代码段 | EPUB→PDF Linux 被 reddit/askubuntu 占位 | epub-to-pdf 博客加一行命令（Gemini 偏好含代码块页） |

## 八、内容 brief（content-optimizer 框架，O1 示例）

**页面**：`/convert/calibre-alternative`（新）— 标题 `Best Calibre Alternative — Free, No Install, Online`
- H1：Best Free Calibre Alternative for Ebook Conversion
- H2：What is Calibre and why look for an alternative（客观，不贬低）
- H2：bookconv vs Calibre vs CloudConvert（对比表：安装/免费/格式数/隐私/批量）
- H2：When to use bookconv（场景：不想装软件、偶尔转、隐私敏感）
- FAQ：
  - Is bookconv really free? → 是，无付费墙（主张可验证）
  - Do I need to install anything? → 否，纯浏览器（可验证）
  - Is my file safe? → 256-bit SSL + 自动删除（**待运维确认后发布**）
  - Can it handle batch? → 见 /convert/batch-converter（O1 关联页）
- **Claim 审核清单**：①"免费"可验证 ②"无需安装"可验证 ③"比 CloudConvert 更快"**禁写**（无实测）④"最安全"**禁写**（主观）

## 九、实验日历（E1–E4，指标基于 Brave 引用率）

| ID | 基线 | 变更 | 假设 | 指标 | 观察窗 | 负责人 | 验收 |
|---|---|---|---|---|---|---|---|
| E1 | 词页 404 | 建 O1 五页 | 占位降、bookconv 入结果 | 5 题 Brave 引用率 0→≥20% | 4 周 | 内容主 | 5 题均出现 bookconv |
| E2 | 无社区段 | O2 Reddit 拦截段 | reddit 占位降 | reddit 占位 17→≤8 | 4 周 | 内容主 | 相关页含官方答案段 |
| E3 | 长尾页无对比 | O3/O4 增强 | 转换站占位降 | FB2/RTF/MOBI/AZW3 占位降 ≥30% | 4 周 | 内容主 | 对比表+FAQ 上线 |
| E4 | 无 AI 喂料段 | O5 NotebookLM FAQ | ai-feed 入结果 | 4 题引用率 0→≥25% | 4 周 | 内容主 | FAQ 上线且被引 |

**禁止指标**：排名提升、流量增长、转化提升（无因果证据，不声称）。

## 十、数据缺口与边界

- Brave 代理信号 ≠ Gemini/ChatGPT 直引；AI 真实提及率待两引擎配额恢复后补采（用 `geo/geo-exposure-probe.py probe`）。
- 5 个词页 404 已确认（content 目录无对应文件）；部分科普 slug（epub-vs-azw3 等）可能归 guides，URL 映射需二次核对。
- 外链是下一杠杆（与 GSC 诊断一致）：本基线量化了"占位缺口"，但填补靠内容 + 外链双管。
- 所有"被引率提升"为实验假设，非已发生结果。

## 附：复跑命令

```bash
python geo/geo-exposure-probe.py brave geo/questions-seed.json   # 代理信号
python geo/analyze-brave.py                                     # 指标统计
# 待配额恢复：
python geo/geo-exposure-probe.py probe geo/questions-seed.json  # Gemini/ChatGPT 直引
```
