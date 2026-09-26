# bookconv.com × Google《生成式 AI 搜索优化指南》合规核查
## 红队审计修订版 v2（含苏格拉底式审计 + 整改清单）

> 文档性质：经红队对抗审查 + 苏格拉底式追问迭代后的最终版。
> 上游：Google Search Central《Optimizing your website for generative AI features on Google Search》（2026-05-15 发布，2026-07-15 更新）。
> 默认假设：bookconv.com = 英文独立站 + Google 线优先 + 并行跑 Bing / Perplexity / Claude 线 + 无 ICP / 国内主体要求。
> 所有"实测"结论均来自对本仓 `src/`、`public/` 文件的核验（见各【已核验】标注）。

---

# 第一部分 · 红队审计（四层 Elenchus）

> 本部分只暴露前提与疑点，**不直接下新结论**；修订在第二部分裁决表。

## 审计元信息
- 审计对象：前一份《bookconv.com × Google 官方指南合规核查》（下称"前结论"）。
- 方法：苏格拉底式四层诘问（自我判断 → 来源共识 → 数据本身 → 动机框架）。
- 范围：前结论的"该做/不必做"清单、渠道纪律、因果归因、数字口径。
- 注：本审计文档本身可被下一轮诘问推翻（Layer 4）。

---

## Layer 1 — 审计"我自己的判断"（为何信前结论）

**Q1【已核验/可答】** 前结论称"content 30 / 31 convert + 22 guide = 53 程序化页"。但 `src/data/content/index.ts` 的 `CONTENT_MAP` 实际有 **31** 个条目（代码注释还写着"All 30 modules"，注释本身也错了）。我是否照搬了记忆里的"30"而没开箱数？
- why fatal：分母单位错了，所有"程序化页比例""暗页率"推论随之漂移。
- 结论：前结论的"53"公式（31+22）计数碰巧对，但"content=30"的旁注是错的，且把"程序化页"含糊等同于"53"，未区分 convert(31)/guide(22)/blog(68) 三层风险梯度。

**Q2【可答】** 前结论把"53 程序化页同质化 = 8/21 断崖根因"直接归因到"Google 这份指南点名的 scaled-content 红旗"。这份指南的"误区"清单（llms.txt / 切块 / AI 重写 / 虚假提及 / 过度结构化数据）**根本没提 scaled content**。我是否张冠李戴，把 Google 独立的 spam 政策/8-18 更新当成了这份指南的措辞？
- why fatal：归因错源会误导后续动作——若以为"指南要求差异化"，可能在本不该动的地方动刀；真正的 scaled-content 风险来自 spam 政策，而非本指南。

**Q3【已核验】** 前结论称 `epub-to-word / epub-to-docx / epub-to-word-docx` 三篇近重。核验发现：这三篇**全是 blog 层活页**（`blog/index.ts` 第 17/41/48 行均注册）；而 convert 层的 `/convert/epub-to-docx` 已在 `middleware.ts` 的 `CONVERSION_REDIRECTS` 中 301 → `/convert/epub-to-word`。我是否把"blog 近重"与"convert 去重"混为一谈，给出了误导性画面？
- why fatal：混淆层会导致整改动作指错对象（去重 blog 还是改 convert 模板）。

## Layer 2 — 审计"来源共识"（共识是 4 次验证还是 1 次叙事×4）

**Q4【可答】** 前结论的"llms.txt 对 Google 完全无效"与 Google 指南逐字表述一致吗？指南原文："Google 搜索本身并不使用这些文件或标记""Google 搜索会忽略这些文件""不会损害（也不会提升）您的网站在 Google 搜索中的展示效果或排名"。——一致。但前结论漏了半句："如果您决定为使用 LLMS.txt 文件（或其他类似文件）的其他服务或系统创建并维护这些文件，完全没问题"。即 **llms.txt 对 Bing/Perplexity/Claude 是有效资产**。前结论是否只讲了"对 Google 没用"，没讲"对非 Google 有用"，导致用户可能误删？
- why fatal：误删 llms.txt 会直接伤害 Bing/Perplexity 线 ROI。

**Q5【可答】** 前结论"robots.txt 放行 Google-Extended 无效（只管 Gemini 训练/grounding，不管理搜索索引）"——此说来自 Google-Extended 官方文档，并非这份 AI 指南（指南全文无 "Google-Extended" 一词）。那么"无效"二字是否误导？Google-Extended 放行 = 允许 Gemini 用你内容做 grounding，对 Gemini 可见度是**正向**，只是不控制搜索索引（那归 Googlebot）。"无效"措辞可能诱使用户把它从 robots.txt 删掉——那才是真错。
- why fatal：误删 Google-Extended 放行会主动放弃 Gemini grounding 机会。

## Layer 3 — 审计"数据本身"（开箱验字段）

**Q6【已核验】** llms.txt 是否如 9/25 审计所述"Conversions==CONVERSION_MAP(31)"？数 llms.txt 第 9–39 行 = 31 条 ✓。但 `Guides` 段（第 42–111 行）与 `Troubleshooting` 段是否仍指向**已删除**的博文？核验 `blog/index.ts` 第 85 行注释："2026-08-27: …removed 4 broken files (azw3-epub-mobi-kindle, …)"。而 llms.txt 第 91 行仍列 `/blog/azw3-epub-mobi-kindle` → **死链**。另 llms.txt 第 84 行 `/blog/epub-to-txt`，但 blog 仅有 `epub-to-text.ts`（无 `epub-to-txt.ts`）→ **疑似死链**。
- why fatal：llms.txt 是 Bing/Perplexity 资产，死链直接拉低那两渠抓取质量，且是 CI 本应门禁却漏掉的真实缺陷。

**Q7【已核验】** 前结论"8/21 断崖根因=53 程序化页同质化"——这是实测还是推断？项目记忆载：活跃索引页 14→3（−81%），加权 position 68→64（基本持平，非排名惩罚）→ 属"覆盖/索引坍塌"。归因"规模化薄模板触发质量信号"是与 8-18 spam update 时间对齐的**推断**，非实验室证明。我是否把它写成确定因果？
- why fatal：把推断当结论，会让用户以为"差异化 52 页必然恢复流量"，而遗漏其它可能因子（如具体掉的是哪 11 页、是否含非模板页）。

**Q8【可答】** 前结论"Bing 9,012 引用已证与 llms.txt 无关"。核验：9,012 = PageStats 累计引用总和（手册 v1.1 R6 校正后的权威值），但"与 llms.txt 无关"是**弱证**——只能说"无证据归因于 llms.txt；Bing 同样可从抓取到的 HTML 引用"。不能断言"已证无关"。
- why fatal：过度断言会让人停止验证 llms.txt 对 Bing 的真实贡献。

## Layer 4 — 审计"动机与框架"（最不舒服的一问）

**Q9【可答】** 前结论的"该做 vs 不必做"是否陷入了"每边给一半"的安全姿态？例如把 llms.txt 归为"保留但无效"，既不得罪 Bing 线也没给 Google 线新动作。这是独立判断，还是被"两边都要顾"的框架裹挟出的平庸结论？
- why fatal：若 llms.txt 对 Google 中性、对 Bing 有用，正确结论应是"保留并修复死链、移出 Google ROI 计算"，而非含糊的"保留但无效"。

**Q10【待实测】** 前结论所有判断的锚点是否都来自本仓静态文件 + 项目记忆？哪些仍需线上验证（GSC 掉页清单、Bing 是否真吃 llms.txt、Gemini 是否因 Google-Extended 而引用）？
- why fatal：红队纪律——任何"独立判断"必须带可快速验证的数据锚点，否则标【待实测】。

---

## 裁决修正表（R1–R8）

| 编号 | 前结论（旧） | 修订后（新） | 依据 |
|---|---|---|---|
| R1 | "content 30、53 程序化页" | `CONTENT_MAP`=**31**（非 30）；程序化页分三层：convert 31（最薄/最高风险）、guide 22（较厚）、blog 68（多实质但含近重簇）。"53"=31+22 仅作"convert+guide 模板页"代理，不等同全部风险面 | Q1【已核验】 |
| R2 | "53 页同质化=Google 指南点名的 scaled-content 红旗" | 此指南**未提 scaled content**；规模化薄内容风险来自 Google 独立 spam 政策 + 2026-08-18 更新，非本指南。本指南只说"做有用的非同质化内容 + 常规好 SEO" | Q2【可答】 |
| R3 | "epub-to-word/docx/word-docx 三篇近重（笼统）" | 三篇确为**blog 层活页近重**（均未跳转）；convert 层 `/convert/epub-to-docx`→`/convert/epub-to-word` 早已 301 去重（✅）。整改对象= blog 层三篇 | Q3【已核验】 |
| R4 | "llms.txt 对 Google 完全无效" | 对 **Google 搜索中性**（忽略、不伤不助）；对 **Bing/Perplexity/Claude 是有效资产**（指南原文认可"为其他服务维护完全没问题"）。结论：保留并修复死链，仅从 Google ROI 剔除 | Q4【可答】 |
| R5 | "robots.txt 放行 Google-Extended 无效" | 措辞误导。Google-Extended 管 Gemini grounding（**正向**），不控制搜索索引（那归 Googlebot）。bookconv 已正确 Allow 两者。保留，勿删；别用它替代 Googlebot 索引放行 | Q5【可答】 |
| R6 | "Bing 9,012 引用已证与 llms.txt 无关" | 改为"无证据归因于 llms.txt；Bing 亦可由 HTML 引用"。属【可答-弱证】，停止过度断言 | Q8【可答】 |
| R7 | （未提及 llms.txt 死链） | llms.txt 存在死链：`/blog/azw3-epub-mobi-kindle`（8/27 已删文件）、`/blog/epub-to-txt`（无此文件，仅有 epub-to-text）。需从 llms.txt 清除 + 加 CI 门禁 | Q6【已核验】 |
| R8 | "53 页=8/21 断崖根因"（确定因果） | 降级为**推断**：实测=活跃索引页 14→3（覆盖坍塌），position 持平（非排名惩罚）；归因规模化模板与 8-18 spam 时间对齐。"差异化 52 页"是项目自身复盘结论的修复动作，非本指南条目。需 GSC 验证"掉的是哪 11 页"坐实 | Q7【已核验】/【待实测】 |

## 审计的边界
- **已核验（可置信）**：R1 数字、R3 convert 去重、R4 Google 忽略 llms.txt 的逐字依据、R5 Google-Extended 机制、R7 死链存在、R8 活跃页 14→3 与 position 持平。
- **可答（需措辞修正）**：R2/R4/R5/R6 的框架与归因校准。
- **待实测（不可代结论）**：R8 断崖的精确掉页清单；Bing/Perplexity 是否真吃 llms.txt；Gemini 是否因 Google-Extended 而引用 bookconv。这些应在下一轮审计前用 GSC/Bing Webmaster/Perplexity 探针实测。

---

# 第二部分 · 修订后最终版合规核查

## ① 一页纸结论
```
1. 该不该继续做 GEO：✅ 做 —— 但重心从"文件/黑科技"校准到"非同质化内容 + 技术地基"
2. 对 Google：本指南 = "别搞 AI 噱头、做好常规好 SEO"。llms.txt/chunking/AI重写/虚假提及/过度结构化数据 = 可直接忽略
3. 对 Bing/Perplexity/Claude：llms.txt 是有效资产，保留并修复死链；Google-Extended 放行保留（利 Gemini）
4. 最大真实风险：31 个薄模板 convert 页 + blog/guide 间近重簇（非"Google 指南点名"，而是 spam 政策/8-18 更新面）
5. 第一步：完成 31 convert 页差异化 + 收敛近重簇（见第三部分清单）
```

## ② 该做 vs 不必做 · 合规核查表（修订版）

**表 A｜该做（官方推荐）—— bookconv 现状与判定**

| 官方"该做" | bookconv 现状（实测） | 判定 |
|---|---|---|
| 清晰技术结构 / 可抓取 / 可索引 | `robots.txt` 开放 Googlebot(*) 与 AI bot；`sitemap.ts` 由 CONTENT_MAP/guides/blog 派生；canonical 按 locale 判断、不硬编码 /en | ✅ 已达标 |
| 非同质化、第一手有帮助内容 | blog 68 + guide 22 多为真实 how-to/对比/排障；founder/about 为 E-E-A-T 实体页 | ✅ 方向对（最被看重） |
| 结构化数据（富媒体用） | convert 页含 FAQPage + SoftwareApplication + HowTo | ✅ 保留正确，不违规 |
| 高质量图片/视频 | 部分 guide 含截图；convert 页偏纯文本 | 🟡 部分达标，convert 页偏弱 |
| 用 Search Console 生成式 AI 报告监控 | 已有 GSC 双渠道分析流程 | ✅ 应在做 |
| 减少重复/近重内容 | blog/guide 间存在近重簇（见第三部分） | 🔴 待收敛 |

**表 B｜不必做（官方点名误区）—— bookconv 是否踩雷（逐字依据）**

| 官方"不必做"（逐字） | bookconv 现状 | 判定 |
|---|---|---|
| "LLMS.txt 文件和其他'特殊'标记"：Google 搜索不使用、会忽略，不伤不助 | `public/llms.txt` 存在，但 Google 忽略；对 Bing/Perplexity 是资产 | 🟡 对 Google 中性；对非 Google 保留有效（修复死链） |
| "内容'分块'"：无需为 AI 刻意拆解 | 正文自然长文（epub-to-mobi≈2500 词），未切块 | ✅ 没踩雷 |
| "专门针对 AI 系统重写内容" | 正常英文 how-to，无 AI 腔 | ✅ 没踩雷 |
| "刻意追求虚假的'提及'" | 未发现 | ✅ 没踩雷 |
| "过分关注结构化数据"：生成式 AI 不需要，但常规 SEO 仍建议 | 已用标准 schema，未造"AI schema" | ✅ 没踩雷 |

**表 C｜渠道纪律（最易被混淆）**

| 动作 | Google 搜索 / AI Overviews | Bing / Perplexity / Claude |
|---|---|---|
| `llms.txt` | ❌ 忽略（中性） | ✅ 可能读取（资产，需修死链） |
| robots.txt 放行 `Google-Extended` | 不控制搜索索引，但**允许 Gemini grounding（正向）** | ✅ 放行 GPTBot/PerplexityBot/ClaudeBot 有用 |
| 非同质化内容 + 可索引 | ✅ 唯一真正生效路径 | ✅ 同样生效 |
| 31 薄模板 convert 页 + 近重簇 | 🔴 触发 spam 质量信号风险（spam 政策/8-18 更新面，非本指南） | 🟡 同样可能因薄内容被低评 |

## ③ 术语人话
- **scaled content abuse（规模化内容滥用）**：为每种长尾变体批量造薄页刷 AI 回答，Google 判垃圾。⚠️ 注意：此风险来自 Google **spam 政策 + 2026-08-18 更新**，**不在**本 AI 优化指南的"误区"清单内。
- **Google-Extended**：给 Gemini/Vertex AI 训练与 grounding 的爬取开关，**不管理搜索网页索引**（那归 Googlebot）。
- **llms.txt**：给非 Google AI 的"站点说明书"；Google 忽略、Bing/Perplexity/Claude 可能读取。
- **E-E-A-T 实体页**：founder/about 这类证明"真有这家公司/这个人"的页，是 AI 采信的事实基线。

---

# 第三部分 · 整改清单

> 两大块：A. 31 个 convert 薄模板页差异化；B. blog/guide 近重簇收敛。
> 每项含：问题表现 / 风险等级 / 整改动作 / 验收标准。

## A. 31 个 convert 内容页差异化（最高风险）

**背景（实测）**：`CONTENT_MAP` = 31 页，由模板生成（hero + sections + faq），多为"X to Y 怎么转"的同构薄内容，是 8/21 覆盖坍塌的高危面。Tier-1 五页已上线（记忆 #0），余 26 页待差异化。

| 项 | 问题表现 | 风险 | 整改动作 | 验收标准 |
|---|---|---|---|---|
| A1 | 31 页正文同构、仅靠格式对替换，缺第一手价值（步骤/坑/设备差异） | 🔴 高 | 每页补：①真实分步操作（含 Calibre 命令/浏览器内差异）②该格式对的"常见失败+修复"③适用设备/阅读器清单；Tier 分层（Tier-1 已 5 页，Tier-2/3 按主题簇推进） | 单页原创独特点 ≥3 条；与同簇他页文本重复率 <30%（工具校验） |
| A2 | 部分页 wordCount 偏低、metaDescription 缺失（记忆 #7 曾补过，需复检） | 🟡 中 | 复检 31 页 metaDescription 100% 覆盖；正文 ≥400 词（geo-audit 阈值） | `audit:geo-content` 全 PASS；metaDescription 无空 |
| A3 | convert 页图片/视频偏弱（表 A 标 🟡） | 🟡 中 | 关键页补格式对照截图/动图（如 EPUB↔MOBI 排版差异） | 至少 10 个高频页含 ≥1 张原创图 |
| A4 | `/convert/epub-to-pdf` 基线曝光 0（线上 200）索引疑云 | 🟡 中 | GSC 查该页索引状态与覆盖；若未索引则排查 canonical/内链 | 该页在 GSC 覆盖率=已索引且 impressions>0 |

## B. blog / guide 近重簇收敛（实测存活簇）

> 下述 slug 均经 `blog/index.ts` / `guides/index.ts` 核验为**已注册活页**。convert 层去重已完成（R3），不重复列。

| 簇 | 涉及活页（实测） | 风险 | 整改动作 | 验收标准 |
|---|---|---|---|---|
| B1 EPUB→Word/DOCX（blog 3 篇） | `/blog/epub-to-word`、`/blog/epub-to-docx`、`/blog/epub-to-word-docx` | 🔴 高 | 选 `/blog/epub-to-word` 为规范页；另两篇做 301（加 `BLOG_REDIRECTS`）或重构为不同角度（如一篇专讲"保留排版"、一篇专讲"批量/API"） | 仅 1 个规范 slug 可索引；另两篇 301 或差异化后无标题/意图重叠 |
| B2 EPUB→Various（blog 2 篇同标题） | `/blog/epub-converter`、`/blog/epub-to-various-other`（llms.txt 第 83/86 行标题完全相同） | 🔴 高 | 二选一为规范页，另一篇 301；或合并内容去重 | 同标题双 slug 消除；`find-duplicate-headings` 门禁 PASS |
| B3 EPUB→Text | `/blog/epub-to-text`（活）；`/blog/epub-to-txt`（llms.txt 第 84 行，无对应文件→疑似死链） | 🟡 中 | 确认规范 slug；若 epub-to-txt 无文件，从 llms.txt 删除该链接；blog 仅留 epub-to-text | llms.txt 无指向不存在 blog 的链接 |
| B4 EPUB→MOBI（blog+guide 3 页） | `/blog/epub-to-mobi`、`/blog/epub-to-mobi-guide`、`/guide/epub-to-mobi-keep-formatting` | 🟡 中 | 明确分工：blog 教"怎么转"、guide 教"保排版"；标题/意图错开；如需可 301 合并 blog 两篇 | 三页意图不重叠；无互相抢词 |
| B5 EPUB vs MOBI（blog+guide） | `/blog/epub-vs-mobi`、`/guide/epub-vs-mobi` | 🟡 中 | 跨层近重：blog 偏"选哪个"、guide 偏"技术差异"，标题错开避免完全相同 | 两页标题不完全一致；覆盖不同搜索意图 |
| B6 AZW3 vs MOBI（blog+guide 同标题） | `/blog/azw3-vs-mobi`、`/guide/azw3-vs-mobi`（llms.txt 第 42/133 行标题一致） | 🟡 中 | 跨层同标题最危险；建议 guide 改副标题区分（如"+ KFX 兼容性"），或 blog 301 到 guide | 同标题跨层消除 |
| B7 Kindle 格式簇（blog 2-3 篇） | `/blog/kindle-epub-azw3-mobi`、`/blog/azw3-epub-mobi-kindle-compatibility`；`/blog/azw3-epub-mobi-kindle` 已删（llms.txt 第 91 行死链） | 🟡 中 | 收敛为 1 篇综合 + 1 篇设备专项；清 llms.txt 死链 | 簇内 ≤2 篇且无意图重叠；死链清除 |
| B8 Batch 簇（blog+guide 3 篇） | `/blog/batch-converter`、`/blog/calibre-free-batch`、`/guide/batch-converter` | 🟡 中 | 分工：blog 讲"何时用 Calibre 替代"、guide 讲"用 BookConv 批量"；错开标题 | 三页意图清晰分离 |
| B9 Calibre 对比簇（blog+guide 3 篇） | `/blog/bookconv-vs-calibre`、`/guide/calibre-vs-online-converter`、`/guide/calibre-alternative` | 🟡 中 | 合并/分工："vs Calibre"归 BookConv 官方对比；两 guide 合并为一篇"Calibre 替代方案" | 簇内 ≤2 篇 |
| B10 Sync/读书组簇（blog 3 篇） | `/blog/sync-reading-across-devices`、`/blog/sync-ebooks-reading-groups`、`/blog/reading-groups-hub` | 🟡 中 | "reading-groups"与"sync-ebooks-reading-groups"高度近重→合并或 301；前者留"跨设备进度" | 仅 1 篇读书组主题 |
| B11 IP「multiple devices」模板簇（blog 5 篇） | `/blog/harry-potter-…`、`/blog/lord-of-the-rings-…`、`/blog/twilight-…`、`/blog/chronicles-of-narnia-…`、`/blog/marvel-comics-…`（同构"X: Read Across Kindle, Kobo, and More"） | 🔴 高（最像 scaled content） | 每篇注入该 IP 独有内容（正版渠道、设备限制、版权提示、粉丝 FAQ），打破模板同构；保留已验证的 Bing 58% Citation Share 优势页 | 五篇间文本重复率 <40%；每篇含 ≥3 条该 IP 专属信息 |

## C. llms.txt 死链修复（Bing/Perplexity 资产保全）

| 项 | 问题表现（实测） | 风险 | 整改动作 | 验收标准 |
|---|---|---|---|---|
| C1 | llms.txt 第 91 行 `/blog/azw3-epub-mobi-kindle` 指向 8/27 已删文件 | 🟡 中（伤 Bing/Perplexity） | 从 llms.txt 删除该条；加 CI 门禁校验 llms.txt 链接均存在 | `grep` llms.txt 链接 100% 有对应注册 slug |
| C2 | llms.txt 第 84 行 `/blog/epub-to-txt` 无对应文件（仅 `epub-to-text`） | 🟟 低-中 | 改为 `/blog/epub-to-text` 或删除 | 同上 |

> ⚠️ **勘误（2026-09-26 · Batch 4 Day 1 实测，以文件为准）**：上文 C1/C2 前提**不成立**，已更正。
> - **C1 错误**：`/blog/azw3-epub-mobi-kindle` **并非死链**——`src/data/blog/index.ts:51` 仍注册、`src/data/blog/azw3-epub-mobi-kindle.ts` 文件存在且内容完整（lastUpdated 2026-09-04）。index.ts 第 85 行注释「8/27 已删 4 文件」与代码实际状态矛盾（注释陈旧）。该页为**活页**，llms.txt 链接有效，**不应删除**。
> - **C2 错误**：当前 `llms.txt` 已无 `/blog/epub-to-txt`（旧行号引用过时），仅存在 `/blog/epub-to-text`（活页），无需改动。
> - **真死链**：全量扫描 123 条 llms.txt 链接，**唯一真死链是 `/convert/epub-to-docx`**（`src/middleware.ts:14` 定义为 →`/convert/epub-to-word` 的 301 跳转源，非内容 slug）。已将其改为指向 canonical `/convert/epub-to-word`，复验 **0 DEAD / 123 链接**。
> - 结论：Day 1 实际修正 1 处真死链 + 更正错误前提；v2 审计的原始 C1/C2 描述作废，以本勘误与 `docs/seo-geo-execution-plan-2026-09-17.md` §八 Day 1 行为准。

## D. 门禁与验证（闭环）

| 项 | 动作 | 验收 |
|---|---|---|
| D1 | 批量改内容后跑 `npm run audit:syntax` + `audit:geo-content` + `audit:geo-guide` + `find-duplicate-headings` | CI 全绿 |
| D2 | llms.txt 加"链接存在性"门禁 | 死链零出现 |
| D3 | GSC 验证 8/21 掉页清单（哪 11 页） | 【待实测】坐实规模化模板假设（R8） |
| D4 | Bing Webmaster + Perplexity 探针验证 llms.txt 实际贡献 | 【待实测】确认 llms.txt 对 Bing/Perplexity 增益 |

---

## 两个必须记住的结论（修订后）
1. **bookconv 的 llms.txt 对 Google 中性（忽略），但对 Bing/Perplexity/Claude 是有效资产**——保留、修死链、移出 Google ROI 计算；Google-Extended 放行是正向（利 Gemini），勿删。
2. **8/21 覆盖坍塌的修复靶面 = 31 薄模板 convert 页 + blog/guide 近重簇**（B1–B11、C1–C2）。这与 Google **spam 政策 / 2026-08-18 更新**对齐，而**不是**本 AI 优化指南的条目——本指南只要求"做好常规好 SEO、别搞 AI 噱头"。差异化整改是正确动作，但应理解为"满足 spam 恢复 + 基础 SEO"，而非"满足本指南"。

---
*审计与修订完成。R8 / D3 / D4 为【待实测】项，应在下一轮审计前用线上数据闭环。*
