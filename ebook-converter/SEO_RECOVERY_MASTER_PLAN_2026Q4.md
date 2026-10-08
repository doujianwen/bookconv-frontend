# SEO Recovery 主计划 · 2026 Q4

> 生成：2026-10-07 · 模式：**READ ONLY**（未修改任何源码、未提交、未推送）
> 配套报告：`CONVERT_INVENTORY.md` · `CONVERT_PERFORMANCE_REPORT.md` · `CANNIBALIZATION_REPORT.md` · `CONTENT_QUALITY_REPORT.md` · `INTERNAL_LINK_REPORT.md` · `SEO_RECOVERY_DECISIONS.md`

---


## 一句话结论

> **Convert 页的技术 SEO 底座是健康的（31 页 = 31 可索引 = 31 进 sitemap，canonical/schema/301 无硬伤），但 91 天内 633 次曝光、0 点击、平均 position 50–75。**
> **"把内容写厚"这条已被数据否证**（零曝光页平均字数反而更高）。真正的瓶颈是 **站点级权威度** 与 **9 组跨目录同名 slug 的意图重叠**。

---


## 一、FACT（已实测，证据可复算）


### F1 — 资产层完全健康

| 事实 | 数值 | 证据源 |
|---|---|---|
| Convert 页面总数 | 31 | `src/data/content/*.ts`（脚本断言 = CONTENT_MAP 键数）|
| 实际可索引 | 31 | `page.tsx` `dynamicParams = false` + `generateStaticParams` = 31 |
| Sitemap 收录（en / es） | 31 / 3 | `sitemap.ts:248` / `:229` |
| Canonical 显式设置 | 31/31 | `buildAlternates`，无 /en 硬编码 |
| Schema 类型 | 4（BreadcrumbList/HowTo/WebPage/FAQPage）| `schema.ts:128-175`，server-side 输出 |
| 旧 slug 301 | `epub-to-docx → epub-to-word` | `middleware.ts:14` |

### F2 — Google 表现：曝光 633 / 点击 0

| 事实 | 数值 | 证据源 |
|---|---|---|
| 数据窗口 | 2026-07-04 → 2026-10-02（91 天）| `_wb_tmp/gsc-qpage.json` |
| 样本量 | 482 行 / 402 query / 37 URL | 同上 |
| Convert 总曝光 | **633** | 同上 |
| Convert 总点击 | **0** | 同上 |
| 全站总点击 | **3**（全在首页）| 同上 |
| Tier A（>20 曝光）| 6 页（19.4%），吃掉 88.5% 曝光 | 同上 |
| Tier D（0 曝光）| **18 页（58.1%）** | 同上 |

### F3 — 🔴 用户所述「52% 零曝光」不成立

| 口径 | 零曝光占比 |
|---|---|
| 用户所述 | 52% |
| **本审计实测（31 页 / 91 天）** | **58.1%（18/31）** |
| 差异 | +6.1pp |

**52% 在项目内找不到任何数据源支撑。** 最接近的历史结论是 `数据分析/转换页收录核对清单.md`（2026-08-03）的"25 个 P0 页中 22 个零曝光 = 88%"——方向一致，量级不同。

### F4 — 内容质量：声明字数 0/31 可信

| 事实 | 数值 |
|---|---|
| 声明字数合计 | 32,565 |
| 实测字数合计 | 43,716（高 34.3%）|
| 逐页完全一致的页数 | **0 / 31** |
| 实测 < 声明×0.7 的页 | 4（`epub-to-pdf`、`pdf-to-epub`、`epub-to-mobi`、`txt-to-epub`）|
| D 档（<800 字）| 4 页：`epub-to-zip` 739、`azw3-to-epub` 587、`txt-to-epub` 528、`docx-to-epub` 428 |
| FAQ 停在 6 条的页 | 26 / 31 |
| 正文零出站引用的页 | 25 / 31 |

### F5 — 🔴 内容厚度与曝光无正相关（反直觉）

| 分组 | 页数 | 平均实测字数 | 平均曝光 |
|---|---|---|---|
| 有曝光 | 13 | 1,516 | 48.7 |
| 零曝光 | 18 | 1,278 | 0 |

⚠️ **零曝光页平均字数低于有曝光页但差距不大，且 4 个 D 档页全部零曝光。** 结合 `epub-to-zip`（739 字、全站最佳 position 14.8）这个反例 ⇒ **"写厚就能恢复"不成立，但"太薄确实无机会"也成立。**

### F6 — 无内容内耗（判据自检通过）

| 事实 | 数值 |
|---|---|
| 同 query 落多 URL（必要条件）| 62 个 query |
| 判据自检（同页自比 Jaccard）| **1.000** ✅ |
| Jaccard > 40% 的页对 | **0** |
| **TRUE cannibalization** | **0** |
| Convert 页两两 Jaccard > 0.30 | 0 |
| 最高 Jaccard | **0.026** |

**独立交叉印证**：`数据分析/convert差异化-文本层报告.md`（2026-10-07，项目自有脚本）测得两两平均 0.002、最高 0.143 ⇒ 结论方向一致。

### F7 — 但存在 9 组跨目录同名 slug（真实结构风险）

| slug | 存在于 | GSC 中同时分摊 query |
|---|---|---|
| `mobi-to-epub` | convert + blog | ✅ 9 个 |
| `epub-to-mobi` | convert + blog（另有 `epub-to-mobi-guide`）| ✅ 5 个 |
| `epub-to-azw3` | convert + blog | ✅ 7 个 |
| `azw3-to-mobi` | convert + blog | ✅ 1 个 |
| `cbr-to-pdf` | convert + blog + guide | ✅ 1 个 |
| `djvu-to-pdf` | convert + blog + guide | ✅ 1 个 |
| `epub-to-word` | convert + blog | 0 |
| `fb2-to-epub` | convert + blog | 0 |
| `txt-to-epub` | convert + blog | 0 |

### F8 — 内链结构：出站均匀，入站两极

| 事实 | 数值 |
|---|---|
| Convert 页出站内链 | **恒为 6 条**（3 blog + 3 guide），31 页完全一致 |
| Convert 页零出站 | 0 页 |
| 零 Convert 入站的 blog | **32 / 63** |
| 零 Convert 入站的 guide | **7 / 24** |
| 入站最高的 guide | `/guide/epub-to-mobi-keep-formatting`（12 页指向）|
| **反例** | `epub-to-zip` 无任何 guide 指向，却拿到 45 曝光 / pos 14.8 ⇒ **内链非曝光必要条件** |

### F9 — 结构层骨架同质（项目自有审计，今天生成）

来源：`数据分析/convert差异化-结构层报告.md`（`scripts/audit-convert-differentiation.mjs`）

| 判据 | 结果 | 目标 | 判定 |
|---|---|---|---|
| 共用骨架数（出现 ≥8 页）| 6 | ≤ 3 | **FAIL** |
| 最高频共用章节覆盖页数 | 18 | ≤ 8 | **FAIL** |

最普遍骨架：`howtoconvert<>to<>`（18 页）、`<>vs<>formatcomparison`（16 页）、`whatis<>format`（15 页）。

### F10 — 历史结论已被证伪 1 条

| 旧结论（2026-08-03）| 现实 |
|---|---|
| `epub-to-zip` 是"伪需求、epub 即 zip、不在 CONVERSION_MAP、建议 noindex" | **该页现为 Tier A：45 曝光、pos 14.8（全站最佳），全站 Convert 第 5。且 `conversion-map.ts` 中 `epub-html` = "EPUB to HTMLZ (Zipped Web Pages)" ⇒ zip 是真实产物 |

---


## 二、ASSUMPTION（合理推断，但未被数据证实）


| # | 假设 | 支持证据 | 反对证据 | 置信度 |
|---|---|---|---|---|
| A1 | 零曝光的根因是**站点级权威度不足**（而非单页质量）| 全站仅 3 点击、position 50–75；零曝光页平均字数并不低 | 无外链数据、无法量化站点权威度 | **中** |
| A2 | 曝光集中由**真实搜索需求**驱动（Kindle/AZW3 迁移痛点 > 小众格式）| `mobi-to-epub` 227 曝光 vs `chm-to-mobi` 0 曝光 | `constants.ts` 的搜索量表已与实际收录脱节（F10 同类问题）| **中** |
| A3 | 9 组同名 slug 造成**权重分散**，压制 convert 页排名| 62 个 query 分摊；`mobi-to-epub` 一页与 guide 分摊 9 个 query | Jaccard ≈ 0，Google 未必视为重复；无实验数据 | **中低** |
| A4 | Bing Web（+26.1% VI）与 Bing AI（+147.8% VI）的增长**可迁移**到 Google| 两渠道同向同幅增长过 | Google 同期 −27.5%；迁移假设从未被验证 | **低** |
| A5 | 结构层同质（6 个共用骨架）**正在**被 Google 惩罚| 通用做法，无本地证据 | 本项目无任何证据表明 Google 已实际降权 | **低** |

---


## 三、UNKNOWN（本数据集无法判定，永久标 UNKNOWN 不报 FAIL）


| # | 未知项 | 为什么不可判定 | 需要什么数据 |
|---|---|---|---|
| U1 | 18 个零曝光页**是否已被 Google 收录** | GSC 曝光数据只记录"被展示过"，未收录与收录但不值展示都表现为零记录 | GSC **索引覆盖报告**（Index Coverage API）|
| U2 | 零曝光的**真因**是未收录 / 不值得展示 / 无搜索需求 | 三种可能在本数据中表现完全相同 | Index Coverage + 关键词搜索量工具 |
| U3 | 这些格式对的**真实月搜索量** | `constants.ts` 搜索量表是静态手填且已与实际脱节（F10）| 外部 keyword 工具重新拉取 |
| U4 | **真正的全站孤儿页**清单 | 本报告只算 Convert 链路内链，未爬取渲染后完整链接图谱 | 线上渲染 HTML + 全站链接图谱爬取 |
| U5 | 站点**外链/域名权威度**当前水平 | 项目内无外链数据 | Ahrefs/Semrush 或 GSC 外部链接报告 |
| U6 | 结构层同质**是否已被 Google 实际降权** | 无任何本地证据 | 需 Google Search Console 手动处罚/人工处置记录 |
| U7 | Bing AI 引用的 13,139 次**是否带来流量** | 项目已有实测反驳：`bing/organic` 全期仅 2 会话 / 7,067 引用（≈0.03%）| — 已有答案：**几乎不带来流量** |

---


## 四、30 天计划（2026-10-08 → 2026-11-06）


**原则：只做"不需新数据就能验证"的事，所有删除/合并一律不做。**


| # | 动作 | 负责面 | 验收判据（可执行）| 依据 |
|---|---|---|---|
| 1 | **拉取 GSC 索引覆盖报告**，确定 18 个零曝光页的收录状态 | 数据 | 产出 U1 答案，18 页中"已收录/未收录"数字 | U1 |
| 2 | **用外部 keyword 工具重拉 31 个格式对的搜索量** | 数据 | 产出 U3 答案，替换已脱节的 `constants.ts` | U3、F10 |
| 3 | **修正 `export const wordCount` 为实测值** | 内容 | 31/31 与实测一致（当前 0/31）| F4 |
| 4 | **9 组同名 slug 做 title/意图分工**（convert 抢"X to Y converter"、blog 抢"how to/why"、guide 抢"keep formatting"）| SEO | 9 组的 title 意图矩阵文档化，**不改正文** | F6 + F7 |
| 5 | **修 `mobi-to-epub` 与 `/guide/mobi-to-epub-keep-formatting` 的分工** | SEO | convert 页正文显式加一句"格式保留细节见 guide"内链 | F7（9 query 分摊）|
| 6 | **完成 M2-8 结构层差异化**（共用骨架 6→≤3，18 页共享章节→≤8）| 内容 | 重跑 `audit-convert-differentiation.mjs` 两项 PASS | F9 |
| 7 | **给 4 个 D 档页（`txt-to-epub`/`docx-to-epub`/`azw3-to-epub`/`epub-to-zip`）做 Index Coverage 排查 + 请求索引** | SEO | 4 页索引状态明确 | F5、U1 |
| 8 | **建每周 GSC page 维度基线导出** | 数据 | 每周一产出，替代本次一次性快照 | 记忆纪律：单窗口不是趋势 |

🚫 **30 天内明确不做**：删页、合并页、改 canonical、重写正文模板、动 `dynamicParams`。理由：F6 已排除内耗，删除无收益且有 F10 证伪先例。

---


## 五、90 天计划（2026-10-08 → 2027-01-06）


| # | 动作 | 前置 | 验收判据 |
|---|---|---|---|
| 1 | **Tier A 六页 ENHANCE**（`/convert/mobi-to-epub`、`/convert/epub-to-doc`、`/convert/epub-to-txt`、`/convert/epub-to-azw3`、`/convert/epub-to-zip`、`/convert/azw3-to-mobi`）| 30 天动作 4 完成 | 六页 position 有可测量改善（用曝光加权均值，跨窗对比）|
| 2 | **32 个零 Convert 入站的 blog + 7 个零入站 guide** 建立互链入口 | 30 天动作 3 | 这 39 页至少各获 1 条 Convert 链内链 |
| 3 | **按 U1/U3 的答案，重新裁定 18 个零曝光页的存废** | 30 天动作 1、2 完成 | 输出带搜索量依据的 keep/remove 表 |
| 4 | **外链建设启动**（当前 U5 无数据，先建立基线）| 30 天动作 8 | 拿到首份外链基线报告 |
| 5 | **复测内耗判据**：90 天后重跑 Jaccard + shared-query | — | 若 9 组分工后分摊 query 数下降，验证 A3 假设 |
| 6 | **F5 反例追踪**：`epub-to-zip` 是否能守住 pos 14.8 | — | 验证薄页也能有排名的边界 |

---


## 六、180 天计划（2026-10-08 → 2027-04-07）


| # | 动作 | 说明 |
|---|---|
| 1 | **扩展格式组合**（`数据分析/转换页收录核对清单.md` 第四节 P1/P2：docx→pdf 33,100、pdf→docx 22,200、html→pdf 12,100 等）| ⚠️ 仅在 U3 搜索量数据确认后执行；且必须先解决 Calibre 委派路径已关闭（VPS 149.104.69.126 已到期）这一能力边界 |
| 2 | **结构化数据 A/B**：4 类 schema 已全量输出，但 GSC「搜索结果呈现」为空 ⇒ 测 Rich Results Test 通过率 | 已知缺口 |
| 3 | **内容形态升级**：从 6 条同质 FAQ（26/31 页）升级为差异化 FAQ + 真实出站引用（当前 25/31 页零出站）| F4 |
| 4 | **跨渠道验证 A4**：Bing 的增长能否迁移到 Google | 需 Google 侧排名实质改善才算验证 |
| 5 | **180 天全量复审**：重跑本审计全部脚本，产出趋势对比 | 用 `VI v1.0` 口径（|VI|<10% 无信号 / 10–20% 弱 / ≥20% 信号成立）|

---


## 七、Quick Wins（低成本 × 高确定性，优先做）


| # | Quick Win | 成本 | 确定性 | 依据 |
|---|---|---|---|---|
| Q1 | **修正 31 页的 `wordCount` 为实测值** | 极低（改 31 个常量）| **高**（0/31 可信 → 100% 可信）| F4 |
| Q2 | **9 组同名 slug 的 title 分工** | 低（只改 title/meta）| **高**（62 个 query 实测分摊）| F6+F7 |
| Q3 | **`mobi-to-epub` ↔ guide 互链** | 极低（各加 1 条）| **高**（9 query 分摊，且该页是曝光第一）| F7 |
| Q4 | **4 个 D 档页请求索引 + Index Coverage 排查** | 极低 | **中**（依赖 U1）| F5、U1 |
| Q5 | **`epub-to-zip` 加 3 条 w3/idf/calibre 正文外链** | 低 | **中**（E-E-A-T 信号已存在于 `authorship.sources` 但未被渲染成可爬外链）| F4 |
| Q6 | **纠正 8-03 清单的 `epub-to-zip` 结论** | 极低（改文档）| **高**（该页已是 pos 14.8）| F10 |

---


## 八、ROI 优先级排序


排序依据：`确定性（证据强度）× 影响面 ÷ 成本`。**不确定的（标 ⚪）一律排在确定动作之后。**


| 排名 | 动作 | 影响面 | 成本 | 确定性 | ROI |
|---|---|---|---|---|---|
| 1 | Q1 修正 wordCount | 31 页内容治理 | 极低 | 🟢 实测 | **★★★★★** |
| 2 | Q2 title 分工 | 9 组 × 62 query | 低 | 🟢 实测 | **★★★★★** |
| 3 | Q3 mobi-to-epub ↔ guide 互链 | 1 页（曝光第一）+ 1 guide | 极低 | 🟢 实测 | **★★★★★** |
| 4 | M2-8 结构层差异化 | 31 页（FAIL → PASS）| 中 | 🟢 项目自有审计已判 FAIL | **★★★★** |
| 5 | Q4 D 档页索引排查 | 4 页 | 极低 | 🟡 依赖 U1 | **★★★★** |
| 6 | U1 索引覆盖数据 | 决定 18 页去留 | 低 | ⚪ 未知 | **★★★★**（信息价值）|
| 7 | U3 搜索量重拉 | 决定所有扩页决策 | 低 | ⚪ 未知 | **★★★★**（信息价值）|
| 8 | 32+7 零入站页互链 | 39 页 | 中 | 🟡 假设 A1 间接支持 | **★★★** |
| 9 | Q5 权威外链落地 | E-E-A-T | 低 | 🟡 | **★★★** |
| 10 | 外链建设（站外）| 站点权威度 | **高** | 🟡 A1 | **★★★**（高成本拉低 ROI）|
| — | 🚫 删页 | — | 低 | 🔴 **F10 已证伪同类判断** | **不推荐** |
| — | 🚫 合并 convert/blog | — | 中 | 🔴 **Jaccard 0.026，无内耗** | **不推荐** |
| — | 🚫 重写正文模板 | — | 高 | 🔴 **F5 无正相关** | **不推荐** |
| — | ⚪ 扩格式组合 | 7 个 P1/P2 | 高 | ⚪ 依赖 U3 + Calibre 能力边界 | **暂缓** |

---


## 九、数据来源清单（全部可复算）


| # | 数据 | 路径 | 产生方式 |
|---|---|---|---|
| S1 | GSC query×page 91 天数据 | `_wb_tmp/gsc-qpage.json` | GSC Search Analytics API（SA-JWT，只读 scope），`_wb_tmp/fetch-gsc-qpage.mjs` |
| S2 | 31 页内容元数据 | `_wb_tmp/_audit_rows.json` | 解析 `src/data/content/*.ts`（断言解析数=文件数）|
| S3 | 内链矩阵 | `_wb_tmp/_audit_links.json` | 复刻 `src/lib/internal-links.ts` 打分逻辑 |
| S4 | 内耗判据 | `_wb_tmp/_audit_cannib.json` | 8-gram Jaccard（自检=1.000）+ GSC shared-query |
| S5 | 结构层差异化 | `数据分析/convert差异化-结构层报告.md` | 项目自有 `scripts/audit-convert-differentiation.mjs`（2026-10-07）|
| S6 | 文本层差异化 | `数据分析/convert差异化-文本层报告.md` | 同上，独立交叉印证 F6 |
| S7 | 渠道趋势 | `数据分析/Bing-Google双渠道日报-2026-10-05.md` | 自动化日报（VI v1.0 口径）|
| S8 | 历史收录判断（已部分证伪）| `数据分析/转换页收录核对清单.md` | 2026-08-03 人工清单 |
| S9 | 转换能力边界 | `src/lib/conversion-map.ts` | CONVERSION_MAP 键 |
| S10 | 站点/sitemap/schema | `src/app/sitemap.ts`、`src/lib/seo/schema.ts`、`src/app/[locale]/convert/[slug]/page.tsx` | 源码直读 |

## 十、本次审计自身的局限（诚实声明）


| # | 局限 | 影响 |
|---|---|---|
| 1 | 内链矩阵是**复刻算法**而非真实渲染结果 | 若运行时 blog/guide 数据有变动，结果可能偏差 |
| 2 | 未爬取线上渲染 HTML | canonical/schema/301 是**源码核验**而非线上抓取核验 |
| 3 | 未验证线上真实索引状态 | U1 仍 UNKNOWN |
| 4 | 正文外链只统计 `body:` 内的 markdown 链接 | 导航/页脚外链未计入 |
| 5 | 曝光/position 均为 91 天**单窗口** | 按项目纪律，单窗口不是趋势；变化率须用滚动多窗口 |
| 6 | 审计脚本本身经过 2 轮修正才产出正确结果（blog 文件三种引号写法导致过假零）| 已加断言防回归，但说明**任何"0 命中"结论都必须先验证判据有效性** |
