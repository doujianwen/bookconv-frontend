# BookConv SEO/GEO 执行规划文档

**制定日期**: 2026-09-17
**最近更新**: 2026-09-27（新增 §十：双渠道分析衍生待办 M1–M8；hermes 执行副本同步 `hermes-context/`）
**执行状态**: Batch 1a/1b 已完成并线上验证；Batch 1c/2/3 待执行（已并入 `待执行计划-v2` 的 A 系列）；Batch 4 自 2026-09-26 起逐日执行；**Day 1 已完成**（llms.txt 死链归零，0 DEAD / 123 链接）；**Day 2 已完成**（B1：epub-to-docx / epub-to-word-docx 301 → epub-to-word，两 slug 移出 sitemap，commit `b50732d`/`5ad0dcb`，**2026-09-26 核实已推送**）；**Day 3 已完成**（B2：epub-converter / epub-to-various-other 同标题双 slug 301 → epub-converter，commit `84a69b5`，**未 push**）；**Day 4 已完成**（B11a：lord-of-the-rings/twilight/marvel-comics 3 个零曝光 IP 页 301 → /blog/read-epub-on-any-device，commit `1fef1fe`，**未 push**）；**K2 + M13-1 已完成**（K2: /about sameAs + BookReverb/BookConvert 消歧，commit 5925248；M13-1: /convert/mobi-to-epub 复现 P31 强推荐语序，未 push）；**Day 5 已完成**（B11b：harry-potter + chronicles-of-narnia 两 IP 页差异化，修正 HP 错误公版声明 + 各加 1 个 IP 专属章节，commit 90eb4a1，未 push）；**Day 6 已完成**（B3 EPUB→Text 规范 slug 实测确认 = `/convert/epub-to-txt`，`/convert/epub-to-text` 为 301 源；llms.txt 全量 121 链接 0 DEAD；M13-3 补 `docx-to-epub`/`azw3-to-epub`/`doc-to-epub` 三页事实密度句式（`mobi-to-epub` 来自 M13-1）；K4 外联邮件草稿已交付待用户发送；commit `8e3e6db` **已 push + 线上断言 CONFIRMED**）；**Day 7 已完成**（B4：`/blog/epub-to-mobi-guide` 标题错开差异化，保留 `/blog/epub-to-mobi` 主 how-to 与 `/guide/epub-to-mobi-keep-formatting`，三页意图不再重叠，commit `47b9291`，**已随 origin/main 上线（10-02 复核）**）；**Day 8 前置完成（2026-10-02）**：B5 + K5 + M13-4（见 changelog 2026-10-02 行）；**Day 9 已完成**（B6：llms.txt 第 42 行 blog 链接文本去重，blog/guide 跨层同标题消除，commit 1ef49db）；**M1 首读 API 复核完成（2026-10-02 下午）**：Tier-1 持平无修复信号、URL Inspection 403 权限阻断待提权（见 changelog）；**Day 10 已完成**（B7：kindle-epub-azw3-mobi 改为 Kindle 设备专项实操指南，与 azw3-epub-mobi-kindle-compatibility 综合格式指南意图不再重叠；commit 3a0621f，未 push）；**Day 11 已完成**（B8：guide/batch-converter 改为 BookConv 批量工具页、/blog/batch-converter 重锚定改用 Calibre 决策，消除两页近同标题、与 /blog/calibre-free-batch 三页意图清晰分离；commit bbbe8fd，未 push）
**⚠️ 排期职能**：本文件即为待执行计划权威源（含 §八 Batch 4 / §九 D 系列 / §十 M 系列）；`docs/待执行计划-v2`、`docs/待执行计划-v3` 为历史同步副本，新项只在此维护。（2026-09-27 更正）
**负责人**: 鉴源·出海专家辅助执行

---

## 一、执行概览

| 维度 | 数值 |
|------|------|
| 总任务数 | 22 个（原 20 + 新增 2 个缺陷修复） |
| 已完成 | 9 个 |
| 执行中 | 0 个 |
| 未开始 | 13 个 |
| 完成率 | 41% |

**双渠道策略定位**
- GSC 修复：60% 精力（提升排名与点击）
- Bing 放大：40% 精力（维持增长势头）

**⚠️ 执行纪律修正（本日新增）**
原计划假设"分批提交即可避免处罚"。本日实测发现真正的风险不是"提交太快"，
而是**批量脚本把内容插错位置**——详见 §三 B1a/B1b。分批仍是纪律，但
**每次批量改动后必须跑构建门禁**，否则改动根本不会上线。

---

## 二、Week 1 执行计划（2026-09-17 ~ 2026-09-23）

### T0: Schema 审计与修复 ✅ 已完成

| 任务 | 状态 | 完成日期 | 备注 |
|------|------|---------|------|
| T0-1: Convert 页 Schema 审计 | ✅ | 2026-09-17 | 30/30 OK |
| T0-2: Guide 页 Schema 审计 | ✅ | 2026-09-17 | 22/22 OK |
| T0-3: Blog 页 Schema 审计 | ✅ | 2026-09-17 | 23/24 OK（1 个 404，已随 B1-1 修复） |

**结论**：Schema 全站已覆盖，无需修复。此前"Convert 页缺 Schema"的判定是
红队误判（静态查代码未实测线上 HTML），已从规范文档中降级。

---

### B1a: 部署解冻 + 404 修复 ✅ 已完成并线上验证

> **这是本次最重要的发现**：站点自 06:02af5 起构建一直失败，
> 但 Vercel 在构建失败时会**继续服务上一个成功版本**，
> 所以站点看起来完全正常，实际每一次 push 都是死的。

| 任务 | 状态 | 提交 | 线上验证 |
|------|------|------|---------|
| B1a-1: 修复 `epub-to-mobi.ts` 语法错误（sections 数组被提前闭合） | ✅ | a0680f5 | ✅ |
| B1a-2: 修复 `blog/index.ts` 重复 import（post69 声明两次） | ✅ | a0680f5 | ✅ |
| B1a-3: 修复 `/blog/azw3-to-mobi` 404（未注册到 posts[]） | ✅ | d2a405c → 随部署生效 | ✅ 实测 200 |
| B1a-4: 新增构建门禁脚本 | ✅ | a0680f5 | ✅ |

**根因**：`6c02af5`（P2 差异化改造）把 8 个新 section **插在了 `sections` 数组的
闭合 `],` 之后**，而不是数组内部，导致 `L110: Unexpected token '{'`。
`81b625e` 在同一破损状态上继续追加，问题被叠加。

**验证证据**

| 项 | 结果 |
|---|---|
| `npm run build` | ✅ Compiled successfully（354/354 静态页） |
| `GET /blog/azw3-to-mobi` | ✅ 200（修复前 404） |
| `GET /convert/epub-to-mobi` | ✅ 200，13 个 section 全部渲染 |
| 新门禁 `audit-content-integrity.mjs` | ✅ 0 error |

**新增门禁**：`scripts/audit-content-integrity.mjs`
- TS 解析错误 / 重复 import 绑定 → ERROR（会阻断构建）
- 同文件内重复 heading / 缺 `metaDescription` → WARN
- 同时兼容 `content/` 与 `blog/` 两套 schema
- 非零退出码，可直接接入发布流程

---

### B1b: P2 批次缺陷修复 ✅ 已完成，线上验证中

| 任务 | 状态 | 提交 | 说明 |
|------|------|------|------|
| B1b-1: 移除重复的 `Conversion Quality Guarantee` 章节（3 页） | ✅ | 49096ba | 见下方 ⚠️ 并行写入说明 |
| B1b-2: 修复裸 HTML 标签泄漏（markdown 正文里写死 `<h1>`/`<h2>`/`<nav>`） | ✅ | 060a806 | 已推送到 origin，等待 Vercel |
| B1b-3: 标记 `shared-modules.ts` 为孤儿文件 | ✅ | 未提交 | 无任何文件 import 它 |
| B1b-4: 新增 `scripts/find-duplicate-headings.mjs` | ✅ | 060a806 | 定位重复 heading 并指出保留哪一份 |

**缺陷 1：重复章节**
P2 批次的本意是"把纯文本版本升级成带 bullet 的版本"，但脚本**追加**而不是**替换**，
导致同一页出现两个同名 `<h2>`。受影响 3 页：
`epub-to-azw3` / `epub-to-pdf` / `pdf-to-epub`。

**缺陷 2：裸 HTML 标签泄漏进 DOM**
markdown 正文里直接写了尖括号标签，渲染器当成真 HTML 输出。线上实测（已剥离 script 块）：

| 页面 | 现象 |
|------|------|
| `/convert/epub-to-mobi` | 裸 `<h2>` 吞掉后续文字，产生伪 h2「structure. Open in Calibre…」，真正的 `Device Compatibility Report` 标题被挤掉 |
| `/convert/epub-to-azw3` | 裸 `<nav epub:type="toc">` 真的渲染成 `<nav>` 元素 |

**修复方式**：改写为纯文字（去掉尖括号）。**不使用反引号包裹**——这些正文是
TS 模板字符串，裸反引号会直接截断字符串。参照 `fb2-to-epub.ts` 已有的正确写法。

---

### B1c: Google 修复（待执行）

> ⚠️ 依赖 B1b 部署完成，且与 B1b 间隔 ≥24h，避免同一天连续批量改动。

#### B1c-1: Convert 页 Title 优化 🔴 P0

| 任务ID | 页面 | 动作 | 状态 | 预计工时 |
|--------|------|------|------|---------|
| B1c-1a | `/convert/mobi-to-epub` | Title 加 "for Kindle/Kobo" | ⏳ 待执行 | 15 分钟 |
| B1c-1b | `/convert/epub-to-txt` | Title 加 "extract text" | ⏳ 待执行 | 15 分钟 |
| B1c-1c | `/convert/epub-to-doc` | Title 加 "to Word" | ⏳ 待执行 | 15 分钟 |

**依据**：GSC 显示这 3 页印象最高但零点击（平均排名 >59）。

#### B1c-2: 高展示页面内链补充 🔴 P0

| 任务ID | 页面 | 当前内链 | 目标内链 | 状态 | 预计工时 |
|--------|------|---------|---------|------|---------|
| B1c-2a | `/convert/mobi-to-epub` | 1 条 | ≥2 条 | ⏳ 待执行 | 30 分钟 |
| B1c-2b | `/convert/epub-to-txt` | 1 条 | ≥2 条 | ⏳ 待执行 | 30 分钟 |
| B1c-2c | `/convert/epub-to-doc` | 1 条 | ≥2 条 | ⏳ 待执行 | 30 分钟 |

**内链策略**（v2.0 要求"高质量"而非机械凑数）
- 反向格式对互链（`mobi-to-epub` ↔ `epub-to-mobi`）
- 相关博客指南（`/blog/epub-vs-mobi`）
- 相关格式百科（`/guide/kindle-formats`）

---

### B2: Batch 2 - Bing 放大（待执行，间隔 ≥24h）

| 任务ID | 页面 | 动作 | 状态 | 预计工时 |
|--------|------|------|------|---------|
| B2-1 | `/blog/best-ebook-reader-apps` | FAQ 强化至 8 条 | ⏳ 待执行 | 1 小时 |
| B2-2 | `/blog/sync-reading-across-devices` | FAQ 强化至 8 条 | ⏳ 待执行 | 1 小时 |
| B2-3 | `/blog/harry-potter-digital-books` | 复用 IP 模板 | ⏳ 待执行 | 2 小时 |

**Bing 引用数据**（Top 5 占 63.9%）
- `/blog/best-ebook-reader-apps`：857 cites（25.0%）
- `/blog/sync-reading-across-devices`：393 cites（11.5%）
- `/blog/harry-potter-digital-books`：212 cites（6.2%）

---

### B3: Batch 3 - 全站检查（待执行）

| 任务ID | 内容 | 状态 | 预计工时 |
|--------|------|------|---------|
| B3-1 | 全站 Title 长度检查（≤55 字符） | ⏳ 待执行 | 1 小时 |
| B3-2 | 全站 Description 检查（≤155 字符） | ⏳ 待执行 | 1 小时 |
| B3-3 | 全站 Open Graph 标签检查 | ⏳ 待执行 | 30 分钟 |
| B3-4 | 🆕 为 20 个 convert 页补 `metaDescription` | ⏳ 待执行 | 2 小时 |

**B3-4 说明**（本日新发现）
`convert/[slug]/page.tsx:49` 的兜底逻辑是 `contentData?.metaDescription || subtitle`，
即没有 `metaDescription` 时**直接用 hero 副标题当 SERP 描述**。
实测 32 个 content 文件中只有 10 个写了 `metaDescription`，**20 个在裸奔**。
副标题是为页面内展示写的，长度与钩子都不适合 SERP。这是当前最容易拿分的一项。

---

## 三、Week 2-4 计划预览

| 周次 | 内容 |
|------|------|
| Week 2 | Convert 页批量优化；全站内链扫描 |
| Week 3 | Blog 内容增强；IP 内容复用 |
| Week 4 | 周数据导出、指标追踪与迭代 |

---

## 四、关键指标基线

### Google（GSC）

| 指标 | 基线（8 月） | 基线（9 月） | Week 1 目标 | 监测频率 |
|------|-----------|-----------|-----------|---------|
| 日均印象 | 82.5/天 | 9.0/天 | 50/天 | 周 |
| CTR | 0.37% | 0.37% | 0.5% | 周 |
| Top 10 排名 | 0% | 0% | 3% | 周 |

### Bing

| 指标 | 基线（9/16） | Week 1 目标 | 监测频率 |
|------|-----------|-----------|---------|
| 日引用 | 214.6 | 240 | 周 |
| 引用增长率 | +22.1% | +25% | 周 |

**⚠️ 双渠道不对称格局**：GSC 日均印象 -89% vs Bing AI 近 7 天 +22.1%。
这不是全站惩罚，是两个渠道各自独立的表现。修复要按渠道分开归因。

---

## 五、执行纪律

### 防批量处罚规则

- ✅ 每次提交 ≤3 页
- ✅ 提交间隔 ≥24 小时
- ✅ 每页发布前用 curl 验证 Schema
- ✅ 回滚预案：连续 3 天 CTR 下降立即回滚
- 🆕 ✅ **每次批量改动后必须跑 `npm run build`**（本次教训：改动可以静默不上线）
- 🆕 ✅ **批量脚本只允许"替换/定点更新"，禁止"追加整块"**
- 🆕 ✅ **禁止在 markdown 正文写尖括号标签**（用纯文字表述）

### 构建后门禁（新增，自动化）

```bash
node scripts/audit-content-integrity.mjs     # 0 error 才算通过
node scripts/find-duplicate-headings.mjs     # 人工确认无重复章节
node scripts/verify-markup-fix.mjs           # 部署后线上断言
```

### 发布前 Checklist（每页必过）

- [ ] Schema 验证：curl 源码包含 FAQPage / Article / HowTo
- [ ] Title 长度：≤55 字符（含空格）
- [ ] Description 长度：≤155 字符
- [ ] 内链数量：≥2 条高质量链接
- [ ] Canonical 自指
- [ ] Open Graph 标签完整
- [ ] 无死链（404 检查）
- [ ] 🆕 页面 h2 清单无重复、无碎片
- [ ] 🆕 正文无裸 HTML 标签

---

## 六、风险登记

| # | 风险 | 等级 | 状态 | 应对 |
|---|------|------|------|------|
| R1 | **构建静默失败**导致改动不上线，而站点表面正常 | 🔴 高 | 已缓解 | 已加门禁脚本；push 后必须线上断言，不能只看"站点能打开" |
| R2 | **并行写入者**：本日另一进程以「豆豆妈」身份连续提交并 push（`49096ba` 21:38、`bf10c69` 21:5x），其中一次在我 `git add` 与 `git commit` 之间完成提交，**把我的暂存区冲掉**（该次提交最终仍成功落为 `7312100`，但过程不可靠） | 🔴 高 | **待用户决策** | 提交前先 fetch；发现他人提交先 rebase 再 push；**建议约定"同一时间只跑一个改动会话"** |
| R3 | `shared-modules.ts` 是孤儿文件，无人 import | 🟡 中 | 待决策 | 二选一：删除，或正式接入并复用 |
| R4 | `scripts/d3-tier2-batch1.mjs` 等批量脚本未入库且机制危险（追加式插入） | 🔴 高 | 待处理 | 建议改写为幂等、定点更新后再入库，否则是下一次事故的种子 |
| R5 | 20 个 convert 页无 `metaDescription`，SERP 描述裸奔 | 🟡 中 | 待执行 | 见 B3-4 |
| R6 | `bf10c69` 在 `/convert/epub-to-mobi` 引入近重复章节（`…(Step-by-Step)` 与 `…: Step by Step` 并存） | 🔴 高 | ✅ 已解决并线上验证 | 已删除较旧的 `(Step-by-Step)` 章节（commit `4b1bef3`）。线上实测 `<h2>` 由 20 → **19**，"How to Convert" 标题剩 **1** 个。附带收益：被删章节含 10MB/50MB 文件大小声明，与 §4 纪律冲突。审计脚本已升级为归一化比对（`7312100`） |
| R7 | 🆕🔴 **Pro 套餐在售，但其核心权益未实现**：定价页与 `PLANS` 承诺 Pro（$5/月）"Up to 50MB"、API（$20/月）"Up to 100MB"，**而转换管线对所有用户固定 10MB** | 🔴 高 | 🟡 **方案 C 已执行**（要约层已收口）；博客/转换页 43 处待批量 pass | 见下方"R7 详情"。已修正 8 个文件；剩余 18 个内容文件需单独 pass |

---

### R7 详情：在售的 Pro 权益没有对应实现

**结论**：BookConv 正在以 $5/月（Pro）和 $20/月（API）售卖"更大文件上限"，但转换管线对所有身份一律 10MB。付费用户上传 30MB 的 EPUB 会被拒，错误信息是 `File too large. Max 10MB`。

**证据链（全部为代码/线上实测，非推断）**

| # | 环节 | 位置 | 实测事实 |
|---|------|------|---------|
| 1 | 对外承诺 | `src/lib/payments/service.ts:14-62` | Free `Up to 10MB` / Pro `Up to 50MB` / API `Up to 100MB` |
| 2 | 承诺已上线 | `https://www.bookconv.com/pricing` | 200，渲染出 "Up to 50MB file size"、"Up to 100MB file size"，且页面存在购买入口 |
| 3 | 套餐可购买 | `.env.production` | `LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID` 与 `..._API_...` 均已配置 → `proHasVariant = true`，升级按钮不会因未配置而禁用 |
| 4 | 身份可解析 | `src/lib/subscription.ts:77-87` | `getPlanByEmail()` 能正确返回 `'free' \| 'pro' \| 'api'` —— 系统**知道**用户买了什么 |
| 5 | 🔴 管线不读身份 | `src/lib/convert-handler.ts:16` | `const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB \|\| "10", 10) * 1024 * 1024` —— 单一固定上限，**无任何套餐分支**；`convertAndStream()` 的签名里根本没有用户/套餐参数 |
| 6 | 入口不解析身份 | `src/app/api/convert/route.ts` | 仅按 IP 限流（`convertApi` 20 req/60s），全程不解析登录用户，因此即使想分套餐也拿不到输入 |
| 7 | 前端同样写死 | `src/components/tools/FileDropZone.tsx:40` | `const MAX_FILE_SIZE_MB = 10`（无 env、无套餐） |

**同类未兑现项**：`PLANS` 里的 "5 conversions per hour"（Free）/"Unlimited"（Pro、API）也是未实现的 —— 限流是 IP 维度的 20 req/60s，对所有套餐一致。即套餐卡片上的**量级类承诺整体处于"声明 ≠ 代码"状态**。

**为何此前没被发现**：MEMORY §4 把该现象记成"pricing 写 50MB 实际硬编码 10MB"并给出**文案侧规避**（"新文案不提文件大小"）。规避动作压住了新增文案，但没有触及根因——**定价页本身**（真正收钱的那一页）仍在承诺 50MB，而它不在"新文案"范围内。

**处置选项（需决策，不擅自执行）**

| 方案 | 动作 | 代价 |
|------|------|------|
| A. 兑现承诺 | 把 plan 贯穿到转换链路：`getPlanByEmail()` → 映射到上限 → 传给 `convertAndStream()`，前端按套餐取限 | 真实功能开发，涉及支付相邻代码；且公开转换页目前不要求登录，需先定义"未登录用户算哪一档" |
| B. 修正对外口径 | 从 `PLANS`、定价页、`FAQSection` 及约 12 篇博客、4 个转换页移除 50MB/100MB 表述，改为"10MB，更大文件请用桌面版" | 文案改动面大，且会**撤掉付费卖点**；与并行写入者 1 小时前刚"恢复文件大小事实"的方向相反 |
| C. 先收口最暴露面 | 只处理定价页与 `PLANS`（法律意义上的"要约"），博客/转换页留待批量一致性 pass | 折中；仍需先定 A 还是 B 的方向 |

### R7 执行记录：方案 C（用户 2026-09-17 22:13 选定）

**范围**：收口"要约层"——凡构成对外承诺的表面，全部改为只写代码真正兑现的东西。长文内容（博客/转换页正文）留待单独 pass。

**判定依据（先验证再改文案）**

| 声明 | 结论 | 依据 |
|------|------|------|
| Free `Up to 10MB` | ✅ 真 | `.env.production` 中 `MAX_FILE_SIZE_MB=10` |
| Pro `Up to 50MB` / API `Up to 100MB` | ❌ 假 | `convert-handler.ts:16` 单一固定上限，无套餐分支 |
| Free `5 conversions per hour` | ❌ 假 | 实为 `convertApi` 20 req/60s/IP；**低估了 240 倍** |
| Pro/API `Unlimited conversions` | ❌ 假 | 限流按 IP，与套餐无关 |
| Pro/API `Priority queue` | ❌ 假 | `ConversionJobData.priority` 声明后**全库无任何赋值点** |
| Pro/API `Batch conversion` | ✅ 真 | `/batch` 有 `isPro` 门槛 |
| `No watermark` | ✅ 真 | 全库无 watermark 逻辑，从不加水印 |
| API `Full API access` | ⚠️ 未证实 | `api-docs/openapi.json` 存在，但**全库无 ApiKeyAuth 校验点**（仅 `health` 用 `x-api-key` 自用）。暂保留，需再核 |

**已改（commit `f97e5f6`，8 个文件）**

1. `src/lib/payments/service.ts` — `PLANS` 三档 features 只留真声明，并**加注释记录删除项与原因**，防止再被"restore"
2. `src/app/[locale]/pricing/page.tsx` — 删掉 conversions-per-hour 与 priority 两行；文件大小两列都写 10 MB，不再暗示 Pro 有提升
3. `src/app/api-docs/openapi.json` — `ApiKeyAuth` 描述去掉 "Pro users get priority processing"
4. `messages/en.json` + `es.json` — `faq.a1`、`FILE_TOO_LARGE`、`RATE_LIMIT`。**`FILE_TOO_LARGE` 最要紧**：它是用户被拦下、正要决定付费时读到的那句话，而它把人指向 50 MB
5. `src/components/tools/FAQSection.tsx` + `src/lib/seo/schema.ts` — 两份**重复**的默认 FAQ 生成器（已各自漂移）。`schema.ts` 现加指针注释指向其孪生副本
6. `src/app/auth/page.tsx` — 注册页去掉 "priority processing"

**刻意未做**

- **43 处、18 个内容文件**（`src/data/blog/*`、`src/data/content/*`）仍含同类套餐承诺，需单独 pass。注意：这些文件里另有大量 `50MB` 是**第三方事实**（如 "Kindle 拒收 >50MB"），不是本站承诺，改动时须逐条区分，不能盲replace。
- **未 bump sitemap `lastmod`**。理由：spam update 恢复期对 30 个程序化页做批量 lastmod 攀升，本身就是风险动作；而本次改动的目的是**对外口径正确**（用户可见），不依赖 Google 立刻重抓。若后续确认 FAQPage 富媒体摘要需刷新，再单独评估。

**重大发现（方法论，已写入长期记忆）**

旧记忆把该现象记成"pricing 写 50MB、实际硬编码 10MB → **新文案不提文件大小**"，给出的是**文案侧规避**。规避动作压住了新增文案，**却完全没碰根因**——定价页是真正收钱的那一页、法律意义上的要约，它不属于"新文案"范围。

> **教训**：发现"声明 ≠ 实现"时，先按法律权重排序（要约 > 宣传 > 科普 > 文档），再决定改声明还是改实现。只改低权重面会制造"已处理"的假象。

**并行发现**：`openapi.json` 自身早已与实现脱节——它正确写明 "20 requests/minute per IP"，却同时承诺 "Pro users get priority processing"。**这两句自相矛盾，正是该缺口长期存活的机制**：文档比代码更早承认真相，但没人对照。

---

## 七、变更记录

| 日期 | 变更内容 | 提交 |
|------|---------|------|
| 2026-09-17 07:26 | 初始版本创建 | — |
| 2026-09-17 21:30 | 发现部署已冻结：`epub-to-mobi.ts` 语法错误 + 重复 import | a0680f5 |
| 2026-09-17 21:38 | 移除 3 页重复的 `Conversion Quality Guarantee` 章节（并行进程提交） | 49096ba |
| 2026-09-17 21:45 | 修复裸 HTML 标签泄漏；新增 2 个诊断脚本；发现 20 页缺 metaDescription | 060a806 |
| 2026-09-17 21:45 | 本规划文档改版：新增 B1a/B1b、风险登记、门禁脚本 | — |
| 2026-09-17 21:53 | 移除 `/convert/epub-to-mobi` 近重复章节（R6）；并行进程删除孤儿文件（R3） | 4b1bef3 / 16cacfc |
| 2026-09-17 22:5x | **R6 线上验证通过**（h2 20→19，How-to 标题 1 个）；**新增 R7**：Pro/API 文件上限与限流承诺未在代码实现，涉真实收款 | — |
| 2026-09-26 09:50 | **Batch 4 Day 1 完成**：全量校验 llms.txt 123 链接，修正 1 处真死链 `/convert/epub-to-docx`→`/convert/epub-to-word`（middleware:14 为 301 跳转源）；**更正 C1 错误前提**——`/blog/azw3-epub-mobi-kindle` 实为活页（v2 审计「8/27 已删」与代码不符）；门禁 audit-content-integrity + find-duplicate-headings 均 0 error | 未 push（待人工复核） |
| 2026-09-26 10:10 | **Batch 4 Day 2 完成（B1）**：`src/middleware.ts` 的 `BLOG_REDIRECTS` 新增 2 条 301（`/blog/epub-to-docx`、`/blog/epub-to-word-docx` → `/blog/epub-to-word`）；门禁 audit-content-integrity + find-duplicate-headings + build 均 0 error | b50732d（未 push，待人工复核） |
| 2026-09-26 10:35 | **B1 彻底完成（应人工要求）**：将 2 个近重 slug 彻底移出 sitemap——`src/data/blog/index.ts` 取消 `post44`(epub-to-docx)/`post53`(epub-to-word-docx) 注册；`public/llms.txt` 删除 2 条对应链接；**保留** `middleware.ts` 2 条 301（旧 URL 仍 301→规范页）。门禁 audit-content-integrity + find-duplicate-headings + build 均 0 error | 5ad0dcb（未 push） |
| 2026-09-26 10:53 | **Kelriva 待办同步（K 系列入排期）**：P0 三项已完成（SSR 计数器 `85f1a56` 已 push 并线上断言 PASS；batch/pricing diff 一致；首页 FAQPage 确认已存在）；剩余 P1/P2 拆为 K1–K7 分散 Day 3–Day 9（每日 1 项）；记录防御性否决 3 项（屏蔽 guide 页 / Wikipedia 外链 / 无真实数据上 AggregateRating） | — |
| 2026-09-26 21:00 | **新增 §九 D 系列（代码摸底衍生）**：D1 归档 `next-sitemap.config.js`→`_archived/dead-config/`（可逆）、D2 修正两份 README 失真描述（加可信度声明 + 定点修正 队列/Supabase/28→31/孤儿端点/仓库名/GitHub 链接），D3–D6 登记待执行；门禁 0 error。**同时修正一处认知错误**：队列系刻意废弃（8/4 实测 Vercel 100% 504），非待接线；已写入 MEMORY.md 防止重提 | 未 commit |
| 2026-09-27 12:25 | **新增 §十 M13 系列（GEO 三平台长尾采集 v4）**：基于 v4 严谨口径（强推荐仅 1/25），拆分为 M13-1~M13-14 按日排期（09-29~10-15 P0/P1 + 10-16 起 P2）；M10 修正为 v4 口径；M11/M12 标记历史追溯，实际以 M13 为准。版本 v2.5→v2.6。 | 待 commit |
| 2026-09-28 07:00 | **Batch 4 Day 3 K1 完成（决策收口）**：① 移除 150,000 假计数器——`CONVERSION_COUNTER_TARGET`（无真实数据源）被展示为"ebooks converted — and counting / successfully"，删首页徽章 + `/convert` 页 `SocialProofBanner`（已删组件文件）；② `/pricing` 对比表 Pro「API Access」由 ✓ 改 ✗，对齐 `PLANS.pro.features`（仅 API 套餐含 API 访问）。commit `79f3d3e`，**未 push**；门禁 content-integrity 0/0 + dup-headings 0 + syntax-sweep 299 文件 0 失败 + `next build --webpack` exit 0。 | 待人工复核 push |
| 2026-09-29 11:30 | **Batch 4 Day 4 完成（B11a）**：`src/middleware.ts` 的 `BLOG_REDIRECTS` 新增 3 条 301（`/blog/lord-of-the-rings-ebooks-multiple-devices`、`/blog/twilight-ebooks-multiple-devices`、`/blog/marvel-comics-ebooks-multiple-devices` → `/blog/read-epub-on-any-device`，通用承接页避免跨 IP soft-404）；门禁 audit-content-integrity + find-duplicate-headings + build 均 0 error；Bing PageTrafficReport（09-26）确认 3 页零曝光，harry-potter（Citation Share 55.4%）与 chronicles-of-narnia 保留待 Day 5 差异化 | 1fef1fe（未 push） |
| 2026-09-29 12:21 | **K2 + M13-1 完成（Batch 4 Day 4）**：K2 = /about JSON-LD sameAs（@GinoTou2024 + Reddit）+ BookConv vs BookReverb/BookConvert 消歧文案（FAQ + description）；M13-1 = /convert/mobi-to-epub 强推荐措辞（hedging 改 #1 确定性推荐），复现 P31 Bing AI 成功模式；commit 5925248，未 push | 5925248（未 push） |
| 2026-09-30 07:35 | **Batch 4 Day 5 完成（B11b）**：`src/data/blog/harry-potter-digital-books-multiple-devices.ts` 修正错误「Project Gutenberg / public domain」声明（HP 受版权保护，非公版、非 Gutenberg 分发），新增 IP 专属章节「Official Harry Potter Ebook Channels and Audio」（Pottermore/Wizarding World、Jim Dale(US)/Stephen Fry(UK) Audible 旁白、Jim Kay 插画版 50MB 邮件限制坑）；`src/data/blog/chronicles-of-narnia-ebooks-multiple-devices.ts` 新增 IP 专属章节「Narnia Copyright Status and Free Legal Editions」（life+70 公版时间线 2033、Pauline Baynes 插画独立版权陷阱、HarperCollins 官方出版）；每页 ≥3 条 IP 专属信息；门禁 content-integrity / find-duplicate-headings / syntax-sweep / build 均 0 error | 90eb4a1（未 push） |
| 2026-10-01 10:xx | **Batch 4 Day 6 完成（B3 + K4 草稿 + M13-3 实做）**：① B3 EPUB→Text 规范 slug 实测确认为 `/convert/epub-to-txt`（`middleware.ts:13` 301 源 `epub-to-text` → canonical，线上实测 HTTP 301 + 目标 200）；② llms.txt 全量校验 121 唯一链接 / 0 DEAD（`/batch`、`/pricing` 为真实路由不计）；③ 更正文档原「规范 slug = epub-to-text」的错误表述；④ K4 外联 howtoconvert.co 邮件草稿已交付（待用户审阅发送）；⑤ M13-3 已实做：`docx-to-epub`/`azw3-to-epub`/`doc-to-epub` 三页补 `#1 recommended free online converter` 事实密度句式（`mobi-to-epub` 来自 M13-1），全 convert 页密度命中 ≥1、0 页缺失；门禁 syntax-sweep + content-integrity + find-duplicate-headings + `next build --webpack` 全过（build 末尾 safe-delete 守卫拦截属本地环境，非代码错误，`your-redis-host` 为历史占位配置） | 8e3e6db **已 push**（Vercel 部署 ~75s 后线上断言 CONFIRMED：docx-to-epub/azw3-to-epub/doc-to-epub 三页 HTTP 200 + 新句式渲染）+ 邮件草稿待用户发送 |
| 2026-10-01 (auto·Day 7) | **Batch 4 Day 7 完成（B4）**：`/blog/epub-to-mobi-guide` 标题错开差异化——EN「How to Convert EPUB to MOBI Online: The BookConv Guide」→「EPUB to MOBI: Still Needed? Send-to-Kindle & AZW3」（保留 `/blog/epub-to-mobi` 主 how-to 与 `/guide/epub-to-mobi-keep-formatting` keep-formatting，三页意图不再重叠，满足 B4 验收）；ES 标题并行更新；门禁 audit-content-integrity 0 / find-duplicate-headings 0 / build PASS(400/400) | 47b9291（未 push，待人工复核） |
| 2026-10-02 09:xx | **Batch 4 Day 8 前置完成（B5 + K5 + M13-4）**：① B5 `guide/epub-vs-mobi` 标题错开为 `EPUB vs MOBI: Device Compatibility Guide`（实测两页标题本非全同但共享 `EPUB vs MOBI: Which Ebook Format` 前缀；去前缀重叠，llms.txt 同步；标题级改动不 bump lastmod，沿用 B4 先例）；② K5 publishingxpress.com 外联草稿落盘 `社媒/外联-publishingxpress-2026-10-02.md`（免费即时 vs 人工印刷服务互补角度，待用户发送）；③ M13-4 新建 `/guide/how-to-read-epub-on-kindle`（guide 22→23：`guides/index.ts` 注册 + llms.txt Troubleshooting 加行；geo-audit-guide 7 要素全过、wordCount ≥400 档）；④ 复核修正：B4（`47b9291`）确认已随 origin/main 上线，原「未 push」表述过时；门禁 syntax 298/0 + content 0/0 + geo-guide exit 0 + dup-headings 0 + claims 1（已知 R7）+ `next build --webpack` PASS | （commit 待 push 后回填） |
| 2026-10-02 14:45 | **M1 首读 API 复核 + 覆盖率刷新（用户指令「合并一次 GSC 拉取」）**：① page 维 API 拉取 9/16–9/30（25 行/2 点击/158 曝光）+ date 维 9/12–9/29（18 行/3 点击）；**date 维与 10/1 UI 导出交叉验证一致（窗口②日均 6.3=6.3 ✓）⇒ 后续可用 API 替代 UI 手动导出**；② Tier-1 转换五页合计 10 曝光/14 天 ≈0.71/天 vs 窗口② 0.73/天 **持平，无修复正向信号，维持观测至 10/20**；`epub-to-pdf` 第三窗仍 0（与 M1-B「已发现未抓取」定性一致）；③ 附带发现：活跃页 20→25；`rtf-to-epub`（M1-C 目标）4 曝光/pos 8.2 首次入列表（🟡 n=4 待 10/20 复评）；blog 改题页 `epub-to-azw3`/`epub-to-mobi-guide` pos 3–4 噪声级曝光；④ 🔴 **URL Inspection 28/28 全部 403**（「You do not own this site」）——SA 为 readonly 权限，Inspection API 需 Owner/Full ⇒ 覆盖率 P0 阻断，待用户提权（GSC 设置→用户和权限→SA 邮箱提 Full）或沿用 UI 手动抽查；报告见 `数据分析/GSC覆盖率刷新与Tier1首读复核-2026-10-02.md`，阻断证据 `数据分析/GSC_URLInspection_2026-10-02.csv` | 只读，无代码改动 |
| 2026-10-02 15:10 | **M1-D 覆盖率核查闭环（用户提权 SA→Full）**：① 首次重跑仍 28/28 403 ⇒ 实测根因 = **属性不匹配**（SA 只在前缀属性 `https://www.bookconv.com/` 有 siteFullUser，脚本默认查 `sc-domain:bookconv.com`）；改 `GSC_SITE_URL` 前缀属性后 **28/28 全部成功**；② **覆盖分布：15 已收录 / 9 已发现未抓取 / 4 完全未知（URL is unknown）**；有效 25 页中 **13 页（52%）`crawl=never`**，而已收录页最近抓取至 9/30 ⇒ Google 持续抓站但系统性跳过这 13 页，抓取优先级实锤；③ API 交叉验证 M1-B：`epub-to-pdf` = 已发现未编入索引 + crawl=never，与 10/1 UI 定性一致 ✓；④ 4 个 unknown 页（`txt-to-epub`/`doc-to-epub`/`mobi-to-txt`/`djvu-to-pdf`）实测 HTTP 200 + 在 live sitemap（curl 断言 4/4）+ Inspection `referringUrls=0`（M1-C 内链未入索引快照）⇒ 定为 52 页差异化队列**最前置子集**；⑤ 教训入库：SA 权限排障先调 `webmasters/v3/sites` 列实际可见属性，别只猜级别；Google 无「请求编入索引」API ⇒ 发现链路杠杆 = 内链 + sitemap + 等抓取配额。明细 `数据分析/GSC_URLInspection_2026-10-02.csv`（28/28 PASS 版），汇总 `数据分析/GSC覆盖率刷新与Tier1首读复核-2026-10-02.md` §七 | 只读，无代码改动 |
| 2026-10-02 15:30 | **新增 M1-E / M14 / M15（用户三指令）**：① **M1-E** = 13 零抓取页定为 Tier-2 差异化前置子集（9 已发现未抓取 + 4 完全未知，覆盖基线见 M1-D）；② **M14** = 周一三合一分析（关键词排名 + 竞品 + GEO 对照）并入「每周双渠道分析」自动化 f4d73b34（周一 07:30，首次 10-05），口径铁律与 PENDING 降级规则写入自动化 prompt，结果并入最终报告不单独建文档；③ **M15** = 博客补给（最后一批 9/24、停更 8 天；缺口 = GEO 操作指南类 0/7 / 对比类 0/4 / 阅读器类 0/3 强推荐 + 13 页缺有曝光上游 + Top1 集中度 25%），建议每周 2 篇（指南+对比各 1），选题方向待用户拍板。版本 v2.19→v2.20 | 自动化已更新 + 两副本同步 |
| 2026-10-02 15:56 | **M2-9 拍板 + M3-2/D1 收口（用户两决策）**：① M15 选题方向已定 = **操作指南类优先**（GEO 强推荐 0/7），对比类次之，首批 due 10-10，新博文内链优先指向 13 零抓取页与 formats 页；② **D1 真相澄清**：原决策「formats/*(17)+compat/*(1) 是否补入 sitemap」已于 9/27 裁决并实现（sitemap.ts 注释留痕），10/02 线上复核 17+1 全在表 ⇒ M3-2 收口 done；③ **D1 残余分叉**：formats 17 页实测「已发现未收录」+ referringUrls=0（零内链孤页）、compat/calibre 完全未知 ⇒ 处置（差异化 vs 有意排除）延至 10/20 重评估后裁决，期间靠 M2-9 内链自然供血。作战台同步：M3-2→done、D1 改写（blocks→M2-8）。版本 v2.20→v2.21 | 作战台 + 两副本同步 |
| 2026-10-02 16:08 | **M15 首批选题候选写入（用户指令「写入待执行进度表」）**：M2-9 首批 2 篇操作指南类候选 = ① p26 Kobo EPUB 兼容（空白区，内链 formats/epub + epub-to-mobi）；② p37/p38 DRM-free 合法转换（立场：仅支持 DRM-free，内链 mobi-to-epub + formats/mobi）；排除 p27/p28/p32（M13-4 guide 已承接，防自竞争）与 p47（等 10-06 IP 决策）。due 10-10，KPI = Bing AI 引用 + 内链供血 13 零抓取页/formats 页。待站长确认题目后进入写作节奏 | 两副本同步 |
| 2026-10-02 16:14 | **M15 两题定稿（用户按 A 版）**：① 《Can Kobo Read EPUB Files? (And When to Convert)》（48 字符，完整命中 GEO 查询词 can kobo read epub files）；② 《How to Convert DRM-Free Kindle Books to EPUB》（44 字符，目标词完整前置；Safely/Legally 留给正文与 meta description）。题目确认完毕，进入写作节奏，due 10-10 | 版本 v2.22→v2.23 | 两副本同步 |
| 2026-10-02 16:40 | **M15 第①篇写作完成（用户指令「开始写」）**：《Can Kobo Read EPUB Files? (And When to Convert)》落盘 `src/data/blog/can-kobo-read-epub-files.ts`（post75，已注册 index.ts + llms.txt）。SEO/GEO 规格：1758 词 / 8 sections / 7 FAQ / Key Takeaways 5 条可引用要点 / 内链 7 条（计划要求 2 条：formats/epub + epub-to-mobi ✓，另补 mobi-to-epub×2、mobi-to-kobo、azw3-vs-mobi）/ 权威外链 3 条（help.kobo.com、overdrive.com、adobe.com）/ 目标词完整命中首 100 词与 FAQ。事实口径与存量 mobi-to-kobo 文对齐（Kobo 原生 EPUB/KEPUB、MOBI 侧载不可靠）。门禁：syntax-sweep 304 文件 0 失败 ✓ audit:content 0 错 ✓ critic-layer 0 BLOCK 新文零警告 ✓ publish-gate 两层放行 ✓ jest schema/metadata/toc 19/19 ✓。⚠️ 教训重申：博客文件必须用反引号模板串（critic 只解析反引号，双引号会静默解析失败→假 BLOCK）。状态：**已发布**（用户指令「发布」，commit d272ba7 push→main，pre-push Gate B 放行；75s 后线上断言全过：HTTP 200 / strip-script 后标题+Key Takeaways+内链真实渲染 / canonical 自指 / sitemap 含新 slug）| 版本 v2.23→v2.24 | 两副本同步 |
| 2026-10-03 08:55 | **M15 第②篇完成 + 作战台状态回填 + 两条事实纠正**（用户指令「按你的建议，逐一执行」）：<br>① **第②篇题目改判据角度**：原定《How to Convert DRM-Free Kindle Books to EPUB》与站内 post20 `/blog/mobi-to-epub`（12 小节英西双语 how-to）意图重叠 ⇒ 触发 R1 自我竞争判据，经用户拍板改为《Which Kindle Books Can You Convert? (DRM-Free Checklist)》，锁定「哪些文件能转」的判定规则，与 post20 零重叠。落盘 `src/data/blog/which-kindle-books-can-you-convert-drm-free-checklist.ts`（post76，index.ts + llms.txt 已注册）。1482 词 / 9 节 / 7 FAQ / 内链 7 / 权威外链 3。门禁：syntax-sweep 305/0 ✓ audit:content 0 错 ✓ critic-layer **新文 0 WARN**（195→192，修标题 65→58 字、去 AI 套话 landscape、补权威外链）✓ publish-gate 两层放行 ✓ tsc 0 错（3 个 db-probe 错为 .next 残留，rm -rf 后清零）✓ jest 25/25 ✓。<br>② 🔴 **纠正内链决策错误**：10-02 定的「内链指向 /convert/mobi-to-epub + /formats/mobi」中前者**已证伪** —— Inspection CSV 实测该页 `PASS / Submitted and indexed / 最后抓取 2026-09-15`，不是零抓取页。真正零抓取的是 formats/* 系列。⚠️ 同时复核确认 **13 页 crawl=never 数字无误**（9 已发现未抓取 + 4 unknown）。<br>③ **作战台状态回填**（25 项逾期逐项对磁盘产物取证）：**18 项 todo→done、6 项 todo→doing、1 项维持**（真欠债仅 M1-4/M2-5/M3-5/M6-4），每项写入 `statusNote` 证据路径 + `statusAudited` 日期。**6 项判 doing 而非 done**：M0-5（无独立断言分级表）、**M2-1（门禁已建 136 行但 10-03 实跑 FAIL 2/4，24 页共用 Conversion Quality Checklist）**、M5-1（hreflang 无复核记录）、M6-1、M7-2（竞品名单自承「默认占位」）、M8-5。<br>④ ⚠️ **踩坑记录**：新枚举状态 `partial` **不在 loader.ts 合法集内**（`todo/doing/done/blocked/dropped`）⇒ 改用既有语义 `doing`（派生层已有计数支持），**不改 schema 迁就数据**。修 board.test.ts 硬编码计数时**两次推算错**（open 数与 isOpen 口径），最后靠读 derive.ts 确认 `isOpen = todo + doing` 才改对 —— 再次验证「纠正的终点 = 错误的值不可能再被取到」。 | 版本 v2.24→v2.25 | 两副本同步 |
| 2026-10-01 10:xx | **M1 Tier-1 五页首读完成（只读）**：用户导出 GSC「过去 3 个月」Pages CSV（窗口 7/23–9/28，⚠️ 非 Tier-1 定向窗口）。站级展示 2,864（日期/设备自洽）/页面 3,075（+7.4%）/点击 12/加权排名 56.12；分期日均 = 18.8→**160.8**→14.3→**6.3**（Tier-1 后）。**Tier-1 五页 549 展示 / 0 点击 / 排名 52–70**；`epub-to-pdf` 0 展示（索引疑点）。**结论：首读未见修复正向信号，但窗口污染+仅 10 天 ⇒ 不可证伪**。另发现「首页位置却 0 点击」的 CTR/意图瓶颈（`azw3 vs mobi` pos10.33 等）。下一步需自定义区间双导做真对照 | 只读，无提交 |
| 2026-10-01 10:xx | **M1 定向对照完成（只读，用户双导 Pages）**：窗口① `8/18–9/17`(31 天) vs 窗口② `9/18–9/28`(11 天)。**clean 对照**（剔高峰 8/18–8/21）：断崖后 **14.3/天 → Tier-1 后 6.3/天（−56%）**；加权排名 71.5→67.9（持平，证非排名惩罚）。Tier-1 五页 166→8 展示（日均 −86%）/ 0 点击；排名在 n=1–4 上大幅改善迹象但属噪声。簇全线下行。**结论：无正向信号 + 疑为覆盖坍塌而非排名问题 ⇒ 观测延至 10/20 重评估**。`epub-to-pdf` 两窗 0 展示（索引疑点） | 只读，无提交
| 2026-10-01 10:xx | **M1-A `epub-to-pdf` 索引疑点核查完成（只读 + IndexNow 提交）**：技术可索引性全过（HTTP 200 / `index, follow` / canonical 自指 / sitemap 含 / 无 noindex 头）；非重复内容（同族 8-gram Jaccard ≤3.1%）；但两窗均未进 GSC 页面列表（r1 47 行 / r2 20 行）⇒ 曝光 <1 次/窗。归因＝未拿到该查询曝光位，非技术索引缺陷。已 IndexNow 提交 168 URL（200 OK）。定性待 GSC URL Inspection（用户自服务）；**裁决：不作为单页特例，归入 52 程序化页差异化队列、低优先级** | 只读 + 提交，无代码改动 | |
| 2026-10-01 10:xx | **M1-B
| 2026-10-01 11:xx | **M1-C 内链修复落地（用户批准 A 方案）**：**实测推翻「4 个孤儿页」判据** —— `/formats/*` 格式页是隐藏枢纽（`src/data/formats.ts` 驱动 7 条 convert 内链）且 r1 有曝光 = 0，故「上游全暗」目标集由 4 页扩为 **7 页**（`doc-to-epub` / `epub-to-html` / `epub-to-jpg` / `epub-to-png` / `epub-to-rtf` / `html-to-epub` / `rtf-to-epub`）+ 原有 5 个暗上游。从 **GSC 有曝光源**（`epub-to-doc` 109 展示、`epub-to-txt` 68、`can-kindle-read-azw3`-family、`calibre-vs-online-converter` 23、`epub-to-txt-extract` 15、`mobi-or-azw3-for-kindle` 14、`why-convert-lit-to-epub` 4、`ebook-formats-explained` 3）注入 **14 条上下文内链**（11 处定点补丁，全部带命中数断言）。订正：首页 Converter Grid 为**全量 KEYWORDS 渲染**（非「只链 12/31」），`TOP_CONVERTERS` 只是 Popular 权重区块 ⇒ **不做首页改动**。诚实定价：入链数 ≠ 曝光（反例 `epub-to-pdf` 27 入链 / 0 曝光 vs `epub-to-doc` 3 入链 / 109 曝光）⇒ 内链是**必要非充分**兜底，不是曝光回升杠杆 | 12 源文件 + plan v2.16 | 定性落地（`epub-to-pdf` GSC URL Inspection 截图）**：定性＝**已发现 – 尚未编入索引**（未抓取，抓取记录全「不适用」）。证伪薄内容（词数中位 165 vs 160 无区分度）/ 重复内容 / robots / noindex / canonical；量化覆盖坍塌 **16/31 convert 页零曝光（52%）**；**新挖出 4 个孤儿页（`doc-to-epub`、`epub-to-html`、`epub-to-jpg`、`epub-to-png`）全站零内链，首页只链 12/31** ⇒ 定为 P0 低成本修复项待批准。机制结论：M1「覆盖坍塌」被证实并升级为「已发现未抓取」 | 只读分析，代码改动待用户批准 |
| **M1-B** | `epub-to-pdf` **GSC URL Inspection 定性 + 覆盖坍塌量化**（2026-10-01，用户截图） | 只读 | ✅ **定性＝「已发现 – 尚未编入索引」（未抓取）**。发现来源 `sitemap.xml` + 首页 ⇒ 发现链路正常；「上次抓取时间 / 网页抓取 / 是否允许编入索引」全为 **不适用** ⇒ **Google 从未抓取过该 URL**。② 证伪「薄内容」：零曝光页正文词数中位 **165** vs 有曝光页 **160**（均值 192 vs 157），`epub-to-pdf` 269 词反而厚于对照 `mobi-to-epub` 244 ⇒ 词长无区分度。③ 证伪「重复内容」（同族 8-gram Jaccard ≤3.1%）与 robots（`Allow: /`）/ noindex / canonical 问题。④ **范围量化（关键）**：31 个 convert 页中 **16 页（52%）两窗零曝光** ⇒ 站级覆盖收缩，非单页特例。⑤ **新发现的确定缺陷 —— 4 个孤儿页（全站 0 内链入口）**：`doc-to-epub` / `epub-to-html` / `epub-to-jpg` / `epub-to-png`；首页转换列表只链 12/31，上述 4 页均不在其中。另 5 页（`azw-to-mobi` / `azw3-to-pdf` / `lit-to-mobi` / `djvu-to-pdf` / `cbr-to-pdf`）有内链但上游全为暗页。⑥ 裁决：`epub-to-pdf` 有 15 个上游文件、其中 4 个已有曝光 ⇒ **内链也不是它的瓶颈**，纯属抓取优先级；而 4 个孤儿页是**独立于抓取预算的确定技术缺陷 ⇒ 提升为 P0 低成本修复项**（从首页/相关转换块补 ≥2 条高质量内链），不依赖 Google 抓取配额。⑦ 机制结论：**M1 的「覆盖坍塌」判断被截图证实并升级**
| **M1-C** | 内链修复：7 个「上游全暗」页 + 5 个暗上游页补活上游内链（2026-10-01，用户批准 A 方案） | 已落地 | 判据修正：实测 `grep` 显示这 7 页各有 2–4 条入链，全部来自 `/formats/{doc,html,jpg,png,rtf}` 格式页；而 `/formats/*` 在 r1 页面报告里 **0 曝光** ⇒ 上游全暗、内链等于无效。动作：从 GSC 有曝光页向 12 个目标页注入 14 条上下文内链（`epub-to-doc`↔`doc-to-epub`、`epub-to-txt`↔`epub-to-html`、`epub-to-html`↔`html-to-epub`、`epub-to-rtf`↔`rtf-to-epub` 互链 + `ebook-formats-explained` 路由列表 + `calibre-vs-online-converter` 工具段 + `epub-to-azw3-for-kindle` + `azw3-vs-mobi` + `why-convert-lit-to-epub` + `epub-to-txt-extract` + `lit-to-epub`）。验证：`audit:syntax` 297 文件 0 失败 / `audit:content` 0-0 / `geo-content`+`geo-guide` exit 0 / `next build` 通过。**未被修复的已知事实**：内链不构成曝充分条件，`epub-to-pdf` 27 条入链仍 0 曝光 ⇒ 主杠杆仍是 52 页差异化 | 12 files, commit 待 push |——不是「排名低」，而是「已发现但未被抓取/编入索引」 | 只读 + 代码改动待用户批准 |
| 2026-10-03 14:53 | **Batch 4 Day 9 完成（B6）**：`public/llms.txt` 第 42 行（`/blog/azw3-vs-mobi` 链接）文本由 guide 标题「AZW3 vs MOBI: Which Kindle Format Should You Use?」改回 blog 实际标题「MOBI vs AZW3 & AZW3 vs MOBI — Which Kindle Format Wins in 2026」，与第 133 行 guide 标题去重，消除跨层同标题；blog/guide 页面标题本已差异化（blog=`MOBI vs AZW3...`、guide=`AZW3 vs MOBI: Which...`）；门禁 audit-content-integrity 0 / find-duplicate-headings 0 / `next build --webpack` PASS(411/411) / 两 URL 均已在 blog/index.ts:11 + guides/index.ts:22 注册 | 1ef49db（未 push） |
| 2026-10-03 21:5x | **M13-5 完成（红队改判据）+ M16 立项 + 竞品实测报告 v2.0**：① R1 查重证伪 M13-5 原设计——p45「calibre vs online converter which is better」与存量 `/guide/calibre-vs-online-converter` 标题逐字级重叠 ⇒ 新页不写 vs 主轴、p45 让给存量页；p44「best free calibre alternative」改锁「多替代品按场景清单」定位（与单工具页 calibre-alternative、通用榜 best-ebook-converter 三向切分）。落盘 `src/data/guides/calibre-alternatives-online.ts`（guide 23→24，index.ts + llms.txt 已注册）。470 词 / 6 节 / 7 FAQ / KT 5 / 内链 5；门禁：syntax-sweep 311/0、audit:content 0/0、geo-guide PASS 6.5/7（WordCount 470 满档）、find-duplicate-headings 0、`next build --webpack` PASS（⚠️ 首两跑被 safe-delete 守卫拦历史 trace 文件 = 本地环境噪声，rm 后复跑通过）。**未 push**。② 竞品实测报告 `docs/竞品内容优劣势分析-2026-10-03.md` **v2.0**：WebFetch 实测 6 站 + 红队审计 8 项质疑→修正（formats 扩写改试点制防抢跑 10/20 裁决、事实卡与 M13-10 同页协同、at-a-glance 耗时无实测禁写、榜单方法论必须真实、convertio 1GB 标注待核、归因声明）。③ **M16 立项**（见 §十 M16 块）：竞品结构缺口批次 M16-1~M16-5，10-05 起每日 ≤1 项。版本 v2.25→v2.26 | 两副本同步 |
| 2026-10-04 09:3x | **M3-5 收口 done + 判据升级（双口径）+ 抓到 /tutorial H1 真实缺陷**：新建 `scripts/verify-nojs-render.mjs`（npm run `audit:nojs`）实跑 10 类页面模板，**硬判据 10/10 PASS** ⇒ 站点不存在「纯客户端渲染导致 AI 抓空壳」问题（convert 页口径A 正文 16,079 字符 / 64 段）。① **判据升级（本轮最大价值）**：原验收「no-JS 快照含完整 H1+正文首段」只测 HTML 源码，10/10 会全 PASS **并掩盖真实问题** ⇒ 改**双口径**——口径A（剥 `<script>` = AI 爬虫实际读取路径）过 6 项硬门槛，口径B（再剥 `<div hidden>` = no-JS 浏览器真实可见）只报「可见占比」。② **真实缺陷已修**：`/tutorial` H1 = 光杆词 `Tutorial`（8 字符，全站唯一 <10，且与同 namespace 的 `metaTitle` 脱节）→ `messages/{en,es}.json` 定点改（en→`Ebook Conversion Tutorial: Step by Step` / es→`Tutorial de Conversión de Ebooks: Paso a Paso`），全站扫描确认仅此一处越界；⚠️ **待上线验证**。③ **结构性观察暂不修**：convert 31 页 + formats 详情 17 页共 **48 页**正文经 React streaming Suspense 投递（口径B 可见 3% / 30%，no-JS 只见 `Loading …`），但口径A 完整 ⇒ **GEO 侧无实质影响**；不修三条理由 = 修法都有代价（`ssr:true` 疑与 hydration 冲突 / 拆服务端组件改动面 48 页）、GEO 无收益（核心杠杆仍是差异化）、**10/20 读数前不动 48 页渲染路径避免引入新变量** ⇒ 转为 `audit:nojs` 持续监测，将来要修**必须与 M16 合并同批**（禁同页两次触碰）。④ **3 则「静默假成功」型踩坑**：URL 靠猜致 3 处 404 被误判成页面缺陷（真实 URL 须取自 `sitemap.ts`/`compat/index.ts`）、非贪婪正则测 hidden 因嵌套 div 提前截断致 convert 页 H1 **假消失**（改深度追踪）、判据只测口径A 造成 10/10 全 PASS 的虚假安心（靠「16,079 字符却仅 3% 可见」这个不合理数字才发现判据漏洞）。门禁：syntax-sweep 311/0、audit:content 0/0、find-duplicate-headings 0、tsc 0 错、**jest 10F/249P 与基线失败名单逐条一致（零回归；改前用 `git stash` 还原 HEAD 实测基线 = 5F/51P 存量）**、claims 1 error = R7 已知存量。看板 done 27→28 / open 39→38，同步 `board.test.ts` 3 处硬编码（主计数 + 2 处衍生）。报告 `数据分析/M3-5-抓取与渲染可解析性-2026-10-04.md`（不入库）。 | 版本 v2.26→v2.27 | 两副本同步 |
| 2026-10-06 (auto·Day 11) | **Batch 4 Day 11 完成（B8）**：B8 Batch 簇分工 + 标题错开——`/guide/batch-converter` 标题改为「BookConv Batch Converter: Convert Many Files at Once in Your Browser」（BookConv 批量工具页）；`/blog/batch-converter` 标题改为「When to Use Calibre for Batch Conversion (Instead of a Browser Tool)」+ 引言重锚定「何时改用桌面 Calibre CLI」；`/blog/calibre-free-batch` 标题本已差异化（Calibre 免费替代方案）保持不变；`public/llms.txt` 第 65/131 行链接文本同步新标题（URL 不变，无死链）；两 slug 仍注册于 blog/index.ts:23 + guides/index.ts:18；消除 guide 与 blog 原近同标题（均「Batch Ebook Converter:…(and When to Use Calibre)」开头），三页意图清晰分离（guide=BookConv 批量 / blog=batch-converter=改用 Calibre 决策 / blog=calibre-free-batch=Calibre 免费替代）；门禁 audit-content-integrity 0/0 + find-duplicate-headings 0 + 5 道 pre-commit 快门禁全过 + `next build` exit 0 | bbbe8fd（未 push） |

---

---

## 八、Batch 4 — 审计整改逐日推进（2026-09-26 起）

> 来源：经红队审计修订的合规核查 `docs/bookconv-google-ai-guide-audit-final-v2.md` 第三部分「整改清单」（A/B/C/D）。
> 目标：把优先级近重簇与死链修复**逐日、小批量**推进，避免一次性大改触发 Google spam 质量信号（呼应执行纪律 §五「每次提交 ≤3 页 / 间隔 ≥24h」）。
> 执行方式：**每日自动化推进 1 个批次**（编辑 + 门禁 + commit，**不自动 push**；push 由人工复核后执行）。详细问题表现/风险/动作/验收见 v2 审计文档。

### 优先级与逐日排期

| 日 | 目标日期 | 批次 | 项（v2 编号） | 触及页面 | 风险 | 门禁 / 验收 | 状态 |
|----|---------|------|--------------|---------|------|-----------|------|
| Day 1 | 2026-09-26 | C 资产保全 | **前提修正**：C1 目标 `/blog/azw3-epub-mobi-kindle` 经核验为**活页**（blog/index.ts:51 仍注册、文件存在），非死链→不删除（原 v2 审计「8/27 已删」与代码实际状态矛盾，已更正）；C2 `/blog/epub-to-txt` 确不存在→跳过。全量扫描 123 条链接，发现**唯一直链** `/convert/epub-to-docx`（middleware.ts:14 为 →`/convert/epub-to-word` 的 301 跳转源），已改为指向 canonical `/convert/epub-to-word` | 0 页面（仅 llms.txt 1 行 URL 修正） | 🟢 | llms.txt 链接 123 条全数有对应注册 slug（0 DEAD，复验通过） | ✅ |
| Day 2 | 2026-09-27 | B 近重🔴 | B1 EPUB→Word/DOCX 三 blog（`epub-to-word`/`epub-to-docx`/`epub-to-word-docx`）301 至 `epub-to-word` | 3 blog（2 个 301） | 🔴 | 仅 1 规范 slug 可索引；`BLOG_REDIRECTS` 加 2 条；**两近重 slug 彻底移出 sitemap（index.ts 取消注册 + llms.txt 删 2 链接，301 保留）** | ✅ |
| Day 3 | 2026-09-28 | B 近重🔴 | B2 `epub-converter`/`epub-to-various-other` 同标题双 slug → 301 其一 | 2 blog（1 个 301） | 🔴 | 同标题双 slug 消除；`find-duplicate-headings` PASS | ✅ |
| Day 4 | 2026-09-29 | B 近重🔴 | B11a IP「multiple devices」5 篇模板簇（chronicles-of-narnia / lord-of-the-rings / twilight / marvel-comics / harry-potter）→ 先查 GSC/Bing 流量，301 合并 3 篇留 2 篇规范 | 5 blog（3 个 301） | 🔴 | 簇内 ≤3 篇，意图不重叠 | ✅ |
| Day 5 | 2026-09-30 | B 近重🔴 | B11b 剩余 2 篇差异化（补各 IP 专属分步/设备/坑） | 2 blog | 🔴 | 单页原创独特点 ≥3 | ✅ |
| Day 6 | 2026-10-01 | B 近重🟡 | **B3 已收口（2026-10-01 实测）**：EPUB→Text **规范 slug = `/convert/epub-to-txt`**；`/convert/epub-to-text` 是 301 **源不是 canonical**（原表把两者写反，已更正）。该 301 实际在 Day 2（B1）随 `middleware.ts:13` 一并埋入；llms.txt 全量校验 121 链接 / **0 DEAD**。⚠️ 校验脚本本身先出假阳性：guide 判据误用 `guides/index.ts` 的 import 列表（单引号且 slug 运行期取 `GUIDE_MAP[g.slug]`）⇒ 22 个 `/guide/*` 全被误判 DEAD；改用「各 `guides/*.ts` 的 `export const slug`」后归零 | 0–1 | 🟡 | ✅ |
| Day 7 | 2026-10-02 | B 近重🟡 | B4 EPUB→MOBI 三页（`epub-to-mobi`/`epub-to-mobi-guide`/`guide/epub-to-mobi-keep-formatting`）分工 | 3 | 🟡 | 意图不重叠 | ✅ |
| Day 8 | 2026-10-03 | B 近重🟡 | B5 EPUB vs MOBI（`blog/epub-vs-mobi`/`guide/epub-vs-mobi`）标题错开 | 2 | 🟡 | 两页标题不完全一致 | ✅（10-02：guide 侧改 Device Compatibility Guide，去共享前缀） |
| Day 9 | 2026-10-03 | B 近重🟡 | B6 AZW3 vs MOBI 跨层同标题（`blog/azw3-vs-mobi`/`guide/azw3-vs-mobi`） | 2 | 🟡 | 同标题跨层消除（llms.txt 第 42 行 blog 链接文本改为实际标题，与第 133 行 guide 标题去重；page 标题本已差异化） | ✅ |
| Day 10 | 2026-10-05 | B 近重🟡 | B7 Kindle 簇（`kindle-epub-azw3-mobi`/`azw3-epub-mobi-kindle-compatibility` + 死链已清）收敛 | 2–3 | 🟡 | 簇内 ≤2 篇 | ✅ |
| Day 11 | 2026-10-06 | B 近重🟡 | B8 Batch 簇（`batch-converter`/`calibre-free-batch`/`guide/batch-converter`）分工 | 3 | 🟡 | 意图清晰分离 | ✅ |
| Day 12 | 2026-10-07 | B 近重🟡 | B9 Calibre 簇（`bookconv-vs-calibre`/`guide/calibre-vs-online-converter`/`guide/calibre-alternative`） | 3 | 🟡 | 簇内 ≤2 篇 | ⏳ |
| Day 13 | 2026-10-08 | B 近重🟡 | B10 Sync/读书组簇（`sync-reading-across-devices`/`sync-ebooks-reading-groups`/`reading-groups-hub`） | 3 | 🟡 | 仅 1 篇读书组主题 | ⏳ |
| Day 14+ | 2026-10-09 起 | A 差异化 | 31 个 convert 薄模板页，按 Tier 分层每日 ≤3 页差异化（Tier-2/3 按主题簇）；含 A2 metaDescription 复检、A3 图片、A4 `/convert/epub-to-pdf` 索引核查 | 3/天 | 🔴 | 单页原创独特点 ≥3；与同簇文本重复率 <30%；`audit:geo-content` PASS | ⏳ |

### Kelriva 衍生待办（K 系列，2026-09-26 同步）

> 来源：`数据分析/Kelriva-AI-Visibility-分析报告-2026-09-26.md` §六（红队审计修订版）+ `数据分析/Kelriva报告-红队审计与修订-2026-09-26.md`。
> 排期原则：**每日 1 项、分散一周（Day 3–Day 9）**，避免一次性大改触发 spam 质量信号；K 项与 B 批次同日并行时，站内页面改动合计仍 ≤3 页。P0 三项（SSR 计数器 `85f1a56` 已上线、batch/pricing diff、FAQPage 确认已存在）**已完成**，不重复排期。

| 项 | 目标日 | 内容 | 类型 | 触及页面 | 验收 / 备注 | 状态 |
|----|--------|------|------|---------|------------|------|
| K1 | 2026-09-28（Day 3） | 两项用户决策收口：① 150,000 计数器对外口径确认（展示目标值 vs 实测累计，需数据来源）；② `/pricing` 对比表 "API Access: Pro ✓" 是否改为"仅 API 套餐"（与 `PLANS.pro.features` 不一致） | 决策（0 代码） | 0 页 | 用户拍板后如有改动按 1 行定点更新 | ✅ |
| K2 | 2026-09-29（Day 4） | `/about` 页强化品牌实体区分：明确 BookConv vs 同名/近名产品（Kelriva 实测 Gemini 混淆 "BookReverb"、"BookConvert"），补充 sameAs（@GinoTou2024）与实体信号 | 站内 | 1 页 | 实体归一要素齐备；`audit:syntax` PASS | ✅ |
| K3 | 2026-09-30（Day 5） | 第三方评论体系启动：注册 Trustpilot（优先）或 G2，建立邀请评价流程 | 站外 | 0 页 | 账号开通；首页暂不挂评分（等真实数据） | ⏳ |
| K4 | 2026-10-01（Day 6） | 外联 howtoconvert.co：请求更新引用语，强调在线工具特性（免费+无需注册+Calibre 引擎）；邮件草稿经用户审阅后发送 | 站外 | 0 页 | 草稿交付→人工发送；不作对外承诺 | ✅（10-01 草稿已交付；发送由用户执行） |
| K5 | 2026-10-02（Day 7） | 外联 publishingxpress.com：提交对比角度（免费即时 vs 人工服务），获取被引用机会 | 站外 | 0 页 | 同 K4 纪律 | ✅（10-02 草稿已落盘 社媒/外联-publishingxpress-2026-10-02.md，待用户发送） |
| K6 | 2026-10-03（Day 8） | 首页 "Featured in"/评价位结构准备：等 K3 产出真实评分后挂载；先做 schema.org/Review/AggregateRating 的合规占位方案（无真实数据不启用） | 站内 | ≤1 页 | 无真实评分不上线 AggregateRating（防虚假结构化数据惩罚） | ⏳ |
| K7 | 2026-10-04（Day 9） | P2 跟踪机制建立：① 月度 Kelriva 重测日程（下月同日）；② 扩展词库计划（Bing 高引用词选 10 个商业意图词，CRₚ+Wilson 区间口径）——25 词 Perplexity 批量测已在其他会话进行，此处仅登记口径引用 | 流程 | 0 页 | 重测日期写入日历；口径与 `GEO跨平台统计分析方法论.md` 一致 | ⏳ |

> ⛔ 防御性否决（不执行项， Kelriva 原建议）：❌ 屏蔽 `/guide/best-ebook-converter`（唯一无品牌引用来源）；❌ Wikipedia 主动外链（COI 高风险）；❌ 无真实数据时上线 AggregateRating。

### 执行纪律（沿用 §五，自动化强制执行）

- ✅ 每批次 ≤3 个页面改动
- ✅ 每日仅推进 1 个批次（不一次性全部完成）
- ✅ 每次改动后必跑门禁：`node scripts/audit-content-integrity.mjs` + `node scripts/find-duplicate-headings.mjs` + `npm run build`（0 error 才 commit）
- ✅ **不自动 push**：commit 后报告，人工复核再 push（push = 公开发布，且需防部署冻结）
- ✅ 重定向走既有 `BLOG_REDIRECTS`（`src/middleware.ts:22`），不新造机制
- ✅ 正文禁尖括号标签；批量脚本只替换/定点更新
- 🆕 门禁增补：CI 校验 `public/llms.txt` 每条链接均有对应注册 slug（防 C1/C2 类死链回归）

---

## 九、增量待办 D 系列（2026-09-26 代码摸底衍生）

> 来源：本次全量代码摸底（`src/` 250 文件 + 部署/配置核查），非既有审计清单。
> 原则：**文档类与死代码类改动零 SEO 风险，可立即做；内容类改动沿用 §五纪律（≤3 页/日）**。
> ⚠️ 注意 D5 的方向：**队列是刻意废弃，不是待接线**。2026-08-04 实测 BullMQ 在 Vercel serverless 上 100% 504，
> 已决策改为请求内同步转换，且该教训已作为对外内容资产输出。**正确动作是删除死代码，不是接回来。**

| ID | 项 | 依据 | 风险 | 触及 | 状态 |
|----|----|------|------|------|------|
| D1 | 删除 `next-sitemap.config.js`（未被 git 跟踪的死配置，占位域名） | `git ls-files` 未跟踪 + 全仓无引用 + package.json 无依赖 | 🟢 | 0 页 | ✅ **已完成（用户 2026-09-26 21:35 拍板：直接删除）**：先归档后按决策删除，`find` 全仓已无残留。留证于此：该文件自始未被 git 跟踪（`git ls-files --error-unmatch` 报错），且被 `.gitignore:29` 的 `*.js` 规则忽略，故**远端本就不存在副本**，删除不产生历史丢失 |
| D2 | 修正 `PROJECT_README.md` / `README.md` 与代码不符的描述 | 对比 `conversion-map.ts`(31 对)、`auth.ts`(Supabase 已移除)、`convert-handler.ts`(同步) | 🟢 | 0 页 | ✅ **已完成**：加顶部可信度声明 + 定点修正（队列/Supabase/28→31/孤儿端点/仓库名） |
| D3 | 补 guide 正文：22 篇中 **14 篇 <100 词** | `geo-audit-guide.mjs` 实测（21 PASS / 1 WARN，但自承 14 篇低于阈值） | 🟡 | 22 页 | ⏳ 待执行（≤3 页/日） |
| D4 | `/es/guide/*` 语言错配：11 个页面为英文兜底（`<lang="es">` 包英文正文） | `src/app/sitemap.ts:75-91` + i18n 摸底：内容层西语仅 9 页 | 🟡 | 11 页 | ⏳ **待重新论证**：⚠️ 经审计修正——原拟「删除这些页面」会**自造 11 个 404**。`sitemap.ts` 注释明示它们是「URL is valid and hreflang/canonical are correct」，为防 GSC 持续 404 而保留。**正确动作是补西语译文，不是删页**。另：勿与已证伪的「/es 致断崖」论点混淆（§1.4） |
| D5 | 清理异步架构死代码：`lib/queue.ts`(28KB)、`worker/`、`api/convert/[jobId]/*` | 全仓无 `.add()` 调用 | 🟡 | 0 页 | ⏳ 待执行（**删除**，非接线）。⚠️ 经审计修正风险等级（原标 🟢 偏低）：`queue.ts` 被 `tests/unit/queue.test.ts`(5 处)、`tests/boundary/*`(2 处) 等 require，且 `package.json:14` `start-with-worker` 引用 `./dist/lib/queue`。**删除须同步处理测试与脚本**，否则 `npm test` 直接失败 |
| D6 | `.gitignore:29` 的 `*.js` 规则致 `scripts/*.js` 静默不入库 | 实测 `geo-audit.js`/`geo-audit-v2.js` 未被跟踪，仅 2 个 js 被 `!` 放行 | 🟡 | 0 页 | ⏳ 待决策（当前影响小：二者已被 `.mjs` 取代，但机制有隐患） |

**⚠️ D1/D2 验收方式更正（红队审计指出「假门禁」）**

`audit-content-integrity.mjs` 与 `find-duplicate-headings.mjs` 只扫描 `src/data/content` 与 `src/data/blog` 下的 `.ts`，
**不读任何 `.md`**。本次改动全部落在 `.md` 与未跟踪配置上，因此这两个脚本跑出 0 error **不构成验收证据**（覆盖率 0）。
这正是本项目已知的**头号失败模式**：脚本静默假成功。

D1/D2 的**真实验收**应为：
1. `git ls-files --error-unmatch next-sitemap.config.js` → 报错（确认从未跟踪）→ 归档后 `ls` 不命中 ✅
2. 全仓 `grep -rn "next-sitemap"` → 无引用 ✅
3. 逐条核对 README 新写入的数字与代码实测一致（31 转换对 / 18 格式 / sitemap 150 / src 246 / tests-unit 10）✅
4. `npx jest` 全量通过（确认未破坏测试；临时探针文件已删除）— **待执行**
5. Markdown 表格结构无 CR 截断（实测 CR 数 1 → 0）✅

> 后续凡"改文档/配置"类任务，禁止引用这两个脚本作为门禁。

---

---

## 十、双渠道分析衍生待办 M 系列（2026-09-27 合并）

> 来源：Bing-Google 双渠道分析 09-26 轮（日报 §三 / 最终报告 §六 / 红队审计修改建议表）+ **GEO 三平台长尾采集 v4（2026-09-27）**。
> 与 §一–§九 的内容差异化/权威主线互补，属**双渠道监测与转化优化**支线。
> 🔴 **收口纪律（2026-09-27 用户铁律）**：本类"下一步行动"**只并入本文档**，禁止单独建文档；由 **hermes** 负责执行，副本同步 `hermes-context/`。本轮 GSC 误判已回滚、审计 #7 来源判定铁律已固化，二者不计入待办。
> 任务系统同步跟踪：Task #1–#8。

**P0（瓶颈监测）**

| ID | 项 | 触及 | 验收 | 状态 |
|----|----|------|------|------|
| **M1** | Google Tier-1 五页差异化修复**首读评估**（≥10/1 起读，看主题簇总量） | 只读 | ✅ **首读 + 定向对照完成（2026-10-01）**。① 首读窗口＝GSC「过去 3 个月」**7/23–9/28**（⚠️ 非定向窗口）：站级 2,864 展示 / 12 点击 / 加权排名 56.12；Tier-1 五页 549 展示 / 0 点击。② **定向对照（用户按建议双导 Pages）**：窗口① `8/18–9/17`(31 天) vs 窗口② `9/18–9/28`(11 天，Tier-1 上线后)。**同类 clean 对照**（剔除断崖前高峰 8/18–8/21＝152.3/天）：**断崖后基线 14.3/天(8/22–9/17) → Tier-1 后 6.3/天 ＝ −56%**；加权排名 71.5→67.9（持平微升，仍证「非排名惩罚」）。③ Tier-1 五页：166→8 展示（日均 5.35→0.73，−86%）／两窗 0 点击；**排名出现大幅改善迹象**（epub-to-azw3 60.6→4.5｜pdf-to-epub 49.4→11｜epub-to-mobi 52.4→16.5｜mobi-to-epub 65.4→55），但 **n=1–4 属噪声不可作结论**，且存「选择偏差」替代解释（落榜宽泛词、仅剩长尾词故位置虚高）。④ 簇（日均展示）：convert 13.4→3.4｜Kindle 12.9→1.0｜blog+guide 9.8→0.9｜首页 11.1→3.9（**全线下行**）。⑤ **结论：首读与定向对照均未见正向信号，主题簇总量持续走低；但「Tier-1 排名改善 + 展示坍塌」并存 ⇒ 疑非排名问题而是覆盖/抓取坍塌，需延长观测至 10/20 重评估锚点**。⑥ `epub-to-pdf` 两窗均 **0 展示**（线上 200）⇒ 索引疑点待单独核查 ⇒ **A 项核查已完成（2026-10-01）：排除技术索引问题**。技术面全过：HTTP 200 ✓ / meta `index, follow` ✓ / canonical 自指 ✓ / `sitemap.xml` 含该 URL ✓ / 无 noindex 响应头 ✓；非重复内容（对同族 epub-to-mobi、pdf-to-epub、epub-to-doc、mobi-to-epub、epub-to-azw3、epub-to-txt、zip、rtf 的 8-gram Jaccard **≤3.1%**）；但它**两窗均未进入 GSC 页面列表**（页面报告仅列 ≥1 展示的页，r1 仅 47 行 / r2 仅 20 行）⇒ 实际曝光 <1 次/窗。归因收敛：不是 noindex／canonical／重复内容，而是「未拿到该查询曝光位」（未索引 或 已索引但无 query 落点）。已执行 IndexNow 提交全站 168 URL（200 OK）作低成本闭环；Bing `site:` 探针返回 Reddit 结果、解析不可靠，**不作判据**。定性仍需 GSC URL Inspection（AI 无法操作 GSC UI）⇒ 列为用户自服务项。裁决建议：**不作为单页特例投入**——after 窗口 convert 仅 11/31 页存活，单页 retrieval 属站点级覆盖坍塌的一部分，差异化动作归入「52 个程序化页差异化」队列、低优先级 |
| **M2** | 品牌词 `bookconv` 监控纳入日常/周清单（GSC 3 展示/3 点击/pos 1.33） | 监测 | 清单含 bookconv 品牌项 | ⏳ |
| **M1-E** | **13 个零抓取页 = Tier-2 差异化前置子集**（M1-C/D 衍生，2026-10-02）：9 页已发现未抓取（`epub-to-pdf`/`mobi-to-pdf`/`epub-to-html`/`azw3-to-pdf`/`html-to-epub`/`epub-to-jpg`/`fb2-to-epub`/`cbr-to-pdf`/`epub-to-png`）+ 4 页完全未知（`txt-to-epub`/`doc-to-epub`/`mobi-to-txt`/`djvu-to-pdf`）。差异化动作复用 M13-10 节奏（≤3 页/天）；10/20 复评 crawl/referringUrls 变化 | 13 页 | 覆盖基线已入库 MEMORY §13 | ⏳ |

**P1（转化优化）**

| ID | 项 | 触及 | 状态 |
|----|----|------|------|
| **M3** | Bing Web 高曝光低点击页植入 CTA：`/guide/kindle-formats`(140/1)、`/blog/kindle-epub-azw3-mobi`(52/1) | 2 页 | ⏳ |
| **M4** | 闭环口径标注（Bing Web 标「仅自身增量比、非跨渠道 VI」；品牌簇窗口差异谨慎外推，审计 #3/#5） | 文档 | ⏳（已标注·确认留存） |

**P2（评估 / 可选）**

| ID | 项 | 触及 | 状态 |
|----|----|------|------|
| **M5** | 美区(us) 英语长尾承接评估（us 44% 曝光、CTR 3.12% 健康） | 评估 | ⏳ |
| **M6** | Bing AI 被引页承接 `/convert/` CTA（best-ebook-reader-apps 等，承接意图流量） | 可选 | ⏳ |
| **M7** | Harry Potter 份额策略复用至其他 IP（52.9% share 已验证，待对照数据） | 评估 | ⏳（关联 10-06 观测窗） |
| **M8** | 补拉 GSC 日期维作权威基准（当前用图表维 2,851/12） | 可选 | ⏳ |

**时间锚点**：M1/M2 → **10-01** 首读窗口开启（✅ 10-01/10-02 两轮完成）；M7 → **10-06** IP 策略观测窗截止（决策是否扩至其他 IP）。

### M14 周一三合一分析 + M15 博客内容补给（2026-10-02 新增）

| ID | 项 | 排期 | 状态 |
|----|----|------|------|
| **M14** | 周一三合一分析 = **关键词排名 + 竞品 + GEO 对照**，已并入「每周双渠道分析」自动化（f4d73b34，周一 07:30）：① 关键词 = 刷新 `build-keyword-series.mjs`，输出升降词 Top10 + 品牌词走势（M2）+ Tier-1/13 零抓取页相关词；② 竞品 = 对照 `docs/competitor-analysis-top5-2026-09-25.md` 名单，核心词 SERP + Bing AI 被引域名 diff（vs 9/25 基线）；③ GEO = 以 v4 报告（强推荐 1/25）为基线的对照检查（被引域名构成 + M13 P0 动作词位变化），全量 25 词重采仍属 M13-13（11-01）。失败一律标 PENDING 不编造；结果并入最终报告，不单独建文档 | 每周一 07:30（首次 10-05） | ✅ 自动化已更新 |
| **M15** | **博客内容补给**：博客最后一批 = 9/24（3 篇），**已停更 8 天**（guide 线正常，M13-4 今日 +1）。缺口判据：① GEO v4 零覆盖区 = 操作指南类 0/7、格式对比类 0/4、阅读器类 0/3 强推荐；② 13 零抓取页缺有曝光内链上游；③ Top1 集中度 25% 需多样化承接页。动作：恢复博客节奏（建议每周 2 篇 = 指南类 + 对比类各 1），选题源 = `数据分析/keyword-reason-candidates-2026-09-27.md` + `geo/reddit-signals.csv`（17 条高意向帖）+ M13 系列缺口清单。**选题方向已拍板（10-02）= 操作指南类优先**。<br>✅ **第①篇已发布**（10-02，post75）：《Can Kobo Read EPUB Files? (And When to Convert)》，commit d272ba7，1758 词 / 8 节 / 7 FAQ / 内链 7。<br>✅ **第②篇已完成待发布**（10-03，post76）：**题目由原定《How to Convert DRM-Free Kindle Books to EPUB》改为《Which Kindle Books Can You Convert? (DRM-Free Checklist)》**——理由：站内已有 `/blog/mobi-to-epub`（post20，12 小节含完整英西双语 how-to），原题与之意图高度重叠，属 R1 自我竞争（已有 4 例归档 301 先例）；改判据角度后与 post20 零重叠。1482 词 / 9 节 / 7 FAQ / 内链 7（`/formats/epub` ×2、`/blog/mobi-to-epub` ×2、`/blog/azw3-vs-mobi`、`/convert/epub-to-mobi`、`/convert/epub-to-azw3`）/ 权威外链 3（copyright.gov DMCA §1201、gutenberg.org、amazon.com CoU、overdrive.com）。门禁：syntax-sweep 305/0、audit:content 0 错、critic-layer **新文 0 WARN**、publish-gate 两层放行、tsc 0 错、jest 25/25。<br>🔴 **原定内链 `/convert/mobi-to-epub` 已证伪（10-03 实测）**：`GSC_URLInspection_2026-10-02.csv` 第 1 行 = `PASS / Submitted and indexed / 最后抓取 2026-09-15` ⇒ 它**不是零抓取页**，不能作为内链供血目标。真正零抓取的是 `formats/*` 系列（该页不在 28 页 Inspection CSV 内，CSV 仅覆盖 convert 页）。⚠️ 13 页 crawl=never 数字经逐行复核无误（9 已发现未抓取 + 4 完全未知）。<br>排除项：p27/p28/p32 Kindle 集群已有 M13-4 guide 页承接，博客版需错位角度，列第二批评估；p47 哈利波特等 10-06 IP 策略决策，不抢跑。每篇 KPI = Bing AI 引用（非 Google 流量）+ ≥2 内链指向 13 零抓取页/formats 页 | 首批 due 10-10 | 🟡 第①篇已发布，第②篇待发布 |

### M16 竞品结构缺口批次（2026-10-03 立项）

> 来源：`docs/竞品内容优劣势分析-2026-10-03.md` v2.0（WebFetch 实测 6 站 + 红队审计 8 项质疑→修正）。
> 定位：把竞品验证过的「结构化摘录单元」（事实卡/对比表/at-a-glance/兼容矩阵）补进我方存量页，与 M13（GEO 长尾）、M15（博客补给）、B（近重收敛）三线并行。
> 排期：10-05 起每日 ≤1 项；与 B7–B10 / M13-10 同日并行时合计 ≤3 页。

| ID | 项 | 触及 | 验收 / 纪律 | 状态 |
|----|----|------|------------|------|
| **M16-1** | Key facts 事实卡 ×31 convert 页：5 行卡（Full name/Extension/MIME/Developer/Initial release，模板=AnyConv）。🔴 **与 M13-10 同页同日协同**（一次改完，禁同页两次批量触碰） | 31 页 | 数据为公开格式事实可静态写死；脚本定点注入禁追加整块 | ⏳ |
| **M16-2** | at-a-glance 参数行（convert 页 hero 下）：只写**有代码证据**的数字（10MB ✓、1h 自动删除 ✓ 存量口径）；平均耗时无实测数据**禁写** | 31 页 | 每个数字逐条核代码；无证据即不写（诚实数据铁律） | ⏳ |
| **M16-3** | `/guide/best-ebook-converter` 扩写 97→1500+ 词：借 gitnux 结构（场景句 Fits-when + 对比表 + 评分维度），方法论**必须真实**（基于 GSC/Bing 实测数据资产 + 格式官方文档核验），禁模仿竞品 AI 流水线话术；动笔前逐页深抓 2–3 个榜单竞品补实测 | 1 页 | R1 查重；critic 0 WARN；权威外链 3–5 | ⏳ |
| **M16-4** | `/guide/kindle-formats` 扩写 360→800–1000 词 + 设备×格式兼容矩阵表 + KFX/渲染引擎节 | 1 页 | geo-guide 7 要素全过；内链 ≥3 | ⏳ |
| **M16-5** | `/formats/*` 扩写**试点制**（标杆=Convertio About-formats 百科段+元数据行+权威外链）：10/20 复评前仅试点 2–3 页（候选 /formats/epub、/formats/pdf、/formats/mobi），借 M1-E 内链供血；复评通过后扩全量 17 页 | 2–3 页→17 页 | 🔴 **10/20 前禁全量**（D1 残余分叉裁决在先）；试点页 geo-guide 7 要素全过 | ⏳ |

### M3-5 抓取与渲染可解析性（2026-10-04 收口 done）

> 产物：`scripts/verify-nojs-render.mjs`（npm run `audit:nojs`）+ 报告 `数据分析/M3-5-抓取与渲染可解析性-2026-10-04.md`（不入库）。

| ID | 项 | 结果 |
|----|----|------|
| **M3-5** | 禁用 JS 快照校验（原验收= 3 个代表页含完整 H1 与正文首段） | ✅ **done**，但**判据被升级**：原标准只测「HTML 源码含正文」会全PASS 并掩盖问题 ⇒ 改为**双口径**——口径A（剥 `<script>`，= AI 爬虫实际读取路径）过 6 项硬门槛，口径B（再剥 `<div hidden>`，= no-JS 浏览器真实可见）只作软判据报「可见占比」。实跑 10 类页面模板（首页/convert/guide/blog/formats 索引+详情/compare/compat/help/tutorial）**硬判据 10/10 PASS**，站点**不存在**「纯客户端渲染导致 AI 抓空壳」问题（convert 页口径A 正文 16,079 字符/ 64 段）。① **真实缺陷已修**：`/tutorial` H1 = 光杆词 `Tutorial`（8 字符，全站唯一 <10，与同 namespace 的 `metaTitle` 脱节）→ `messages/{en,es}.json` 定点改（en→`Ebook Conversion Tutorial: Step by Step` / es→`Tutorial de Conversión de Ebooks: Paso a Paso`），全站扫描确认仅此一处越界；⚠️ **待上线验证**。② **结构性观察暂不修**：convert 31 页 + formats 详情 17 页共 **48 页**正文经 React streaming Suspense 投递（口径B 可见 3% / 30%，no-JS 只见 `Loading …`），但口径A 完整 ⇒ **GEO侧无实质影响**；不修的三条理由 = 修法都有代价（`ssr:true` 疑与 hydration 冲突 / 拆服务端组件改动面 48 页）、GEO 无收益（核心杠杆仍是差异化）、**10/20 读数前不动 48 页渲染路径避免引入新变量** ⇒ 转为 `audit:nojs` 持续监测，若将来要修**必须与 M16 合并同批**（禁同页两次触碰）。**方法论踩坑 3 则**（均为「静默假成功」型）：URL 靠猜致 3 处 404 被误判成页面缺陷（真实 URL 须取自 `sitemap.ts`/`compat/index.ts`）；非贪婪正则 `/<div hidden[^>]*>[\s\S]*?<\/div>/` 因嵌套 div 提前截断 ⇒ convert页 H1 **假消失**（改用深度追踪）；判据只测口径A ⇒ 10/10 全 PASS 的虚假安心（靠「16,079 字符却仅 3% 可见」这个不合理数字才发现判据漏洞） | ✅ done |
| 2026-10-05 (auto·Day 10) | **Batch 4 Day 10 完成（B7）**：`src/data/blog/kindle-epub-azw3-mobi.ts` 改为 Kindle 设备专项实操指南（标题 Azw3/Epub/Mobi Compatibility with Kindle → Convert AZW3, EPUB & MOBI for Your Kindle: Step-by-Step；正文重锚定为「Send-to-Kindle / USB 侧载 / 免费转 AZW3」实操，去除与综合页重复的 Kobo/Apple 生态对比）；`azw3-epub-mobi-kindle-compatibility.ts` 保留为综合格式选择指南，两页意图不再重叠（满足 B7 验收「簇内 ≤2 篇且无意图重叠」）；`public/llms.txt` 第 99 行链接文本同步为新标题（URL 不变，无死链）；`azw3-epub-mobi-kindle`（C1 项，Day 1 已核为活页）不在本批次范围、未动 | 3a0621f（未 push） |

---

### GEO 三平台长尾采集（v4 严谨版 · 2026-09-27）

> 来源：`数据分析/GEO三平台长尾业务词覆盖率报告-20260927.md`（v4 严谨版）。
> 🔴 **关键修正（红队审计）**：原 v3 将 citation source 标签（"BookConv +1"、来源卡片标题）误判为品牌提及。逐行分析后收紧口径：**三平台强推荐仅 1/25（4.0%）**，全部来自 P31 "convert mobi to epub online free"。Perplexity 的"来源"卡片含大量 YouTube 视频噪声，citations 数不可跨平台直接比较。

**P0 · 本周内（2026-09-29 ~ 2026-10-05）**

| ID | 目标日期 | 动作 | 触及页面 | 预期效果 |
|----|---------|------|---------|---------|
| **M13-1** | 09-29（Day 4，与 B11a 并行） | `/convert/mobi-to-epub` 强化推荐语序（hedging → #1 确定性推荐） | 1 页 | ✅ 复现 P31 成功模式 |
| **M13-2** | 09-30（Day 5，与 B11b 并行） | 给 3 个高流量 convert 页（p29/p30/p33）补事实密度句式："Free, no signup, no watermark, uses Calibre engine, 10MB limit" | 3 页 | 扩展 P31 成功要素 |
| **M13-3** | 10-01（Day 6，与 K4 外联并行）✅ | 给剩余 4 个 convert 页（p48/p49/p50 + 任意 1 个）补事实密度句式——实做 `docx-to-epub`/`azw3-to-epub`/`doc-to-epub`（`mobi-to-epub` 来自 M13-1） | 4 页 | ✅ 完成 7 个转换类全补（全 convert 页密度≥1） |
| **M13-4** | 10-02（Day 7，与 K5 外联并行） | 新建 `/guide/how-to-read-epub-on-kindle`（解决 p27/p28/p32 Kindle 兼容痛点） | 1 页（新） | 抢占操作指南类空白（✅ 10-02 已上线，guide 23 页） |
| **M13-5** | 10-03（Day 8，与 K6 并行） | 新建 `/guide/calibre-alternatives-online`（解决 p44/p45 对比工具类空白）✅ **已完成（10-03 红队改判据）**：R1 查重证伪原「一页解决 p44/p45」设计——p45 查询词与存量 `/guide/calibre-vs-online-converter` 标题逐字级重叠 ⇒ 新页不写 vs 主轴、p45 让给存量页；p44「best free calibre alternative」改锁「多替代品按场景清单」定位（与单工具页 calibre-alternative、通用榜 best-ebook-converter 三向切分）。470 词 / 6 节 / 7 FAQ / KT 5 / 内链 5；门禁 syntax 311/0、content 0/0、geo-guide PASS 6.5/7、dup-headings 0、build PASS；guide 23→24，index.ts + llms.txt 已注册；**未 push** | 1 页（新） | ✅ |
| **M13-6** | 10-04（Day 9，与 K7 并行） | `public/llms.txt` 登记新增 2 个 guide 页（缺哪个补哪个） | 0 页（配置） | LLM 入口可见性 |

**P1 · 2-4 周内（2026-10-05 ~ 2026-10-19）**

| ID | 目标日期 | 动作 | 触及页面 |
|----|---------|------|---------|
| **M13-7** | 10-05 | 新建 `/guide/drm-free-conversion-guide`（回应 p37/p38 DRM 查询） | 1 页（新） |
| **M13-8** | 10-07 | `/convert/mobi-to-epub` 加 Kobo 场景子节（"If you're converting MOBI → EPUB specifically for Kobo…"） | 1 页 |
| **M13-9** | 10-09 | 新建 `/guide/harry-potter-digital-books-guide`（复用 Bing AI 58% Citation Share 策略） | 1 页（新） |
| **M13-10** | 10-12 | 给 31 个 `/convert/` 页全部补「FAQ ≥5 + KeyTakeaways ≥3」块（按 ≤3 页/天节奏） | 31 页 |
| **M13-11** | 10-15 | `public/llms.txt` 全量登记 31 个 convert 页（缺哪个补哪个） | 0 页（配置） |

**P2 · 评估后做（2026-10-16 起）**

| ID | 目标日期 | 动作 | 备注 |
|----|---------|------|------|
| **M13-12** | 10-16 | 给 `utm_source=chatgpt.com` 加 GA4 埋点事件 `link_click_from_chatgpt` | 量化 LLM 引荐流量 |
| **M13-13** | 11-01 | 自动化重跑 25 词采集 + 竞品被引 diff | 月度闭环，automation_update |
| **M13-14** | 11-04 | 分析首次重跑结果，更新本报告 | 验证 P0 动作效果 |

**时间锚点**：
- **M13-1 ~ M13-6**：09-29 ~ 10-04（本周）
- **M13-7 ~ M13-11**：10-05 ~ 10-15（第 2-3 周）
- **M13-12 ~ M13-14**：10-16 起（评估期）
- **月度监测**：每月 1 号 07:00 自动重跑

**执行纪律（沿用 §五，自动化强制执行）**
- ✅ 每批次 ≤3 个页面改动（M13 每日 1 项，与 B/K 系列并行时合计仍 ≤3 页）
- ✅ 每次改动后必跑门禁：`node scripts/audit-content-integrity.mjs` + `npm run build`（0 error 才 commit）
- ✅ **不自动 push**：commit 后报告，人工复核再 push
- ✅ 新增 guide 页须通过 `audit:geo-guide` 门禁（WordCount ≥400 / FAQ ≥5 / KeyTakeaways ≥3）
- ✅ 凡涉及"补事实密度句式"，只允许**替换/定点更新**，禁止追加整块（防正文膨胀）

---

**文档版本**: v2.28（2026-10-06 Batch 4 Day 11 B8 已完成：B8 Batch 簇分工+标题错开，三页意图清晰分离，commit bbbe8fd 未 push；2026-10-04 09:3x M3-5 收口 done（no-JS 渲染审计 10/10 PASS，判据升级为双口径，抓到并修复 /tutorial H1 光杆词缺陷；48 页 Suspense 投递记为结构性观察暂不修）；v2.26（2026-10-03 21:5x M13-5 完成待发布（calibre-alternatives-online，红队改判据：p45 让给存量页、新页锁 p44 多替代品清单）+ 竞品实测报告 v2.0（6 站实测+红队 8 项修正）+ M16 立项（竞品结构缺口批次 M16-1~M16-5，formats 扩写试点制）；v2.25（2026-10-03 08:55 M15 第②篇完成待发布（post76 判据角度，题目因 R1 自我竞争由原题改写）+ 作战台 25 项逾期状态回填（18 done / 6 doing）+ 纠正「mobi-to-epub 是零抓取页」的错误内链决策；v2.24（2026-10-02 16:40 M15 第①篇完成待发布（post75 已注册，门禁全绿，未 push）；v2.23（2026-10-02 16:14 M15 两题按 A 版定稿：Kobo 48 字符 / DRM-free 44 字符，进入写作节奏 due 10-10；v2.22（2026-10-02 16:08 M15 首批选题候选写入：p26 Kobo + p37/p38 DRM-free，排除 Kindle 集群与 HP（防自竞争/等 IP 决策），due 10-10 待确认题目；v2.21（2026-10-02 15:56 M2-9 拍板=操作指南类优先；M3-2 收口 done（formats+compat 已于 9/27 补入 sitemap，10/02 复核）；D1 改写为残余分叉（未收录处置延至 10/20 后）；v2.20（2026-10-02 15:30 新增 M1-E/M14/M15：13 零抓取页前置子集；周一三合一分析挂自动化；博客补给待拍板；v2.19（2026-10-02 15:10 M1-D 覆盖率闭环：28/28 Inspection 成功（SA 需用前缀属性）；15 已收录/9 已发现未抓取/4 完全未知，13/28 crawl=never；v2.18（2026-10-02 M1 首读 API 复核：Tier-1 持平无修复信号、epub-to-pdf 第三窗 0；URL Inspection 403 权限阻断待提权；v2.17（Day8 前置：B5 标题错开 + K5 外联草稿落盘 + M13-4 新 guide how-to-read-epub-on-kindle（guide 22→23）；v2.16：M1-C：7 页上游全暗 + 5 页暗上游补活内链 14 条；原 M1-B：`epub-to-pdf` 定性＝已发现未编入索引；覆盖坍塌量化 16/31；判据修正：4 孤儿页实为「上游全暗」7 页 —— `epub-to-pdf` 定性＝已发现未编入索引；覆盖坍塌量化 16/31；新挖 4 个孤儿页定 P0）
**下次更新**: 2026-10-06（Batch 4 Day 11 B8 已完成：guide/batch-converter 改为 BookConv 批量工具页、/blog/batch-converter 重锚定改用 Calibre 决策，三页意图清晰分离，commit bbbe8fd 未 push；下一个待办 = Day 12 (B9) 2026-10-07 Calibre 簇（bookconv-vs-calibre / calibre-vs-online-converter / calibre-alternative））；M1 观测延至 10/20 重评估锚点
**状态更正（2026-09-26 21:35 实测）**：① `b50732d`+`5ad0dcb` **已推送**——`git rev-list --left-right --count origin/main...main` = 0/0，本地与远程完全同步，原「未 push」记录系过时信息；② D1/D2 已由用户复核通过并提交。

---

## 已完成记录（2026-09-27 · WorkBuddy 接管执行）

> 来源：GA4 每日分析 9/26 轮 + 用户指令「继续 同步到 hermes」。归口 §十 M 系列（转化优化支线）。

- **M9 ✅ 已完成｜人物页 CTA 接转化漏斗**：`/about` 与 `/founder` 新增/改指向转换器首页 `/` 的「免费转换工具」CTA（强调 Free / no registration / 1h 删除）。`npm run audit:syntax` 全仓 279 文件 0 失败。commit `0951042` 已 push → Vercel 部署，线上断言 4/4 新 CTA 文案命中（HTTP 200）。背景：9/26 人物页(about 62.5% + founder 20.8% = 83%) 占浏览但 **0 转化**，原 CTA 只指 /blog+mailto 完全没接漏斗。
- **关键发现｜referral 域名 = `app.seobotai.com`**：9/26 引荐流量(占事件 34%)来自该 AI SEO 自动化/爬虫平台，仅 1 用户 / 14 事件 → 判定**机器流量，非真人引荐**，不追投、仅监控。Reddit 归因仍 0（noreferrer + 零链接发帖规范所致，非无需求）。
- **✅ 已固化（2026-09-27）**：每日 07:00 GA 自动化（id `1d5da91c`）prompt 已更新——referral 出现时用「eventName + sessionSource 双维度 + page.reload()」挖具体域名（实测有效），禁入"流量获取"报告；并内置机器流量判定参考（AI SEO 爬虫域名 → 不追投仅监控）。
